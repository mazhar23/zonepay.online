// EazyPay — presentation layer.
// Money, users and permissions come from data.js (Supabase). This file only
// renders and calls the RPC-backed actions. It holds no authoritative state.

import {
  supabase, state, restore, signIn, signOut, loadAll, loadMe,
  payBill, transfer, createVirtualBalance, adminDebit, createUser,
  setUser, toggleApproval, toggleActive, toggleKyc, togglePermission,
  currentUser, isAdmin, directChildren, allDownline,
  allowedCreateRoles, validParentsForRole, changePassword
} from './data.js';

import {
  electricityOperators as OPERATORS, UP_DISCOMS
} from './operators.js';

const app = document.getElementById('app');
const $ = id => document.getElementById(id);

/* ---------- helpers ---------- */

// Escape every value that reaches innerHTML. Bill data comes from a third
// party and user names are user-supplied; neither is trusted.
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const roleLabel = r => (r || '')
  .replace('SUPER DISTRIBUTOR', 'Super Distributor')
  .replace('DISTRIBUTOR', 'Distributor')
  .replace('RETAILER', 'Retailer')
  .replace('ADMIN', 'Admin');
const userLabel = u => (u ? `${roleLabel(u.role)} — ${u.name} (${u.id})` : '—');
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const formatDateTime = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-';
const nowStr = () => new Date().toLocaleString('en-IN');
const isToday = s => { try { return new Date(s).toDateString() === new Date().toDateString(); } catch { return false; } };

// Inline handlers need globals. Expose only the names they use.
Object.assign(window, {
  go, renderPage, doLogin, doLogout, toggleSidebar, closeSidebar,
  fetchBill, doPay, doTransfer, doCreateBalance, doAdminDebit,
  doCreateUser, onRoleChange, doToggleApproval, doToggleActive,
  doToggleKyc, doToggleBillPerm, doToggleTransferPerm, doEditCommission,
  applyWalletFilters, applyBillFilters, exportWalletExcel, exportBillExcel,
  printBillTxn, downloadReceipt, shareWhatsApp, logout: doLogout, setup, doSetup,
  doChangePassword, refreshData
});

// Enter key support for forms
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (state.page === 'login') doLogin();
  else if (state.page === 'setup') doSetup();
});

async function refreshData() {
  if (!currentUser()) return;
  await Promise.all([loadMe(), loadAll()]);
  renderPage();
}

/* ---------- shells ---------- */

function publicShell(body) {
  app.innerHTML = `<header class="public-top"><div class="brand">Eazy<span>Pay</span></div>
  <nav class="public-nav">
    <button class="${state.page === 'home' ? 'active' : ''}" onclick="go('home')">Home</button>
    <button onclick="go('login')">Login</button>
  </nav></header>
  <main class="wrap">${body}</main>
  <footer class="footer">© 2026 EazyPay • Electricity Bill Payment Platform</footer>`;
}

function dashShell(body) {
  const u = currentUser();
  if (!u) { go('login'); return; }
  const nav = [
    { id: 'dashboard',  label: 'Dashboard',        ico: '📊' },
    { id: 'bill',       label: 'Electricity Bill', ico: '⚡' },
    { id: 'wallet',     label: 'Wallet & Ledger',  ico: '💰' },
    { id: 'admin',      label: 'Transactions',     ico: '📋' },
    { id: 'network',    label: isAdmin() ? 'Power Admin' : 'My Network', ico: '👥' },
    { id: 'commission', label: 'Commission',       ico: '📈' },
    { id: 'activity',   label: 'Activity Log',     ico: '🕒' }
  ];
  app.innerHTML = `<div class="app-shell">
    <div class="overlay ${state.sidebarOpen ? 'show' : ''}" onclick="closeSidebar()"></div>
    <aside class="sidebar ${state.sidebarOpen ? 'open' : ''}">
      <div class="sidebar-brand">Eazy<span>Pay</span></div>
      <div class="sidebar-user"><div class="name">${esc(u.name)}</div><div class="role">${esc(roleLabel(u.role))} · ${esc(u.id)}</div></div>
      <nav class="sidebar-nav">${nav.map(n =>
        `<button class="${state.page === n.id ? 'active' : ''}" onclick="go('${n.id}');closeSidebar()"><span class="ico">${n.ico}</span>${n.label}</button>`).join('')}</nav>
      <div class="sidebar-footer"><button class="btn ghost" style="width:100%;justify-content:center;color:#fff;border-color:#ffffff33" onclick="doLogout()">Logout</button></div>
    </aside>
    <div class="main">
      <div class="topbar">
        <div class="topbar-left">
          <button class="menu-btn" onclick="toggleSidebar()">☰</button>
          <div>
            <div style="font-weight:800;font-size:15px">${esc(nav.find(n => n.id === state.page)?.label || 'EazyPay')}</div>
            <div class="muted" style="font-size:12px">${esc(roleLabel(u.role))} dashboard</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="muted" style="font-size:11px;text-transform:uppercase;font-weight:700">Wallet</div>
          <div style="font-weight:800;color:var(--green)">${money(u.balance)}</div>
        </div>
      </div>
      <div class="page-body">${body}</div>
    </div>
  </div>`;
}

/* ---------- routing ---------- */

const PAGES = {
  home, login, setup, profile: profilePage, dashboard, bill: billPage, details, payment, receipt,
  admin, wallet: walletPage, network, commission: commissionPage, activity: activityPage
};

function go(p) {
  state.page = p;
  state.sidebarOpen = false;
  renderPage();
}

function renderPage() {
  const pub = ['home', 'login', 'setup'];
  if (!pub.includes(state.page) && !currentUser()) { go('login'); return; }
  (PAGES[state.page] || home)();
}

function toggleSidebar() { state.sidebarOpen = !state.sidebarOpen; renderPage(); }
function closeSidebar() { state.sidebarOpen = false; renderPage(); }

/* ---------- auth ---------- */

function home() {
  if (currentUser()) { go('dashboard'); return; }
  publicShell(`<section class="hero">
    <h1>Electricity bill payment, made simple.</h1>
    <p>Fetch bills with Consumer ID, pay from wallet, and get a professional digital receipt — built for retailers and multi-level networks.</p>
    <div class="row"><button class="btn primary" onclick="go('login')">Retailer / Network Login</button></div>
  </section>
  <div class="grid">
    <div class="card"><h3>⚡ Bill Fetch</h3><p class="muted">70+ electricity operators across India.</p></div>
    <div class="card"><h3>💰 Wallet Ledger</h3><p class="muted">Every credit &amp; debit with opening/closing balance.</p></div>
    <div class="card"><h3>🧾 Instant Receipt</h3><p class="muted">Printable receipt with verification code.</p></div>
  </div>`);
}

function login() {
  publicShell(`<div class="login-wrap"><div class="card">
    <h2 style="margin:0 0 4px">Welcome back</h2>
    <p class="muted" style="margin:0 0 18px">Sign in to your EazyPay account</p>
    <label class="label">Username</label>
    <input id="user" class="input" autocomplete="username" placeholder="Enter your username">
    <label class="label" style="margin-top:12px">Password</label>
    <input id="pass" type="password" class="input" autocomplete="current-password" placeholder="Enter your password">
    <div id="loginmsg" style="margin-top:12px"></div>
    <button class="btn primary" style="width:100%;margin-top:16px;justify-content:center" id="loginBtn" onclick="doLogin()">Login</button>
    <div style="text-align:center; margin-top:20px;">
      <p class="muted" style="margin:0 0 8px; font-size:13px;">New user approved by admin?</p>
      <button class="btn secondary" style="width:100%;justify-content:center" onclick="go('setup')">First Time Setup</button>
    </div>
  </div></div>`);
}

async function doLogin() {
  const btn = $('loginBtn');
  const msg = $('loginmsg');
  const username = $('user').value.trim();
  const password = $('pass').value;
  if (!username || !password) { msg.innerHTML = '<p class="warning">Enter username and password.</p>'; return; }

  btn.disabled = true; btn.innerText = 'Signing in…'; msg.innerHTML = '';
  const res = await signIn(username, password);
  if (!res.ok) {
    msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`;
    btn.disabled = false; btn.innerText = 'Login';
    return;
  }
  await loadAll();
  go('dashboard');
}

function setup() {
  publicShell(`<div class="login-wrap"><div class="card">
    <h2 style="margin:0 0 4px">First Time Setup</h2>
    <p class="muted" style="margin:0 0 18px">Set a password for your new account</p>
    <label class="label">Username</label>
    <input id="setupUser" class="input" autocomplete="username" placeholder="Provided by your admin">
    <label class="label" style="margin-top:12px">Create Password</label>
    <input id="setupPass" type="password" class="input" autocomplete="new-password" placeholder="Min 6 characters">
    <div id="setupmsg" style="margin-top:12px"></div>
    <button class="btn primary" style="width:100%;margin-top:16px;justify-content:center" id="setupBtn" onclick="doSetup()">Set Password & Login</button>
    <div style="text-align:center; margin-top:20px;">
      <button class="btn ghost" style="width:100%;justify-content:center" onclick="go('login')">Back to Login</button>
    </div>
  </div></div>`);
}

async function doSetup() {
  const btn = $('setupBtn'), msg = $('setupmsg');
  const username = $('setupUser').value.trim();
  const password = $('setupPass').value;
  
  if (!username || !password) { msg.innerHTML = '<p class="warning">Enter username and password.</p>'; return; }
  if (password.length < 6) { msg.innerHTML = '<p class="warning">Password must be at least 6 characters.</p>'; return; }

  btn.disabled = true; btn.innerText = 'Creating account…'; msg.innerHTML = '';
  
  // Actually sign up via Supabase
  const { data, error } = await supabase.auth.signUp({
    email: username.toLowerCase() + '@zonepay.online',
    password: password
  });

  if (error) {
    msg.innerHTML = `<p class="fail">${esc(error.message)}</p>`;
    btn.disabled = false; btn.innerText = 'Set Password & Login';
    return;
  }

  // Auth only hands back a session when email confirmation is disabled. Because
  // @zonepay.online mail is undeliverable, "Confirm email" has to be OFF in the
  // Supabase dashboard or this account can never be signed in. Without this
  // branch the next check reports the misleading "username was not found".
  if (!data?.session) {
    await supabase.auth.signOut();
    msg.innerHTML = '<p class="fail">Account created, but the server returned no login session. '
      + 'Email confirmation must be switched <b>OFF</b> in Supabase '
      + '(Authentication &rarr; Providers &rarr; Email &rarr; Confirm email), '
      + 'because mail to @zonepay.online is never delivered.</p>';
    btn.disabled = false; btn.innerText = 'Set Password & Login';
    return;
  }

  // Attempt to load the user profile
  const me = await loadMe();
  if (!me) {
    await supabase.auth.signOut();
    msg.innerHTML = '<p class="fail">Your username was not found. Please ensure the admin has created your account.</p>';
    btn.disabled = false; btn.innerText = 'Set Password & Login';
    return;
  }
  
  if (!me.approved) {
    await supabase.auth.signOut();
    msg.innerHTML = '<p class="fail">Your account has been created but is awaiting admin approval. You cannot log in yet.</p>';
    btn.disabled = false; btn.innerText = 'Set Password & Login';
    return;
  }

  await loadAll();
  go('dashboard');
}

async function doLogout() {
  await signOut();
  state.bill = null; state.payment = null;
  go('home');
}

/* ---------- profile ---------- */

function profilePage() {
  const u = currentUser();
  dashShell(`
    <h1 class="page-title">My Profile</h1>
    <p class="page-sub">Account details and settings</p>
    <div class="grid-2">
      <div class="card">
        <h3>Account Information</h3>
        <table style="min-width:0">
          <tr><td class="muted">Name</td><td><b>${esc(u.name)}</b></td></tr>
          <tr><td class="muted">User ID</td><td>${esc(u.id)}</td></tr>
          <tr><td class="muted">Username</td><td>${esc(u.username || '—')}</td></tr>
          <tr><td class="muted">Role</td><td><span class="badge badge-info">${esc(roleLabel(u.role))}</span></td></tr>
          <tr><td class="muted">Parent</td><td>${esc(u.parent || '—')}</td></tr>
          <tr><td class="muted">Balance</td><td class="success">${money(u.balance)}</td></tr>
          <tr><td class="muted">Commission Rate</td><td>${esc(u.commission_rate ?? 0)}%</td></tr>
        </table>
      </div>
      <div class="card">
        <h3>Status</h3>
        <table style="min-width:0">
          <tr><td class="muted">KYC</td><td><span class="badge ${u.kyc === 'VERIFIED' ? 'badge-ok' : 'badge-warn'}">${esc(u.kyc || 'PENDING')}</span></td></tr>
          <tr><td class="muted">Approval</td><td><span class="badge ${u.approved ? 'badge-ok' : 'badge-warn'}">${u.approved ? 'APPROVED' : 'PENDING'}</span></td></tr>
          <tr><td class="muted">Account</td><td><span class="badge ${u.active ? 'badge-ok' : 'badge-fail'}">${u.active ? 'ACTIVE' : 'DISABLED'}</span></td></tr>
          <tr><td class="muted">Bill Permission</td><td>${u.permissions?.bill ? '<span class="badge badge-ok">ON</span>' : '<span class="badge badge-fail">OFF</span>'}</td></tr>
          <tr><td class="muted">Transfer Permission</td><td>${u.permissions?.transfer ? '<span class="badge badge-ok">ON</span>' : '<span class="badge badge-fail">OFF</span>'}</td></tr>
        </table>
        <h3 style="margin-top:20px">Change Password</h3>
        <label class="label">New Password</label>
        <input id="newPass" type="password" class="input" placeholder="Min 6 characters" autocomplete="new-password">
        <label class="label" style="margin-top:8px">Confirm Password</label>
        <input id="confirmPass" type="password" class="input" placeholder="Re-enter password" autocomplete="new-password">
        <button class="btn primary" style="margin-top:12px" onclick="doChangePassword()">Update Password</button>
        <div id="passMsg" style="margin-top:10px"></div>
      </div>
    </div>`);
}

async function doChangePassword() {
  const msg = $('passMsg');
  const pw = $('newPass').value;
  const pw2 = $('confirmPass').value;
  if (!pw || pw.length < 6) { msg.innerHTML = '<p class="warning">Password must be at least 6 characters.</p>'; return; }
  if (pw !== pw2) { msg.innerHTML = '<p class="warning">Passwords do not match.</p>'; return; }
  msg.innerHTML = '<p class="muted">Updating…</p>';
  const res = await changePassword(pw);
  if (!res.ok) { msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`; return; }
  msg.innerHTML = '<p class="success">✅ Password updated successfully!</p>';
  $('newPass').value = ''; $('confirmPass').value = '';
}

/* ---------- dashboard ---------- */

function dashboard() {
  const u = currentUser();
  const mine = state.tx.filter(t => t.retailer_id === u.id);
  const today = mine.filter(t => isToday(t.date));
  const down = isAdmin() ? state.users.filter(x => x.role !== 'ADMIN') : allDownline(u);

  dashShell(`
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Hello, ${esc(u.name)} · ${esc(roleLabel(u.role))}</p>
    <div class="grid" style="margin-bottom:20px">
      <div class="stat-card"><div class="stat-ico green">💰</div><div><div class="stat-val">${money(u.balance)}</div><div class="stat-lbl">Wallet Balance</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">📅</div><div><div class="stat-val">${today.length}</div><div class="stat-lbl">Today Transactions</div></div></div>
      <div class="stat-card"><div class="stat-ico purple">📈</div><div><div class="stat-val">${money(today.reduce((a, t) => a + Number(t.commission || 0), 0))}</div><div class="stat-lbl">Today Commission</div></div></div>
      <div class="stat-card"><div class="stat-ico amber">⏳</div><div><div class="stat-val">${mine.filter(t => t.status === 'UNDER PROCESS' || t.status === 'PENDING').length}</div><div class="stat-lbl">Pending</div></div></div>
      <div class="stat-card"><div class="stat-ico red">✕</div><div><div class="stat-val">${mine.filter(t => t.status === 'FAILED').length}</div><div class="stat-lbl">Failed</div></div></div>
      ${u.role !== 'RETAILER' ? `<div class="stat-card"><div class="stat-ico blue">👥</div><div><div class="stat-val">${down.length}</div><div class="stat-lbl">Network Users</div></div></div>` : ''}
    </div>
    <div class="grid-2">
      <div class="card"><h3>Quick Actions</h3>
        <div class="row" style="margin-top:8px">
          ${u.permissions?.bill ? `<button class="btn primary" onclick="go('bill')">⚡ Pay Electricity Bill</button>` : ''}
          <button class="btn secondary" onclick="go('wallet')">💰 Wallet Ledger</button>
          <button class="btn secondary" onclick="go('admin')">📋 Transactions</button>
          ${u.role !== 'RETAILER' ? `<button class="btn secondary" onclick="go('network')">👥 Network</button>` : ''}
        </div>
      </div>
      <div class="card"><h3>Account Status</h3>
        <table style="min-width:0">
          <tr><td class="muted">KYC</td><td><span class="badge ${u.kyc === 'VERIFIED' ? 'badge-ok' : 'badge-warn'}">${esc(u.kyc || 'PENDING')}</span></td></tr>
          <tr><td class="muted">Approval</td><td><span class="badge ${u.approved ? 'badge-ok' : 'badge-warn'}">${u.approved ? 'APPROVED' : 'PENDING'}</span></td></tr>
          <tr><td class="muted">Account</td><td><span class="badge ${u.active ? 'badge-ok' : 'badge-fail'}">${u.active ? 'ACTIVE' : 'DISABLED'}</span></td></tr>
          <tr><td class="muted">Commission Rate</td><td><b>${esc(u.commission_rate ?? 0)}%</b></td></tr>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-head"><h3 style="margin:0">Recent Bill Transactions</h3><button class="btn secondary" onclick="go('admin')">View all</button></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Txn ID</th><th>Consumer</th><th>Biller</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${(isAdmin() ? state.tx : mine).slice(0, 6).map(t => `<tr>
          <td>${esc(t.id)}</td><td>${esc(t.consumer_id)}</td><td>${esc(t.biller)}</td>
          <td>${money(t.amount)}</td>
          <td><span class="badge ${t.status === 'SUCCESS' ? 'badge-ok' : t.status === 'FAILED' ? 'badge-fail' : 'badge-warn'}">${esc(t.status)}</span></td>
          <td>${formatDateTime(t.date || t.created_at)}</td></tr>`).join('') || `<tr><td colspan="6" class="empty">No transactions yet</td></tr>`}
        </tbody>
      </table></div>
    </div>`);
}

/* ---------- bill fetch (hits proxy.php) ---------- */

function billPage() {
  const u = currentUser();
  if (!u.permissions?.bill) {
    dashShell(`<div class="card"><h2>Electricity Bill Disabled</h2><p class="muted">Admin has disabled bill payment for this account.</p></div>`);
    return;
  }
  const options = OPERATORS.map(o => `<option value="${esc(o.operator_code)}">${esc(o.operator_name)}</option>`).join('');
  const discoms = UP_DISCOMS.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');

  dashShell(`<h1 class="page-title">Electricity Bill Payment</h1>
    <p class="page-sub">Enter consumer number → fetch bill → pay from wallet → get receipt</p>
    <div class="card" style="max-width:560px">
      <label class="label">Electricity Provider</label>
      <select id="provider" class="select" onchange="window.__updateParams()">
        <option value="">-- Select Operator --</option>${options}
      </select>
      <label class="label" style="margin-top:12px">Consumer ID / Customer Number</label>
      <input id="consumer" class="input" placeholder="e.g. 2313593" value="${esc(state.bill?.consumer || '')}">
      <div id="extraParamContainer" style="margin-top:12px;display:none;">
        <label id="extraParamLabel" class="label">Extra Param:</label>
        <input id="extraParam" class="input">
      </div>
      <div id="discomContainer" style="margin-top:12px;display:none;">
        <label class="label">UP Discom:</label>
        <select id="extraParamDiscom" class="select">${discoms}</select>
      </div>
      <div class="form-actions">
        <button class="btn primary" id="fetchBillBtn" onclick="fetchBill()">Fetch Bill</button>
        <button class="btn secondary" onclick="go('dashboard')">Cancel</button>
      </div>
      <div id="fetchmsg" style="margin-top:16px"></div>
    </div>`);
}

window.__updateParams = () => {
  const code = $('provider').value;
  const op = OPERATORS.find(o => o.operator_code === code);
  $('extraParamContainer').style.display = 'none';
  $('discomContainer').style.display = 'none';
  if (op?.params?.length) {
    if (op.params[0] === 'Discom') $('discomContainer').style.display = 'block';
    else { $('extraParamContainer').style.display = 'block'; $('extraParamLabel').innerText = op.params[0] + ':'; }
  }
};

async function fetchBill() {
  const opSelect = $('provider'), consInput = $('consumer');
  const msgDiv = $('fetchmsg'), btn = $('fetchBillBtn');
  const code = opSelect.value;
  const consumer = consInput.value.trim();

  if (!code || !consumer) { msgDiv.innerHTML = '<p class="warning">Please select an operator and enter Consumer ID.</p>'; return; }

  const op = OPERATORS.find(o => o.operator_code === code);
  const payload = { consumer_no: consumer, operator: code };

  if (op?.params?.length) {
    const val = op.params[0] === 'Discom' ? $('extraParamDiscom').value : $('extraParam').value.trim();
    if (!val) { msgDiv.innerHTML = `<p class="warning">Please enter: ${esc(op.params[0])}</p>`; return; }
    payload.params = val;
  }

  btn.disabled = true; btn.innerText = 'Fetching…';
  msgDiv.innerHTML = '<p class="muted">Fetching bill from provider…</p>';

  try {
    // Absolute + https so a visitor landing on http cannot ride the 301,
    // which silently drops the POST body.
    const proxyUrl = new URL('proxy.php', location.href);
    proxyUrl.protocol = 'https:';

    const res = await fetch(proxyUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      msgDiv.innerHTML = `<p class="fail">Server returned a non-JSON response (HTTP ${res.status}). Please try again.</p>`;
      btn.disabled = false; btn.innerText = 'Fetch Bill';
      return;
    }

    if (data.status === 'success' || data.code === 200 || data.data || data.response) {
      const r = data.response || data.data || data;
      state.bill = {
        name: r.customer_name || r.consumer_name || r.name || 'N/A',
        address: r.customer_address || r.address || 'India',
        consumer: r.customer_id || r.consumer_no || consumer,
        biller: r.operator_name || op.operator_name,
        billNo: r.bill_no || r.request_id || 'TX-' + Date.now().toString().slice(-6),
        billDate: r.bill_date || nowStr(),
        dueDate: r.due_date || r.bill_due_date || nowStr(),
        current: Number(r.bill_amount ?? r.due_amount ?? r.amount ?? 0) || 0,
        arrears: Number(r.arrears ?? 0) || 0,
        total: Number(r.due_amount ?? r.bill_amount ?? r.amount ?? 0) || 0
      };
      go('details');
    } else {
      msgDiv.innerHTML = `<p class="warning">⚠️ ${esc(data.message || 'Could not fetch bill')}</p>`;
      btn.disabled = false; btn.innerText = 'Fetch Bill';
    }
  } catch (err) {
    msgDiv.innerHTML = `<p class="fail">❌ Network Error: ${esc(err.message)}</p>`;
    btn.disabled = false; btn.innerText = 'Fetch Bill';
  }
}

/* ---------- payment ---------- */

function details() {
  const b = state.bill;
  if (!b) { go('bill'); return; }
  dashShell(`<h1 class="page-title">Bill Details</h1>
    <div class="card" style="max-width:640px">
      <div class="section-head">
        <div><h2 style="margin:0">${esc(b.biller)}</h2><span class="badge badge-ok">Bill fetched</span></div>
        <div class="total" style="color:var(--primary)">${money(b.total)}</div>
      </div>
      <table style="min-width:0">
        <tr><th>Customer Name</th><td>${esc(b.name)}</td></tr>
        <tr><th>Consumer ID</th><td>${esc(b.consumer)}</td></tr>
        <tr><th>Address</th><td>${esc(b.address)}</td></tr>
        <tr><th>Bill Number</th><td>${esc(b.billNo)}</td></tr>
        <tr><th>Bill Date</th><td>${esc(b.billDate)}</td></tr>
        <tr><th>Due Date</th><td>${esc(b.dueDate)}</td></tr>
        <tr><th>Current Bill</th><td>${money(b.current)}</td></tr>
        <tr><th>Arrears</th><td>${money(b.arrears)}</td></tr>
        <tr><th>Total Payable</th><td><b>${money(b.total)}</b></td></tr>
      </table>
      <div class="form-actions">
        <button class="btn primary" onclick="go('payment')">Continue to Payment</button>
        <button class="btn secondary" onclick="go('bill')">Change Consumer ID</button>
      </div>
      <p class="muted" style="font-size:12px;margin-top:10px">Amount is re-verified by the server before your wallet is debited.</p>
    </div>`);
}

function payment() {
  const b = state.bill, u = currentUser();
  if (!b) { go('bill'); return; }
  const canPay = Number(u.balance) >= Number(b.total);
  dashShell(`<h1 class="page-title">Payment</h1>
    <div class="grid-2">
      <div class="card"><h3>Bill Summary</h3>
        <table style="min-width:0">
          <tr><th>Board</th><td>${esc(b.biller)}</td></tr>
          <tr><th>Consumer ID</th><td>${esc(b.consumer)}</td></tr>
          <tr><th>Customer</th><td>${esc(b.name)}</td></tr>
          <tr><th>Bill No</th><td>${esc(b.billNo)}</td></tr>
          <tr><th>Amount</th><td><b>${money(b.total)}</b></td></tr>
        </table>
      </div>
      <div class="card"><h3>Pay from Wallet</h3>
        <p class="muted">Amount will be debited from your EazyPay wallet.</p>
        <div style="margin:16px 0;padding:16px;border-radius:12px;background:var(--green-bg)">
          <div class="muted" style="font-size:12px">Available Balance</div>
          <div class="total" style="color:var(--green)">${money(u.balance)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:14px">
          <span>To debit</span><span>${money(b.total)}</span>
        </div>
        <button class="btn success-btn" style="width:100%;justify-content:center" id="payBtn" ${canPay ? '' : 'disabled'} onclick="doPay()">💳 Pay ${money(b.total)}</button>
        ${canPay ? '' : '<div class="notice">Insufficient wallet balance.</div>'}
        <div id="paymsg" style="margin-top:12px"></div>
      </div>
    </div>`);
}

async function doPay() {
  const btn = $('payBtn'), msg = $('paymsg');
  const b = state.bill;
  if (!confirm(`Pay ${money(b.total)} to ${b.biller} for consumer ${b.consumer}?\n\nThis debits your wallet immediately.`)) return;
  btn.disabled = true; btn.innerText = 'Processing…'; msg.innerHTML = '';

  const res = await payBill(state.bill);
  if (!res.ok) {
    msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`;
    btn.disabled = false; btn.innerText = 'Pay';
    return;
  }
  go('receipt');
}

function receipt() {
  const b = state.bill, p = state.payment, u = currentUser();
  if (!b || !p) { go('bill'); return; }
  dashShell(`<h1 class="page-title" style="text-align:center">Payment Receipt</h1>
    <div class="receipt" id="receiptCard">
      <div class="receipt-head">
        <div class="receipt-logo">Eazy<span>Pay</span></div>
        <div class="muted" style="font-weight:800">Electricity Bill Receipt</div>
      </div>
      <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px dashed #cbd5e1;border-bottom:1px dashed #cbd5e1;margin-bottom:14px;font-size:13px">
        <span><b>Date:</b> ${formatDateTime(p.date || p.created_at)}</span>
      </div>
      <table style="min-width:0">
        <tr><th>Service Number</th><td>${esc(b.consumer)}</td></tr>
        <tr><th>Customer Name</th><td>${esc(b.name)}</td></tr>
        <tr><th>Transaction ID</th><td>${esc(p.id)}</td></tr>
        <tr><th>Merchant ID</th><td>${esc(u.id)}</td></tr>
        <tr><th>Txn Status</th><td><span class="badge badge-ok">SUCCESS</span></td></tr>
        <tr><th>Biller</th><td>${esc(b.biller)}<br>Electricity</td></tr>
        <tr><th>Bill Amount</th><td>${money(b.total)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:14px 0;border-top:1px dashed #cbd5e1;border-bottom:1px dashed #cbd5e1;display:flex;justify-content:space-between;align-items:center;gap:12px">
        <b style="font-size:17px">Total Amount</b><div class="total">${money(p.amount)}</div>
      </div>
      <div style="text-align:center;margin:18px 0 4px;font-weight:800">Thank You For Using Our Services</div>
      <div class="receipt-qr">Verify<br>${esc(p.verifyCode)}</div>
      <div class="notice notice-info" style="margin-top:16px;font-size:12px">
        <b>Disclaimer:</b><br>
        1. Please check Service Number and amount on your receipt.<br>
        2. Biller may acknowledge payment within 2 business days.<br>
        3. Keep this receipt for settlement, if required.
      </div>
    </div>
    <div class="row" style="justify-content:center;margin-top:18px">
      <button class="btn primary" onclick="window.print()">🖨 Print</button>
      <button class="btn secondary" onclick="downloadReceipt()">⬇ Download</button>
      <button class="btn success-btn" onclick="shareWhatsApp()">WhatsApp</button>
      <button class="btn ghost" onclick="go('dashboard')">Dashboard</button>
    </div>`);
}

function downloadReceipt() {
  const b = state.bill, p = state.payment, u = currentUser();
  const rows = [
    ['Retailer', `${u.name} (${u.id})`], ['Customer', b.name], ['Consumer ID', b.consumer],
    ['Provider', b.biller], ['Amount', money(b.total)], ['Txn ID', p.id],
    ['Date', formatDateTime(p.date || p.created_at)], ['Verify', p.verifyCode]
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>EazyPay Receipt ${esc(p.id)}</title>
  <style>body{font-family:Arial,sans-serif;background:#f5f7fb;padding:24px}.r{max-width:520px;margin:auto;background:#fff;padding:28px;border:1px solid #ddd;border-radius:14px}
  .logo{font-size:26px;font-weight:900;text-align:center}.logo span{color:#1a56db}table{width:100%;border-collapse:collapse;margin-top:12px}
  td,th{padding:8px 0;border-bottom:1px solid #eee;text-align:left}.total{text-align:center;font-size:28px;font-weight:900;margin-top:16px}</style></head><body>
  <div class="r"><div class="logo">Eazy<span>Pay</span></div><p style="text-align:center;color:#059669;font-weight:800">PAYMENT SUCCESSFUL</p>
  <table>${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>
  <div class="total">${money(p.amount)}<div style="font-size:13px;font-weight:400">Total Paid</div></div></div></body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = `EazyPay-Receipt-${p.id}.html`;
  a.click();
}

function shareWhatsApp() {
  const b = state.bill, p = state.payment;
  const msg = `EazyPay Receipt%0AStatus: SUCCESS%0ACustomer: ${encodeURIComponent(b.name)}%0AConsumer: ${b.consumer}%0AAmount: ${money(b.total)}%0ATxn: ${p.id}%0AVerify: ${p.verifyCode}`;
  window.open('https://wa.me/?text=' + msg, '_blank');
}

/* ---------- wallet ---------- */

function filteredWallet() {
  const u = currentUser();
  let rows = state.walletTx.filter(t => isAdmin() || t.user_id === u.id);
  const f = state.filters;
  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter(t => [t.id, t.user_id, t.user_name, t.note, t.counterparty_name, t.by_name].join(' ').toLowerCase().includes(q));
  }
  if (f.direction) rows = rows.filter(t => t.direction === f.direction);
  if (f.type) rows = rows.filter(t => (t.type || '') === f.type);
  if (f.status) rows = rows.filter(t => (t.status || 'SUCCESS') === f.status);
  if (f.level) rows = rows.filter(t => t.user_role === f.level);
  return rows;
}

function walletPage() {
  const u = currentUser();
  const rows = filteredWallet();
  const credits = rows.filter(t => t.direction === 'CREDIT').reduce((a, t) => a + Number(t.amount), 0);
  const debits  = rows.filter(t => t.direction === 'DEBIT').reduce((a, t) => a + Number(t.amount), 0);

  // Computed over the FULL ledger, not the filtered view, so the identity holds
  // regardless of what search is applied.
  const allMine = state.walletTx.filter(t => isAdmin() || t.user_id === u.id);
  const allCredits = allMine.filter(t => t.direction === 'CREDIT').reduce((a, t) => a + Number(t.amount), 0);
  const allDebits  = allMine.filter(t => t.direction === 'DEBIT').reduce((a, t) => a + Number(t.amount), 0);
  const opening = Number(u.balance) - allCredits + allDebits;
  const filteredTotals = (credits !== allCredits || debits !== allDebits)
    ? `<p class="muted" style="font-size:12px;margin:0 0 12px">Showing filtered rows: +${money(credits)} credit, −${money(debits)} debit (${rows.length} of ${allMine.length}). Totals below use the complete ledger.</p>`
    : '';

  dashShell(`
    <div class="section-head">
      <div><h1 class="page-title">Wallet &amp; Ledger</h1><p class="page-sub">Opening + Credit − Debit = Closing</p></div>
      <div class="stat-val" style="color:var(--green)">${money(u.balance)}</div>
    </div>
    ${filteredTotals}
    <div class="ledger-formula">
      <div><span>Opening</span><br><b>${money(opening)}</b></div>
      <div>+ <span>Total Credit</span><br><b class="success">${money(allCredits)}</b></div>
      <div>− <span>Total Debit</span><br><b class="warning">${money(allDebits)}</b></div>
      <div>= <span>Closing (Wallet)</span><br><b>${money(u.balance)}</b></div>
    </div>
    ${isAdmin() ? `<div class="grid-2">${createBalanceBox()}${debitBox()}</div>${transferBox(true)}` : (u.role !== 'RETAILER' ? transferBox(false) : '')}
    <div class="card" style="margin-top:16px">
      <h3>Filters</h3>
      <div class="filter-bar">
        <div><label class="label">Search</label><input id="fQ" class="input" value="${esc(state.filters.q)}"></div>
        <div><label class="label">Direction</label><select id="fDir" class="select">
          <option value="">All</option>
          <option value="CREDIT" ${state.filters.direction === 'CREDIT' ? 'selected' : ''}>Credit</option>
          <option value="DEBIT" ${state.filters.direction === 'DEBIT' ? 'selected' : ''}>Debit</option></select></div>
        <div><label class="label">Type</label><select id="fType" class="select"><option value="">All</option>
          ${['CREATE','TRANSFER','ADMIN_DEBIT','ADMIN_CREDIT','BILL_PAYMENT','COMMISSION','REFUND','REVERSAL','ADJUSTMENT']
            .map(t => `<option value="${t}" ${state.filters.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        ${isAdmin() ? `<div><label class="label">User Level</label><select id="fLevel" class="select">
          <option value="">All</option>
          ${['SUPER DISTRIBUTOR','DISTRIBUTOR','RETAILER','ADMIN'].map(r =>
            `<option value="${esc(r)}" ${state.filters.level === r ? 'selected' : ''}>${esc(roleLabel(r))}</option>`).join('')}
        </select></div>` : ''}
        <button class="btn primary" onclick="applyWalletFilters()">Apply</button>
        <button class="btn secondary" onclick="exportWalletExcel()">⬇ Excel</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Txn ID</th><th>Type</th><th>Dir</th><th>Amount</th><th>Opening</th><th>Closing</th>
          <th>User</th><th>Counterparty</th><th>By</th><th>Note</th><th>Date</th></tr></thead>
        <tbody>${rows.length ? rows.map(t => {
          const cls = t.direction === 'CREDIT' ? 'success' : 'warning';
          const sign = t.direction === 'CREDIT' ? '+' : '−';
          return `<tr>
            <td>${esc(t.id)}</td><td><span class="badge badge-info">${esc(t.type || '—')}</span></td>
            <td class="${cls}">${esc(t.direction)}</td><td class="${cls}">${sign}${money(t.amount)}</td>
            <td>${money(t.opening_balance)}</td><td>${money(t.closing_balance)}</td>
            <td>${esc(t.user_name || '—')}<br><span class="muted">${esc(t.user_id || '')}</span></td>
            <td>${esc(t.counterparty_name || '—')}</td><td>${esc(t.by_name || '—')}</td>
            <td>${esc(t.note || '—')}</td><td>${formatDateTime(t.date || t.created_at)}</td></tr>`;
        }).join('') : `<tr><td colspan="11"><div class="empty"><div class="ico">📒</div>No ledger entries yet</div></td></tr>`}
        </tbody>
      </table></div>
    </div>`);
}

function applyWalletFilters() {
  state.filters.q = $('fQ')?.value || '';
  state.filters.direction = $('fDir')?.value || '';
  state.filters.type = $('fType')?.value || '';
  const lv = $('fLevel');
  state.filters.level = lv ? lv.value : '';
  walletPage();
}

function exportWalletExcel() {
  const rows = filteredWallet();
  downloadExcel([
    ['Txn ID','Type','Direction','Amount','Opening','Closing','User ID','User','Counterparty','By','Note','Date'],
    ...rows.map(t => [t.id,t.type,t.direction,t.amount,t.opening_balance,t.closing_balance,
                      t.user_id,t.user_name,t.counterparty_name,t.by_name,t.note,t.date])
  ], 'EazyPay-Wallet-Ledger');
}

/* ---------- transfer / admin money ---------- */

function transferBox(adminMode) {
  const u = currentUser();
  const list = adminMode ? state.users.filter(x => x.id !== u.id) : directChildren(u);
  if (isAdmin() || u.role !== 'RETAILER') {
    return `<div class="card transfer-card"><h3>Virtual Balance Transfer</h3>
      <p class="muted">${adminMode ? 'Admin can transfer to any layer.' : 'Only direct downline.'}</p>
      <div class="transfer-grid">
        <div><label class="label">From</label><input class="input" value="${esc(u.name)} — ${esc(roleLabel(u.role))}" disabled></div>
        <div><label class="label">To</label><select id="transferTo" class="select">
          ${list.map(x => `<option value="${esc(x.id)}">${esc(roleLabel(x.role))} — ${esc(x.name)} (${esc(x.id)})</option>`).join('')}</select></div>
        <div><label class="label">Amount</label><input id="transferAmount" class="input" type="number" min="1"></div>
      </div>
      ${list.length ? `<button class="btn primary" style="margin-top:12px" onclick="doTransfer()">Transfer Balance</button>`
                    : `<div class="notice">No eligible downline.</div>`}
      <div id="transferMsg" style="margin-top:10px"></div>
    </div>`;
  }
  return '';
}

async function doTransfer() {
  const msg = $('transferMsg');
  const res = await transfer($('transferTo').value, $('transferAmount').value);
  if (!res.ok) { msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`; return; }
  msg.innerHTML = '<p class="success">Transfer complete.</p>';
  setTimeout(renderPage, 700);
}

function createBalanceBox() {
  if (!isAdmin()) return '';
  return `<div class="card transfer-card"><h3>Create Virtual Balance</h3>
    <p class="muted">Adds virtual balance to the Admin wallet only.</p>
    <div class="transfer-grid"><div><label class="label">Amount</label>
      <input id="createBalanceAmount" class="input" type="number" min="1"></div></div>
    <button class="btn primary" style="margin-top:12px" onclick="doCreateBalance()">Add to Admin Wallet</button>
    <div id="createBalanceMsg" style="margin-top:10px"></div>
  </div>`;
}

async function doCreateBalance() {
  const msg = $('createBalanceMsg');
  const res = await createVirtualBalance($('createBalanceAmount').value);
  if (!res.ok) { msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`; return; }
  msg.innerHTML = '<p class="success">Balance added.</p>';
  setTimeout(renderPage, 700);
}

function debitBox() {
  if (!isAdmin()) return '';
  const targets = state.users.filter(x => x.role !== 'ADMIN');
  return `<div class="card transfer-card"><h3>Debit Balance (Admin)</h3>
    <p class="muted">Debit from any user → amount returns to Admin wallet. Both sides logged.</p>
    <div class="transfer-grid">
      <div><label class="label">From User</label><select id="debitFrom" class="select">
        ${targets.map(x => `<option value="${esc(x.id)}">${esc(roleLabel(x.role))} — ${esc(x.name)} · ${money(x.balance)}</option>`).join('')}</select></div>
      <div><label class="label">Amount</label><input id="debitAmount" class="input" type="number" min="1"></div>
      <div><label class="label">Reason</label><input id="debitNote" class="input"></div>
    </div>
    <button class="btn danger" style="margin-top:12px" onclick="doAdminDebit()">Debit from User</button>
    <div id="debitMsg" style="margin-top:10px"></div>
  </div>`;
}

async function doAdminDebit() {
  const msg = $('debitMsg');
  const who = state.users.find(u => u.id === $('debitFrom').value);
  const amt = $('debitAmount').value;
  if (!confirm(`Debit ${money(amt)} from ${who ? who.name : $('debitFrom').value}?\n\nThis removes money from the wallet immediately and cannot be undone.`)) return;
  const res = await adminDebit($('debitFrom').value, amt, $('debitNote').value);
  if (!res.ok) { msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`; return; }
  msg.innerHTML = '<p class="success">Debited and logged on both sides.</p>';
  setTimeout(renderPage, 700);
}

/* ---------- network ---------- */

function createUserBox() {
  const u = currentUser();
  const roles = allowedCreateRoles(u);
  if (!roles.length) return '';
  const parents = validParentsForRole(roles[0], u);
  return `<div class="card transfer-card"><h3>Create ${isAdmin() ? 'New User' : esc(roleLabel(roles[0]))}</h3>
    <div class="transfer-grid">
      <div><label class="label">Name</label><input id="newName" class="input"></div>
      <div><label class="label">Layer</label>
        ${isAdmin()
          ? `<select id="newRole" class="select" onchange="onRoleChange()">${roles.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select>`
          : `<input id="newRole" class="input" value="${esc(roles[0])}" disabled>`}</div>
      <div><label class="label">Parent</label><select id="newParent" class="select">
        ${parents.map(x => `<option value="${esc(x.id)}">${esc(roleLabel(x.role))} — ${esc(x.name)}</option>`).join('')}</select></div>
      <div><label class="label">Username</label><input id="newUsername" class="input"></div>
    </div>
    <p class="muted" style="font-size:12px;margin-top:8px">An account is created PENDING. The user sets their own password after admin approval.</p>
    <button class="btn primary" style="margin-top:12px" onclick="doCreateUser()">Create User</button>
    <div id="createUserMsg" style="margin-top:10px"></div>
  </div>`;
}

function onRoleChange() {
  const u = currentUser();
  const role = $('newRole')?.value;
  const parents = validParentsForRole(role, u);
  $('newParent').innerHTML = parents
    .map(x => `<option value="${esc(x.id)}">${esc(roleLabel(x.role))} — ${esc(x.name)}</option>`).join('');
}

async function doCreateUser() {
  const msg = $('createUserMsg');
  const name = $('newName')?.value?.trim();
  const role = $('newRole')?.value?.trim();
  const parent = $('newParent')?.value?.trim();
  const username = $('newUsername')?.value?.trim();

  if (!name) { msg.innerHTML = '<p class="warning">Please enter a name.</p>'; return; }
  if (!role) { msg.innerHTML = '<p class="warning">Please select a role/layer.</p>'; return; }
  if (!parent) { msg.innerHTML = '<p class="warning">Please select a parent.</p>'; return; }
  if (!username) { msg.innerHTML = '<p class="warning">Please enter a username.</p>'; return; }
  if (username.length < 3) { msg.innerHTML = '<p class="warning">Username must be at least 3 characters.</p>'; return; }

  msg.innerHTML = '<p class="muted">Creating user…</p>';
  try {
    const res = await createUser({ name, role, parent, username });
    if (!res.ok) { msg.innerHTML = `<p class="fail">❌ ${esc(res.error)}</p>`; return; }
    msg.innerHTML = `<p class="success">✅ Created <b>${esc(res.id)}</b>. Tell the user:<br>1. Go to <b>zonepay.online</b><br>2. Click <b>"First Time Setup"</b><br>3. Username: <b>${esc(username)}</b>, then choose a password.</p>`;
    setTimeout(renderPage, 1200);
  } catch (err) {
    msg.innerHTML = `<p class="fail">❌ ${esc(err.message)}</p>`;
  }
}

function network() {
  const u = currentUser();
  if (isAdmin()) return powerAdminView();
  const children = directChildren(u);
  dashShell(`
    <h1 class="page-title">My Network</h1>
    <p class="page-sub">${esc(roleLabel(u.role))} · ${esc(u.name)}</p>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico green">💰</div><div><div class="stat-val">${money(u.balance)}</div><div class="stat-lbl">My Balance</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">👥</div><div><div class="stat-val">${children.length}</div><div class="stat-lbl">Direct Downline</div></div></div>
      <div class="stat-card"><div class="stat-ico purple">✓</div><div><div class="stat-val">${children.filter(x => x.approved && x.active).length}</div><div class="stat-lbl">Active</div></div></div>
    </div>
    ${createUserBox()}${transferBox(false)}
    <div class="card" style="margin-top:16px">
      <h3>Direct Downline</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Layer</th><th>Balance</th><th>KYC</th><th>Approval</th><th>Account</th></tr></thead>
        <tbody>${children.length ? children.map(x => `<tr>
          <td>${esc(x.name)}<br><span class="muted">${esc(x.id)}</span></td>
          <td>${esc(roleLabel(x.role))}</td><td>${money(x.balance)}</td>
          <td><span class="badge ${x.kyc === 'VERIFIED' ? 'badge-ok' : 'badge-warn'}">${esc(x.kyc || 'PENDING')}</span></td>
          <td><span class="badge ${x.approved ? 'badge-ok' : 'badge-warn'}">${x.approved ? 'APPROVED' : 'PENDING'}</span></td>
          <td><span class="badge ${x.active ? 'badge-ok' : 'badge-fail'}">${x.active ? 'ACTIVE' : 'DISABLED'}</span></td>
        </tr>`).join('') : `<tr><td colspan="6" class="empty">No downline</td></tr>`}</tbody>
      </table></div>
    </div>`);
}

function powerAdminView() {
  const u = currentUser();
  const byRole = r => state.users.filter(x => x.role === r).length;
  dashShell(`
    <h1 class="page-title">Power Admin</h1>
    <p class="page-sub">Full control · Virtual balance · Hierarchy · Approvals</p>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico green">💰</div><div><div class="stat-val">${money(u.balance)}</div><div class="stat-lbl">Admin Virtual Balance</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">🏢</div><div><div class="stat-val">${byRole('SUPER DISTRIBUTOR')}</div><div class="stat-lbl">Super Distributors</div></div></div>
      <div class="stat-card"><div class="stat-ico purple">🏬</div><div><div class="stat-val">${byRole('DISTRIBUTOR')}</div><div class="stat-lbl">Distributors</div></div></div>
      <div class="stat-card"><div class="stat-ico amber">🏪</div><div><div class="stat-val">${byRole('RETAILER')}</div><div class="stat-lbl">Retailers</div></div></div>
    </div>
    ${createUserBox()}
    <div class="grid-2">${createBalanceBox()}${debitBox()}</div>
    ${transferBox(true)}
    <div class="card" style="margin-top:16px">
      <h3>All Network Users</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Layer</th><th>Parent</th><th>Balance</th><th>Rate</th><th>KYC</th><th>Approval</th><th>Account</th><th>Bill</th><th>Xfer</th><th>Actions</th></tr></thead>
        <tbody>${state.users.map(x => `<tr>
          <td>${esc(x.name)}<br><span class="muted">${esc(x.id)}</span></td>
          <td>${esc(roleLabel(x.role))}</td><td>${esc(x.parent || '—')}</td><td>${money(x.balance)}</td>
          <td>${esc(x.commission_rate ?? 0)}%</td>
          <td><span class="badge ${x.kyc === 'VERIFIED' ? 'badge-ok' : 'badge-warn'}">${esc(x.kyc || 'PENDING')}</span></td>
          <td><span class="badge ${x.approved ? 'badge-ok' : 'badge-warn'}">${x.approved ? 'APPROVED' : 'PENDING'}</span></td>
          <td><span class="badge ${x.active ? 'badge-ok' : 'badge-fail'}">${x.active ? 'ACTIVE' : 'DISABLED'}</span></td>
          <td>${x.permissions?.bill ? 'ON' : 'OFF'}</td><td>${x.permissions?.transfer ? 'ON' : 'OFF'}</td>
          <td>${x.role === 'ADMIN' ? '—' : `<div class="row" style="gap:4px">
            <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="doToggleApproval('${esc(x.id)}',${!x.approved})">${x.approved ? 'Revoke' : 'Approve'}</button>
            <button class="btn ${x.active ? 'danger' : 'secondary'}" style="padding:6px 8px;font-size:12px" onclick="doToggleActive('${esc(x.id)}',${!x.active})">${x.active ? 'Disable' : 'Enable'}</button>
            <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="doToggleBillPerm('${esc(x.id)}',${!x.permissions?.bill})">Bill ${x.permissions?.bill ? 'ON' : 'OFF'}</button>
            <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="doToggleTransferPerm('${esc(x.id)}',${!x.permissions?.transfer})">Xfer ${x.permissions?.transfer ? 'ON' : 'OFF'}</button>
            <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="doToggleKyc('${esc(x.id)}','${x.kyc === 'VERIFIED' ? 'PENDING' : 'VERIFIED'}')">KYC</button>
            <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="doEditCommission('${esc(x.id)}')">Rate</button>
          </div>`}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="notice">Hierarchy: Admin → any layer. SD → Distributor only. Distributor → Retailer only. Retailer cannot create/transfer.</div>`);
}

const act = async (fn, msgId) => {
  const msg = $(msgId);
  const res = await fn();
  if (!res.ok) { if (msg) msg.innerHTML = `<p class="fail">${esc(res.error)}</p>`; return; }
  if (msg) msg.innerHTML = '<p class="success">Updated.</p>';
};
function doToggleApproval(id, next) {
  if (!next && !confirm(`Revoke approval for ${id}?\n\nThey will lose access immediately.`)) return;
  return act(() => toggleApproval(id, next)).then(renderPage);
}
function doToggleActive(id, next) {
  if (!next && !confirm(`Disable account ${id}?\n\nThey are locked out immediately.`)) return;
  return act(() => toggleActive(id, next)).then(renderPage);
}
function doToggleKyc(id, next) { return act(() => toggleKyc(id, next)).then(renderPage); }
function doToggleBillPerm(id, next) { return act(() => togglePermission(id, 'bill', next)).then(renderPage); }
function doToggleTransferPerm(id, next) { return act(() => togglePermission(id, 'transfer', next)).then(renderPage); }

// app_admin_set_user already allow-lists 'commission_rate'; this just exposes it.
function doEditCommission(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  const raw = prompt(`Commission rate for ${u.name} (${u.id})\n\nEnter a percentage between 0 and 100.`, String(u.commission_rate ?? 0));
  if (raw === null) return;
  const val = Number(String(raw).trim());
  if (!Number.isFinite(val) || val < 0 || val > 100) { alert('Enter a number between 0 and 100.'); return; }
  return act(() => setUser(id, 'commission_rate', val)).then(renderPage);
}

/* ---------- transactions ---------- */

function filteredBillTx() {
  const u = currentUser();
  let rows = isAdmin() ? [...state.tx]
    : state.tx.filter(t => t.retailer_id === u.id || allDownline(u).some(d => d.id === t.retailer_id));
  const f = state.filters;
  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter(t => [t.id, t.retailer_name, t.retailer_id, t.consumer_id, t.biller].join(' ').toLowerCase().includes(q));
  }
  if (f.status) rows = rows.filter(t => t.status === f.status);
  return rows;
}

function admin() {
  const rows = filteredBillTx();
  const total = rows.reduce((a, x) => a + Number(x.amount), 0);
  dashShell(`
    <div class="section-head">
      <div><h1 class="page-title">Transaction History</h1><p class="page-sub">Bill payments · filter &amp; export</p></div>
      <button class="btn secondary" onclick="exportBillExcel()">⬇ Excel</button>
    </div>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico blue">📋</div><div><div class="stat-val">${rows.length}</div><div class="stat-lbl">Transactions</div></div></div>
      <div class="stat-card"><div class="stat-ico green">₹</div><div><div class="stat-val">${money(total)}</div><div class="stat-lbl">Volume</div></div></div>
      <div class="stat-card"><div class="stat-ico amber">⏳</div><div><div class="stat-val">${rows.filter(x => x.status === 'UNDER PROCESS').length}</div><div class="stat-lbl">Pending</div></div></div>
    </div>
    <div class="card">
      <div class="filter-bar">
        <div><label class="label">Search</label><input id="bq" class="input" value="${esc(state.filters.q)}"></div>
        <div><label class="label">Status</label><select id="bst" class="select">
          <option value="">All</option>
          ${['UNDER PROCESS','SUCCESS','FAILED'].map(s =>
            `<option value="${s}" ${state.filters.status === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <button class="btn primary" onclick="applyBillFilters()">Apply</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Txn ID</th><th>Retailer</th><th>Consumer</th><th>Biller</th><th>Amount</th><th>Commission</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>${rows.map(x => `<tr>
          <td>${esc(x.id)}</td>
          <td>${esc(x.retailer_name)}<br><span class="muted">${esc(x.retailer_id || '')}</span></td>
          <td>${esc(x.consumer_id)}</td><td>${esc(x.biller)}</td>
          <td>${money(x.amount)}</td><td>${money(x.commission || 0)}</td>
          <td><span class="badge ${x.status === 'FAILED' ? 'badge-fail' : x.status === 'SUCCESS' ? 'badge-ok' : 'badge-warn'}">${esc(x.status)}</span></td>
          <td>${formatDateTime(x.date || x.created_at)}</td>
          <td><button class="btn secondary" style="padding:6px 10px;font-size:12px" onclick="printBillTxn('${esc(x.id)}')">Print</button></td>
        </tr>`).join('') || `<tr><td colspan="9" class="empty">No transactions</td></tr>`}</tbody>
      </table></div>
    </div>`);
}

function applyBillFilters() {
  state.filters.q = $('bq')?.value || '';
  state.filters.status = $('bst')?.value || '';
  admin();
}

function exportBillExcel() {
  const rows = filteredBillTx();
  downloadExcel([
    ['Txn ID','Retailer','Retailer ID','Consumer','Biller','Amount','Commission','Status','Date'],
    ...rows.map(x => [x.id,x.retailer_name,x.retailer_id,x.consumer_id,x.biller,x.amount,x.commission||0,x.status,x.date])
  ], 'EazyPay-Transactions');
}

function printBillTxn(id) {
  const x = state.tx.find(t => t.id === id);
  if (!x) return;
  const w = window.open('', '_blank');
  w.document.write(`<!doctype html><html><head><title>${esc(x.id)}</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #eee}</style></head><body>
    <h2>EazyPay Transaction</h2><p><b>${esc(x.status)}</b></p>
    <table>
      <tr><td>Txn ID</td><td>${esc(x.id)}</td></tr>
      <tr><td>Retailer</td><td>${esc(x.retailer_name)}</td></tr>
      <tr><td>Consumer</td><td>${esc(x.consumer_id)}</td></tr>
      <tr><td>Biller</td><td>${esc(x.biller)}</td></tr>
      <tr><td>Amount</td><td>${money(x.amount)}</td></tr>
      <tr><td>Date</td><td>${formatDateTime(x.date || x.created_at)}</td></tr>
    </table><script>onload=()=>print()<\/script></body></html>`);
  w.document.close();
}

function downloadExcel(rows, name) {
  const cell = v => {
    const s = esc(v);
    return typeof v === 'number' ? `<Cell><Data ss:Type="Number">${s}</Data></Cell>`
                                 : `<Cell><Data ss:Type="String">${s}</Data></Cell>`;
  };
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>${rows.map(r => `<Row>${r.map(cell).join('')}</Row>`).join('')}</Table></Worksheet></Workbook>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([xml], { type: 'application/vnd.ms-excel' }));
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
}

/* ---------- commission / activity ---------- */

function commissionPage() {
  const u = currentUser();
  const scope = isAdmin() ? state.tx
    : state.tx.filter(t => t.retailer_id === u.id || allDownline(u).some(d => d.id === t.retailer_id));
  dashShell(`
    <h1 class="page-title">Commission Report</h1>
    <p class="page-sub">Your rate: ${esc(u.commission_rate ?? 0)}% · earned on bill payments</p>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico purple">📈</div><div><div class="stat-val">${money(scope.reduce((a, t) => a + Number(t.commission || 0), 0))}</div><div class="stat-lbl">Total Commission</div></div></div>
      <div class="stat-card"><div class="stat-ico green">📅</div><div><div class="stat-val">${money(scope.filter(t => isToday(t.date)).reduce((a, t) => a + Number(t.commission || 0), 0))}</div><div class="stat-lbl">Today</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">%</div><div><div class="stat-val">${esc(u.commission_rate ?? 0)}%</div><div class="stat-lbl">Your Rate</div></div></div>
    </div>
    <div class="card"><div class="table-wrap"><table>
      <thead><tr><th>Txn ID</th><th>Retailer</th><th>Amount</th><th>Commission</th><th>Date</th></tr></thead>
      <tbody>${scope.filter(t => Number(t.commission) > 0).map(t => `<tr>
        <td>${esc(t.id)}</td><td>${esc(t.retailer_name)}</td><td>${money(t.amount)}</td>
        <td class="success">${money(t.commission)}</td><td>${formatDateTime(t.date || t.created_at)}</td>
      </tr>`).join('') || `<tr><td colspan="5" class="empty">No commission yet</td></tr>`}</tbody>
    </table></div></div>`);
}

function activityPage() {
  const u = currentUser();
  const rows = isAdmin() ? state.activity : state.activity.filter(a => a.user_id === u.id);
  dashShell(`
    <h1 class="page-title">Login / Activity History</h1>
    <p class="page-sub">Recent actions on this account${isAdmin() ? ' (all users)' : ''}</p>
    <div class="card"><div class="table-wrap"><table>
      <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Detail</th></tr></thead>
      <tbody>${rows.length ? rows.slice(0, 100).map(a => `<tr>
        <td>${formatDateTime(a.date || a.created_at)}</td>
        <td>${esc(a.user_name || '—')}<br><span class="muted">${esc(a.user_id || '')}</span></td>
        <td>${esc(roleLabel(a.user_role || ''))}</td>
        <td><span class="badge badge-info">${esc(a.action)}</span></td><td>${esc(a.detail || '—')}</td>
      </tr>`).join('') : `<tr><td colspan="5" class="empty">No activity yet</td></tr>`}</tbody>
    </table></div></div>`);
}

/* ---------- boot ---------- */

// Keep the session fresh across tabs and expiry.
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (!session) {
    state.me = null;
    if (state.page !== 'home') go('login');
    return;
  }
  await loadMe();
  if (state.me && (state.page === 'home' || state.page === 'login')) go('dashboard');
});

const me = await restore();
if (me) { await loadAll(); go('dashboard'); }
else home();
