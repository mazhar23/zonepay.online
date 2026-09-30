import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { electricityOperators, UP_DISCOMS } from './operators.js';

// APIclub Configuration
const APICLUB_KEY = 'apclb_5lptSLyLopA42cLtcit0M6DKcdd32711';
const APICLUB_URL = 'https://api.apiclub.in/api/v1/fetch_bill';

// Supabase Configuration
const supabaseUrl = 'https://ivvtryddebbizflmvdzz.supabase.co';
const supabaseKey = 'sb_publishable_MHevw7ZOWkf8vocACWhzeQ_dViUPHdU';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// Expose ALL interactive functions to window so inline onclick works
// (ES modules are scoped, so we must attach to window explicitly)
// ============================================================

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
    
    // Initialize state FIRST so loadDataFromSupabase can use it
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

    // Load other data from Supabase
    await loadDataFromSupabase();
    
    // Load current user state from Supabase persisted state
    await loadCurrentUserState();
    
    // Render the app
    render();
    
  } catch (error) {
    console.error('App initialization error:', error);
    // Initialize state for fallback
    window.state = window.state || {
      page: "home", logged: false, currentUserId: null, bill: null,
      payment: null, sidebarOpen: false, tx: [], walletTx: [],
      activity: [], filters: { q: "", type: "", direction: "", status: "", from: "", to: "", level: "" }
    };
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

// ============================================================
//  RENDER — routes to the correct page view
// ============================================================
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  switch (window.state.page) {
    case "bill":
      renderBillPage(app);
      break;
    default:
      app.innerHTML = `
        <div style="font-family:'Inter',sans-serif; max-width:600px; margin:40px auto; text-align:center;">
          <h1 style="margin-bottom:20px;">EazyPay — ${window.state.page.charAt(0).toUpperCase() + window.state.page.slice(1)}</h1>
          <button onclick="window.go('bill')" style="padding:12px 24px; font-size:16px; background:#007bff; color:#fff; border:none; border-radius:6px; cursor:pointer;">
            ⚡ Fetch Electricity Bill
          </button>
        </div>`;
      break;
  }
}

// ============================================================
//  BILL FETCH — calls APIclub via Supabase Edge Function proxy
// ============================================================
async function handleFetchBill() {
  const opSelect = document.getElementById('operatorCode');
  const consInput = document.getElementById('consumerNo');
  const resultDiv = document.getElementById('billResult');
  const fetchBtn  = document.getElementById('fetchBillBtn');
  
  if (!opSelect.value || !consInput.value.trim()) {
    alert("Please select an operator and enter a consumer number.");
    return;
  }
  
  // Show loading state
  fetchBtn.disabled = true;
  fetchBtn.textContent = "Fetching…";
  resultDiv.innerHTML = `<div style="text-align:center;padding:30px;color:#666;">
    <div style="font-size:24px;margin-bottom:10px;">⏳</div>
    Fetching your bill from the provider…
  </div>`;
  
  try {
    // Build payload
    const payload = {
      consumer_no: consInput.value.trim(),
      operator: opSelect.value
    };
    
    // Check for extra params (Mobile number, Billing Unit, Discom)
    const op = electricityOperators.find(o => o.operator_code === opSelect.value);
    if (op && op.params && op.params.length > 0) {
      if (op.params[0] === 'Discom') {
        payload.params = document.getElementById('extraParamDiscom').value;
      } else {
        const extraVal = document.getElementById('extraParam').value.trim();
        if (!extraVal) {
          alert(`Please enter: ${op.params[0]}`);
          fetchBtn.disabled = false;
          fetchBtn.textContent = "Fetch Bill";
          resultDiv.innerHTML = "Bill details will appear here…";
          return;
        }
        payload.params = extraVal;
      }
    }

    // Call Vercel Serverless Function proxy to bypass CORS
    const proxyUrl = '/api/fetch-bill';

    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // The PHP proxy forwards the response as-is in raw mode.
    // If it fails to parse as JSON, handle it gracefully.
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      throw new Error("Failed to parse API response. The proxy might be blocking the request or the API returned non-JSON data.");
    }
    
    if (data.status === 'success' || data.code === 200) {
      const r = data.response || data;
      resultDiv.innerHTML = `
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#28a745;color:#fff;padding:12px 16px;font-weight:600;">
            ✅ Bill Fetched Successfully
          </div>
          <div style="padding:16px;">
            <table style="width:100%;border-collapse:collapse;">
              ${r.consumer_name ? `<tr><td style="padding:8px 0;color:#666;">Consumer Name</td><td style="padding:8px 0;font-weight:600;">${r.consumer_name}</td></tr>` : ''}
              ${r.consumer_no ? `<tr><td style="padding:8px 0;color:#666;">Consumer No.</td><td style="padding:8px 0;font-weight:600;">${r.consumer_no}</td></tr>` : ''}
              ${r.bill_amount != null ? `<tr><td style="padding:8px 0;color:#666;">Bill Amount</td><td style="padding:8px 0;font-weight:700;color:#d32f2f;font-size:18px;">₹${Number(r.bill_amount).toLocaleString('en-IN')}</td></tr>` : ''}
              ${r.due_date ? `<tr><td style="padding:8px 0;color:#666;">Due Date</td><td style="padding:8px 0;font-weight:600;">${r.due_date}</td></tr>` : ''}
              ${r.bill_date ? `<tr><td style="padding:8px 0;color:#666;">Bill Date</td><td style="padding:8px 0;">${r.bill_date}</td></tr>` : ''}
              ${r.operator_name ? `<tr><td style="padding:8px 0;color:#666;">Operator</td><td style="padding:8px 0;">${r.operator_name}</td></tr>` : ''}
            </table>
          </div>
        </div>
        <details style="margin-top:12px;"><summary style="cursor:pointer;color:#666;font-size:13px;">Show raw API response</summary>
          <pre style="white-space:pre-wrap;word-wrap:break-word;background:#f5f5f5;padding:12px;border-radius:4px;font-size:12px;margin-top:8px;">${JSON.stringify(data, null, 2)}</pre>
        </details>`;
    } else {
      // Error from API
      resultDiv.innerHTML = `
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;">
          <div style="font-weight:600;color:#856404;margin-bottom:8px;">⚠️ ${data.message || 'Could not fetch bill'}</div>
          <pre style="white-space:pre-wrap;word-wrap:break-word;font-size:12px;color:#666;">${JSON.stringify(data, null, 2)}</pre>
        </div>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `
      <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;padding:16px;">
        <div style="font-weight:600;color:#721c24;margin-bottom:8px;">❌ Network Error</div>
        <div style="color:#721c24;">${err.message}</div>
        <div style="margin-top:10px;font-size:13px;color:#666;">
          This usually means the Supabase Edge Function proxy is not deployed yet.<br>
          Please deploy the edge function first (see instructions).
        </div>
      </div>`;
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = "Fetch Bill";
  }
}

function updateBillParams() {
  const code = document.getElementById('operatorCode').value;
  const op = electricityOperators.find(o => o.operator_code === code);
  const textContainer = document.getElementById('extraParamContainer');
  const discomContainer = document.getElementById('discomContainer');
  
  textContainer.style.display = 'none';
  discomContainer.style.display = 'none';
  
  if (op && op.params && op.params.length > 0) {
    if (op.params[0] === 'Discom') {
      discomContainer.style.display = 'block';
    } else {
      textContainer.style.display = 'block';
      document.getElementById('extraParamLabel').innerText = op.params[0] + ':';
    }
  }
}

function renderBillPage(app) {
  const options = electricityOperators.map(o => `<option value="${o.operator_code}">${o.operator_name}</option>`).join('');
  const discoms = UP_DISCOMS.map(d => `<option value="${d}">${d}</option>`).join('');
  
  app.innerHTML = `
    <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto; padding:24px;">
      <h2 style="margin-bottom:20px;">⚡ Electricity Bill Fetch</h2>

      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;font-weight:600;font-size:14px;">Operator:</label>
        <select id="operatorCode" onchange="window.updateBillParams()" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;">
          <option value="">-- Select Operator --</option>
          ${options}
        </select>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;font-weight:600;font-size:14px;">Consumer Number:</label>
        <input type="text" id="consumerNo" placeholder="Enter Consumer Number" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;box-sizing:border-box;">
      </div>

      <div id="extraParamContainer" style="margin-bottom:16px;display:none;">
        <label id="extraParamLabel" style="display:block;margin-bottom:6px;font-weight:600;font-size:14px;">Extra Param:</label>
        <input type="text" id="extraParam" placeholder="Enter value" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;box-sizing:border-box;">
      </div>

      <div id="discomContainer" style="margin-bottom:16px;display:none;">
        <label style="display:block;margin-bottom:6px;font-weight:600;font-size:14px;">UP Discom:</label>
        <select id="extraParamDiscom" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;">
          ${discoms}
        </select>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:20px;">
        <button id="fetchBillBtn" onclick="window.handleFetchBill()" style="padding:12px 24px;background:#007bff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:15px;font-weight:600;">
          Fetch Bill
        </button>
        <button onclick="window.go('home')" style="padding:12px 24px;background:#6c757d;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:15px;">
          Back
        </button>
      </div>
      
      <div id="billResult" style="padding:20px;background:#f8f9fa;border:1px solid #ddd;min-height:100px;border-radius:8px;color:#666;">
        Bill details will appear here…
      </div>
    </div>
  `;
}

// Page stubs
function home()           { render(); }
function login()          { render(); }
function dashboard()      { render(); }
function billPage()       { render(); }
function details()        { render(); }
function payment()        { render(); }
function receipt()        { render(); }
function admin()          { render(); }
function walletPage()     { render(); }
function network()        { render(); }
function commissionPage() { render(); }
function activityPage()   { render(); }

// ============================================================
//  ATTACH EVERYTHING TO WINDOW (critical for inline onclick)
// ============================================================
window.go = go;
window.render = render;
window.doLogin = doLogin;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.handleFetchBill = handleFetchBill;
window.updateBillParams = updateBillParams;

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for use in other files (if using a bundler/Node in the future)
export { initializeApp, saveUsers, saveTx, saveWalletTx, saveActivity, saveCurrentUserState };
