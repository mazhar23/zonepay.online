const electricityOperators = [
  { "operator_name": "Adani Electricity", "type": "electricity", "operator_code": "ADEM", "params": [] },
  { "operator_name": "Ajmer Vidyut Vitran Nigam Limited", "type": "electricity", "operator_code": "AVVR", "params": [] },
  { "operator_name": "APDCL (Non-RAPDR) - ASSAM", "type": "electricity", "operator_code": "APDC", "params": [] },
  { "operator_name": "Assam Power Distribution Company Ltd (RAPDR)", "type": "electricity", "operator_code": "APDR", "params": [] },
  { "operator_name": "Bangalore Electricity supply company Ltd", "type": "electricity", "operator_code": "BESC", "params": [] },
  { "operator_name": "Bharatpur Electricity Services Ltd. (BESL)", "type": "electricity", "operator_code": "BESL", "params": [] },
  { "operator_name": "BEST Mumbai", "type": "electricity", "operator_code": "BEUM", "params": [] },
  { "operator_name": "Bikaner Electricity Supply Limited", "type": "electricity", "operator_code": "BKEB", "params": [] },
  { "operator_name": "BSES Rajdhani Power Limited", "type": "electricity", "operator_code": "BSRD", "params": [] },
  { "operator_name": "BSES Yamuna Power Limited", "type": "electricity", "operator_code": "BSYD", "params": [] },
  { "operator_name": "Calcutta Electric Supply Corporation Limited", "type": "electricity", "operator_code": "CESC", "params": [] },
  { "operator_name": "CESCOM - KARNATAKA", "type": "electricity", "operator_code": "CESK", "params": [] },
  { "operator_name": "Chhattisgarh State Power Distribution Company Ltd", "type": "electricity", "operator_code": "CSPD", "params": [] },
  { "operator_name": "Dakshin Gujarat Vij Company Limited", "type": "electricity", "operator_code": "DGVC", "params": [] },
  { "operator_name": "Dakshin Haryana Bijli Vitran Nigam", "type": "electricity", "operator_code": "DHBH", "params": [ "Mobile number" ] },
  { "operator_name": "Dadra and Nagar Haveli and Daman and Diu Power Distribution Corporation Limited", "type": "electricity", "operator_code": "DADE", "params": [] },
  { "operator_name": "DNH Power Distribution Company Limited", "type": "electricity", "operator_code": "DNHP", "params": [] },
  { "operator_name": "Goa Electricity Department", "type": "electricity", "operator_code": "GOED", "params": [] },
  { "operator_name": "Gulbarga Electricity Supply Company Limited", "type": "electricity", "operator_code": "GESK", "params": [] },
  { "operator_name": "Himachal Pradesh State Electricity Board Ltd", "type": "electricity", "operator_code": "HPSE", "params": [] },
  { "operator_name": "Hubli Electricity Supply Company Ltd", "type": "electricity", "operator_code": "HESK", "params": [] },
  { "operator_name": "Jaipur Vidyut Vitran Nigam", "type": "electricity", "operator_code": "JVVR", "params": [] },
  { "operator_name": "Jammu and Kashmir Power Development Department", "type": "electricity", "operator_code": "JKPD", "params": [] },
  { "operator_name": "Jamshedpur Utilities & Services (JUSCO)", "type": "electricity", "operator_code": "JUSC", "params": [] },
  { "operator_name": "Jharkhand Bijli Vitran Nigam Limited", "type": "electricity", "operator_code": "JBVN", "params": [] },
  { "operator_name": "Jodhpur Vidyut Vitran Nigam Limited", "type": "electricity", "operator_code": "JDVR", "params": [] },
  { "operator_name": "Kannan Devan Hills Plantations Company Private Limited", "type": "electricity", "operator_code": "KDHP", "params": [] },
  { "operator_name": "Kanpur Electricity Supply Company", "type": "electricity", "operator_code": "KESC", "params": [] },
  { "operator_name": "Kerala State Electricity Board Ltd", "type": "electricity", "operator_code": "KSEB", "params": [] },
  { "operator_name": "Kota Electricity Distribution Limited", "type": "electricity", "operator_code": "KEDR", "params": [] },
  { "operator_name": "Madhya Gujarat Vij Company Limited", "type": "electricity", "operator_code": "MGVG", "params": [] },
  { "operator_name": "Madhya Kshetra Vitaran (Rural) - Madhya Pradesh", "type": "electricity", "operator_code": "MKMP", "params": [] },
  { "operator_name": "Madhya Kshetra Vitaran (Urban) - Madhya Pradesh", "type": "electricity", "operator_code": "MKVU", "params": [] },
  { "operator_name": "Meghalaya Power Dist Corp Ltd", "type": "electricity", "operator_code": "MPDC", "params": [] },
  { "operator_name": "Maharashtra State Electricity Distbn Co Ltd (MSEDCL)", "type": "electricity", "operator_code": "MSEM", "params": [ "Billing Unit" ] },
  { "operator_name": "Muzaffarpur Vidyut Vitran", "type": "electricity", "operator_code": "MZVV", "params": [] },
  { "operator_name": "NESCO Utility", "type": "electricity", "operator_code": "NESO", "params": [] },
  { "operator_name": "New Delhi Municipal Council (NDMC)", "type": "electricity", "operator_code": "NDMC", "params": [] },
  { "operator_name": "Noida Power", "type": "electricity", "operator_code": "NOPN", "params": [] },
  { "operator_name": "North Bihar Power Distribution Co. Ltd", "type": "electricity", "operator_code": "NBBR", "params": [] },
  { "operator_name": "Paschim Gujarat Vij Company Limited", "type": "electricity", "operator_code": "PGVG", "params": [] },
  { "operator_name": "Paschim Kshetra Vidyut Vitaran - Madhya Pradesh", "type": "electricity", "operator_code": "PVMP", "params": [] },
  { "operator_name": "Poorv Kshetra Vitaran (Rural) - MADHYA PRADESH", "type": "electricity", "operator_code": "PKVR", "params": [] },
  { "operator_name": "Punjab State Power Corporation Limited", "type": "electricity", "operator_code": "PSPC", "params": [] },
  { "operator_name": "SNDL Power - NAGPUR", "type": "electricity", "operator_code": "SNPN", "params": [] },
  { "operator_name": "South Bihar Power Distribution Co. Ltd", "type": "electricity", "operator_code": "SBBR", "params": [] },
  { "operator_name": "Southern Power Distribution Company of Telangana Limited", "type": "electricity", "operator_code": "SPDC", "params": [] },
  { "operator_name": "Central Power Distribution Corporation Ltd. of Andhra Pradesh (APCPDCL)", "type": "electricity", "operator_code": "APCP", "params": [] },
  { "operator_name": "Northern Power Distribution Company of Telangana Limited", "type": "electricity", "operator_code": "NPDC", "params": [] },
  { "operator_name": "TP Southern Odisha Distribution Limited", "type": "electricity", "operator_code": "SOTO", "params": [] },
  { "operator_name": "Tamil Nadu Electricity Board", "type": "electricity", "operator_code": "TNEB", "params": [] },
  { "operator_name": "Tata Power - MUMBAI", "type": "electricity", "operator_code": "TAPM", "params": [] },
  { "operator_name": "Tata Power AJMER - RAJASTHAN", "type": "electricity", "operator_code": "TPAR", "params": [] },
  { "operator_name": "Tata Power Delhi Distribution Limited", "type": "electricity", "operator_code": "TAPD", "params": [] },
  { "operator_name": "Telangana Co-Operative Electric Supply Society Ltd", "type": "electricity", "operator_code": "TESS", "params": [] },
  { "operator_name": "Torrent Power Limited - Agra", "type": "electricity", "operator_code": "TPAG", "params": [] },
  { "operator_name": "Torrent Power Limited - Ahmedabad", "type": "electricity", "operator_code": "TPAH", "params": [] },
  { "operator_name": "Torrent Power Limited - Bhiwandi", "type": "electricity", "operator_code": "TPBW", "params": [] },
  { "operator_name": "Torrent Power Limited - Surat", "type": "electricity", "operator_code": "TPSR", "params": [] },
  { "operator_name": "Torrent Power Limited - Shilmumbrakalwa", "type": "electricity", "operator_code": "TPSM", "params": [] },
  { "operator_name": "TP Ajmer Distribution Ltd (TPADL)", "type": "electricity", "operator_code": "TPAD", "params": [] },
  { "operator_name": "TP Central Odisha Distribution Limited (TPCODL)", "type": "electricity", "operator_code": "TPCO", "params": [] },
  { "operator_name": "Tripura Electricity Corp Ltd", "type": "electricity", "operator_code": "TSTP", "params": [] },
  { "operator_name": "Uttar Gujarat Vij Company Limited", "type": "electricity", "operator_code": "UGVG", "params": [] },
  { "operator_name": "Uttar Haryana Bijli Vitran Nigam", "type": "electricity", "operator_code": "UHBV", "params": [ "Mobile number" ] },
  { "operator_name": "Uttarakhand Power Corporation Ltd - UPCL", "type": "electricity", "operator_code": "UPUK", "params": [] },
  { "operator_name": "UP Power Corporation Ltd - UPPCL", "type": "electricity", "operator_code": "UPCL", "params": [ "Discom" ] },
  { "operator_name": "WESCO Utility", "type": "electricity", "operator_code": "WESO", "params": [] },
  { "operator_name": "West Bengal State Electricity Distribution Company Limited", "type": "electricity", "operator_code": "WBSE", "params": [ "Mobile number" ] }
];

const UP_DISCOMS = [
  "Agra-DVVNL", "Aligarh-DVVNL", "Ambedkar Nagar-MVVNL", "Amethi-MVVNL", "Amroha-PVVNL", "Auraiya-DVVNL", "Ayodhya-MVVNL", "Azamgarh-PUVNL", "Bagpat-PVVNL", "Bahraich-MVVNL", "Ballia-PUVNL", "Balrampur-MVVNL", "Banda-DVVNL", "Barabanki-MVVNL", "Bareilly-MVVNL", "Basti-PUVNL", "Bijnor-PVVNL", "Budaun-MVVNL", "Bulandshahr-PVVNL", "Chandauli-PUVNL", "Chitrakoot-DVVNL", "Deoria-PUVNL", "Etah-DVVNL", "Etawah-DVVNL", "Farrukhabad-DVVNL", "Fatehpur-PUVNL", "Firozabad-DVVNL", "Gautam Buddha Nagar-PVVNL", "Ghaziabad-PVVNL", "Ghazipur-PUVNL", "Gonda-MVVNL", "Gorakhpur-PUVNL", "Hamirpur-DVVNL", "Hapur District-PVVNL", "Hardoi-MVVNL", "Hathras-DVVNL", "Jalaun-DVVNL", "Jaunpur-PUVNL", "Jhansi-DVVNL", "Kannauj-DVVNL", "Kanpur Dehat-DVVNL", "Kanpur Nagar-DVVNL", "Kanpur Nagar-KESCO", "Kasganj-DVVNL", "Kaushambi-PUVNL", "Kushinagar-PUVNL", "Lakhimpur Kheri-MVVNL", "Lalitpur-DVVNL", "Lucknow-MVVNL", "Maharajganj-PUVNL", "Mahoba-DVVNL", "Mainpuri-DVVNL", "Mathura-DVVNL", "Mau-PUVNL", "Meerut-PVVNL", "Mirzapur-PUVNL", "Moradabad-PVVNL", "Muzaffarnagar-PVVNL", "Pilibhit-MVVNL", "Pratapgarh-PUVNL", "PrayagRaj-PUVNL", "Raebareli-MVVNL", "Rampur-PVVNL", "Saharanpur-PVVNL", "Sambhal-PVVNL", "Sant Kabir Nagar-PUVNL", "Sant Ravidas Nagar-Bhadohi-PUVNL", "Shahjahanpur-MVVNL", "Shamli-PVVNL", "Shravasti-MVVNL", "Siddharthnagar-PUVNL", "Sitapur-MVVNL", "Sonbhadra-PUVNL", "Sultanpur-MVVNL", "Unnao-MVVNL", "Varanasi-PUVNL"
];

const app=document.getElementById("app");

/* ---------- Storage ---------- */
const savedTx=JSON.parse(localStorage.getItem("eazypay_transactions")||"null");
const savedUsers=JSON.parse(localStorage.getItem("eazypay_users")||"null");
const savedWalletTx=JSON.parse(localStorage.getItem("eazypay_wallet_tx")||"null");
const savedActivity=JSON.parse(localStorage.getItem("eazypay_activity")||"null");

const users=savedUsers||[
  {id:"ADM001",name:"EazyPay Power Admin",role:"ADMIN",parent:null,balance:50000,mainBalance:0,approved:true,active:true,kyc:"VERIFIED",permissions:{bill:true,transfer:true},username:"admin001",password:"admin123",commissionRate:0},
  {id:"SD001",name:"Ahmedabad Super Distributor",role:"SUPER DISTRIBUTOR",parent:"ADM001",balance:15000,mainBalance:0,approved:true,active:true,kyc:"VERIFIED",permissions:{bill:true,transfer:true},username:"super001",password:"123456",commissionRate:0},
  {id:"D001",name:"Ahmedabad Distributor",role:"DISTRIBUTOR",parent:"SD001",balance:5000,mainBalance:0,approved:true,active:true,kyc:"VERIFIED",permissions:{bill:true,transfer:true},username:"dist001",password:"123456",commissionRate:0},
  {id:"R001",name:"Ahmedabad Retailer",role:"RETAILER",parent:"D001",balance:2500,mainBalance:0,approved:true,active:true,kyc:"VERIFIED",permissions:{bill:true,transfer:false},username:"retailer001",password:"123456",commissionRate:0},
  {id:"R002",name:"Demo Retailer 2",role:"RETAILER",parent:"D001",balance:1200,mainBalance:0,approved:false,active:false,kyc:"PENDING",permissions:{bill:false,transfer:false},username:"retailer002",password:"123456",commissionRate:0}
];
users.forEach(u=>{
  u.permissions=u.permissions||{bill:true,transfer:u.role!=="RETAILER"};
  if(u.mainBalance==null)u.mainBalance=0;
  if(!u.kyc)u.kyc=u.approved?"VERIFIED":"PENDING";
  u.commissionRate=0; // always show 0%
});
localStorage.setItem("eazypay_users",JSON.stringify(users));

const currentUserId=localStorage.getItem("eazypay_current_user")||null;
const state={
  page:"home",
  logged:!!currentUserId,
  currentUserId,
  bill:null,
  payment:null,
  sidebarOpen:false,
  tx:savedTx||[
    {id:"EZY-260921-1001",retailer:"Ahmedabad Retailer",retailerId:"R001",consumer:"1234567890",biller:"Torrent Power",service:"ELECTRICITY",amount:1842,status:"UNDER PROCESS",date:"21 Sep 2026, 16:42",commission:0},
    {id:"EZY-260921-1002",retailer:"Demo Retailer",retailerId:"R002",consumer:"9876543210",biller:"UGVCL",service:"ELECTRICITY",amount:921,status:"UNDER PROCESS",date:"21 Sep 2026, 15:18",commission:0}
  ],
  walletTx:savedWalletTx||[],
  activity:savedActivity||[],
  filters:{q:"",type:"",direction:"",status:"",from:"",to:"",level:""}
};
if(!savedTx) localStorage.setItem("eazypay_transactions",JSON.stringify(state.tx));
if(!savedWalletTx) localStorage.setItem("eazypay_wallet_tx",JSON.stringify(state.walletTx));
if(!savedActivity) localStorage.setItem("eazypay_activity",JSON.stringify(state.activity));

const demoBills={
  "1234567890":{name:"Mohammed A. Khan",address:"Ahmedabad, Gujarat",consumer:"1234567890",biller:"Torrent Power",billNo:"TP-202609-48291",billDate:"10 Sep 2026",dueDate:"25 Sep 2026",current:1792,arrears:0,total:1792},
  "9876543210":{name:"Javid S.",address:"Mehsana, Gujarat",consumer:"9876543210",biller:"UGVCL",billNo:"UG-202609-73182",billDate:"08 Sep 2026",dueDate:"23 Sep 2026",current:921,arrears:0,total:921}
};

/* ---------- Helpers ---------- */
function currentUser(){return users.find(u=>u.id===state.currentUserId)||null}
function roleLabel(r){return (r||"").replace("SUPER DISTRIBUTOR","Super Distributor").replace("DISTRIBUTOR","Distributor").replace("RETAILER","Retailer").replace("ADMIN","Admin")}
function userLabel(u){return u?`${roleLabel(u.role)} — ${u.name} (${u.id})`:"—"}
function saveUsers(){localStorage.setItem("eazypay_users",JSON.stringify(users))}
function saveWalletTx(){localStorage.setItem("eazypay_wallet_tx",JSON.stringify(state.walletTx))}
function saveTx(){localStorage.setItem("eazypay_transactions",JSON.stringify(state.tx))}
function saveActivity(){localStorage.setItem("eazypay_activity",JSON.stringify(state.activity))}
function nowStr(){return new Date().toLocaleString("en-IN")}
function todayKey(){const d=new Date();return d.toDateString()}
function isToday(dateStr){
  try{return new Date(dateStr).toDateString()===todayKey()}catch(e){return (dateStr||"").includes(new Date().getDate().toString())}
}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2})}
function uid(prefix){return prefix+"-"+Date.now().toString().slice(-10)+"-"+Math.floor(Math.random()*900+100)}
function directChildren(u){return users.filter(x=>x.parent===u.id)}
function allDownline(u){
  const out=[];const q=[u.id];
  while(q.length){const id=q.shift();users.filter(x=>x.parent===id).forEach(c=>{out.push(c);q.push(c.id)})}
  return out;
}
function canTransferTo(from,to){if(!from||!to||from.id===to.id)return false;if(from.role==="ADMIN")return true;return to.parent===from.id}
function toggleSidebar(){state.sidebarOpen=!state.sidebarOpen;renderPage()}
function closeSidebar(){state.sidebarOpen=false;renderPage()}

function addActivity(action,detail){
  const u=currentUser();
  state.activity.unshift({id:uid("ACT"),userId:u?.id,userName:u?.name,role:u?.role,action,detail,date:nowStr()});
  if(state.activity.length>500)state.activity.length=500;
  saveActivity();
}

function addWalletTx(entry){
  const id=uid("WTX");
  const row={id,date:nowStr(),openingBalance:entry.openingBalance??0,closingBalance:entry.closingBalance??entry.balanceAfter??0,...entry};
  state.walletTx.unshift(row);
  saveWalletTx();
  return row;
}

/* ---------- Navigation shell ---------- */
function publicShell(body){
  app.innerHTML=`<header class="public-top"><div class="brand">Eazy<span>Pay</span></div>
  <nav class="public-nav">
    <button class="${state.page==='home'?'active':''}" onclick="go('home')">Home</button>
    <button onclick="go('login')">Login</button>
  </nav></header>
  <main class="wrap">${body}</main>
  <footer class="footer">© 2026 EazyPay • Electricity Bill Payment Platform</footer>`;
}

function dashShell(body){
  const u=currentUser();
  if(!u){go("login");return}
  const navItems=[
    {id:"dashboard",label:"Dashboard",ico:"📊"},
    {id:"bill",label:"Electricity Bill",ico:"⚡"},
    {id:"wallet",label:"Wallet & Ledger",ico:"💰"},
    {id:"admin",label:"Transactions",ico:"📋"},
    {id:"network",label:u.role==="ADMIN"?"Power Admin":"My Network",ico:"👥"},
    {id:"commission",label:"Commission",ico:"📈"},
    {id:"activity",label:"Activity Log",ico:"🕒"}
  ];
  app.innerHTML=`<div class="app-shell">
    <div class="overlay ${state.sidebarOpen?'show':''}" onclick="closeSidebar()"></div>
    <aside class="sidebar ${state.sidebarOpen?'open':''}">
      <div class="sidebar-brand">Eazy<span>Pay</span></div>
      <div class="sidebar-user"><div class="name">${u.name}</div><div class="role">${roleLabel(u.role)} · ${u.id}</div></div>
      <nav class="sidebar-nav">${navItems.map(n=>`<button class="${state.page===n.id?'active':''}" onclick="go('${n.id}');closeSidebar()"><span class="ico">${n.ico}</span>${n.label}</button>`).join("")}</nav>
      <div class="sidebar-footer"><button class="btn ghost" style="width:100%;justify-content:center;color:#fff;border-color:#ffffff33" onclick="logout()">Logout</button></div>
    </aside>
    <div class="main">
      <div class="topbar">
        <div class="topbar-left">
          <button class="menu-btn" onclick="toggleSidebar()">☰</button>
          <div>
            <div style="font-weight:800;font-size:15px">${navItems.find(n=>n.id===state.page)?.label||"EazyPay"}</div>
            <div class="muted" style="font-size:12px">${roleLabel(u.role)} dashboard</div>
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

function shell(body){
  if(state.logged&&currentUser())dashShell(body);
  else publicShell(body);
}

function renderPage() {
  const map={
    home,login,dashboard,bill:billPage,details,payment,receipt,
    admin,wallet:walletPage,network,powerAdmin:()=>{state.page="network";network()},
    commission:commissionPage,activity:activityPage
  };
  (map[state.page]||home)();
}

function go(p){
  state.page=p;
  state.sidebarOpen=false;
  renderPage();
}

/* ---------- Auth ---------- */
function home(){
  if(state.logged&&currentUser()){go("dashboard");return}
  publicShell(`<section class="hero">
    <h1>Electricity bill payment, made simple.</h1>
    <p>Fetch bills with Consumer ID, pay from wallet, and get a professional digital receipt — built for retailers and multi-level networks.</p>
    <div class="row">
      <button class="btn primary" onclick="go('login')">Retailer / Network Login</button>
    </div>
  </section>
  <div class="grid">
    <div class="card"><h3>⚡ Bill Fetch</h3><p class="muted">Torrent Power & Gujarat DISCOMs ready for demo.</p></div>
    <div class="card"><h3>💰 Wallet Ledger</h3><p class="muted">Every credit & debit with opening/closing balance.</p></div>
    <div class="card"><h3>🧾 Instant Receipt</h3><p class="muted">Printable receipt with verification code.</p></div>
  </div>`);
}

function login(){
  publicShell(`<div class="login-wrap"><div class="card">
    <h2 style="margin:0 0 4px">Welcome back</h2>
    <p class="muted" style="margin:0 0 18px">Sign in to your EazyPay account</p>
    <label class="label">Username</label>
    <input id="user" class="input" value="retailer001" autocomplete="username">
    <label class="label" style="margin-top:12px">Password</label>
    <input id="pass" type="password" class="input" value="123456" autocomplete="current-password">
    <button class="btn primary" style="width:100%;margin-top:18px;justify-content:center" onclick="doLogin()">Login</button>
    <div class="notice"><b>Demo logins</b><br>
      Admin: admin001 / admin123<br>
      Super: super001 / 123456<br>
      Distributor: dist001 / 123456<br>
      Retailer: retailer001 / 123456
    </div>
  </div></div>`);
}

function doLogin(){
  const u=users.find(x=>x.username===document.getElementById("user").value.trim()&&x.password===document.getElementById("pass").value);
  if(!u){alert("Invalid username or password");return}
  if(!u.approved||!u.active){alert("User is not approved or is disabled by Admin.");return}
  state.logged=true;state.currentUserId=u.id;
  localStorage.setItem("eazypay_current_user",u.id);
  addActivity("LOGIN","Successful login");
  go("dashboard");
}

function logout(){
  addActivity("LOGOUT","User logged out");
  state.logged=false;state.currentUserId=null;
  localStorage.removeItem("eazypay_current_user");
  go("home");
}

/* ---------- Dashboard ---------- */
function dashboard(){
  const u=currentUser();if(!u){go("login");return}
  const myBillTx=state.tx.filter(t=>t.retailerId===u.id||t.retailer===u.name);
  const todayTx=myBillTx.filter(t=>isToday(t.date));
  const pending=myBillTx.filter(t=>t.status==="UNDER PROCESS"||t.status==="PENDING").length;
  const failed=myBillTx.filter(t=>t.status==="FAILED").length;
  const todayComm=todayTx.reduce((a,t)=>a+Number(t.commission||0),0);
  const todayVol=todayTx.reduce((a,t)=>a+Number(t.amount||0),0);
  const children=directChildren(u);
  const down=u.role==="ADMIN"?users.filter(x=>x.role!=="ADMIN"):allDownline(u);

  dashShell(`
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Hello, ${u.name} · ${roleLabel(u.role)}</p>
    <div class="grid" style="margin-bottom:20px">
      <div class="stat-card"><div class="stat-ico green">💰</div><div><div class="stat-val">${money(u.balance)}</div><div class="stat-lbl">Wallet Balance</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">📅</div><div><div class="stat-val">${todayTx.length}</div><div class="stat-lbl">Today Transactions</div></div></div>
      <div class="stat-card"><div class="stat-ico purple">📈</div><div><div class="stat-val">${money(todayComm)}</div><div class="stat-lbl">Today Commission</div></div></div>
      <div class="stat-card"><div class="stat-ico amber">⏳</div><div><div class="stat-val">${pending}</div><div class="stat-lbl">Pending</div></div></div>
      <div class="stat-card"><div class="stat-ico red">✕</div><div><div class="stat-val">${failed}</div><div class="stat-lbl">Failed</div></div></div>
      ${u.role!=="RETAILER"?`<div class="stat-card"><div class="stat-ico blue">👥</div><div><div class="stat-val">${down.length}</div><div class="stat-lbl">Network Users</div></div></div>`:""}
    </div>
    <div class="grid-2">
      <div class="card">
        <h3>Quick Actions</h3>
        <div class="row" style="margin-top:8px">
          ${u.permissions.bill?`<button class="btn primary" onclick="go('bill')">⚡ Pay Electricity Bill</button>`:""}
          <button class="btn secondary" onclick="go('wallet')">💰 Wallet Ledger</button>
          <button class="btn secondary" onclick="go('admin')">📋 Transactions</button>
          ${u.role!=="RETAILER"?`<button class="btn secondary" onclick="go('network')">👥 Network</button>`:""}
        </div>
      </div>
      <div class="card">
        <h3>Account Status</h3>
        <table style="min-width:0">
          <tr><td class="muted">KYC</td><td><span class="badge ${u.kyc==='VERIFIED'?'badge-ok':'badge-warn'}">${u.kyc||"PENDING"}</span></td></tr>
          <tr><td class="muted">Approval</td><td><span class="badge ${u.approved?'badge-ok':'badge-warn'}">${u.approved?"APPROVED":"PENDING"}</span></td></tr>
          <tr><td class="muted">Account</td><td><span class="badge ${u.active?'badge-ok':'badge-fail'}">${u.active?"ACTIVE":"DISABLED"}</span></td></tr>
          <tr><td class="muted">Commission Rate</td><td><b>${u.commissionRate||0}%</b></td></tr>
          ${u.role==="ADMIN"?`<tr><td class="muted">Virtual Balance</td><td><b>${money(u.balance)}</b></td></tr>`:""}
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-head"><h3 style="margin:0">Recent Bill Transactions</h3><button class="btn secondary" onclick="go('admin')">View all</button></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Txn ID</th><th>Consumer</th><th>Biller</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${(u.role==="ADMIN"?state.tx:myBillTx).slice(0,6).map(t=>`<tr>
          <td>${t.id}</td><td>${t.consumer}</td><td>${t.biller}</td>
          <td>${money(t.amount)}</td>
          <td><span class="badge ${t.status==='SUCCESS'||t.status==='COMPLETED'?'badge-ok':t.status==='FAILED'?'badge-fail':'badge-warn'}">${t.status}</span></td>
          <td>${t.date}</td></tr>`).join("")||`<tr><td colspan="6" class="empty">No transactions yet</td></tr>`}
        </tbody>
      </table></div>
    </div>`);
}

/* ---------- Bill payment ---------- */
function updateBillParams(){
  const code=document.getElementById("provider").value;
  const op=electricityOperators.find(o=>o.operator_code===code);
  const exC=document.getElementById("extraParamContainer");
  const dcC=document.getElementById("discomContainer");
  if(exC) exC.style.display="none";
  if(dcC) dcC.style.display="none";
  if(op&&op.params&&op.params.length>0){
    if(op.params[0]==="Discom"){
      if(dcC) dcC.style.display="block";
    }else{
      if(exC){
        exC.style.display="block";
        document.getElementById("extraParamLabel").innerText=op.params[0]+":";
      }
    }
  }
}

function billPage(){
  const u=currentUser();if(!u){go("login");return}
  if(!u.permissions.bill){
    dashShell(`<div class="card"><h2>Electricity Bill Disabled</h2><p class="muted">Admin has disabled bill payment for this account.</p></div>`);
    return;
  }
  const options=electricityOperators.map(o=>`<option value="${o.operator_code}">${o.operator_name}</option>`).join("");
  const discoms=UP_DISCOMS.map(d=>`<option value="${d}">${d}</option>`).join("");

  dashShell(`<h1 class="page-title">Electricity Bill Payment</h1>
    <p class="page-sub">Enter consumer number → fetch bill → pay from wallet → get receipt</p>
    <div class="card" style="max-width:560px">
      <label class="label">Electricity Provider</label>
      <select id="provider" class="select" onchange="updateBillParams()">
        <option value="">-- Select Operator --</option>
        ${options}
      </select>
      <label class="label" style="margin-top:12px">Consumer ID / Customer Number</label>
      <input id="consumer" class="input" placeholder="e.g. 1234567890" value="${state.bill?.consumer||""}">
      <div id="extraParamContainer" style="margin-top:12px;display:none;">
        <label id="extraParamLabel" class="label">Extra Param:</label>
        <input id="extraParam" class="input" placeholder="Enter value">
      </div>
      <div id="discomContainer" style="margin-top:12px;display:none;">
        <label class="label">UP Discom:</label>
        <select id="extraParamDiscom" class="select">${discoms}</select>
      </div>
      <div class="form-actions">
        <button class="btn primary" id="fetchBillBtn" onclick="fetchBill()">Fetch Bill</button>
        <button class="btn secondary" onclick="go('dashboard')">Cancel</button>
      </div>
      <div id="fetchmsg" style="margin-top:16px;"></div>
    </div>`);
}

async function fetchBill(){
  const opSelect=document.getElementById("provider");
  const consInput=document.getElementById("consumer");
  const msgDiv=document.getElementById("fetchmsg");
  const btn=document.getElementById("fetchBillBtn");
  
  if(!opSelect.value||!consInput.value.trim()){
    msgDiv.innerHTML='<p class="warning">Please select an operator and enter Consumer ID.</p>';
    return;
  }
  
  btn.disabled=true;
  btn.innerText="Fetching...";
  msgDiv.innerHTML='<p class="muted">Fetching real bill data from provider via APIclub...</p>';

  const payload = {
    consumer_no: consInput.value.trim(),
    operator: opSelect.value
  };
  
  const op = electricityOperators.find(o => o.operator_code === opSelect.value);
  if(op&&op.params&&op.params.length>0){
    if(op.params[0]==="Discom"){
      payload.params=document.getElementById("extraParamDiscom").value;
    }else{
      const ev=document.getElementById("extraParam").value.trim();
      if(!ev){
        msgDiv.innerHTML=`<p class="warning">Please enter: ${op.params[0]}</p>`;
        btn.disabled=false;
        btn.innerText="Fetch Bill";
        return;
      }
      payload.params=ev;
    }
  }

  try{
    const proxyUrl = window.location.hostname.includes('vercel.app') ? '/api/fetch-bill' : 'proxy.php';
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    let data;
    const textData = await res.text();
    try {
      data = JSON.parse(textData);
    } catch(e) {
      msgDiv.innerHTML=`<p class="fail">❌ Server Error: Endpoint returned HTML (likely 404 Not Found) instead of JSON. Make sure Vercel/cPanel is fully deployed.</p>`;
      btn.disabled=false;
      btn.innerText="Fetch Bill";
      return;
    }
    
    if (data.status === 'success' || data.status === 1 || data.code === 200 || data.data) {
      const r = data.data || data.response || data.billAmount || data;
      state.bill = {
        name: r.customer_name || r.consumer_name || r.name || "N/A",
        address: "India",
        consumer: r.consumer_no || consInput.value.trim(),
        biller: r.operator_name || op.operator_name,
        billNo: "TX-"+Date.now().toString().slice(-6),
        billDate: r.bill_date || nowStr(),
        dueDate: r.due_date || r.bill_due_date || nowStr(),
        current: Number(r.bill_amount || r.amount || r.dueAmount) || 0,
        arrears: 0,
        total: Number(r.bill_amount || r.amount || r.dueAmount) || 0
      };
      go("details");
    }else{
      msgDiv.innerHTML=`<p class="warning">⚠️ ${data.message || 'Could not fetch bill'}</p>`;
      btn.disabled=false;
      btn.innerText="Fetch Bill";
    }
  }catch(err){
    msgDiv.innerHTML=`<p class="fail">❌ Network Error: ${err.message}</p>`;
    btn.disabled=false;
    btn.innerText="Fetch Bill";
  }
}

function details(){
  const b=state.bill;if(!b){go("bill");return}
  dashShell(`<h1 class="page-title">Bill Details</h1>
    <div class="card" style="max-width:640px">
      <div class="section-head">
        <div><h2 style="margin:0">${b.biller}</h2><span class="badge badge-ok">Bill fetched</span></div>
        <div class="total" style="color:var(--primary)">${money(b.total)}</div>
      </div>
      <table style="min-width:0">
        <tr><th>Customer Name</th><td>${b.name}</td></tr>
        <tr><th>Consumer ID</th><td>${b.consumer}</td></tr>
        <tr><th>Address</th><td>${b.address}</td></tr>
        <tr><th>Bill Number</th><td>${b.billNo}</td></tr>
        <tr><th>Bill Date</th><td>${b.billDate}</td></tr>
        <tr><th>Due Date</th><td>${b.dueDate}</td></tr>
        <tr><th>Current Bill</th><td>${money(b.current)}</td></tr>
        <tr><th>Arrears</th><td>${money(b.arrears)}</td></tr>
        <tr><th>Total Payable</th><td><b>${money(b.total)}</b></td></tr>
      </table>
      <div class="form-actions">
        <button class="btn primary" onclick="go('payment')">Continue to Payment</button>
        <button class="btn secondary" onclick="go('bill')">Change Consumer ID</button>
      </div>
    </div>`);
}

function payment(){
  const b=state.bill;const u=currentUser();
  if(!b||!u){go("bill");return}
  const canPay=u.balance>=b.total;
  dashShell(`<h1 class="page-title">Payment</h1>
    <div class="grid-2">
      <div class="card">
        <h3>Bill Summary</h3>
        <table style="min-width:0">
          <tr><th>Board</th><td>${b.biller}</td></tr>
          <tr><th>Consumer ID</th><td>${b.consumer}</td></tr>
          <tr><th>Customer</th><td>${b.name}</td></tr>
          <tr><th>Bill No</th><td>${b.billNo}</td></tr>
          <tr><th>Amount</th><td><b>${money(b.total)}</b></td></tr>
        </table>
      </div>
      <div class="card">
        <h3>Pay from Wallet</h3>
        <p class="muted">Amount will be debited from your EazyPay wallet.</p>
        <div style="margin:16px 0;padding:16px;border-radius:12px;background:var(--green-bg)">
          <div class="muted" style="font-size:12px">Available Balance</div>
          <div class="total" style="color:var(--green)">${money(u.balance)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:14px">
          <span>To debit</span><span>${money(b.total)}</span>
        </div>
        <button class="btn success-btn" style="width:100%;justify-content:center" ${canPay?"":"disabled"} onclick="pay()">💳 Pay ${money(b.total)}</button>
        ${canPay?"":'<div class="notice">Insufficient wallet balance.</div>'}
      </div>
    </div>`);
}

function pay(){
  const b=state.bill;const u=currentUser();
  if(!u||!b||u.balance<b.total){go("payment");return}
  const opening=u.balance;
  const commission=+(b.total*(u.commissionRate||0)/100).toFixed(2);
  u.balance-=b.total;
  // credit commission back (demo)
  if(commission>0){u.balance+=commission}
  saveUsers();
  const id=uid("EZY");
  const date=nowStr();
  state.payment={id,amount:b.total,status:"UNDER PROCESS",date,retailer:u.name,retailerId:u.id,commission,verifyCode:"EP"+id.slice(-8).toUpperCase()};
  state.tx.unshift({
    id,retailer:u.name,retailerId:u.id,consumer:b.consumer,biller:b.biller,service:"ELECTRICITY",
    amount:b.total,status:"UNDER PROCESS",date,commission
  });
  saveTx();
  addWalletTx({
    type:"BILL_PAYMENT",direction:"DEBIT",service:"ELECTRICITY",
    userId:u.id,userName:u.name,userRole:u.role,
    counterpartyId:null,counterpartyName:b.biller,
    amount:b.total,openingBalance:opening,closingBalance:opening-b.total,
    balanceAfter:opening-b.total,note:`Bill ${b.consumer} / ${b.biller}`,byId:u.id,byName:u.name,status:"SUCCESS"
  });
  if(commission>0){
    addWalletTx({
      type:"COMMISSION",direction:"CREDIT",service:"ELECTRICITY",
      userId:u.id,userName:u.name,userRole:u.role,
      counterpartyId:null,counterpartyName:"System",
      amount:commission,openingBalance:opening-b.total,closingBalance:u.balance,
      balanceAfter:u.balance,note:`Commission ${u.commissionRate}% on ${id}`,byId:"SYSTEM",byName:"System",status:"SUCCESS"
    });
  }
  addActivity("BILL_PAYMENT",`${id} · ${money(b.total)} · ${b.consumer}`);
  go("receipt");
}

function receipt(){
  const b=state.bill,p=state.payment;const u=currentUser();
  if(!b||!p){go("bill");return}
  const merchantId=u?.id||p.retailerId||"—";
  const status=(p.status||"UNDER PROCESS").toUpperCase();
  dashShell(`<h1 class="page-title" style="text-align:center">Cash Payment Receipt</h1>
    <div class="receipt" id="receiptCard">
      <div class="receipt-head">
        <div class="receipt-logo">Eazy<span>Pay</span></div>
        <div class="muted" style="font-weight:800">Cash Payment Receipt</div>
      </div>
      <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px dashed #cbd5e1;border-bottom:1px dashed #cbd5e1;margin-bottom:14px;font-size:13px">
        <span><b>Date:</b> ${new Date(p.date).toLocaleDateString("en-GB")}</span>
        <span><b>Time:</b> ${new Date(p.date).toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit'})}</span>
      </div>
      <table style="min-width:0">
        <tr><th>Service Number</th><td>${b.consumer}</td></tr>
        <tr><th>Customer Name</th><td>${b.name}</td></tr>
        <tr><th>Transaction ID</th><td>${p.id}</td></tr>
        <tr><th>Merchant ID</th><td>${merchantId}</td></tr>
        <tr><th>Txn Status</th><td><span class="badge badge-warn">${status}</span></td></tr>
        <tr><th>Biller</th><td>${b.biller}<br>Electricity</td></tr>
        <tr><th>Bill Amount</th><td>${money(b.total)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:14px 0;border-top:1px dashed #cbd5e1;border-bottom:1px dashed #cbd5e1;display:flex;justify-content:space-between;align-items:center;gap:12px">
        <b style="font-size:17px">Total Amount</b>
        <div class="total">${money(p.amount)}</div>
      </div>
      <div style="text-align:center;margin:18px 0 4px;font-weight:800">Thank You For Using Our Services</div>
      <div class="receipt-qr">QR / Verify<br>${p.verifyCode||p.id.slice(-8)}</div>
      <div class="notice notice-info" style="margin-top:16px;font-size:12px">
        <b>Disclaimer:</b><br>
        1. Please check Service Number and amount mentioned in your receipt.<br>
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

function downloadReceipt(){
  const b=state.bill,p=state.payment,u=currentUser();
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>EazyPay Receipt ${p.id}</title>
  <style>body{font-family:Arial,sans-serif;background:#f5f7fb;padding:24px}.r{max-width:520px;margin:auto;background:#fff;padding:28px;border:1px solid #ddd;border-radius:14px}
  .logo{font-size:26px;font-weight:900;text-align:center}.logo span{color:#1a56db}table{width:100%;border-collapse:collapse;margin-top:12px}
  td,th{padding:8px 0;border-bottom:1px solid #eee;text-align:left}.total{text-align:center;font-size:28px;font-weight:900;margin-top:16px}</style></head><body>
  <div class="r"><div class="logo">Eazy<span>Pay</span></div><p style="text-align:center;color:#d97706;font-weight:800">PAYMENT UNDER PROCESS</p>
  <table>
  <tr><td><b>Retailer</b></td><td>${u?.name||""} (${u?.id||""})</td></tr>
  <tr><td><b>Customer</b></td><td>${b.name}</td></tr>
  <tr><td><b>Consumer ID</b></td><td>${b.consumer}</td></tr>
  <tr><td><b>Provider</b></td><td>${b.biller}</td></tr>
  <tr><td><b>Amount</b></td><td>${money(b.total)}</td></tr>
  <tr><td><b>Txn ID</b></td><td>${p.id}</td></tr>
  <tr><td><b>Date</b></td><td>${p.date}</td></tr>
  <tr><td><b>Verify</b></td><td>${p.verifyCode||""}</td></tr>
  </table><div class="total">${money(p.amount)}<div style="font-size:13px;font-weight:400">Total Paid</div></div></div></body></html>`;
  const blob=new Blob([html],{type:"text/html"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`EazyPay-Receipt-${p.id}.html`;a.click();
}

function shareWhatsApp(){
  const b=state.bill,p=state.payment;
  const msg=`EazyPay Receipt%0AStatus: UNDER PROCESS%0ACustomer: ${encodeURIComponent(b.name)}%0AConsumer: ${b.consumer}%0AAmount: ${money(b.total)}%0ATxn: ${p.id}%0AVerify: ${p.verifyCode||""}`;
  window.open("https://wa.me/?text="+msg,"_blank");
}

/* ---------- Wallet ledger ---------- */
function filteredWalletTx(forUser){
  let rows=(state.walletTx||[]).filter(t=>{
    if(forUser.role==="ADMIN")return true;
    return t.userId===forUser.id;
  });
  const f=state.filters;
  if(f.q){
    const q=f.q.toLowerCase();
    rows=rows.filter(t=>[t.id,t.userId,t.userName,t.note,t.counterpartyName,t.byName].join(" ").toLowerCase().includes(q));
  }
  if(f.direction)rows=rows.filter(t=>t.direction===f.direction);
  if(f.type)rows=rows.filter(t=>(t.type||"")===f.type);
  if(f.status)rows=rows.filter(t=>(t.status||"SUCCESS")===f.status);
  if(f.level)rows=rows.filter(t=>t.userRole===f.level);
  return rows;
}

function walletPage(){
  const u=currentUser();if(!u){go("login");return}
  const rows=filteredWalletTx(u);
  const credits=rows.filter(t=>t.direction==="CREDIT").reduce((a,t)=>a+Number(t.amount),0);
  const debits=rows.filter(t=>t.direction==="DEBIT").reduce((a,t)=>a+Number(t.amount),0);
  // Opening of oldest visible approx: current - credits + debits for filtered set is not perfect; show formula on current wallet
  const openingApprox=u.balance-credits+debits;

  dashShell(`
    <div class="section-head">
      <div><h1 class="page-title">Wallet & Ledger</h1><p class="page-sub">Complete accounting ledger — Opening + Credit − Debit = Closing</p></div>
      <div class="stat-val" style="color:var(--green)">${money(u.balance)}</div>
    </div>
    <div class="ledger-formula">
      <div><span>Opening (approx)</span><br><b>${money(openingApprox)}</b></div>
      <div>+ <span>Total Credit</span><br><b class="success">${money(credits)}</b></div>
      <div>− <span>Total Debit</span><br><b class="warning">${money(debits)}</b></div>
      <div>= <span>Closing (Wallet)</span><br><b>${money(u.balance)}</b></div>
    </div>
    ${u.role==="ADMIN"?`<div class="grid-2">${createVirtualBalanceBox()}${debitBox()}</div>${transferBox(true)}`:`${u.role!=="RETAILER"?transferBox(false):""}`}
    <div class="card" style="margin-top:16px">
      <h3>Filters</h3>
      <div class="filter-bar">
        <div><label class="label">Search</label><input id="fQ" class="input" placeholder="Txn / User / Note" value="${state.filters.q||""}"></div>
        <div><label class="label">Direction</label><select id="fDir" class="select"><option value="">All</option><option value="CREDIT" ${state.filters.direction==="CREDIT"?"selected":""}>Credit</option><option value="DEBIT" ${state.filters.direction==="DEBIT"?"selected":""}>Debit</option></select></div>
        <div><label class="label">Type</label><select id="fType" class="select">
          <option value="">All</option>
          ${["CREATE","TRANSFER","ADMIN_DEBIT","ADMIN_CREDIT","BILL_PAYMENT","COMMISSION","REFUND","REVERSAL","ADJUSTMENT"].map(t=>`<option value="${t}" ${state.filters.type===t?"selected":""}>${t}</option>`).join("")}
        </select></div>
        ${u.role==="ADMIN"?`<div><label class="label">User Level</label><select id="fLevel" class="select"><option value="">All</option><option value="SUPER DISTRIBUTOR">Super Distributor</option><option value="DISTRIBUTOR">Distributor</option><option value="RETAILER">Retailer</option><option value="ADMIN">Admin</option></select></div>`:""}
        <button class="btn primary" onclick="applyWalletFilters()">Apply</button>
        <button class="btn secondary" onclick="exportWalletExcel()">⬇ Excel</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Txn ID</th><th>Type</th><th>Dir</th><th>Amount</th><th>Opening</th><th>Closing</th>
          <th>User</th><th>Counterparty</th><th>By</th><th>Note</th><th>Date</th>
        </tr></thead>
        <tbody>${rows.length?rows.map(t=>{
          const dirClass=t.direction==="CREDIT"?"success":"warning";
          const sign=t.direction==="CREDIT"?"+":"−";
          return `<tr>
            <td>${t.id}</td><td><span class="badge badge-info">${t.type||"—"}</span></td>
            <td class="${dirClass}">${t.direction}</td>
            <td class="${dirClass}">${sign}${money(t.amount)}</td>
            <td>${money(t.openingBalance)}</td><td>${money(t.closingBalance??t.balanceAfter)}</td>
            <td>${t.userName||"—"}<br><span class="muted">${t.userId||""}</span></td>
            <td>${t.counterpartyName||"—"}</td>
            <td>${t.byName||"—"}</td>
            <td>${t.note||"—"}</td>
            <td>${t.date}</td>
          </tr>`;
        }).join(""):`<tr><td colspan="11"><div class="empty"><div class="ico">📒</div>No ledger entries yet</div></td></tr>`}
        </tbody>
      </table></div>
    </div>
    <div class="notice notice-info">Har debit/credit (transfer, admin create/debit, bill, commission) ledger me Opening & Closing balance ke saath record hota hai.</div>
  `);
}

function applyWalletFilters(){
  state.filters.q=document.getElementById("fQ")?.value||"";
  state.filters.direction=document.getElementById("fDir")?.value||"";
  state.filters.type=document.getElementById("fType")?.value||"";
  const lv=document.getElementById("fLevel");
  if(lv)state.filters.level=lv.value||"";
  walletPage();
}

function exportWalletExcel(){
  const u=currentUser();
  const rows=filteredWalletTx(u);
  const data=[["Txn ID","Type","Direction","Amount","Opening","Closing","User ID","User","Counterparty","By","Note","Date"],
    ...rows.map(t=>[t.id,t.type,t.direction,t.amount,t.openingBalance,t.closingBalance??t.balanceAfter,t.userId,t.userName,t.counterpartyName,t.byName,t.note,t.date])];
  downloadExcel(data,"EazyPay-Wallet-Ledger");
}

/* ---------- Transfer / Create / Debit ---------- */
function transferBalance(fromId,toId,amount){
  const from=users.find(x=>x.id===fromId),to=users.find(x=>x.id===toId),n=Number(amount);
  if(from&&from.role!=="ADMIN"&&!from.permissions.transfer){alert("Virtual balance transfer is disabled by Admin.");return}
  if(!from||!to||!Number.isFinite(n)||n<=0){alert("Enter a valid amount.");return}
  if(!canTransferTo(from,to)){alert("Balance can only be transferred to your direct downline. Admin can transfer to any layer.");return}
  if(!from.approved||!from.active||!to.approved||!to.active){alert("Both accounts must be approved and active.");return}
  if(from.balance<n){alert("Insufficient virtual balance.");return}
  const fromOpen=from.balance,toOpen=to.balance;
  from.balance-=n;to.balance+=n;saveUsers();
  addWalletTx({type:"TRANSFER",direction:"DEBIT",userId:from.id,userName:from.name,userRole:from.role,
    counterpartyId:to.id,counterpartyName:to.name,amount:n,openingBalance:fromOpen,closingBalance:from.balance,
    balanceAfter:from.balance,note:`Transfer to ${userLabel(to)}`,byId:from.id,byName:from.name,status:"SUCCESS"});
  addWalletTx({type:"TRANSFER",direction:"CREDIT",userId:to.id,userName:to.name,userRole:to.role,
    counterpartyId:from.id,counterpartyName:from.name,amount:n,openingBalance:toOpen,closingBalance:to.balance,
    balanceAfter:to.balance,note:`Received from ${userLabel(from)}`,byId:from.id,byName:from.name,status:"SUCCESS"});
  addActivity("TRANSFER",`${money(n)} → ${to.name} (${to.id})`);
  renderCurrentManagementPage();
}

function createVirtualBalance(){
  const admin=currentUser();
  if(!admin||admin.role!=="ADMIN"){alert("Only Power Admin can create virtual balance.");return}
  const amount=Number(document.getElementById("createBalanceAmount")?.value);
  if(!Number.isFinite(amount)||amount<=0){alert("Enter a valid amount.");return}
  const open=admin.balance;
  admin.balance+=amount;saveUsers();
  addWalletTx({type:"CREATE",direction:"CREDIT",userId:admin.id,userName:admin.name,userRole:admin.role,
    counterpartyId:null,counterpartyName:null,amount,openingBalance:open,closingBalance:admin.balance,
    balanceAfter:admin.balance,note:"Virtual balance created by Power Admin",byId:admin.id,byName:admin.name,status:"SUCCESS"});
  addActivity("CREATE_BALANCE",money(amount));
  alert(`${money(amount)} virtual balance added to Admin wallet.`);
  network();
}

function debitBalance(){
  const admin=currentUser();
  if(!admin||admin.role!=="ADMIN"){alert("Only Power Admin can debit balance.");return}
  const toId=document.getElementById("debitFrom")?.value;
  const amount=Number(document.getElementById("debitAmount")?.value);
  const note=(document.getElementById("debitNote")?.value||"").trim()||"Admin adjustment / recovery";
  const target=users.find(x=>x.id===toId);
  if(!target||target.role==="ADMIN"){alert("Select a valid non-admin user.");return}
  if(!Number.isFinite(amount)||amount<=0){alert("Enter a valid amount.");return}
  if(target.balance<amount){alert("User does not have sufficient balance.");return}
  const tOpen=target.balance,aOpen=admin.balance;
  target.balance-=amount;admin.balance+=amount;saveUsers();
  addWalletTx({type:"ADMIN_DEBIT",direction:"DEBIT",userId:target.id,userName:target.name,userRole:target.role,
    counterpartyId:admin.id,counterpartyName:admin.name,amount,openingBalance:tOpen,closingBalance:target.balance,
    balanceAfter:target.balance,note,byId:admin.id,byName:admin.name,status:"SUCCESS"});
  addWalletTx({type:"ADMIN_CREDIT",direction:"CREDIT",userId:admin.id,userName:admin.name,userRole:admin.role,
    counterpartyId:target.id,counterpartyName:target.name,amount,openingBalance:aOpen,closingBalance:admin.balance,
    balanceAfter:admin.balance,note:`Debited from ${userLabel(target)} — ${note}`,byId:admin.id,byName:admin.name,status:"SUCCESS"});
  addActivity("ADMIN_DEBIT",`${money(amount)} from ${target.name}`);
  alert(`${money(amount)} debited from ${target.name} and credited to Admin.`);
  network();
}

function createVirtualBalanceBox(){
  const u=currentUser();if(!u||u.role!=="ADMIN")return "";
  return `<div class="card transfer-card"><h3>Create Virtual Balance</h3>
    <p class="muted">Adds virtual balance only to Admin wallet.</p>
    <div class="transfer-grid">
      <div><label class="label">Admin Wallet</label><input class="input" value="${u.name} (${u.id})" disabled></div>
      <div><label class="label">Amount</label><input id="createBalanceAmount" class="input" type="number" min="1" placeholder="Amount"></div>
    </div>
    <button class="btn primary" style="margin-top:12px" onclick="createVirtualBalance()">Add to Admin Wallet</button>
  </div>`;
}

function debitBox(){
  const u=currentUser();if(!u||u.role!=="ADMIN")return "";
  const targets=users.filter(x=>x.role!=="ADMIN");
  return `<div class="card transfer-card"><h3>Debit Balance (Admin)</h3>
    <p class="muted">Debit from any user → amount returns to Admin wallet. Both sides logged.</p>
    <div class="transfer-grid">
      <div><label class="label">From User</label><select id="debitFrom" class="select">${targets.map(x=>`<option value="${x.id}">${roleLabel(x.role)} — ${x.name} · ${money(x.balance)}</option>`).join("")}</select></div>
      <div><label class="label">Amount</label><input id="debitAmount" class="input" type="number" min="1" placeholder="Debit amount"></div>
      <div><label class="label">Reason</label><input id="debitNote" class="input" placeholder="Adjustment / Recovery"></div>
    </div>
    <button class="btn danger" style="margin-top:12px" onclick="debitBalance()">Debit from User</button>
  </div>`;
}

function transferBox(adminMode=false){
  const u=currentUser();
  const targets=adminMode?users.filter(x=>x.id!==u.id&&x.role!=="ADMIN"?true:x.id!==u.id):directChildren(u||{id:""});
  const list=adminMode?users.filter(x=>x.id!==u.id):directChildren(u||{id:""});
  if(!u)return "";
  return `<div class="card transfer-card"><h3>Virtual Balance Transfer</h3>
    <p class="muted">${adminMode?"Admin can transfer to any layer.":"Only direct downline."}</p>
    <div class="transfer-grid">
      <div><label class="label">From</label><input class="input" value="${u.name} — ${roleLabel(u.role)}" disabled></div>
      <div><label class="label">To</label><select id="transferTo" class="select">${list.map(x=>`<option value="${x.id}">${roleLabel(x.role)} — ${x.name} (${x.id})</option>`).join("")}</select></div>
      <div><label class="label">Amount</label><input id="transferAmount" class="input" type="number" min="1" placeholder="Amount"></div>
    </div>
    ${list.length?`<button class="btn primary" style="margin-top:12px" onclick="transferBalance('${u.id}',document.getElementById('transferTo').value,document.getElementById('transferAmount').value)">Transfer Balance</button>`:`<div class="notice">No eligible downline.</div>`}
  </div>`;
}

function renderCurrentManagementPage(){
  if(state.page==="wallet")walletPage();
  else if(state.page==="network")network();
  else dashboard();
}

/* ---------- Network / Power Admin ---------- */
function allowedCreateRoles(u){
  if(!u)return [];
  if(u.role==="ADMIN")return ["SUPER DISTRIBUTOR","DISTRIBUTOR","RETAILER"];
  if(u.role==="SUPER DISTRIBUTOR")return ["DISTRIBUTOR"];
  if(u.role==="DISTRIBUTOR")return ["RETAILER"];
  return [];
}
function validParentsForRole(role,creator){
  if(creator?.role==="ADMIN"){
    if(role==="SUPER DISTRIBUTOR")return users.filter(x=>x.role==="ADMIN");
    if(role==="DISTRIBUTOR")return users.filter(x=>x.role==="SUPER DISTRIBUTOR");
    if(role==="RETAILER")return users.filter(x=>x.role==="DISTRIBUTOR");
  }
  if(creator?.role==="SUPER DISTRIBUTOR"&&role==="DISTRIBUTOR")return [creator];
  if(creator?.role==="DISTRIBUTOR"&&role==="RETAILER")return [creator];
  return [];
}

function createUserBox(){
  const u=currentUser();
  const roles=allowedCreateRoles(u);
  if(!roles.length)return "";
  if(u.role!=="ADMIN"&&!u.permissions?.transfer)return '<div class="notice"><b>ID Creation is OFF.</b> Admin disabled your permission.</div>';
  const role=roles[0];
  const parents=validParentsForRole(role,u);
  return `<div class="card transfer-card"><h3>Create ${u.role==="ADMIN"?"New User":roleLabel(role)}</h3>
    <div class="transfer-grid">
      <div><label class="label">Name</label><input id="newName" class="input" placeholder="Full name"></div>
      <div><label class="label">Layer</label>${u.role==="ADMIN"?`<select id="newRole" class="select" onchange="refreshCreateParents()">${roles.map(r=>`<option>${r}</option>`).join("")}</select>`:`<input id="newRole" class="input" value="${role}" disabled>`}</div>
      <div><label class="label">Parent</label><select id="newParent" class="select">${parents.map(x=>`<option value="${x.id}">${roleLabel(x.role)} — ${x.name}</option>`).join("")}</select></div>
      <div><label class="label">Username</label><input id="newUsername" class="input" placeholder="Login username"></div>
      <div><label class="label">Password</label><input id="newPassword" class="input" placeholder="Temp password"></div>
    </div>
    <button class="btn primary" style="margin-top:12px" onclick="createUser()">Create User</button>
  </div>`;
}

function refreshCreateParents(){
  const u=currentUser();const role=document.getElementById("newRole")?.value;const el=document.getElementById("newParent");
  if(!u||!el)return;
  el.innerHTML=validParentsForRole(role,u).map(x=>`<option value="${x.id}">${roleLabel(x.role)} — ${x.name}</option>`).join("");
}

function createUser(){
  const u=currentUser();if(!u)return;
  if(u.role!=="ADMIN"&&!u.permissions?.transfer){alert("ID creation disabled.");return}
  const role=document.getElementById("newRole")?.value;
  const name=document.getElementById("newName")?.value.trim();
  const parent=document.getElementById("newParent")?.value;
  const username=document.getElementById("newUsername")?.value.trim();
  const password=document.getElementById("newPassword")?.value;
  if(!allowedCreateRoles(u).includes(role)){alert("Not allowed to create this layer.");return}
  if(!name||!username||!password||!parent){alert("Fill all fields.");return}
  if(!validParentsForRole(role,u).some(x=>x.id===parent)){alert("Invalid parent.");return}
  if(users.some(x=>x.username===username)){alert("Username exists.");return}
  const prefix=role==="SUPER DISTRIBUTOR"?"SD":role==="DISTRIBUTOR"?"D":"R";
  const id=prefix+String(Date.now()).slice(-6);
  users.push({id,name,role,parent,balance:0,mainBalance:0,approved:false,active:false,kyc:"PENDING",
    permissions:{bill:false,transfer:role!=="RETAILER"},username,password,commissionRate:0});
  saveUsers();
  addActivity("CREATE_USER",`${roleLabel(role)} ${name} (${id})`);
  alert(`${roleLabel(role)} created as PENDING. Admin must approve.`);
  network();
}

function userActions(u){
  const isAdmin=currentUser()?.role==="ADMIN";
  if(!isAdmin||u.role==="ADMIN")return "—";
  return `<div class="row" style="gap:4px">
    <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="toggleApproval('${u.id}')">${u.approved?"Revoke":"Approve"}</button>
    <button class="btn ${u.active?"danger":"secondary"}" style="padding:6px 8px;font-size:12px" onclick="toggleActive('${u.id}')">${u.active?"Disable":"Enable"}</button>
    <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="togglePermission('${u.id}','bill')">Bill ${u.permissions.bill?"ON":"OFF"}</button>
    <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="togglePermission('${u.id}','transfer')">Xfer ${u.permissions.transfer?"ON":"OFF"}</button>
    <button class="btn secondary" style="padding:6px 8px;font-size:12px" onclick="toggleKyc('${u.id}')">KYC</button>
  </div>`;
}

function toggleApproval(id){const u=users.find(x=>x.id===id);if(!u||u.role==="ADMIN")return;u.approved=!u.approved;if(u.approved&&!u.active)u.active=true;if(u.approved)u.kyc="VERIFIED";saveUsers();network()}
function toggleActive(id){const u=users.find(x=>x.id===id);if(!u||u.role==="ADMIN")return;u.active=!u.active;saveUsers();network()}
function togglePermission(id,key){const u=users.find(x=>x.id===id);if(!u||u.role==="ADMIN")return;u.permissions=u.permissions||{};u.permissions[key]=!u.permissions[key];saveUsers();network()}
function toggleKyc(id){const u=users.find(x=>x.id===id);if(!u)return;u.kyc=u.kyc==="VERIFIED"?"PENDING":"VERIFIED";saveUsers();network()}

function network(){
  const u=currentUser();if(!u){go("login");return}
  if(u.role==="ADMIN")return powerAdminView();
  const children=directChildren(u);
  dashShell(`
    <h1 class="page-title">My Network</h1>
    <p class="page-sub">${roleLabel(u.role)} · ${u.name}</p>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico green">💰</div><div><div class="stat-val">${money(u.balance)}</div><div class="stat-lbl">My Balance</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">👥</div><div><div class="stat-val">${children.length}</div><div class="stat-lbl">Direct Downline</div></div></div>
      <div class="stat-card"><div class="stat-ico purple">✓</div><div><div class="stat-val">${children.filter(x=>x.approved&&x.active).length}</div><div class="stat-lbl">Active</div></div></div>
    </div>
    ${createUserBox()}${transferBox(false)}
    <div class="card" style="margin-top:16px">
      <h3>Direct Downline</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Layer</th><th>Balance</th><th>KYC</th><th>Approval</th><th>Account</th></tr></thead>
        <tbody>${children.length?children.map(x=>`<tr>
          <td>${x.name}<br><span class="muted">${x.id}</span></td>
          <td>${roleLabel(x.role)}</td><td>${money(x.balance)}</td>
          <td><span class="badge ${x.kyc==='VERIFIED'?'badge-ok':'badge-warn'}">${x.kyc||"PENDING"}</span></td>
          <td><span class="badge ${x.approved?'badge-ok':'badge-warn'}">${x.approved?"APPROVED":"PENDING"}</span></td>
          <td><span class="badge ${x.active?'badge-ok':'badge-fail'}">${x.active?"ACTIVE":"DISABLED"}</span></td>
        </tr>`).join(""):`<tr><td colspan="6" class="empty">No downline</td></tr>`}</tbody>
      </table></div>
    </div>`);
}

function powerAdminView(){
  const u=currentUser();
  const byRole=r=>users.filter(x=>x.role===r).length;
  dashShell(`
    <h1 class="page-title">Power Admin</h1>
    <p class="page-sub">Full control · Virtual balance · Hierarchy · Approvals</p>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico green">💰</div><div><div class="stat-val">${money(u.balance)}</div><div class="stat-lbl">Admin Virtual Balance</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">🏢</div><div><div class="stat-val">${byRole("SUPER DISTRIBUTOR")}</div><div class="stat-lbl">Super Distributors</div></div></div>
      <div class="stat-card"><div class="stat-ico purple">🏬</div><div><div class="stat-val">${byRole("DISTRIBUTOR")}</div><div class="stat-lbl">Distributors</div></div></div>
      <div class="stat-card"><div class="stat-ico amber">🏪</div><div><div class="stat-val">${byRole("RETAILER")}</div><div class="stat-lbl">Retailers</div></div></div>
    </div>
    ${createUserBox()}
    <div class="grid-2">${createVirtualBalanceBox()}${debitBox()}</div>
    ${transferBox(true)}
    <div class="card" style="margin-top:16px">
      <h3>All Network Users</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Layer</th><th>Parent</th><th>Balance</th><th>KYC</th><th>Approval</th><th>Account</th><th>Bill</th><th>Transfer</th><th>Actions</th></tr></thead>
        <tbody>${users.map(x=>`<tr>
          <td>${x.name}<br><span class="muted">${x.id}</span></td>
          <td>${roleLabel(x.role)}</td><td>${x.parent||"—"}</td><td>${money(x.balance)}</td>
          <td><span class="badge ${x.kyc==='VERIFIED'?'badge-ok':'badge-warn'}">${x.kyc||"PENDING"}</span></td>
          <td><span class="badge ${x.approved?'badge-ok':'badge-warn'}">${x.approved?"APPROVED":"PENDING"}</span></td>
          <td><span class="badge ${x.active?'badge-ok':'badge-fail'}">${x.active?"ACTIVE":"DISABLED"}</span></td>
          <td>${x.permissions?.bill?"ON":"OFF"}</td><td>${x.permissions?.transfer?"ON":"OFF"}</td>
          <td>${userActions(x)}</td>
        </tr>`).join("")}</tbody>
      </table></div>
    </div>
    <div class="notice">Hierarchy: Admin → any layer. SD → Distributor only. Distributor → Retailer only. Retailer cannot create/transfer.</div>
  `);
}

/* ---------- Transactions (bill) with filters ---------- */
function filteredBillTx(){
  const u=currentUser();
  let rows=u.role==="ADMIN"?[...state.tx]:state.tx.filter(t=>t.retailerId===u.id||t.retailer===u.name||allDownline(u).some(d=>d.id===t.retailerId));
  const f=state.filters;
  if(f.q){
    const q=f.q.toLowerCase();
    rows=rows.filter(t=>[t.id,t.retailer,t.retailerId,t.consumer,t.biller].join(" ").toLowerCase().includes(q));
  }
  if(f.status)rows=rows.filter(t=>t.status===f.status);
  return rows;
}

function admin(){
  const u=currentUser();if(!u){go("login");return}
  const rows=filteredBillTx();
  const total=rows.reduce((a,x)=>a+Number(x.amount),0);
  dashShell(`
    <div class="section-head">
      <div><h1 class="page-title">Transaction History</h1><p class="page-sub">Bill payments · filter & export</p></div>
      <button class="btn secondary" onclick="exportBillExcel()">⬇ Excel</button>
    </div>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico blue">📋</div><div><div class="stat-val">${rows.length}</div><div class="stat-lbl">Transactions</div></div></div>
      <div class="stat-card"><div class="stat-ico green">₹</div><div><div class="stat-val">${money(total)}</div><div class="stat-lbl">Volume</div></div></div>
      <div class="stat-card"><div class="stat-ico amber">⏳</div><div><div class="stat-val">${rows.filter(x=>x.status==="UNDER PROCESS").length}</div><div class="stat-lbl">Pending</div></div></div>
    </div>
    <div class="card">
      <div class="filter-bar">
        <div><label class="label">Search</label><input id="bq" class="input" placeholder="Txn / Consumer / Retailer" value="${state.filters.q||""}"></div>
        <div><label class="label">Status</label><select id="bst" class="select">
          <option value="">All</option>
          <option value="UNDER PROCESS" ${state.filters.status==="UNDER PROCESS"?"selected":""}>Under Process</option>
          <option value="SUCCESS" ${state.filters.status==="SUCCESS"?"selected":""}>Success</option>
          <option value="FAILED" ${state.filters.status==="FAILED"?"selected":""}>Failed</option>
        </select></div>
        <button class="btn primary" onclick="applyBillFilters()">Apply</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Txn ID</th><th>Retailer</th><th>Consumer</th><th>Biller</th><th>Amount</th><th>Commission</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>${rows.map(x=>`<tr>
          <td>${x.id}</td><td>${x.retailer}<br><span class="muted">${x.retailerId||""}</span></td>
          <td>${x.consumer}</td><td>${x.biller}</td>
          <td>${money(x.amount)}</td><td>${money(x.commission||0)}</td>
          <td><span class="badge ${x.status==='FAILED'?'badge-fail':x.status==='SUCCESS'?'badge-ok':'badge-warn'}">${x.status}</span></td>
          <td>${x.date}</td>
          <td><button class="btn secondary" style="padding:6px 10px;font-size:12px" onclick="printBillTxn('${x.id}')">Print</button></td>
        </tr>`).join("")||`<tr><td colspan="9" class="empty">No transactions</td></tr>`}</tbody>
      </table></div>
    </div>`);
}

function applyBillFilters(){
  state.filters.q=document.getElementById("bq")?.value||"";
  state.filters.status=document.getElementById("bst")?.value||"";
  admin();
}

function exportBillExcel(){
  const rows=filteredBillTx();
  downloadExcel([["Txn ID","Retailer","Retailer ID","Consumer","Biller","Amount","Commission","Status","Date"],
    ...rows.map(x=>[x.id,x.retailer,x.retailerId,x.consumer,x.biller,x.amount,x.commission||0,x.status,x.date])],"EazyPay-Transactions");
}

function printBillTxn(id){
  const x=state.tx.find(t=>t.id===id);if(!x)return;
  const w=window.open("","_blank");
  w.document.write(`<!doctype html><html><head><title>${x.id}</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #eee}</style></head><body>
    <h2>EazyPay Transaction</h2><p><b>${x.status}</b></p>
    <table>
      <tr><td>Txn ID</td><td>${x.id}</td></tr><tr><td>Retailer</td><td>${x.retailer}</td></tr>
      <tr><td>Consumer</td><td>${x.consumer}</td></tr><tr><td>Biller</td><td>${x.biller}</td></tr>
      <tr><td>Amount</td><td>${money(x.amount)}</td></tr><tr><td>Date</td><td>${x.date}</td></tr>
    </table><script>onload=()=>print()<\/script></body></html>`);
  w.document.close();
}

function downloadExcel(rows,name){
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>${rows.map(r=>`<Row>${r.map(v=>`<Cell><Data ss:Type="${typeof v==="number"?"Number":"String"}">${esc(v)}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet></Workbook>`;
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([xml],{type:"application/vnd.ms-excel"}));
  a.download=`${name}-${new Date().toISOString().slice(0,10)}.xls`;a.click();
}

/* ---------- Commission report ---------- */
function commissionPage(){
  const u=currentUser();if(!u){go("login");return}
  const scope=u.role==="ADMIN"?state.tx:state.tx.filter(t=>t.retailerId===u.id||allDownline(u).some(d=>d.id===t.retailerId));
  const totalComm=scope.reduce((a,t)=>a+Number(t.commission||0),0);
  const todayComm=scope.filter(t=>isToday(t.date)).reduce((a,t)=>a+Number(t.commission||0),0);
  dashShell(`
    <h1 class="page-title">Commission Report</h1>
    <p class="page-sub">Rate: ${u.commissionRate||0}% · earned on bill payments</p>
    <div class="grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-ico purple">📈</div><div><div class="stat-val">${money(totalComm)}</div><div class="stat-lbl">Total Commission</div></div></div>
      <div class="stat-card"><div class="stat-ico green">📅</div><div><div class="stat-val">${money(todayComm)}</div><div class="stat-lbl">Today</div></div></div>
      <div class="stat-card"><div class="stat-ico blue">%</div><div><div class="stat-val">${u.commissionRate||0}%</div><div class="stat-lbl">Your Rate</div></div></div>
    </div>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Txn ID</th><th>Retailer</th><th>Amount</th><th>Commission</th><th>Date</th></tr></thead>
        <tbody>${scope.filter(t=>Number(t.commission)>0).map(t=>`<tr>
          <td>${t.id}</td><td>${t.retailer}</td><td>${money(t.amount)}</td><td class="success">${money(t.commission)}</td><td>${t.date}</td>
        </tr>`).join("")||`<tr><td colspan="5" class="empty">No commission yet</td></tr>`}</tbody>
      </table></div>
    </div>`);
}

/* ---------- Activity log ---------- */
function activityPage(){
  const u=currentUser();if(!u){go("login");return}
  const rows=u.role==="ADMIN"?state.activity:state.activity.filter(a=>a.userId===u.id);
  dashShell(`
    <h1 class="page-title">Login / Activity History</h1>
    <p class="page-sub">Recent actions on this account${u.role==="ADMIN"?" (all users)":""}</p>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Detail</th></tr></thead>
        <tbody>${rows.length?rows.slice(0,100).map(a=>`<tr>
          <td>${a.date}</td><td>${a.userName||"—"}<br><span class="muted">${a.userId||""}</span></td>
          <td>${roleLabel(a.role||"")}</td><td><span class="badge badge-info">${a.action}</span></td><td>${a.detail||"—"}</td>
        </tr>`).join(""):`<tr><td colspan="5" class="empty">No activity yet</td></tr>`}</tbody>
      </table></div>
    </div>`);
}

/* ---------- Boot ---------- */
if(state.logged&&currentUser())go("dashboard");
else home();
