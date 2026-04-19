// ১. গ্লোবাল ভেরিয়েবল এবং ইনিশিয়ালাইজেশন
function getSkeleton(type, count = 3) {
    let html = '';
    for(let i=0; i<count; i++) {
        if(type === 'card') html += `<div class="skeleton skeleton-card"></div>`;
        if(type === 'table') html += `<tr>
            <td><div class="skeleton skeleton-circle"></div></td>
            <td><div class="skeleton skeleton-row"></div></td>
            <td><div class="skeleton skeleton-row"></div></td>
            <td><div class="skeleton skeleton-row"></div></td>
            <td><div class="skeleton skeleton-row"></div></td>
            <td><div class="skeleton skeleton-row"></div></td>
        </tr>`;
        if(type === 'list') html += `<div class="card-container"><div class="skeleton skeleton-row" style="width:60%"></div><div class="skeleton skeleton-row"></div></div>`;
    }
    
    return html;
}

const firebaseConfig = {
    apiKey: "AIzaSyAzGK_y9kx5oVFL1-rGTnSDxDvdYoVIqOg",
    authDomain: "bmkf-donation-system.firebaseapp.com",
    databaseURL: "https://bmkf-donation-system-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bmkf-donation-system",
    storageBucket: "bmkf-donation-system.firebasestorage.app",
    messagingSenderId: "718912081844",
    appId: "1:718912081844:web:98d102b1a6dc07464cace1"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// EmailJS ইনিশিয়ালাইজ
emailjs.init("M8KPFz8Wbp6tNUcfR");

const projects = ["সাধারণ তহবিল", "শিক্ষা সহায়তা", "চিকিৎসা তহবিল", "এতিম কল্যাণ", "বৃক্ষরোপণ কর্মসূচি", "অসহায় ও দরিদ্র কল্যাণ", "যাকাত তহবিল"];
let myChart = null;
let availableYears = new Set();

// ২. অথেন্টিকেশন লজিক
function checkLogin() {
    const pass = document.getElementById('adminPass').value;
    if(pass === "Masud#786@R") { 
        // localStorage এর বদলে sessionStorage ব্যবহার করুন
        sessionStorage.setItem('rif_admin_logged_in', 'true');
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        startApp();
    } else { 
        alert("ভুল পাসওয়ার্ড!"); 
    }
}
function logoutAdmin() {
    if(confirm("আপনি কি লগ-আউট করতে চান?")) {
        sessionStorage.removeItem('rif_admin_logged_in');
        location.reload();
    }
}


// ৩. কোর অ্যাপ লজিক
function startApp() {
    loadStats();
    loadPendingDonations();
    loadVerifiedDonations();
    loadExpenseHistory();
    loadMembers();
    const expF = document.getElementById('expenseCategoryFilter');
    if(expF) {
        expF.innerHTML = '<option value="all">সব খাতের ব্যয়</option>';
        projects.forEach(p => expF.innerHTML += `<option value="${p}">${p}</option>`);
    }
}

function switchTab(tabId, el) {
    document.querySelectorAll('.menu-item, .mobile-nav-item').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    
    const label = el.innerText.trim();
    document.querySelectorAll('.menu-item, .mobile-nav-item').forEach(m => {
        if(m.innerText.trim() === label) m.classList.add('active');
    });

    ['dashboard', 'pending', 'verified', 'members', 'accounts'].forEach(t => {
        const section = document.getElementById(t + '-tab');
        if(section) section.style.display = 'none';
    });
    
    const target = document.getElementById(tabId + '-tab');
    if(target) target.style.display = 'block';
}

// ৪. ড্যাশবোর্ড ও স্ট্যাটাস
function loadStats() {
    const container = document.getElementById('stats-container');
    const overallContainer = document.getElementById('overall-stats');
    const chartWrapper = document.getElementById('chart-wrapper');
    const chartCanvas = document.getElementById('donationAnalyticsChart');

    if (container) container.innerHTML = getSkeleton('card', 4);
    if (overallContainer) overallContainer.innerHTML = getSkeleton('card', 1);
    
    db.ref().on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const donations = data.donations || {};
        const expenses = data.expenses || {};
        
        if (container) container.innerHTML = "";
        
        let labels = [], dData = [], eData = [];
        let grandTotalIn = 0, grandTotalOut = 0;

        projects.forEach(p => {
            const totalIn = donations[p] ? parseFloat(donations[p].total_amount || 0) : 0;
            let totalOut = 0;
            if (expenses[p] && expenses[p].items) {
                Object.values(expenses[p].items).forEach(i => totalOut += parseFloat(i.amount || 0));
            }
            
            const balance = totalIn - totalOut;
            grandTotalIn += totalIn;
            grandTotalOut += totalOut;

            labels.push(p); 
            dData.push(totalIn); 
            eData.push(totalOut);

            if(container) {
                container.innerHTML += `
                <div class="stat-card" style="border: 1px solid ${balance >= 0 ? 'var(--primary)' : 'var(--danger)'}">
                    <h4 style="margin-bottom:10px; color:var(--secondary);">${p}</h4>
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px;">
                        <span>জমা: ৳${totalIn}</span>
                        <span style="color:var(--danger)">ব্যয়: ৳${totalOut}</span>
                    </div>
                    <div style="font-size:14px; font-weight:700; color:${balance >= 0 ? 'green' : 'red'};">
                        অবশিষ্ট: ৳${balance}
                    </div>
                </div>`;
            }
        });

        const grandBalance = grandTotalIn - grandTotalOut;
        if (overallContainer) {
            overallContainer.innerHTML = `
                <div class="card-container" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; padding: 25px;">
                    <div><small>সর্বমোট জমা</small><div style="font-size: 20px; font-weight: 700;">৳${grandTotalIn}</div></div>
                    <div style="border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2);"><small>সর্বমোট ব্যয়</small><div style="font-size: 20px; font-weight: 700; color: #ff8a80;">৳${grandTotalOut}</div></div>
                    <div><small>বর্তমান আছে</small><div style="font-size: 20px; font-weight: 700; color: var(--accent);">৳${grandBalance}</div></div>
                </div>`;
        }
        updateChart(labels, dData, eData);
    });
}

function updateChart(l, d, e) {
    const canvas = document.getElementById('donationAnalyticsChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: l,
            datasets: [{ label: 'জমা', data: d, backgroundColor: '#00695c' }, { label: 'ব্যয়', data: e, backgroundColor: '#ff5252' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ৫. পেন্ডিং ও এপ্রুভাল লজিক (ইমেইল সহ)
function loadPendingDonations() {
    document.getElementById('pending-list').innerHTML = getSkeleton('list', 3);
    
    db.ref('pending_donations').on('value', (snapshot) => {
        const list = document.getElementById('pending-list');
        list.innerHTML = "";
        
        if (!snapshot.exists()) {
            list.innerHTML = "<p style='text-align:center; color:#666;'>বর্তমানে কোনো পেন্ডিং অনুদান নেই।</p>";
            return;
        }

        snapshot.forEach(child => {
            const d = child.val();
            const key = child.key;
            
            list.innerHTML += `
            <div class="card-container" style="border-left: 5px solid #ff9800; padding: 15px; margin-bottom: 15px; background: #fff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <b style="font-size: 18px; color: #333;">${d.donorName}</b>
                    <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 20px; font-weight: bold;">৳${d.amount}</span>
                </div>
                
                <div style="margin-top: 10px; font-size: 14px; color: #555;">
                    <p style="margin: 3px 0;"><i class="fas fa-envelope" style="width: 20px; color: #00695c;"></i> ${d.donorEmail || 'ইমেইল নেই'}</p>
                    <p style="margin: 3px 0;"><i class="fas fa-phone" style="width: 20px; color: #00695c;"></i> ${d.donorPhone || 'মোবাইল নেই'}</p>
                    <p style="margin: 3px 0;"><i class="fas fa-hand-holding-heart" style="width: 20px; color: #00695c;"></i> খাত: <b>${d.project}</b></p>
                    <p style="margin: 3px 0;"><i class="fas fa-fingerprint" style="width: 20px; color: #00695c;"></i> TrxID: <span style="font-family: monospace; background: #eee; padding: 2px 5px;">${d.trxID}</span></p>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="approveDonation('${key}')" id="btn-${key}" style="flex: 2; background: #2ecc71; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit;">
                        <i class="fas fa-check-circle"></i> Approve & Email
                    </button>
                    <button onclick="deleteEntry('pending_donations/${key}')" style="flex: 1; background: #ff5252; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>`;
        });
    });
}

function approveDonation(key) {
    if(!confirm("আপনি কি এই অনুদানটি অনুমোদন করে দাতার ইমেইলে রশিদ পাঠাতে চান?")) return;

    const btn = document.getElementById(`btn-${key}`);
    btn.disabled = true;
    btn.innerText = "প্রসেসিং...";

    db.ref('pending_donations/' + key).once('value').then(snap => {
        const d = snap.val();
        if (!d) return alert("তথ্য পাওয়া যায়নি!");

        const approvalDate = new Date().toLocaleDateString('en-GB');
        const newRef = db.ref('donations/' + d.project + '/transactions').push();
        
        db.ref('donations/' + d.project + '/transactions/' + newRef.key).set({
            ...d,
            date: approvalDate,
            status: "verified"
        }).then(() => {
            db.ref('donations/' + d.project + '/total_amount').transaction(c => (c || 0) + parseFloat(d.amount));
            db.ref('pending_donations/' + key).remove();

            // ইমেইল প্যারামিটার
            const emailParams = {
                donorEmail: d.donorEmail,
                donorName: d.donorName,
                amount: d.amount,
                project: d.project,
                trxID: d.trxID,
                date: approvalDate
            };

            sendApprovalEmail(emailParams);
        });
    });
}

function sendApprovalEmail(params) {
    emailjs.send("service_0kfsqyf", "template_kf64wde", params)
        .then((res) => {
            alert("সফল! অনুদান অনুমোদিত হয়েছে এবং রশিদ পাঠানো হয়েছে।");
        })
        .catch((err) => {
            console.error('EmailJS Error:', err);
            alert("অনুমোদন সফল হলেও ইমেইল রশিদ পাঠানো যায়নি।");
        });
}

function loadVerifiedDonations() {
    // ড্রপডাউন থেকে ভ্যালু নেওয়া, যদি না থাকে তবে ডিফল্ট 'all'
    const yearEl = document.getElementById('yearFilter');
    const monthEl = document.getElementById('monthFilter');
    
    const sYear = (yearEl && yearEl.value) ? yearEl.value : 'all';
    const sMonth = (monthEl && monthEl.value) ? monthEl.value : 'all';
    
    document.getElementById('verified-list').innerHTML = getSkeleton('table', 6);
    
    db.ref('donations').on('value', (snapshot) => {
        const tbody = document.getElementById('verified-list');
        if (!tbody) return;
        tbody.innerHTML = "";
        const data = snapshot.val();
        if (!data) return;

        for (let proj in data) {
            const trans = data[proj].transactions;
            if (!trans) continue;
            
            Object.keys(trans).forEach(id => {
                const t = trans[id];
                // তারিখ থেকে বছর ও মাস আলাদা করা (ইংরেজি ফরম্যাটে রূপান্তরসহ)
                let dateStr = t.date.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
                const dParts = dateStr.split('/'); 
                const year = dParts[2];
                const month = parseInt(dParts[1]).toString();

                if (year) availableYears.add(year);

                // ফিল্টারিং লজিক: 'all' থাকলে সব দেখাবে, অথবা ভ্যালু মিললে দেখাবে
                const isYearMatch = (sYear === 'all' || sYear === year);
                const isMonthMatch = (sMonth === 'all' || sMonth === month);

                if (isYearMatch && isMonthMatch) {
                    tbody.innerHTML += `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.donorName}</td>
                            <td><span class="badge" style="background:var(--primary);">${proj}</span></td>
                            <td style="font-weight:bold; color:green;">৳${t.amount}</td>
                            <td><small>${t.trxID}</small></td>
                            <td><i class="fas fa-trash" style="color:var(--danger); cursor:pointer;" onclick="deleteVerified('${proj}', '${id}', ${t.amount})"></i></td>
                        </tr>`;
                }
            });
        }
        // ডেটা লোড হওয়ার পর বছরগুলোর ড্রপডাউন আপডেট করা
        updateYearDropdown(sYear); 
    });
}


function updateYearDropdown(currentSelected) {
    const ys = document.getElementById('yearFilter');
    if(!ys) return;
    
    // বর্তমান সিলেকশন ধরে রাখা
    const cur = currentSelected || ys.value; 
    
    let options = '<option value="all">সব বছর</option>';
    // বছরগুলোকে বড় থেকে ছোট ক্রমে সাজানো
    Array.from(availableYears).sort((a, b) => b - a).forEach(y => {
        options += `<option value="${y}" ${y === cur ? 'selected' : ''}>${y}</option>`;
    });
    
    // শুধুমাত্র তখনই আপডেট হবে যদি নতুন কোনো বছর যুক্ত হয়
    if(ys.innerHTML !== options) {
        ys.innerHTML = options;
    }
}


function loadExpenseHistory() {
    const filter = document.getElementById('expenseCategoryFilter').value;
    document.getElementById('expense-history-list').innerHTML = getSkeleton('list', 4);
    
    db.ref('expenses').on('value', (snapshot) => {
        const list = document.getElementById('expense-history-list');
        if (!list) return;
        list.innerHTML = "";
        const data = snapshot.val() || {};
        
        let hasData = false;

        for (let proj in data) {
            if (filter !== 'all' && filter !== proj) continue;
            const items = data[proj].items; 
            if (!items) continue;

            Object.keys(items).forEach(id => {
                const e = items[id];
                hasData = true;
                list.innerHTML += `
                    <div style="border-bottom:1px solid #eee; padding:10px; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <b>${proj}</b><br>
                                <small style="color:#666;">${e.date} | ${e.note}</small>
                            </div>
                            <div style="text-align:right;">
                                <span style="color:red; font-weight:bold; display:block;">-৳${e.amount}</span>
                                <i class="fas fa-trash-alt" 
                                   style="color:var(--danger); cursor:pointer; font-size:14px; margin-top:5px;" 
                                   onclick="deleteExpense('${proj}', '${id}', ${e.amount})">
                                </i>
                            </div>
                        </div>
                    </div>`;
            });
        }
        
        if (!hasData) {
            list.innerHTML = "<p style='text-align:center; padding:10px; color:#888;'>কোনো রেকর্ড পাওয়া যায়নি।</p>";
        }
    });
}
function addExpense() {
    const p = document.getElementById('expProject').value;
    const a = document.getElementById('expAmount').value;
    const n = document.getElementById('expNote').value;
    
    if(!p || !a || !n) return alert("সব তথ্য দিন!");
    
    db.ref(`expenses/${p}/items`).push({ 
        amount: parseFloat(a), 
        note: n, 
        date: new Date().toLocaleDateString('en-GB') 
    })
    .then(() => { 
        alert("সেভ হয়েছে!"); 
        document.getElementById('expAmount').value = ""; 
        document.getElementById('expNote').value = ""; 
    });
}

function deleteExpense(project, id, amount) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই ব্যয়ের রেকর্ডটি মুছে ফেলতে চান?")) {
        // ফায়ারবেস থেকে ওই নির্দিষ্ট আইটেমটি রিমুভ করা
        db.ref(`expenses/${project}/items/${id}`).remove()
        .then(() => {
            alert("সফলভাবে মুছে ফেলা হয়েছে।");
            // যদি আপনার মোট ব্যয়ের কোনো আলাদা হিসাব (Stats) থাকে, তবে এখানে আপডেট করতে পারেন।
        })
        .catch((error) => {
            alert("মুছে ফেলতে সমস্যা হয়েছে: " + error.message);
        });
    }
}


function loadMembers() {
    document.getElementById('member-list-table').innerHTML = getSkeleton('table', 5);
    db.ref('member_applications').on('value', (snapshot) => {
        const tbody = document.getElementById('member-list-table');
        if (!tbody) return;
        tbody.innerHTML = "";
        if(!snapshot.exists()) return;

        snapshot.forEach(child => {
            const m = child.val();
            const key = child.key;
            
            // স্ট্যাটাস অনুযায়ী ব্যাজ কালার নির্ধারণ
            let statusColor = 'orange';
            if(m.status === 'approved') statusColor = 'var(--success)';
            if(m.status === 'dismissed') statusColor = 'var(--danger)';
            
            tbody.innerHTML += `
                <tr>
                    <td><img src="${m.photo}" onclick="viewPhoto('${m.photo}')" style="width:40px; height:40px; border-radius:50%; object-fit:cover; cursor:pointer;"></td>
                    <td><b>${m.name}</b></td>
                    <td>${m.work}</td>
                    <td>${m.phone}</td>
                    <td><span class="badge" style="background:${statusColor}">${m.status || 'pending'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <select onchange="handleStatusUpdate('${key}', '${m.phone}', '${m.name}', this.value)" style="padding:6px; border-radius:5px; border:1px solid #ddd; font-size:12px; cursor:pointer;">
                                <option value="" disabled selected>অ্যাকশন</option>
                                <option value="approved">Approve</option>
                                <option value="dismissed">Dismiss (অব্যাহতি)</option>
                            </select>

                            <button onclick="deleteMember('${key}')" style="background:var(--danger); color:white; border:none; padding:6px 10px; border-radius:5px; cursor:pointer; font-size:14px;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });
    });
}

// স্ট্যাটাস আপডেট এবং মেসেজ পাঠানোর গেটওয়ে
function handleStatusUpdate(key, phone, name, newStatus) {
    let confirmMsg = newStatus === 'approved' ? "সদস্যপদ অনুমোদন করবেন?" : "সদস্যপদ থেকে অব্যাহতি দেবেন?";
    if(!confirm(confirmMsg)) return;

    db.ref(`member_applications/${key}`).update({ status: newStatus })
    .then(() => {
        alert("স্ট্যাটাস আপডেট সফল হয়েছে!");
        
        // মেসেজ পাঠানোর মাধ্যম নির্বাচন
        const choice = confirm("আপনি কি এই সদস্যকে হোয়াটসঅ্যাপে বার্তা পাঠাতে চান?\n(না চাইলে সাধারণ SMS পাঠানোর অপশন পাবেন)");
        
        if(choice) {
            sendWhatsAppMessage(phone, name, newStatus);
        } else {
            const smsChoice = confirm("আপনি কি সাধারণ SMS পাঠাতে চান?");
            if(smsChoice) sendSMSMessage(phone, name, newStatus);
        }
    });
}

// সাধারণ SMS পাঠানোর ফাংশন (ডাইনামিক মেসেজসহ)
function sendSMSMessage(phone, name, status) {
    let cleanPhone = phone.replace(/\D/g, '');
    let message = "";

    if (status === 'approved') {
        message = `আসসালামু আলাইকুম, ${name}
আপনাকে অভিনন্দন! 🎉

আপনার সদস্যপদের আবেদনটি "রাফাহিয়াতুল ইনসান ফাউন্ডেশন" কর্তৃক পর্যালোচনা করা হয়েছে এবং আপনাকে আমাদের নতুন সদস্য হিসেবে, অনুমোদন দেওয়া হয়েছে। আমাদের এই মানবিক যাত্রায় আপনাকে স্বাগত জানাতে পেরে আমরা আনন্দিত। 🤝

ধন্যবাদান্তে,
রাফাহিয়াতুল ইনসান ফাউন্ডেশন।`;
    } else {
        message = `আসসালামু আলাইকুম, ${name}। 
অত্যন্ত দুঃখের সাথে জানানো যাচ্ছে যে, সংস্থার নিয়ম-শৃঙ্খলা ভঙ্গের কারণে আপনাকে "রাফাহিয়াতুল ইনসান ফাউন্ডেশন" এর সদস্যপদ থেকে অব্যাহতি দেওয়া হয়েছে। আজ থেকে সংস্থার কোনো কার্যক্রমে আপনার সম্পৃক্ততা গণ্য হবে না।

ধন্যবাদান্তে,
রাফাহিয়াতুল ইনসান ফাউন্ডেশন।`;
    }

    const smsURL = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsURL;
}

// হোয়াটসঅ্যাপে সুন্দর বার্তা পাঠানোর ফাংশন (ডাইনামিক মেসেজসহ)
function sendWhatsAppMessage(phone, name, status) {
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('88')) cleanPhone = '88' + cleanPhone;

    let message = "";
    if (status === 'approved') {
        message = `আসসালামু আলাইকুম, *${name}*
আপনাকে অভিনন্দন! 🎉

আপনার সদস্যপদের আবেদনটি "রাফাহিয়াতুল ইনসান ফাউন্ডেশন" কর্তৃক পর্যালোচনা করা হয়েছে এবং আপনাকে আমাদের নতুন সদস্য হিসেবে **অনুমোদন (Approved)** দেওয়া হয়েছে। আমাদের এই মানবিক যাত্রায় আপনাকে স্বাগত জানাতে পেরে আমরা আনন্দিত। 🤝

ধন্যবাদান্তে,
রাফাহিয়াতুল ইনসান ফাউন্ডেশন।`;
    } else {
        message = `আসসালামু আলাইকুম, *${name}*

অত্যন্ত দুঃখের সাথে জানানো যাচ্ছে যে, সংস্থার নিয়ম-শৃঙ্খলা ভঙ্গের কারণে আপনাকে "রাফাহিয়াতুল ইনসান ফাউন্ডেশন"-এর সদস্যপদ থেকে **অব্যাহতি (Dismissed)** দেওয়া হয়েছে। আজ থেকে সংস্থার কোনো কার্যক্রমে আপনার সম্পৃক্ততা গণ্য হবে না।

ধন্যবাদান্তে,
রাফাহিয়াতুল ইনসান ফাউন্ডেশন।`;
    }

    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

function deleteMember(key) {
    if(confirm("আপনি কি নিশ্চিতভাবে এই সদস্যের তথ্য মুছে ফেলতে চান?")) {
        db.ref(`member_applications/${key}`).remove()
        .then(() => {
            alert("সদস্যের তথ্য সফলভাবে মুছে ফেলা হয়েছে।");
        })
        .catch((error) => {
            alert("মুছে ফেলতে সমস্যা হয়েছে: " + error.message);
        });
    }
}


// ছবি বড় করে দেখানো
function viewPhoto(url) {
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modalImg.src = url;
        modal.style.display = 'flex';
        // স্ক্রল বন্ধ করা যখন ছবি ওপেন থাকে
        document.body.style.overflow = 'hidden';
    }
}

// মডাল বন্ধ করা
function closeModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'none';
        // স্ক্রল আবার চালু করা
        document.body.style.overflow = 'auto';
    }
}


function deleteVerified(p, id, amt) { if(confirm("নিশ্চিত?")) { db.ref(`donations/${p}/transactions/${id}`).remove(); db.ref(`donations/${p}/total_amount`).transaction(c => (c || 0) - amt); }}
function deleteEntry(path) { if(confirm("মুছবেন?")) db.ref(path).remove(); }

window.onload = function() {
    if(localStorage.getItem('rif_admin_logged_in') === 'true') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        startApp();
    }
};

// ৯. নিরাপদ সার্চ এবং হাইলাইট ফাংশন (সংশোধিত)

// মেম্বার সার্চের জন্য
function searchMembers() {
    let input = document.getElementById("memberSearch").value.trim().toLowerCase();
    let rows = document.getElementById("member-list-table").getElementsByTagName("tr");
    performSearch(rows, input);
}

// ডোনেশন সার্চের জন্য
function searchDonations() {
    let input = document.getElementById("donationSearch").value.trim().toLowerCase();
    let rows = document.getElementById("verified-list").getElementsByTagName("tr");
    performSearch(rows, input);
}

// কমন সার্চ লজিক যা দুই জায়গাতেই কাজ করবে
function performSearch(rows, input) {
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        
        // আগে হাইলাইট পরিষ্কার করে অরিজিনাল টেক্সট ফিরিয়ে আনা
        clearRowHighlights(row);
        
        let text = row.innerText.toLowerCase();
        
        if (text.includes(input)) {
            row.style.display = "";
            if (input !== "") {
                applyHighlight(row, input);
            }
        } else {
            row.style.display = "none";
        }
    }
}

// টেক্সট হাইলাইট করার নিরাপদ পদ্ধতি
function applyHighlight(row, term) {
    let cells = row.getElementsByTagName("td");
    // প্রথম সেল (ছবি) এবং শেষ সেল (বাটন) বাদ দিয়ে লুপ
    for (let i = 1; i < cells.length - 1; i++) {
        let cell = cells[i];
        let originalText = cell.innerText; // শুধুমাত্র টেক্সট নেওয়া হলো
        
        if (originalText.toLowerCase().includes(term)) {
            let regex = new RegExp(`(${term})`, "gi");
            cell.innerHTML = originalText.replace(regex, '<mark class="search-highlight" style="background: #ffeb3b; color: black; padding: 0; border-radius: 2px;">$1</mark>');
        }
    }
}

// হাইলাইট পুরোপুরি মুছে ফেলার ফাংশন
function clearRowHighlights(row) {
    let cells = row.getElementsByTagName("td");
    // ছবি এবং বাটন বাদে বাকি সেলগুলোর HTML রিসেট করা
    for (let i = 1; i < cells.length - 1; i++) {
        // innerText সেট করলে ভেতরের সব <mark> ট্যাগ ডিলিট হয়ে শুধু টেক্সট থাকবে
        cells[i].innerHTML = cells[i].innerText; 
    }
}

async function generatePDFReport() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'প্রসেসিং...';
    btn.disabled = true;

    // ১. ডাটা সংগ্রহ
    const snapshot = await db.ref().once('value');
    const data = snapshot.val() || {};
    
    // ডাটাবেস স্ট্রাকচার অনুযায়ী সঠিক পাথ নিশ্চিত করুন
    const donations = data.donations || {};
    const expenses = data.expenses || {};

    let gIn = 0, gOut = 0;
    const date = new Date();
    const reportMonth = date.toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
    
    // রিপোর্ট তৈরির সুনির্দিষ্ট সময় ও তারিখ
    const reportingTime = date.toLocaleString('bn-BD', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    });

    let rows = "";

    // ২. লুপ চালিয়ে ডাটা টেবিল তৈরি
    projects.forEach(p => {
        let tIn = 0;
        if (donations[p]) {
            tIn = parseFloat(donations[p].total_amount || donations[p].amount || 0);
        }

        let tOut = 0;
        if (expenses[p]) {
            if (expenses[p].items) {
                Object.values(expenses[p].items).forEach(i => tOut += parseFloat(i.amount || 0));
            } else {
                tOut = parseFloat(expenses[p].amount || 0);
            }
        }

        gIn += tIn; gOut += tOut;

        rows += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${p}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">টাকা ${tIn.toLocaleString('bn-BD')}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">টাকা ${tOut.toLocaleString('bn-BD')}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">টাকা ${(tIn - tOut).toLocaleString('bn-BD')}</td>
            </tr>`;
    });

    const reportElement = document.createElement('div');
    reportElement.style.padding = "20px";
    reportElement.style.fontFamily = "'Adorsho', sans-serif";
    
    reportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #00695c;">রাফাহিয়াতুল ইনসান ফাউন্ডেশন</h2>
            <p>মাসিক বিবরণী: ${reportMonth}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background-color: #00695c; color: green;">
                    <th style="border: 1px solid #ddd; padding: 10px;">খাত</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">মোট জমা</th>
                    <th style="border: 1px solid #ddd; padding: 10px;color:red">মোট ব্যয়</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">অবশিষ্ট</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="margin-top: 20px; font-weight: bold; border-top: 2px solid #00695c; padding-top: 10px;">
            <p>সর্বমোট জমা: টাকা ${gIn.toLocaleString('bn-BD')}</p>
            <p style="color: red;">সর্বমোট ব্যয়: টাকা ${gOut.toLocaleString('bn-BD')}</p>
            <p style="color: #00695c;">বর্তমান অবশিষ্ট: টাকা ${(gIn - gOut).toLocaleString('bn-BD')}</p>
        </div>
        <div style="margin-top: 20px; text-align: right; font-size: 12px; color: #666;">
            <p>রিপোর্ট তৈরির সময়: ${reportingTime}</p>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `RIF_Report_${date.toLocaleDateString('bn-BD')}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(reportElement).save().then(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}





function backupDatabase() {
    if(!confirm("আপনি কি সম্পূর্ণ ডাটাবেসের একটি ব্যাকআপ ফাইল ডাউনলোড করতে চান?")) return;

    db.ref().once('value').then(snapshot => {
        const data = snapshot.val();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `RIF_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert("ব্যাকআপ ফাইলটি সফলভাবে ডাউনলোড হয়েছে। এটি নিরাপদ স্থানে সংরক্ষণ করুন।");
    }).catch(err => {
        alert("ব্যাকআপ নিতে সমস্যা হয়েছে: " + err.message);
    });
}





function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;

    // সাইডবার এবং ওভারলে টগল করা
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    // সাইডবার একটিভ থাকলে স্ক্রলিং বন্ধ (lock) করা, না থাকলে চালু করা
    if (sidebar.classList.contains('active')) {
        body.style.overflow = 'hidden';
        body.style.height = '100vh';
    } else {
        body.style.overflow = 'auto';
        body.style.height = 'auto';
    }
}

// মেনুতে ক্লিক করলে মেনু বন্ধ হয়ে যাবে (মোবাইলের জন্য)
function handleMenuClick(tab, element) {
    // আপনার আগের ট্যাব পরিবর্তন করার ফাংশন
    if (typeof switchTab === "function") {
        switchTab(tab, element); 
    }
    
    // যদি মোবাইল ভিউতে থাকে, তবে মেনু বন্ধ করো এবং স্ক্রলিং চালু করে দাও
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar.classList.contains('active')) {
            toggleSidebar(); // এটি কল করলে স্বয়ংক্রিয়ভাবে স্ক্রলিং unlock হয়ে যাবে
        }
    }
}
window.onload = () => {
    // ১. ইউআরএল প্যারামিটার সিকিউরিটি চেক (আপনার আগের কোড)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('view')) {
        window.location.href = "warning.html";
        return;
    }

    // ২. সেশন চেক (ট্যাব বন্ধ করলেই এটি মুছে যাবে)
    if(sessionStorage.getItem('rif_admin_logged_in') === 'true') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        startApp();
    } else {
        // যদি লগইন না থাকে তবে লগইন সেকশন দেখাবে
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-content').style.display = 'none';
    }
};
