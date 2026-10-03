// EazyPay data layer — Supabase only. No localStorage for money or users.
// Auth is Supabase Auth; every mutation goes through a SECURITY DEFINER RPC
// that re-checks the caller's role server-side.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';

const SUPABASE_URL = 'https://ivvtryddebbizflmvdzz.supabase.co';
const SUPABASE_ANON = 'sb_publishable_MHevw7ZOWkf8vocACWhzeQ_dViUPHdU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// Supabase Auth uses emails; the app shows usernames. Mapping is 1:1 via a
// fixed suffix, so "retailer001" -> "retailer001@zonepay.online".
const EMAIL_DOMAIN = 'zonepay.online';
const toEmail = u => `${String(u).trim().toLowerCase()}@${EMAIL_DOMAIN}`;

export const state = {
  me: null,          // own row from app_current_user()
  users: [],         // visible rows (RLS-scoped)
  tx: [],
  walletTx: [],
  activity: [],
  bill: null,
  payment: null,
  page: 'home',
  sidebarOpen: false,
  filters: { q: '', type: '', direction: '', status: '', level: '' }
};

export const currentUser = () => state.me;
export const isAdmin = () => state.me?.role === 'ADMIN';

const unwrap = res => {
  if (res.error) throw new Error(res.error.message);
  return res.data;
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function restore() {
  const session = await getSession();
  if (!session) { state.me = null; return null; }
  await loadMe();
  if (state.me) {
    // A revoked/disabled account should not keep a working UI.
    if (!state.me.approved || !state.me.active) {
      await signOut();
      return null;
    }
  }
  return state.me;
}

export async function loadMe() {
  const rows = unwrap(await supabase.rpc('app_current_user'));
  state.me = rows?.[0] ?? null;
  return state.me;
}

export async function signIn(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password
  });
  if (error) return { ok: false, error: error.message };

  await loadMe();
  if (!state.me) {
    await supabase.auth.signOut();
    return { ok: false, error: 'No matching account for this login.' };
  }
  if (!state.me.approved || !state.me.active) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: !state.me.approved
        ? 'Your account is awaiting admin approval.'
        : 'Your account has been disabled by the admin.'
    };
  }

  await logActivity('LOGIN', 'Successful login');
  return { ok: true };
}

export async function signOut() {
  if (state.me) await logActivity('LOGOUT', 'User logged out');
  await supabase.auth.signOut();
  state.me = null;
  state.users = [];
  state.tx = [];
  state.walletTx = [];
  state.activity = [];
}

export async function logActivity(action, detail) {
  try {
    await supabase.rpc('app_log', { p_action: action, p_detail: detail ?? null });
  } catch { /* logging must never break the user flow */ }
}

// ---------------------------------------------------------------------------
// Reads — every one of these is narrowed by RLS on the server
// ---------------------------------------------------------------------------

export async function loadAll() {
  if (!state.me) return;

  // RLS does the real filtering; these queries just shape and cap the payload.
  const [users, tx, wtx, act] = await Promise.all([
    supabase.from('users').select('*').order('name').limit(1000),
    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(500),
    supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }).limit(1000),
    supabase.from('activities').select('*').order('date', { ascending: false }).limit(300)
  ]);

  state.users    = unwrap(users) ?? [];
  state.tx       = unwrap(tx) ?? [];
  state.walletTx = unwrap(wtx) ?? [];
  state.activity = unwrap(act) ?? [];
}

export function directChildren(u) {
  return state.users.filter(x => x.parent === u?.id);
}

export function allDownline(u) {
  const out = [];
  const q = [u?.id];
  while (q.length) {
    const id = q.shift();
    state.users.filter(x => x.parent === id).forEach(c => { out.push(c); q.push(c.id); });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Mutations — each delegates the decision to a DB function
// ---------------------------------------------------------------------------

export async function payBill(bill) {
  const rows = unwrap(await supabase.rpc('app_pay_bill', {
    p_consumer: bill.consumer,
    p_biller: bill.biller,
    p_amount: bill.total,
    p_bill_no: bill.billNo ?? null,
    p_due_date: bill.dueDate ?? null
  }));
  const r = rows?.[0];
  if (!r?.ok) return { ok: false, error: r?.error || 'Payment failed' };

  await Promise.all([loadMe(), loadAll()]);
  state.payment = {
    id: r.txn_id,
    amount: bill.total,
    status: 'SUCCESS',
    date: new Date().toLocaleString('en-IN'),
    retailer: state.me.name,
    retailerId: state.me.id,
    verifyCode: 'EP' + String(r.txn_id).slice(-8).toUpperCase()
  };
  return { ok: true, txnId: r.txn_id };
}

export async function transfer(toId, amount) {
  const rows = unwrap(await supabase.rpc('app_transfer', {
    p_to_id: toId,
    p_amount: Number(amount)
  }));
  const r = rows?.[0];
  if (!r?.ok) return { ok: false, error: r?.error || 'Transfer failed' };
  await Promise.all([loadMe(), loadAll()]);
  return { ok: true };
}

export async function createVirtualBalance(amount) {
  const rows = unwrap(await supabase.rpc('app_admin_create_balance', { p_amount: Number(amount) }));
  const r = rows?.[0];
  if (!r?.ok) return { ok: false, error: r?.error || 'Failed' };
  await Promise.all([loadMe(), loadAll()]);
  return { ok: true };
}

export async function adminDebit(userId, amount, note) {
  const rows = unwrap(await supabase.rpc('app_admin_debit', {
    p_user_id: userId,
    p_amount: Number(amount),
    p_note: note ?? null
  }));
  const r = rows?.[0];
  if (!r?.ok) return { ok: false, error: r?.error || 'Failed' };
  await Promise.all([loadMe(), loadAll()]);
  return { ok: true };
}

export async function createUser({ name, role, parent, username }) {
  const rows = unwrap(await supabase.rpc('app_create_user', {
    p_name: name,
    p_role: role,
    p_parent: parent,
    p_username: username
  }));
  const r = rows?.[0];
  if (!r?.ok) return { ok: false, error: r?.error || 'Failed' };
  await loadAll();
  return { ok: true, id: r.new_id };
}

export async function setUser(userId, field, value) {
  const rows = unwrap(await supabase.rpc('app_admin_set_user', {
    p_user_id: userId,
    p_field: field,
    p_value: String(value)
  }));
  const r = rows?.[0];
  if (!r?.ok) return { ok: false, error: r?.error || 'Failed' };
  await Promise.all([loadMe(), loadAll()]);
  return { ok: true };
}

// Convenience wrappers matching the old toggle* call sites.
export const toggleApproval = (id, next) => setUser(id, 'approved', next);
export const toggleActive   = (id, next) => setUser(id, 'active', next);
export const toggleKyc      = (id, next) => setUser(id, 'kyc', next);
export const togglePermission = (id, key, next) =>
  setUser(id, key === 'bill' ? 'perm_bill' : 'perm_transfer', next);

// ---------------------------------------------------------------------------
// Hierarchy rules — mirrored here for UI hints only; the DB is authoritative
// ---------------------------------------------------------------------------

export function allowedCreateRoles(u) {
  if (!u) return [];
  if (u.role === 'ADMIN') return ['SUPER DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'];
  if (u.role === 'SUPER DISTRIBUTOR') return ['DISTRIBUTOR'];
  if (u.role === 'DISTRIBUTOR') return ['RETAILER'];
  return [];
}

export function validParentsForRole(role, creator) {
  if (creator?.role === 'ADMIN') {
    if (role === 'SUPER DISTRIBUTOR') return state.users.filter(x => x.role === 'ADMIN');
    if (role === 'DISTRIBUTOR') return state.users.filter(x => x.role === 'SUPER DISTRIBUTOR');
    if (role === 'RETAILER') return state.users.filter(x => x.role === 'DISTRIBUTOR');
  }
  if (creator?.role === 'SUPER DISTRIBUTOR' && role === 'DISTRIBUTOR') return [creator];
  if (creator?.role === 'DISTRIBUTOR' && role === 'RETAILER') return [creator];
  return [];
}
