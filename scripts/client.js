// التحقق من هوية المريض
(function protectPatientRoute() {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'customer') {
        window.location.href = "../index.html";
    }
})();

// نظام التبديل للوضع الليلي
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

let savedUserLat = null;
let savedUserLon = null;

// 1. الدالة المعدلة لقراءة الإحداثيات من كائن الـ details القادم من السيرفر
async function loadUserSavedLocation() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');
    if (!userId) return;

    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/user/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        // التعديل الجوهري: قراءة البيانات من داخل كائن الـ details بدقة كما يرسلها الباك إند
        if (result.status === 'success' && result.data && result.data.details) {
            savedUserLat = result.data.details.latitude;
            savedUserLon = result.data.details.longitude;
            console.log("📍 تم تحميل موقع العميل بنجاح من السيرفر (تفاصيل العميل):", savedUserLat, savedUserLon);
        }
    } catch (error) {
        console.error("خطأ في جلب موقع العميل من السيرفر:", error);
    }
}

// تشغيل الدالة فور تحميل الصفحة لتجهيز الإحداثيات
document.addEventListener('DOMContentLoaded', loadUserSavedLocation);

// دالة حساب المسافة (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    console.log(parseFloat((R * c).toFixed(1)));
    return parseFloat((R * c).toFixed(1)); 
}

// ضغط الناف بار
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

// ملء الداتا ليست
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
}
document.addEventListener('DOMContentLoaded', setupMedicineDatalist);

const searchInput = document.getElementById('searchInput');
const resultStatus = document.querySelector('.results-stats');
const medGrid = document.getElementById('results-grid');

// دالة البحث المعدلة للترتيب حسب الموقع
async function performSearch(query) {
    if (query.length < 2) {
        if (medGrid) medGrid.innerHTML = '';
        if (resultStatus) resultStatus.innerText = 'اكتب حرفين على الألق...';
        return;
    }
    if (resultStatus) resultStatus.innerText = 'جاري البحث وحساب المسافة بناءً على موقعك المسجل...';

    // نمرر الإحداثيات المسترجعة من السيرفر مباشرة للدالة
    if (savedUserLat && savedUserLon) {
        await fetchAndDisplay(query, savedUserLat, savedUserLon);
    } else {
        // لو العميل مش مسجل موقع في حسابه لسه، نبحث عادي بدون حساب مسافة (أو تظهر غير محدد)
        console.warn("⚠️ العميل لم يقم بتحديث موقعه في ملفه الشخصي بعد.");
        await fetchAndDisplay(query, null, null);
    }
}

async function fetchAndDisplay(query, userLat, userLon) {
    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/public/search-medications?query=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.status === 'success') {
            let data = result.data;
            if (userLat && userLon) {
                data = data.map(item => {
                    // قراءة مباشرة من الـ item كأرقام كما ظهر في الـ console بالظبط
                    const phLat = Number(item.latitude);
                    const phLng = Number(item.longitude);
                    
                    return {
                        ...item,
                        distance: calculateDistance(parseFloat(userLat), parseFloat(userLon), phLat, phLng)
                    };
                });
                // الترتيب التلقائي من الأقرب للأبعد
                data.sort((a, b) => (a.distance || 999) - (b.distance || 999));
            }

            displayResults(data);
            if (resultStatus) resultStatus.innerText = `تم إيجاد ${data.length} نتيجة`;
        }
    } catch (error) {
        console.error("Search Error:", error);
        if (resultStatus) resultStatus.innerText = 'فشل الاتصال بالخادم';
    }
}

function displayResults(data) {
    if (!medGrid) return;

    medGrid.innerHTML = '';
    if (data.length === 0) {
        medGrid.innerHTML = '<p style="color:red; text-align:center; width:100%;">للأسف مفيش نتائج مطابقة حالياً.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('result-card');
        
        const phLat = Number(item.latitude);
        const phLng = Number(item.longitude);
        
        // التعديل السحري هنا: صلحنا علامة الـ $ والقوس عشان الرابط والداتا يقرأوا صح من المتصفح
        const mapUrl = item.google_maps_link && item.google_maps_link.trim() !== "" 
                ? item.google_maps_link 
                : `https://www.google.com/maps?q=${phLat},${phLng}`;

        let stockInfo = "";
        const avail = item.available_stock || 0; 
        const unitsPerPkg = item.units_per_package || 1;

        if (avail > 0) {
            const pkgs = Math.floor(avail / unitsPerPkg);
            const extra = avail % unitsPerPkg;
            if (pkgs > 0) stockInfo += `${pkgs} علبة `;
            if (extra > 0) stockInfo += `${pkgs > 0 ? 'و ' : ''}${extra} شريط`;
        } else {
            stockInfo = "0";
        }

        const isAvailable = avail > 0;

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${item.image_url || '../assets/homesectionimg.png'}" class="pharmacy-img">                   
                <div class="distance-badge">
                    ${item.distance ? (typeof item.distance === 'number' ? item.distance.toFixed(1) : item.distance) + ' كم' : 'غير محدد'}
                    <i class="fas fa-route"></i> 
                </div>
                <a href="${mapUrl}" target="_blank" class="map-link-overlay" title="عرض الموقع على الخريطة">
                    الموقع على الخريطة <i class="fas fa-map-marker-alt"></i>
                </a>
            </div>
            <div class="card-body">
                <div class="med-tag ${isAvailable ? 'available' : 'unavailable'}">
                    ${isAvailable ? 'متوفر الآن' : 'نفذت الكمية'}
                </div>
                <h3 class="pharmacy-name">${item.pharmacy_name}</h3>                     
                <div class="location-details">
                    <i class="fas fa-map-marked-alt"></i>
                    <span>${item.full_address || ''}</span>
                </div>
                <p class="med-name">${item.med_name}</p>
                <p class="price-info">السعر: <b>${item.unit_price} ج.م</b></p>
                <p class="stock-details">المتاح: ${stockInfo}</p>
                <div class="waiting-list">
                    <i class="fas fa-users"></i> قائمة الانتظار: ${item.waiting_list_count || 0}
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-full" onclick="initiateBooking('${item.inventory_id}', '${item.pharmacy_id}')">
                        ${isAvailable ? 'احجز الآن' : 'انضم للانتظار'}
                    </button>
                    <a href="tel:${item.phone || ''}" target='_self' class="btn-icon-link" title="اتصل بالصيدلية">
                        <i class="fas fa-phone-alt"></i>
                    </a>
                </div>
            </div>
        `;
        medGrid.appendChild(card);
    });
}

function validateSearchInput(e){
    const input = e.target.value;
    return input.replace(/[*%]/g, '').trim();
}

let timeout = null;
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = validateSearchInput(e);
        performSearch(query);
    }, 400);
});

//ارسال طلب حجز 
let currentInventoryId = null;
let currentPharmacyId = null;

// دالة فتح المودال - تأكد من تعديل مكان استدعائها في الكروت لتمرير الـ pharmacy_id
async function initiateBooking(inventoryId, pharmacyId) {
    const customerId = localStorage.getItem('userId');
    if (!customerId) {
        alert("يرجى تسجيل الدخول أولاً");
        window.location.href = "signin.html";
        return;
    }

    currentInventoryId = inventoryId;
    currentPharmacyId = pharmacyId;

    document.getElementById('bookingQuantity').value = 1;
    document.getElementById('unitType').value = 'package';
    document.getElementById('bookingModal').style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

async function confirmBookingSubmit() {
    const customerId = localStorage.getItem('userId');
    const qty = document.getElementById('bookingQuantity').value;
    const unit = document.getElementById('unitType').value;
    const btn = document.getElementById('confirmBookingBtn');

    if (!qty || qty < 1) return alert("يرجى إدخال كمية صحيحة");

    btn.disabled = true;
    btn.innerText = "جاري الإرسال...";

    try {
        const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/public/create-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: customerId,
                inventory_id: currentInventoryId,
                pharmacy_id: currentPharmacyId,
                quantity: parseInt(qty),
                unit_type: unit
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("✅ تم إرسال الطلب بنجاح! تابع حالة الطلب من لوحة التحكم.");
            closeBookingModal();
            // تحديث البحث
            performSearch(document.getElementById('searchInput').value);
        } else {
            alert("❌ خطأ: " + result.message);
        }
    } catch (error) {
        alert("⚠️ خطأ في الاتصال بالسيرفر");
    } finally {
        btn.disabled = false;
        btn.innerText = "تأكيد الحجز";
    }
}