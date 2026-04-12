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

    let rows = "";

    // ২. লুপ চালিয়ে ডাটা টেবিল তৈরি
    projects.forEach(p => {
        // এখানে p হলো প্রজেক্টের নাম। নিশ্চিত করুন ডাটাবেসেও এই নামেই ডাটা আছে।
        let tIn = 0;
        if (donations[p]) {
            tIn = parseFloat(donations[p].total_amount || donations[p].amount || 0);
        }

        let tOut = 0;
        if (expenses[p]) {
            // যদি expenses-এর ভেতর items থাকে তবে সেগুলোর যোগফল
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

    // বাকি HTML ডিজাইন এবং html2pdf অংশ আগের মতোই থাকবে...
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
    `;

    const opt = {
        margin: 10,
        filename: `RIF_Report_${date.toLocaleDateString('bn-BD')}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

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