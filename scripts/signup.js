// 1. نظام تبديل نوع الحساب (في النطاق العام ليعمل مع زر onclick في HTML)
let selectedRole = 'customer'; // القيمة الافتراضية مطابقة للداتابيز
function selectType(type, element) {
    // التحويل من المسميات القديمة للجديدة المتوافقة مع الداتا بيز
    selectedRole = (type === 'pharmacy') ? 'pharmacy' : 'customer';
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    const pFields = document.getElementById('pharmacy-fields');
    if (pFields) {
        pFields.style.display = (selectedRole === 'pharmacy') ? 'block' : 'none';}
}
const roleSelectors = document.querySelectorAll('.type-option');
roleSelectors.forEach(selector => {
    selector.addEventListener('click',()=>{
        const type = selector.dataset.role 
        selectType(type,selector);
    })
})
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

// 2. متغيرات الخريطة
let map;
let marker;

// إحداثيات افتراضية (القاهرة) للبدء بها فور فتح الصفحة لضمان عمل الخريطة
const defaultLat = 30.0444;
const defaultLng = 31.2357;

// 3. تهيئة الصفحة والوظائف بعد التحميل
document.addEventListener('DOMContentLoaded', () => {
    
    // إنشاء الخريطة فوراً بالقيم الافتراضية حتى تظهر للمستخدم
    initMap(defaultLat, defaultLng);
    updateCoordinates(defaultLat, defaultLng);

    // برمجة زر تحديد الموقع التلقائي
    const locationBtn = document.getElementById('getLocationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                alert("متصفحك لا يدعم تحديد الموقع.");
                return;
            }

            // تغيير شكل الزر لإعلام المستخدم أنه جاري التحميل
            const originalText = locationBtn.innerHTML;
            locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد الموقع...';

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    updateCoordinates(lat, lng);

                    // تحريك الخريطة بنعومة إلى الموقع الحقيقي
                    if (map && marker) {
                        map.flyTo([lat, lng], 15);
                        marker.setLatLng([lat, lng]);
                    }

                    // إرجاع الزر لشكله الطبيعي
                    locationBtn.innerHTML = '<i class="fas fa-check"></i> تم التحديد';
                    setTimeout(() => { locationBtn.innerHTML = originalText; }, 2000);
                }, 
                function(error) {
                    alert("تعذر جلب موقعك (تأكد من إعطاء صلاحية الـ GPS للمتصفح). يمكنك تحديد موقعك يدوياً بسحب العلامة على الخريطة.");
                    locationBtn.innerHTML = originalText;
                },
                { enableHighAccuracy: true } // طلب دقة عالية
            );
        });
    }
});
// 4. دالة إنشاء الخريطة
function initMap(lat, lng) {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // تهيئة الخريطة
    map = L.map('map').setView([lat, lng], 13);

    // إضافة طبقة الشوارع
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // إضافة العلامة قابلة للسحب
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    // تحديث الإحداثيات عند إفلات العلامة
    marker.on('dragend', function() {
        const pos = marker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
    });

    // تحديث الموقع عند الضغط في أي مكان بالخريطة
    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng);
    });

    // تحديث أبعاد الخريطة لضمان عدم ظهور مربعات رمادية
    setTimeout(() => { map.invalidateSize(); }, 500);
}

// 5. دالة تحديث الحقول المخفية
function updateCoordinates(lat, lng) {
    const latInput = document.getElementById('latitude-in');
    const lngInput = document.getElementById('longitude-in');
    
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
    
    console.log(`تم تحديث الموقع: خط عرض ${lat.toFixed(6)}، خط طول ${lng.toFixed(6)}`);
}


//انشاء حساب
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const typeOptions = document.querySelectorAll('.type-option');
    const pharmacyFields = document.getElementById('pharmacy-fields');
    let currentRole = 'customer'; // القيمة الافتراضية

    // 1. التبديل بين العميل والصيدلي (UI Logic)
    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            typeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentRole = option.getAttribute('data-role');

            // إظهار أو إخفاء حقول الصيدلية
            if (currentRole === 'pharmacy') {
                pharmacyFields.style.display = 'block';
            } else {
                pharmacyFields.style.display = 'none';
            }
        });
    });
 
// 2. معالجة إرسال فورم
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // تجميع البيانات الأساسية
        const formData = {
            full_name: document.getElementById('user-name-in').value,
            email: document.getElementById('email-in').value,
            phone: document.getElementById('phone-in').value.trim(), // تم إضافة trim لإزالة الفراغات الزائدة
            password: document.getElementById('user-pass-in').value,
            role: currentRole,
            latitude: document.getElementById('latitude-in').value,
            longitude: document.getElementById('longitude-in').value
        };
        
        // --- نظام التحقق من رقم الموبايل المصري ---
        // الصيغة: يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتبعه 8 أرقام (إجمالي 11 رقم)
        const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;

        if (!egyptianPhoneRegex.test(formData.phone)) {
            alert('عذراً، يجب إدخال رقم موبايل مصري صحيح ومكون من 11 رقم (مثل: 01012345678)');
            return; // إيقاف تنفيذ الدالة وعدم إرسال الفورم للباك إند
        }
        // ----------------------------------------

        // إضافة بيانات الصيدلية لو الدور صيدلي
        if (currentRole === 'pharmacy') {
            formData.pharmacy_name = document.getElementById('pharmacyName').value;
            formData.governorate = document.getElementById('governorate').value;
            formData.city_center = document.getElementById('city-center').value;
            formData.district_village = document.getElementById('district-village').value;
            formData.gmap_url = document.getElementById('gmap-url').value;
        }

        try {
            // إظهار حالة تحميل (Loading)
            const signupBtn = document.getElementById('signup-btn');
            signupBtn.disabled = true;
            signupBtn.innerText = 'جاري إنشاء الحساب...';

            // إرسال الطلب للباك إند (Flask)
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
            signupBtn.disabled = false;
            signupBtn.innerText = 'إنشاء الحساب';
        }
    });
});