//التحقق من هوية الصيدلي
(function protectPharmacyRoute() {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'pharmacy') {
        window.location.href = "../index.html"; // طرده للرئيسية
    }
})();

let uploadedImageUrl = ""; // تم نقل التعريف هنا ليصبح عالمياً ويحل مشكلة ReferenceError

function openTab(evt, tabName) {
        let i, tabContent, tabBtns;
        tabContent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabContent.length; i++) tabContent[i].style.display = "none";
            
        tabBtns = document.getElementsByClassName("tab-btn");
        for (i = 0; i < tabBtns.length; i++) tabBtns[i].className = tabBtns[i].className.replace(" active", "");
            
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
        if (tabName === 'sales-history'){
            loadSalesHistory();
        } 
    }
        

function openTab2(evt, tabId) {
    let i, tabContents, tabButtons;
    tabContents = document.getElementById('orders').querySelectorAll('.dash-card');
    for (i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active2"); 
    }
    tabButtons = document.getElementById('orders').querySelectorAll('.tab-btn2');
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active2");
    }
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.style.display = "block";
        evt.currentTarget.classList.add("active2");
    }
}

function enableSalesTab() {
    const tabsHeader = document.querySelector('.tabs-header');
    if (!document.getElementById('sales-tab-btn')) {
        const salesBtn = document.createElement('button');
        salesBtn.id = 'sales-tab-btn';
        salesBtn.className = 'tab-btn';
        salesBtn.innerHTML = '<i class="fas fa-history"></i> سجل المبيعات';
        salesBtn.onclick = function(e) { openTab(e, 'sales-history'); };
        tabsHeader.appendChild(salesBtn);
    }
    document.getElementById('sales-tab-btn').click();
    document.querySelector('.archive-trigger').style.display = 'none';
}
/**
 * دالة جلب سجل المبيعات من السيرفر ورسمها في الجدول
 */
async function loadSalesHistory() {
    const pharmacyId = localStorage.getItem('userId');
    const tableBody = document.querySelector('#sales-history .dash-table tbody');
    
    if (!tableBody) return;

    try {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل السجل...</td></tr>';
        
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/sales-history?pharmacy_id=${pharmacyId}`);
        const result = await response.json();

        if (result.status === 'success') {
            tableBody.innerHTML = '';

            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا توجد مبيعات مكتملة مسجلة.</td></tr>';
                return;
            }

            result.data.forEach(item => {
                // تنسيق التاريخ
                const formattedDate = new Date(item.created_at).toLocaleString('ar-EG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                });

                const row = `
                    <tr>
                        <td>
                            <div class="customer-info">
                                <i class="fas fa-user-circle"></i>
                                <span>${item.customer_name}</span>
                                <br><small>${item.customer_phone}</small>
                            </div>
                        </td>
                        <td>
                            <strong>${item.med_name}</strong>
                            <br>
                            <small class="text-muted">الكمية: ${item.reserved_quantity} | السعر: ${item.reserved_price} ج.م</small>
                        </td>
                        <td>${formattedDate}</td>
                        <td><code class="order-code">#${item.booking_code}</code></td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error("History Error:", error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">حدث خطأ في جلب البيانات.</td></tr>';
    }
}

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if(body.classList.contains('dark-mode')) {
        icon.className = 'fa-solid fa-lightbulb';
        localStorage.setItem('theme', 'dark');
    } else {
        icon.className = 'fa-regular fa-lightbulb';
        localStorage.setItem('theme', 'light');
    }
});
if(localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.querySelector('i').className = 'fa-solid fa-lightbulb';
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active-menu');
            const icon = mobileBtn.querySelector('i');
            if (navMenu.classList.contains('active-menu')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});

const expiryInput = document.getElementById('expiry_date');
expiryInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length >= 2) {
        let month = parseInt(value.substring(0, 2)); 
        if (month > 12) month = 12;
        if (month < 1 && value.length === 2) month = 1;
        let formattedMonth = month.toString().padStart(2, '0');
        value = formattedMonth + (value.length > 2 ? '/' + value.substring(2, 4) : '');
    }
    e.target.value = value;
});

expiryInput.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && expiryInput.value.length === 3) {
        expiryInput.value = expiryInput.value.substring(0, 2);
    }
});

expiryInput.addEventListener('blur', function (e) {
    const value = e.target.value;
    if (value.length === 5) {
        const parts = value.split('/');
        const inputMonth = parseInt(parts[0]);
        const inputYear = parseInt("20" + parts[1]);
        const now = new Date();
        const currentMonth = now.getMonth() + 1; 
        const currentYear = now.getFullYear();
        let isExpired = false;
        if (inputYear < currentYear) {
            isExpired = true;
        } else if (inputYear === currentYear && inputMonth <= currentMonth) {
            isExpired = true;
        }
        if (isExpired) {
            e.target.value = '';
            e.target.style.borderColor = "red";
            alert("⚠️ خطأ في الصلاحية: التاريخ المدخل ماضي أو ينتهي هذا الشهر.");
        } else {
            e.target.style.borderColor = "var(--border-color)"; 
        }
    } else if (value.length > 0 && value.length < 5) {
        e.target.value = '';
        alert("⚠️ يرجى إدخال التاريخ كاملاً بصيغة MM/YY");
    }
});

function formatExpiryForDB(uiValue) {
    if (!uiValue || uiValue.length < 5) return null;
    const [month, year] = uiValue.split('/');
    const fullYear = "20" + year; 
    return `${fullYear}-${month}-01`;
}

const medNameInput = document.getElementById('med-name');
const medimgfield = document.getElementById('med-img');
const meddesqfield = document.getElementById('med-desq');
const unitsPerPkgField = document.getElementById('units-per-pkg-field'); // الحقل الجديد
const medList = document.getElementById('medications-list');
medNameInput.addEventListener('input', function() {
    const options = Array.from(medList.options).map(opt => opt.value);
    if (options.includes(this.value)) {
        // الصنف موجود مسبقاً: إخفاء حقول التعريف الجديد
        medimgfield.style.display = 'none';
        meddesqfield.style.display = 'none';
        unitsPerPkgField.style.display = 'none'; // لا داعي لتعريف التقسيم مرة أخرى
        document.getElementById('med_desc').value = '';
    } else {
        // صنف جديد: إظهار كل حقول التعريف
        medimgfield.style.display = 'block';
        meddesqfield.style.display = 'block';
        unitsPerPkgField.style.display = 'block'; 
    }
});

async function setupMedicineDatalist() {
    const datalist = document.getElementById('medications-list');
    try {
        const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/medicines-list');
        const result = await response.json();
        if (result.status === 'success') {
            datalist.innerHTML = ''; 
            result.data.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
        }
    } catch (error) {
        console.error("خطأ في جلب قائمة الأدوية:", error);
    }
};
async function loadPharmacyInventory() {
    const userId = localStorage.getItem('userId');
    const tableBody = document.querySelector('#stock-table tbody');
    const dataList = document.getElementById('inventory-data'); 

    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/get-inventory?userId=${userId}`);
        const result = await response.json();

        if (result.status === 'success') {
            if (tableBody) tableBody.innerHTML = ''; 
            if (dataList) dataList.innerHTML = ''; 

            if (result.data.length === 0 && tableBody) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا توجد أصناف حالياً</td></tr>`;
                return;
            }

            result.data.forEach(item => {
                let quantityDisplay = "";
                if (item.pkgs_count > 0) quantityDisplay += `${item.pkgs_count} علبة `;
                if (item.units_count > 0) quantityDisplay += `${item.pkgs_count > 0 ? 'و ' : ''}${item.units_count} شريط`;
                
                const row = `
                    <tr>
                        <td>${item.med_name}</td>
                        <td><b>${quantityDisplay || '0'}</b><br><small>الإجمالي: ${item.total_units_on_shelf}</small></td>
                        <td>${item.unit_price} جنيه</td>
                        <td><span class="badge-expiry">${item.expiry_date}</span></td>
                        <td>
                            <button class="btn-icon edit" onclick="prepareEditModal('${item.inventory_id}', '${item.med_name}', ${item.pkgs_count}, ${item.units_count}, ${item.unit_price})">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>`;
                tableBody.innerHTML += row;

                if (dataList) {
                    const option = document.createElement('option');
                    option.value = item.med_name;
                    dataList.appendChild(option);
                }
            });

            // تفعيل البحث فور تحميل البيانات
            initInventorySearchLogic(); 
        }
    } catch (error) {
        console.error("خطأ في تحديث الجدول:", error);
    }
}

// دالة منفصلة لمنطق البحث
function initInventorySearchLogic() {
    const searchInput = document.getElementById('inventory-search');
    const rows = document.querySelectorAll('#stock-table tbody tr');
    
    if (!searchInput) return;

    // إزالة أي مستمع قديم قبل إضافة الجديد لمنع التكرار
    searchInput.replaceWith(searchInput.cloneNode(true));
    const newSearchInput = document.getElementById('inventory-search');

    newSearchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        rows.forEach(row => {
            const medName = row.cells[0].textContent.toLowerCase();
            row.style.display = (query === "" || medName.includes(query)) ? "" : "none";
        });
    });
};
// فلترة الطلبات المقبولة بكود الحجز
function filterAcceptedOrders() {
    const query = document.getElementById('search-accepted-code').value.toLowerCase().trim();
    // إزالة الـ # إذا كتبها الصيدلي للبحث بالرقم فقط
    const cleanQuery = query.startsWith('#') ? query.substring(1) : query;
    
    const rows = document.querySelectorAll('#orders-accepted tbody tr');
    
    rows.forEach(row => {
        // كود الحجز موجود في العمود الرابع (index 3)
        const codeText = row.cells[3].textContent.toLowerCase();
        row.style.display = codeText.includes(cleanQuery) ? "" : "none";
    });
}
// فلترة قائمة الانتظار باسم الدواء
function filterWaitingOrders() {
    const query = document.getElementById('search-waiting-med').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#orders-pending tbody tr');
    
    rows.forEach(row => {
        // اسم الدواء موجود في العمود الثاني (index 1)
        const medName = row.cells[1].textContent.toLowerCase();
        row.style.display = medName.includes(query) ? "" : "none";
    });
}
// 1. فتح المودال وتعبئة البيانات
function prepareEditModal(inventoryId, medName, pkgs, units, price) {
    const modal = document.getElementById('editModal');
    if (!modal) return;

    document.getElementById('edit-inventory-id').value = inventoryId;
    document.getElementById('modal-med-name').innerText = medName;
    document.getElementById('edit-pkgs').value = pkgs;
    document.getElementById('edit-units').value = units;
    document.getElementById('edit-price').value = price; // الحقل الجديد للسعر
    
    modal.style.display = "block";
}
// توضع هذه الدالة داخل مستمع الأحداث DOMContentLoaded
async function handleEditSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    
    const payload = {
        inventoryId: document.getElementById('edit-inventory-id').value,
        pkgs: parseInt(document.getElementById('edit-pkgs').value) || 0,
        units: parseInt(document.getElementById('edit-units').value) || 0,
        price: parseFloat(document.getElementById('edit-price').value) || 0
    };
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/update-inventory', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            alert("✅ " + result.message);
            closeEditModal();
            loadPharmacyInventory(); // إعادة تحميل الجدول ليعكس التغييرات أو الحذف
        } else {
            alert("❌ خطأ: " + result.message);
        }
    } catch (error) {
        alert("⚠️ فشل الاتصال بالسيرفر");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "حفظ التعديلات";
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = "none";
}

// 3. معالجة إرسال التحديث للسيرفر
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editInventoryForm');
    if (editForm) {
        editForm.addEventListener('submit',handleEditSubmit)
    }
    // إغلاق المودال عند الضغط خارجه
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target == modal) closeEditModal();
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // 1. التقاط الباراميتر من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const targetTab = urlParams.get('tab');

    // 2. التحقق وتنفيذ التبديل
    if (targetTab) {
        // تأخير بسيط لضمان تحميل العناصر بالكامل قبل محاكاة النقرة
        setTimeout(() => {
            let targetBtn = null;

            if (targetTab === 'inventory') {
                // البحث عن الزر الذي يفتح قسم المخزون
                targetBtn = document.querySelector('.tab-btn[onclick*="inventory"]');
            } else if (targetTab === 'orders') {
                // البحث عن الزر الذي يفتح قسم الطلبات
                targetBtn = document.querySelector('.tab-btn[onclick*="orders"]');
            }

            if (targetBtn) {
                targetBtn.click();
                console.log(`✅ تم التوجه لتبويب: ${targetTab}`);
            }
        }, 100); // 100 ميلي ثانية كافية جداً
    }

    // تشغيل الدوال الأساسية
    setupMedicineDatalist();
    loadPharmacyInventory();
    loadPharmacyOrders();
    renderOrdersTable();
    // تحديث الجداول (الوقت المتبقي) كل دقيقة دون إعادة الطلب من السيرفر
    setInterval(() => {
        if (currentOrdersData.length > 0) {
            loadPharmacyOrders();
            renderOrdersTable();
        }
    }, 10000);
});

async function handleInventorySubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const userId = localStorage.getItem('userId');

    // جلب القيم من الحقول المقسمة في الـ HTML
    const pkgs = document.getElementById('med-pkgs').value || 0;
    const extraUnits = document.getElementById('med-extra-units').value || 0;
    const unitsPerPkg = document.getElementById('units-per-pkg').value || 1; // سترسل فقط لو الصنف جديد

    const payload = {
        userId: userId,
        name: document.getElementById('med-name').value,
        pkgs: pkgs,             // نرسل العبوات منفصلة
        extra_units: extraUnits, // نرسل الفكة منفصلة
        units_per_package: unitsPerPkg, // لجدول medications لو الصنف جديد
        price: document.getElementById('med-price').value,
        expiry: formatExpiryForDB(document.getElementById('expiry_date').value),
        description: document.getElementById('med_desc').value,
        imageUrl: uploadedImageUrl 
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
        
        const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
    const result = await response.json();
    if (result.status === 'exists') {
        alert("⚠️ " + result.message);
        // توجيه المستخدم لأسفل الصفحة عند جدول المخزون
        document.getElementById('inventory-search').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('inventory-search').focus();
        // ملء حقل البحث تلقائياً باسم الدواء ليسهل عليه التعديل
        document.getElementById('inventory-search').value = document.getElementById('med-name').value;
        // تفعيل فلتر البحث يدوياً
        document.getElementById('inventory-search').dispatchEvent(new Event('input'));
    } else if (result.status === 'success') {
        alert("✅ تم إضافة الصنف الجديد بنجاح!");
        loadPharmacyInventory();
        form.reset();
    } else {
                alert("❌ خطأ: " + result.message);
            }
    } catch (error) {
        alert("⚠️ فشل الاتصال بالسيرفر");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'تحديث المخزون لدى الصيدلية';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // تم حذف let uploadedImageUrl من هنا لمنع تضارب النطاقات (Scopes)
    const myWidget = cloudinary.createUploadWidget({
        cloudName: 'dqn2jkmkv', 
        uploadPreset: 'mydefault', 
        sources: ['local', 'camera'],
        multiple: false,
        theme: "minimal"
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            uploadedImageUrl = result.info.secure_url;
            document.getElementById('file-name').textContent = "✅ تم الرفع بنجاح";
            const preview = document.getElementById('img-preview');
            preview.src = uploadedImageUrl;
            preview.style.display = "block";
        }
    });
    document.getElementById("upload_widget").addEventListener("click", function() {
        myWidget.open();
    }, false);
        
    const addForm = document.getElementById('addMedicineForm');
    if (addForm) {
        addForm.addEventListener('submit', handleInventorySubmit);
    }
});

// دالة لحساب الوقت المتبقي وتنسيقه بصيغة (ساعة ودقيقة)
function getRemainingTime(targetDate) {
    const now = new Date();
    const diffMs = new Date(targetDate) - now;
    
    if (diffMs <= 0) return "منتهي";

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs} س و ${diffMins} د`;
}
// دالة لجلب كافة الحجوزات وتوزيعها على التبويبات وتحديث العدادات
let currentOrdersData = []; // متغير لتخزين الطلبات محلياً للتحديث اللحظي
async function loadPharmacyOrders() {
    const pharmacyId = localStorage.getItem('userId');
    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/get-bookings?pharmacy_id=${pharmacyId}`);
        const result = await response.json();

        if (result.status === 'success') {
            currentOrdersData = result.data; // تخزين البيانات
            renderOrdersTable(); // استدعاء دالة الرسم
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}
// دالة رسم الجداول بناءً على البيانات المخزنة
function renderOrdersTable() {
    // التأكد من وجود الجداول في الصفحة أولاً
    const newOrdersTable = document.querySelector('#orders-new tbody');
    const acceptedOrdersTable = document.querySelector('#orders-accepted tbody');
    const waitingOrdersTable = document.querySelector('#orders-pending tbody');

    if (!newOrdersTable || !acceptedOrdersTable || !waitingOrdersTable) return;

    let countNew = 0, countAccepted = 0, countWaiting = 0;

    // تفريغ الجداول مرة واحدة
    newOrdersTable.innerHTML = '';
    acceptedOrdersTable.innerHTML = '';
    waitingOrdersTable.innerHTML = '';

    currentOrdersData.forEach(order => {
        if (order.status === 'pending') {
            countNew++;
            // حساب مهلة الرد (12 ساعة)
            const createdAt = new Date(order.created_at);
            const deadline = new Date(createdAt.getTime() + (12 * 60 * 60 * 1000));
            const timeText = getRemainingTime(deadline);

            newOrdersTable.innerHTML += `
                <tr>
                    <td>${order.customer_name || 'عميل'}</td>
                    <td>${order.med_name}</td>
                    <td>${order.reserved_quantity}</td>
                    <td class="timer-warning">${timeText}</td>
                    <td>
                        <button class="btn-action accept" onclick="respondToBooking('${order.booking_id}', 'accept')">قبول</button>
                        <button class="btn-action reject" onclick="respondToBooking('${order.booking_id}', 'reject')">رفض</button>
                    </td>
                </tr>`;
        } 
        else if (order.status === 'confirmed') {
            countAccepted++;
            const timeText = getRemainingTime(order.expires_at);

            acceptedOrdersTable.innerHTML += `
                <tr>
                    <td>${order.customer_name || 'عميل'}</td>
                    <td>${order.med_name}</td>
                    <td>${order.reserved_quantity}</td>
                    <td class="code">#${order.booking_code}</td>
                    <td class="timer-normal">${timeText}</td>
                    <td><button class="btn-action done" onclick="completeOrder('${order.booking_id}')">تم الاستلام</button></td>
                    </tr>`;
                } 
                else if (order.status === 'waiting') {
                    countWaiting++;
                    waitingOrdersTable.innerHTML += `
                    <tr>
                    <td>${order.customer_name || 'عميل'}</td>
                    <td>${order.med_name}</td>
                    <td>${order.reserved_quantity}</td>
                    <td><span class="wait-rank">${order.queue_rank}</span></td> 
                    <td class="text-muted">سيتحول لمقبول عند توفر المخزن</td>
                </tr>`;
        }
        filterAcceptedOrders();
        filterWaitingOrders();
    });
    //تحديث العدادات في الواجهة (إذا كانت موجودة)
    updateCounters(countNew, countAccepted, countWaiting);
}
// دالة مساعدة لتحديث أرقام الشارات (Badges)
function updateCounters(n, a, w) {
    const badgeNew = document.querySelector('#orders-new .badge-count');
    const badgeAccepted = document.querySelector('#orders-accepted .badge-count');
    const badgeWaiting = document.querySelector('#orders-pending .badge-count');
    
    if(badgeNew) badgeNew.innerText = `${n} طلبات`;
    if(badgeAccepted) badgeAccepted.innerText = `${a} حجوزات`;
    if(badgeWaiting) badgeWaiting.innerText = `${w} انتظار`;
}
// دالة الرد على الطلب (قبول/رفض)
async function respondToBooking(bookingId, action) {
    try {
        const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/respond-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId, action: action })
        });

        const result = await response.json();

        if (response.ok) {
            // إظهار الرسالة التي حددها السيرفر (سواء تأكيد أو انتظار)
            alert(result.message);
            
            // تحديث القائمة
            if (typeof loadPharmacyOrders === 'function') loadPharmacyOrders();
        } else {
            alert("خطأ: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ في الاتصال بالسيرفر");
    }
}

// دالة إتمام العملية (تم الاستلام)
async function completeOrder(bookingId) {
    // 1. التأكيد من الصيدلي
    if (!confirm("هل استلم المريض الدواء بالفعل؟ سيتم خصم الكمية من مخزنك الآن.")) return;

    try {
        // 2. إرسال الطلب للسيرفر
        const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/pharmacy/complete-sale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ booking_id: bookingId })
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
            alert("✅ تم تسجيل عملية الاستلام وتحديث المخزن بنجاح.");
            
            // 3. تحديث الواجهة (إعادة تحميل الطلبات أو حذف السطر من الجدول)
            if (typeof loadPharmacyOrders === 'function') {
                loadPharmacyOrders(); 
            } else {
                location.reload(); // حل احتياطي
            }
        } else {
            alert("❌ خطأ: " + (result.message || "تعذر إتمام العملية"));
        }
    } catch (error) {
        console.error("Error completing order:", error);
        alert("حدث خطأ أثناء الاتصال بالسيرفر.");
    }
}