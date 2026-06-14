// ==========================================
// 1. المتغيرات العامة ونظام تبديل نوع الحساب
// ==========================================
let currentRole = 'customer'; // القيمة الافتراضية مطابقة للداتابيز

function selectType(type, element) {
    currentRole = (type === 'pharmacy') ? 'pharmacy' : 'customer';
    
    // تحديث الشكل النشط للأزرار
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    // إظهار أو إخفاء حقول الصيدلية
    const pFields = document.getElementById('pharmacy-fields');
    if (pFields) {
        pFields.style.display = (currentRole === 'pharmacy') ? 'block' : 'none';
    }
}

// ==========================================
// 2. نظام التبديل للوضع الليلي (Theme)
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (body.classList.contains('dark-mode')) {
            icon.className = 'fa-solid fa-lightbulb';
            localStorage.setItem('theme', 'dark');
        } else {
            icon.className = 'fa-regular fa-lightbulb';
            localStorage.setItem('theme', 'light');
        }
    });
}

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.querySelector('i').className = 'fa-solid fa-lightbulb';
}

// ==========================================
// 3. متغيرات الخريطة ووظائفها (Leaflet Map)
// ==========================================
let map;
let marker;
const defaultLat = 30.0444;
const defaultLng = 31.2357;

function initMap(lat, lng) {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragend', function() {
        const pos = marker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => { map.invalidateSize(); }, 500);
}

function updateCoordinates(lat, lng) {
    const latInput = document.getElementById('latitude-in');
    const lngInput = document.getElementById('longitude-in');
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
}

// ==========================================
// 4. تهيئة الأحداث بعد تحميل الصفحة بالكامل
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // ربط الضغط على خيارات نوع الحساب
    const roleSelectors = document.querySelectorAll('.type-option');
    roleSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            const type = selector.getAttribute('data-role');
            selectType(type, selector);
        });
    });

    // قائمة الموبايل الجانبية
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active-menu');
            const icon = mobileBtn.querySelector('i');
            if (navMenu.classList.contains('active-menu')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }

    // تهيئة الخريطة وتحديث إحداثياتها البدئية
    initMap(defaultLat, defaultLng);
    updateCoordinates(defaultLat, defaultLng);

    // زر تحديد الموقع التلقائي عبر الـ GPS
    const locationBtn = document.getElementById('getLocationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                alert("متصفحك لا يدعم تحديد الموقع.");
                return;
            }

            const originalText = locationBtn.innerHTML;
            locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد الموقع...';

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    updateCoordinates(lat, lng);

                    if (map && marker) {
                        map.flyTo([lat, lng], 15);
                        marker.setLatLng([lat, lng]);
                    }

                    locationBtn.innerHTML = '<i class="fas fa-check"></i> تم التحديد';
                    setTimeout(() => { locationBtn.innerHTML = originalText; }, 2000);
                }, 
                function(error) {
                    alert("تعذر جلب موقعك (تأكد من إعطاء صلاحية الـ GPS للمتصفح). يمكنك تحديد موقعك يدوياً بسحب العلامة على الخريطة.");
                    locationBtn.innerHTML = originalText;
                },
                { enableHighAccuracy: true }
            );
        });
    }

    // ==========================================
    // 5. معالجة إرسال الفورم والتحقق من البيانات
    // ==========================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // تجميع البيانات الأساسية
            const formData = {
                full_name: document.getElementById('user-name-in').value,
                email: document.getElementById('email-in').value,
                phone: document.getElementById('phone-in').value.trim(), 
                password: document.getElementById('user-pass-in').value,
                role: currentRole,
                latitude: document.getElementById('latitude-in').value,
                longitude: document.getElementById('longitude-in').value
            };
            
            // نظام التحقق من رقم الموبايل المصري
            const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
            if (!egyptianPhoneRegex.test(formData.phone)) {
                alert('عذراً، يجب إدخال رقم موبايل مصري صحيح ومكون من 11 رقم (مثل: 01012345678)');
                document.getElementById('phone-in').focus();
                return; 
            }

            // التحقق البرمجي الذكي الخاص بحقول الصيدلية (فقط إذا كان الحساب صيدلي)
            if (currentRole === 'pharmacy') {
                const pharmacyName = document.getElementById('pharmacyName');
                const governorate = document.getElementById('governorate');
                const cityCenter = document.getElementById('city-center');
                const districtVillage = document.getElementById('district-village');
                const gmapUrl = document.getElementById('gmap-url');

                if (!pharmacyName.value.trim()) {
                    alert('برجاء إدخال اسم الصيدلية');
                    pharmacyName.focus();
                    return;
                }
                if (!governorate.value) {
                    alert('برجاء اختيار المحافظة');
                    governorate.focus();
                    return;
                }
                if (!cityCenter.value.trim()) {
                    alert('برجاء إدخال المركز أو المدينة');
                    cityCenter.focus();
                    return;
                }
                if (!districtVillage.value.trim()) {
                    alert('برجاء إدخال الحي أو القرية أو اسم الشارع');
                    districtVillage.focus();
                    return;
                }

                // إضافة البيانات الإضافية للفورم بعد نجاح التحقق
                formData.pharmacy_name = pharmacyName.value.trim();
                formData.governorate = governorate.value;
                formData.city_center = cityCenter.value.trim();
                formData.district_village = districtVillage.value.trim();
                formData.gmap_url = gmapUrl.value.trim();
            }

            // إرسال البيانات إلى السيرفر
            try {
                const signupBtn = document.getElementById('signup-btn');
                signupBtn.disabled = true;
                signupBtn.innerText = 'جاري إنشاء الحساب...';

                const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('تم التسجيل بنجاح! برجاء مراجعة بريدك الإلكتروني لتفعيل الحساب.');
                } else {
                    alert('خطأ: ' + result.message);
                }

            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ في الاتصال بالسيرفر');
            } finally {
                const signupBtn = document.getElementById('signup-btn');
                if (signupBtn) {
                    signupBtn.disabled = false;
                    signupBtn.innerText = 'إنشاء الحساب';
                }
            }
        });
    }
});