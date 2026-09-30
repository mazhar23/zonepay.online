const { createClient } = require('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');

// Supabase Configuration
const supabaseUrl = 'https://ivvtryddebbizflmvdzz.supabase.co';
const supabaseKey = 'sb_publishable_MHevw7ZOWkf8vocACWhzeQ_dViUPHdU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize app and load data from Supabase
async function initializeApp() {
  try {
    // Load users from Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (usersError) {
      console.error('Error loading users from Supabase:', usersError);
      // Fallback to demo users
      window.users = await initializeDemoUsers();
    } else {
      window.users = users || [];
    }
    
    // Configure users
    if (window.users) {
      window.users.forEach(u => {
        u.permissions = u.permissions || { bill: true, transfer: u.role !== "RETAILER" };
        if (u.mainBalance == null) u.mainBalance = 0;
        if (!u.kyc) u.kyc = u.approved ? "VERIFIED" : "PENDING";
        u.commissionRate = 0;
      });
    }
    
    // Load other data from Supabase
    await loadDataFromSupabase();
    
    // Load current user state from Supabase persisted state
    await loadCurrentUserState();
    
    // Initialize state
    window.state = {
      page: "home",
      logged: false,
      currentUserId: null,
      bill: null,
      payment: null,
      sidebarOpen: false,
      tx: [],
      walletTx: [],
      activity: [],
      filters: { q: "", type: "", direction: "", status: "", from: "", to: "", level: "" }
    };
    
    // Render the app
    render();
    
  } catch (error) {
    console.error('App initialization error:', error);
    // Initialize demo users as fallback
    window.users = await initializeDemoUsers();
    await loadDemoData();
    render();
  }
}

async function initializeDemoUsers() {
  const demoUsers = [
    { id: "ADM001", name: "EazyPay Power Admin", role: "ADMIN", parent: null, balance: 50000, mainBalance: 0, approved: true, active: true, kyc: "VERIFIED", permissions: { bill: true, transfer: true }, username: "admin001", password: "admin123", commissionRate: 0 },
    { id: "SD001", name: "Ahmedabad Super Distributor", role: "SUPER DISTRIBUTOR", parent: "ADM001", balance: 15000, mainBalance: 0, approved: true, active: true, kyc: "VERIFIED", permissions: { bill: true, transfer: true }, username: "super001", password: "123456", commissionRate: 0 },
    { id: "D001", name: "Ahmedabad Distributor", role: "DISTRIBUTOR", parent: "SD001", balance: 5000, mainBalance: 0, approved: true, active: true, kyc: "VERIFIED", permissions: { bill: true, transfer: true }, username: "dist001", password: "123456", commissionRate: 0 },
    { id: "R001", name: "Ahmedabad Retailer", role: "RETAILER", parent: "D001", balance: 2500, mainBalance: 0, approved: true, active: true, kyc: "VERIFIED", permissions: { bill: true, transfer: false }, username: "retailer001", password: "123456", commissionRate: 0 },
    { id: "R002", name: "Demo Retailer 2", role: "RETAILER", parent: "D001", balance: 1200, mainBalance: 0, approved: false, active: false, kyc: "PENDING", permissions: { bill: false, transfer: false }, username: "retailer002", password: "123456", commissionRate: 0 }
  ];
  
  // Save demo users to Supabase
  await saveUsers();
  return demoUsers;
}

async function loadDataFromSupabase() {
  try {
    // Load transactions
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (!txError && tx) {
      window.state.tx = tx;
    }
    
    // Load wallet transactions
    const { data: walletTx, error: walletTxError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!walletTxError && walletTx) {
      window.state.walletTx = walletTx;
    }
    
    // Load activities
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
    
    if (!activityError && activity) {
      window.state.activity = activity;
    }
    
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
  }
}

async function loadDemoData() {
  // Load demo transactions
  window.state.tx = [
    { id: "EZY-260921-1001", retailer: "Ahmedabad Retailer", retailerId: "R001", consumer: "1234567890", biller: "Torrent Power", service: "ELECTRICITY", amount: 1842, status: "UNDER PROCESS", date: "21 Sep 2026, 16:42", commission: 0 },
    { id: "EZY-260921-1002", retailer: "Demo Retailer", retailerId: "R002", consumer: "9876543210", biller: "UGVCL", service: "ELECTRICITY", amount: 921, status: "UNDER PROCESS", date: "21 Sep 2026, 15:18", commission: 0 }
  ];
  await saveTx();
}

async function loadCurrentUserState() {
  try {
    // Load persisted state from Supabase
    const { data: persistedData, error } = await supabase
      .from('persisted_state')
      .select('*')
      .single();
    
    if (persistedData) {
      // Restore current user state
      if (persistedData.currentUserId) {
        window.state.currentUserId = persistedData.currentUserId;
        window.state.logged = true;
      }
      if (persistedData.page) window.state.page = persistedData.page;
      if (persistedData.bill) window.state.bill = persistedData.bill;
      if (persistedData.payment) window.state.payment = persistedData.payment;
      if (persistedData.sidebarOpen !== undefined) window.state.sidebarOpen = persistedData.sidebarOpen;
    }
  } catch (error) {
    console.error('Error loading current user state:', error);
  }
}

// Database operations
async function saveUsers() {
  try {
    const { error } = await supabase
      .from('users')
      .upsert(window.users);
    return { error };
  } catch (error) {
    console.error('Error saving users to Supabase:', error);
    return { error };
  }
}

async function saveTx() {
  try {
    const { error } = await supabase
      .from('transactions')
      .upsert(window.state.tx);
    return { error };
  } catch (error) {
    console.error('Error saving transactions to Supabase:', error);
    return { error };
  }
}

async function saveWalletTx() {
  try {
    const { error } = await supabase
      .from('wallet_transactions')
      .upsert(window.state.walletTx);
    return { error };
  } catch (error) {
    console.error('Error saving wallet transactions to Supabase:', error);
    return { error };
  }
}

async function saveActivity() {
  try {
    const { error } = await supabase
      .from('activities')
      .upsert(window.state.activity);
    return { error };
  } catch (error) {
    console.error('Error saving activities to Supabase:', error);
    return { error };
  }
}

async function saveCurrentUserState() {
  try {
    const persistedData = {
      id: 'main_state',
      currentUserId: window.state.currentUserId,
      logged: window.state.logged,
      page: window.state.page,
      bill: window.state.bill,
      payment: window.state.payment,
      sidebarOpen: window.state.sidebarOpen,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('persisted_state')
      .upsert(persistedData);
    return { error };
  } catch (error) {
    console.error('Error saving current user state to Supabase:', error);
    return { error };
  }
}

// Helper functions
function currentUser() {
  return window.users?.find(u => u.id === window.state.currentUserId) || null;
}

function roleLabel(r) {
  return (r || "").replace("SUPER DISTRIBUTOR", "Super Distributor").replace("DISTRIBUTOR", "Distributor").replace("RETAILER", "Retailer").replace("ADMIN", "Admin");
}

function userLabel(u) {
  return u ? `${roleLabel(u.role)} — ${u.name} (${u.id})` : "—";
}

function nowStr() {
  return new Date().toLocaleString("en-IN");
}

function todayKey() {
  const d = new Date();
  return d.toDateString();
}

function isToday(dateStr) {
  try {
    return new Date(dateStr).toDateString() === todayKey();
  } catch (e) {
    return (dateStr || "").includes(new Date().getDate().toString());
  }
}

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function uid(prefix) {
  return prefix + "-" + Date.now().toString().slice(-10) + "-" + Math.floor(Math.random() * 900 + 100);
}

function directChildren(u) {
  return window.users?.filter(x => x.parent === u.id) || [];
}

function allDownline(u) {
  const out = [];
  const q = [u.id];
  while (q.length) {
    const id = q.shift();
    window.users?.filter(x => x.parent === id).forEach(c => {
      out.push(c);
      q.push(c.id);
    });
  }
  return out;
}

function canTransferTo(from, to) {
  if (!from || !to || from.id === to.id) return false;
  if (from.role === "ADMIN") return true;
  return to.parent === from.id;
}

function toggleSidebar() {
  window.state.sidebarOpen = !window.state.sidebarOpen;
  saveCurrentUserState();
  render();
}

function closeSidebar() {
  window.state.sidebarOpen = false;
  saveCurrentUserState();
  render();
}

async function addActivity(action, detail) {
  const u = currentUser();
  const activity = {
    id: uid("ACT"),
    userId: u?.id,
    userName: u?.name,
    userRole: u?.role,
    action,
    detail,
    date: nowStr()
  };
  
  window.state.activity.unshift(activity);
  if (window.state.activity.length > 500) {
    window.state.activity.length = 500;
  }
  
  await saveActivity();
}

async function addWalletTx(entry) {
  const id = uid("WTX");
  const row = {
    id,
    date: nowStr(),
    openingBalance: entry.openingBalance ?? 0,
    closingBalance: entry.closingBalance ?? entry.balanceAfter ?? 0,
    ...entry
  };
  
  window.state.walletTx.unshift(row);
  await saveWalletTx();
  return row;
}

function go(p) {
  window.state.page = p;
  window.state.sidebarOpen = false;
  saveCurrentUserState();
  const map = {
    home, login, dashboard, bill: billPage, details, payment, receipt,
    admin, wallet: walletPage, network, powerAdmin: () => { window.state.page = "network"; network(); },
    commission: commissionPage, activity: activityPage
  };
  (map[p] || home)();
}

async function doLogin() {
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;
  
  const u = window.users?.find(x => x.username === username && x.password === password);
  if (!u) {
    alert("Invalid username or password");
    return;
  }
  if (!u.approved || !u.active) {
    alert("User is not approved or is disabled by Admin.");
    return;
  }
  
  window.state.logged = true;
  window.state.currentUserId = u.id;
  
  await saveCurrentUserState();
  await addActivity("LOGIN", "Successful login");
  go("dashboard");
}

async function logout() {
  await addActivity("LOGOUT", "User logged out");
  window.state.logged = false;
  window.state.currentUserId = null;
  await saveCurrentUserState();
  go("home");
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for use in other files
if (typeof module !== 'undefined') {
  module.exports = { initializeApp, saveUsers, saveTx, saveWalletTx, saveActivity, saveCurrentUserState };
}
