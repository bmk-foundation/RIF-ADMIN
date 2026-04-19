
    // URL থেকে লিডার আইডি চেক করার জন্য
    const urlParams = new URLSearchParams(window.location.search);
    const viewLeaderId = urlParams.get('view'); // উদাহরণ: ?view=L1
    const isLeaderMode = viewLeaderId !== null;


    const firebaseConfig = { databaseURL: "https://bmkf-donation-system-default-rtdb.asia-southeast1.firebasedatabase.app" };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

        const leaders = [
    { id: "L1", name: "মোহাম্মদ মাসুদ রানা", role: "আমীর", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", phone: "8801700000000", pass: "Masud#786@R" },
    { id: "L2", name: "হাফেজ মোঃ নুর আলম", role: "নায়েবে-আমীর", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", phone: "8801700000000", pass: "Nur!Alam$26" },
    { id: "L5", name: "মোঃ বেলাল হোসেন", role: "সেক্রেটারি", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", phone: "8801700000000", pass: "Belal@2026!" },
    { id: "L6", name: "মোঃ সোহেল রানা", role: "সাংগঠনিক সম্পাদক", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", phone: "8801700000000", pass: "Sohel^Rana#1" },
    { id: "L3", name: "মোঃ শাহিন আলম", role: "ক্যাশিয়ার", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", phone: "8801700000000", pass: "Shahin*99&S" },
    { id: "L4", name: "মোঃ মোখলেছুর রহমান", role: "প্রচার সম্পাদক", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", phone: "8801700000000", pass: "Mokhles%55#" }
];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let selectedLeaderId = "";

    function initFilters() {
        const yF = document.getElementById('yearFilter');
        const mF = document.getElementById('monthFilter');
        const now = new Date();
        const startYear = 2026;
        const currentYear = now.getFullYear();

        for(let y = startYear; y <= currentYear; y++) {
            yF.innerHTML += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y} সাল</option>`;
        }
        months.forEach((m, i) => {
            mF.innerHTML += `<option value="${m}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`;
        });
    }

                async function loadGroups() {
        const container = document.getElementById('group-list');
        const yearFilter = document.getElementById('yearFilter');
        const monthFilter = document.getElementById('monthFilter');
        
        // লিডার মোড হলে ফিল্টার ড্রপডাউন লক (Disable) করে দেওয়া
        if (isLeaderMode) {
            yearFilter.disabled = true;
            monthFilter.disabled = true;
        }

        const year = yearFilter.value;
        const month = monthFilter.value;
        
        container.innerHTML = "<p style='text-align:center;'>লোড হচ্ছে...</p>";
        const snap = await db.ref('member_applications').once('value');
        const members = snap.val() || {};
        container.innerHTML = "";

        const leadersToDisplay = isLeaderMode 
            ? leaders.filter(l => l.id === viewLeaderId) 
            : leaders;

        if (isLeaderMode && leadersToDisplay.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:red;'>ভুল লিঙ্ক! লিডার আইডি খুঁজে পাওয়া যায়নি।</p>";
            return;
        }

        leadersToDisplay.forEach(leader => {
            const groupMembers = Object.entries(members).filter(([id, m]) => 
                m.status === 'approved' && m.groupLeader === leader.id
            );

            let mHtml = "";
            groupMembers.forEach(([id, m]) => {
                const isPaid = m.payments && m.payments[year] && m.payments[year][month];
                
                const actionHtml = isLeaderMode 
                    ? `<span style="font-weight:bold; font-size:13px; color:${isPaid ? '#2e7d32' : '#c62828'}">
                        ${isPaid ? '✅ পরিশোধিত' : '❌ জমা দেয়নি'}
                       </span>`
                    : `<div style="display:flex; align-items:center; gap:10px;">
                        <button onclick="openEditModal('${id}', '${m.name}', '${m.phone}', '${m.photo || ''}')" 
                                style="border:none; background:none; color:var(--primary); cursor:pointer; font-size:16px;">
                            <i class="fa fa-edit"></i>
                        </button>
                        <input type="checkbox" class="pay-check" ${isPaid ? 'checked' : ''} 
                               onclick="togglePayment('${id}', '${year}', '${month}', this.checked)">
                       </div>`;

                mHtml += `
                    <div class="member-item">
                        <img src="${m.photo || 'https://via.placeholder.com/50'}" class="member-img">
                        <div class="m-info">
                            <b>${m.name}</b>
                            <span><i class="fa fa-phone"></i> ${m.phone}</span>
                        </div>
                        ${actionHtml}
                    </div>`;
            });

            container.innerHTML += `
                <div class="leader-card">
                    <div class="leader-header">
                        <div class="leader-profile">
                            <img src="${leader.img}" class="leader-img">
                            <div>
    <b style="font-size:16px;">${leader.name}</b><br> <span style="display: inline-block; margin-top: 5px; font-size:11px; background:rgba(255,255,255,0.2); padding:2px 6px; border-radius:5px; border: 1px solid rgba(255,255,255,0.3);">
        ${leader.role || 'দায়িত্বশীল'}
    </span>
    <br>
    <small style="display: block; margin-top: 5px;">সদস্য: ${groupMembers.length} জন</small>
</div>

                            </div>
                        <div class="btn-group">
                            ${!isLeaderMode ? `
                            <button class="action-btn" onclick="openModal('${leader.id}', '${leader.name}')">
                                <i class="fa fa-user-plus"></i> যোগ
                            </button>` : ''}
                        </div>
                    </div>
                    <div>${mHtml || '<p class="empty-msg">কোনো সদস্য নেই</p>'}</div>
                    <div style="padding:10px; ${isLeaderMode ? 'display: none;' : ''}">
                        <button class="whatsapp-btn" onclick="sendWhatsAppReport('${leader.id}', '${leader.name}', '${leader.phone}')">
                            <i class="fa fa-download" aria-hidden="true"></i> রিপোর্ট ডাউনলোড 
                        </button>
                    </div>
                </div>`;
        }); 
    }



    function openModal(lId, lName) {
        selectedLeaderId = lId;
        document.getElementById('modalTitle').innerText = lName + " গ্রুপে নতুন মেম্বার";
        document.getElementById('addMemberModal').style.display = 'flex';
    }

    function closeModal() { document.getElementById('addMemberModal').style.display = 'none'; }

    function openEditModal(id, name, phone, photo) {
        document.getElementById('editMId').value = id;
        document.getElementById('editMName').value = name;
        document.getElementById('editMPhone').value = phone;
        document.getElementById('editMPhoto').value = photo;
        document.getElementById('editMemberModal').style.display = 'flex';
    }

    function closeEditModal() { document.getElementById('editMemberModal').style.display = 'none'; }

    function saveMemberToDB() {
        const name = document.getElementById('newMName').value;
        const phone = document.getElementById('newMPhone').value;
        const photo = document.getElementById('newMPhoto').value || "https://via.placeholder.com/50";
        if(!name || !phone) return alert("দয়া করে নাম ও ফোন নম্বর দিন");
        db.ref('member_applications').push({
            name, phone, photo,
            groupLeader: selectedLeaderId,
            status: 'approved',
            addedAt: new Date().toISOString()
        }).then(() => {
            alert("সদস্য যুক্ত হয়েছে!");
            document.getElementById('newMName').value = "";
            document.getElementById('newMPhone').value = "";
            closeModal();
            loadGroups();
        });
    }

    function updateMemberInDB() {
        const id = document.getElementById('editMId').value;
        const name = document.getElementById('editMName').value;
        const phone = document.getElementById('editMPhone').value;
        const photo = document.getElementById('editMPhoto').value;
        if(!name || !phone) return alert("নাম ও ফোন নম্বর দিন");
        db.ref('member_applications/' + id).update({ name, phone, photo })
        .then(() => {
            alert("তথ্য আপডেট হয়েছে!");
            closeEditModal();
            loadGroups();
        });
    }

    function togglePayment(id, y, m, s) {
        const path = `member_applications/${id}/payments/${y}/${m}`;
        s ? db.ref(path).set(true) : db.ref(path).remove();
    }

    async function sendWhatsAppReport(lId, lName, lPhone) {
    const year = document.getElementById('yearFilter').value;
    const month = document.getElementById('monthFilter').value;
    
    const snap = await db.ref('member_applications').once('value');
    const allData = snap.val();
    
    if(!allData) return alert("ডাটাবেসে কোনো তথ্য পাওয়া যায়নি!");

    const members = Object.values(allData).filter(m => 
        m.groupLeader === lId && m.status === 'approved'
    );

    if(members.length === 0) return alert(lName + " এর গ্রুপে কোনো মেম্বার নেই!");

    // কন্টেইনার তৈরি
    const element = document.createElement('div');
    element.style.cssText = `
        width: 700px; 
        padding: 30px; 
        background: #fff; 
        box-sizing: border-box; 
        margin: 0 auto;
        font-family: 'Adorsho', sans-serif; /* এখানে আপনার ফন্টটি ব্যবহার করা হয়েছে */
    `;

    let rowsHtml = "";
    members.forEach((m, i) => {
        const isPaid = m.payments && m.payments[year] && m.payments[year][month];
        rowsHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${i+1}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${m.name}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${m.phone || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">
                    ${isPaid ? '<span style="color:#2e7d32;">✅ পরিশোধিত</span>' : '<span style="color:#d32f2f;">❌ জমা হয়নি </span>'}
                </td>
            </tr>`;
    });

    element.innerHTML = `
        <div style="text-align:center; border-bottom: 3px solid #00695c; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="color: #00695c; margin: 0; font-size: 24px;">রাফাহিয়াতুল ইনসান ফাউন্ডেশন</h1>
            <p style="font-size: 16px; color: #444; margin: 5px 0;">মাসিক কালেকশন রিপোর্ট (${month}, ${year})</p>
        </div>
        
        <table style="width: 100%; margin-bottom: 15px; border-collapse: collapse; font-size: 14px;">
            <tr>
                <td style="text-align: left;"><b>দায়িত্বশীল:</b> ${lName}</td>
                <td style="text-align: right;"><b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD')}</td>
            </tr>
        </table>
<table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
    <thead>
        <tr style="background: #f4f7f6;">
            <th style="border: 1px solid #ddd; padding: 10px; width: 40px;">নং</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">সদস্যের নাম</th>
            
            <th style="border: 1px solid #ddd; padding: 10px; width: 150px;">ফোন নম্বর</th>
            
            <th style="border: 1px solid #ddd; padding: 10px; width: 130px;">অবস্থা</th>
        </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
</table>

    `;

    const opt = {
        margin: 0.3,
        filename: `${lName}_Report_${month}_${year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true, // এটি বাংলা ফন্ট ঠিক রাখার জন্য জরুরি
            scrollY: 0, 
            scrollX: 0,
            windowWidth: 750 
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // ফন্ট লোড হওয়া নিশ্চিত করে পিডিএফ জেনারেট করা
    if (document.fonts) {
        document.fonts.ready.then(() => {
            html2pdf().set(opt).from(element).save();
        });
    } else {
        // ফন্ট লোডের জন্য সামান্য সময় বিরতি
        setTimeout(() => {
            html2pdf().set(opt).from(element).save();
        }, 800);
    }
}


        function verifyLeaderPassword() {
        const input = document.getElementById('leaderPasswordInput').value;
        const leader = leaders.find(l => l.id === viewLeaderId);
        
        if (leader && input === leader.pass) {
            document.getElementById('login-overlay').style.display = 'none';
            loadGroups();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    }

    window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewLeaderId = urlParams.get('view');

    // যদি view আইডি না থাকে, তবে তাকে সতর্কবার্তা পেজে পাঠিয়ে দাও
    if (!viewLeaderId) {
        window.location.href = "warning.html"; // সতর্কবার্তা পেজের নাম
        return;
    }

    const leader = leaders.find(l => l.id === viewLeaderId);
    if (leader) {
        initFilters();
        document.getElementById('login-title').innerText = leader.name;
        document.getElementById('login-overlay').style.display = 'flex';
    } else {
        // যদি আইডি ভুল থাকে (যেমন: L99) তবে সরাসরি এই পেজেই এরর দেখাবে
        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center;">
                <h1 style="color:red;">ভুল আইডি!</h1>
                <p>আপনার দেওয়া লিডার আইডিটি সঠিক নয়। দয়া করে সঠিক লিঙ্কটি ব্যবহার করুন।</p>
            </div>`;
    }
};
