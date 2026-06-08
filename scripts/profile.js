(function checkAuth() {
    if (!localStorage.getItem('userToken')) {
        window.location.href = "../index.html";
    }
})();

// نظام التبديل للوضع الليلي وحفظ الحالة في المتصفح
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

// دالة جلب بيانات الملف الشخصي
async function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');
    
    // العناصر في الـ HTML
    const displayName = document.getElementById('display-name');
    const roleBadge = document.getElementById('user-role-badge');
    const emailInput = document.querySelector('input[type="email"]');
    const nameInput = document.getElementById('edit-name');
    const locationInput = document.getElementById('edit-location');
    const pharmacyFields = document.getElementById('pharmacy-only-fields');
    const pharmacyNameInput = document.getElementById('edit-pharmacy-name');

    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/user/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            const user = result.data;

            // تعبئة البيانات الأساسية
            displayName.innerText = user.full_name;
            emailInput.value = user.email;
            nameInput.value = user.full_name;
            locationInput.value = user.details?.location_url || '';

            // تخصيص الواجهة حسب النوع
            if (user.role === 'pharmacy') {
                roleBadge.innerText = 'حساب صيدلي';
                roleBadge.style.background = 'var(--primary)';
                pharmacyFields.style.display = 'block';
                pharmacyNameInput.value = user.details?.pharmacy_name || '';
                displayName.innerText = `دكتور/ ${user.full_name}`;
            } else {
                roleBadge.innerText = 'حساب عميل';
                roleBadge.style.background = 'var(--accent)';
                pharmacyFields.style.display = 'none';
            }
        }
    } catch (error) {
        console.error("خطأ في جلب بيانات الملف الشخصي:", error);
    }
}
// المتغيرات الخاصة بالخريطة
let map, marker;

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    // حماية المسار: لو مفيش توكن يرجع للرئيسية
    if (!userId || !token) {
        window.location.href = '../index.html';
        return;
    }

    // 1. جلب بيانات البروفايل وتعبئتها في الحقول
    await fetchUserProfile(userId, token);

    // 2. تفعيل زر الموقع الحالي (GPS)
    document.getElementById('getLocationBtn').addEventListener('click', getCurrentLocation);

    // 3. معالجة حفظ التعديلات عند إرسال الفورم
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
});

// دالة جلب البيانات من السيرفر
async function fetchUserProfile(userId, token) {
    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/user/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            const user = result.data;
            const details = user.details || {};

            // تعبئة البيانات الأساسية
            document.getElementById('display-name').innerText = user.full_name;
            document.getElementById('display-email').value = user.email;
            document.getElementById('edit-name').value = user.full_name;
            document.getElementById('edit-phone').value = user.phone || '';

            const badge = document.getElementById('user-role-badge');
            if (user.role === 'pharmacy') {
                badge.innerText = 'حساب صيدلي';
                document.getElementById('pharmacy-only-fields').style.display = 'block';
                
                // تعبئة حقول الصيدلية
                document.getElementById('edit-pharmacy-name').value = details.pharmacy_name || '';
                document.getElementById('edit-gov').value = details.governorate || '';
                document.getElementById('edit-city').value = details.city_center || '';
                document.getElementById('edit-district').value = details.district_village || '';
                document.getElementById('edit-location').value = details.google_maps_link || '';
                document.getElementById('edit-address-desc').value = details.address_description || '';
            } else {
                badge.innerText = 'حساب عميل';
                badge.style.background = 'var(--accent)';
            }

            // تهيئة الخريطة بالإحداثيات المخزنة
            initMap(details.latitude, details.longitude);
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// دالة تهيئة الخريطة (Leaflet)
function initMap(lat, lng) {
    const defaultLat = lat || 30.0444; 
    const defaultLng = lng || 31.2357;

    map = L.map('map').setView([defaultLat, defaultLng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

    // تحديث القيم المخفية عند سحب الماركر
    updateCoordsInputs(defaultLat, defaultLng);

    marker.on('dragend', function() {
        const position = marker.getLatLng();
        updateCoordsInputs(position.lat, position.lng);
    });
}

// دالة الحصول على الموقع الحالي عبر الـ GPS
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 16);
            marker.setLatLng([latitude, longitude]);
            updateCoordsInputs(latitude, longitude);
        }, () => {
            alert("تعذر الوصول لموقعك الحالي، يرجى تحديده يدويًا على الخريطة.");
        });
    }
}

function updateCoordsInputs(lat, lng) {
    document.getElementById('latitude-in').value = lat;
    document.getElementById('longitude-in').value = lng;
}

// دالة إرسال البيانات المحدثة للباك اند
async function handleProfileUpdate(e) {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');

    // جلب رقم الهاتف وعمل trim لإزالة المسافات الفارغة
    const phoneValue = document.getElementById('edit-phone').value.trim();

    // --- نظام التحقق من رقم الموبايل المصري ---
    // الصيغة: يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتبعه 8 أرقام (إجمالي 11 رقم)
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;

    if (!egyptianPhoneRegex.test(phoneValue)) {
        alert('⚠️ عذراً، يجب إدخال رقم موبايل مصري صحيح ومكون من 11 رقم (مثل: 01012345678)');
        return; // إيقاف تنفيذ الدالة ومنع إرسال البيانات المحدثة للسيرفر
    }
    // ----------------------------------------

    const payload = {
        role: role,
        full_name: document.getElementById('edit-name').value,
        phone: phoneValue, // استخدام القيمة المجردة والمحققة هنا
        latitude: document.getElementById('latitude-in').value,
        longitude: document.getElementById('longitude-in').value
    };

    if (role === 'pharmacy') {
        Object.assign(payload, {
            pharmacy_name: document.getElementById('edit-pharmacy-name').value,
            governorate: document.getElementById('edit-gov').value,
            city_center: document.getElementById('edit-city').value,
            district_village: document.getElementById('edit-district').value,
            google_maps_link: document.getElementById('edit-location').value,
            address_description: document.getElementById('edit-address-desc').value
        });
    }

    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/user/profile/update/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("✅ تم حفظ التعديلات بنجاح!");
            location.reload();
        } else {
            alert("⚠️ فشل التحديث: " + result.message);
        }
    } catch (error) {
        alert("❌ حدث خطأ في الاتصال بالسيرفر.");
    }
}

document.querySelector('.btn-logout').addEventListener('click', () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    window.location.href = "../index.html";
});

document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            // التبديل بين إظهار وإخفاء القائمة
            navMenu.classList.toggle('active-menu');
            
            // تغيير أيقونة الهمبرجر إلى (X) عند الفتح
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