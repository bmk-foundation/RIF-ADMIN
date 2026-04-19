// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBOBeWy-3P39kVnxNmQIMm0-Mawol1qjQU",
  authDomain: "admin-fe276.firebaseapp.com",
  databaseURL: "https://admin-fe276-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "admin-fe276",
  storageBucket: "admin-fe276.appspot.com",
  messagingSenderId: "1047359464238",
  appId: "1:1047359464238:web:bbb93e1b350b8d925110bf"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginMsg = document.getElementById("login-msg");
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");
const overlay = document.getElementById("overlay");

// 🔐 Login
loginBtn.addEventListener("click", () => {
  loginMsg.textContent = "লোড হচ্ছে...";
  firebase.auth().signInWithEmailAndPassword(email.value, password.value)
    .then(() => {
      loginMsg.textContent = "";
    })
    .catch(() => {
      loginMsg.textContent = "⚠️ ভুল ইমেইল বা পাসওয়ার্ড";
    });
});

// 🚪 Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// ✅ Auth Listener
// ✅ Auth Listener আপডেট
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // ইউজার লগইন থাকলে সরাসরি ড্যাশবোর্ড দেখাবে
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
  } else {
    // ইউজার লগইন না থাকলে শুধুমাত্র তখনই লগইন সেকশন দেখাবে
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});
// 🔑 পাসওয়ার্ড রিসেট ফাংশন
const forgotPasswordBtn = document.getElementById("forgot-password");

forgotPasswordBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const userEmail = email.value.trim(); // ইমেইল ইনপুট থেকে নেওয়া হচ্ছে

  if (!userEmail) {
    alert("⚠️ পাসওয়ার্ড রিসেট করার জন্য আগে আপনার ইমেইলটি লিখুন।");
    return;
  }

  firebase.auth().sendPasswordResetEmail(userEmail)
    .then(() => {
      loginMsg.style.color = "green";
      loginMsg.textContent = "✅ আপনার ইমেইলে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।";
      alert("রিসেট লিঙ্ক পাঠানো হয়েছে!");
    })
    .catch((error) => {
      loginMsg.style.color = "red";
      if (error.code === "auth/user-not-found") {
        loginMsg.textContent = "❌ এই ইমেইলে কোনো ইউজার পাওয়া যায়নি।";
      } else {
        loginMsg.textContent = "❌ সমস্যা হয়েছে: " + error.message;
      }
    });
});


// ☰ Sidebar Toggle
hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

// স্ক্রিনের যেকোনো জায়গায় ক্লিক করলে sidebar বন্ধ হবে
overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});


// 📄 Menu Navigation
const menuButtons = document.querySelectorAll(".menu-btn");
const contentSections = document.querySelectorAll("#main-content > div");

function hideAllSections() {
  contentSections.forEach(section => section.style.display = "none");
}

menuButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-page");
    hideAllSections();
    const target = document.getElementById(targetId);
    if (target) {
      target.style.display = "block";
    }
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
});


// 📢 ঘোষণা পাঠানো Google Apps Script
document.getElementById("messageForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const message = document.getElementById("message").value;
  const status = document.getElementById("status");

  status.innerText = "🔁 পাঠানো হচ্ছে...";
  fetch("https://script.google.com/macros/s/AKfycby8pJe9fphNiFmxh24rl4G4Hrw4_pWZBjKY9OxCTmvf6VOEC1PQRxtJ6Ax5Fqxl1wA-/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, message })
  })
    .then(() => {
      status.innerText = "✅ সফলভাবে পাঠানো হয়েছে!";
      document.getElementById("messageForm").reset();
    })
    .catch(() => {
      status.innerText = "❌ পাঠানো যায়নি!";
    });
});

// --- নতুন অনুদান সিস্টেম ---
const donationURL = "https://script.google.com/macros/s/AKfycbwsohUc1ouZzmgpvyrpxGOd05LINvUnLd4SQzJT4tT1lbWYDXpFwfBbBHp7lx4rOnkl/exec"; 

// পেজ লোড হলে সালগুলো নিয়ে আসবে
async function loadSheetList() {
  const selector = document.getElementById("yearSelector");
  try {
    const res = await fetch(`${donationURL}?action=getSheets`);
    const sheetNames = await res.json();
    const currentYear = new Date().getFullYear().toString();
    
    selector.innerHTML = ""; 
    sheetNames.forEach(name => {
      let option = document.createElement("option");
      option.value = name;
      option.text = (name === "Sheet1") ? "2025 (মাস্টার)" : name;
      if (name === currentYear) option.selected = true;
      selector.appendChild(option);
    });
  } catch (e) {
    selector.innerHTML = "<option>লোড ব্যর্থ</option>";
  }
}

// ডাটা সাবমিট ফাংশন
async function submitDonation() {
  const year = document.getElementById("yearSelector").value;
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const month = document.getElementById("month").value;
  const amount = document.getElementById("amount").value.trim();
  const btnText = document.getElementById("btnText");
  const status = document.getElementById("donation-status");

  if (!year || !name || !phone || !amount) return alert("⚠️ সব তথ্য পূরণ করুন!");

  btnText.innerText = "⏳ প্রসেসিং...";
  status.innerText = "ডাটাবেজে পাঠানো হচ্ছে...";
  status.style.color = "orange";

  try {
    const formData = new URLSearchParams({ 
      action: "add", 
      year: year, 
      name: name, 
      phone: phone, 
      month: month, 
      amount: amount 
    });

    const res = await fetch(donationURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });
    
    const msg = await res.text();
    status.innerText = "✅ " + msg;
    status.style.color = "green";
    
    // ফর্ম ক্লিয়ার
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("amount").value = "";
    
  } catch (err) {
    status.innerText = "❌ এরর হয়েছে!";
    status.style.color = "red";
  } finally {
    btnText.innerText = "✅ ডাটাবেজে জমা দিন";
  }
}

// মেনু থেকে 'add-member' বাটনে ক্লিক করলে সাল লোড হবে
document.querySelector('[data-page="add-member"]').addEventListener('click', loadSheetList);

// 👥 সদস্য তথ্য দেখানো
fetch(donationURL + "?action=read")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("view-container");
    if (!data || data.length === 0) {
      container.innerHTML = "⚠️ তথ্য পাওয়া যায়নি!";
      return;
    }

    const headers = Object.keys(data[0]);
    let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
    data.forEach(row => {
      html += `<tr>${headers.map(h => `<td>${row[h] || ""}</td>`).join("")}</tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  })
  .catch(err => {
    document.getElementById("view-container").innerHTML = "❌ লোড করতে ব্যর্থ!";
    console.error(err);
  });
  
