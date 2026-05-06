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

        
// [إصلاح] دالة جلب بيانات المستخدم وتحديث الواجهة ديناميكياً
async function fetchUserProfile() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken'); 
    
    const loginLink = document.getElementById('login-link');
    const searchLink = document.getElementById('search-link');
    const profileLink = document.getElementById('profile-link');
    const logoutBtn = document.getElementById('logout-btn');
    const infoBar = document.getElementById('user-info-bar');
    const patientView = document.getElementById('patient-quick-view');
    const pharmacistView = document.getElementById('pharmacist-quick-view');

    // الحالة 1: مستخدم غير مسجل (زائر) - الحفاظ على الكود الأصلي للواجهة
    if (!token || !userId) {
        loginLink.style.display = 'inline-block';
        searchLink.style.display = 'none';
        profileLink.style.display = 'none';
        logoutBtn.style.display = 'none';
        infoBar.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/user/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            const userData = result.data;
            const bookings = userData.bookings || []; // المصفوفة القادمة من الباك أند
            localStorage.setItem('userRole', userData.role);

            // إعدادات مشتركة للمسجلين - الحفاظ على الكود الأصلي للواجهة
            loginLink.style.display = 'none';
            profileLink.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
            infoBar.style.display = 'block';

            if (userData.role === 'customer') {
                // واجهة المريض - الحفاظ على التحكم في الناف بار
                searchLink.style.display = 'inline-block';
                patientView.style.display = 'block';
                pharmacistView.style.display = 'none';
                
                const nameTag = patientView.querySelector('h3');
                nameTag.innerHTML = `أهلاً بك، ${userData.full_name} <i class="fas fa-user-heart"></i>`;

                // --- تحديث الأرقام الحقيقية للمريض ---
                const pending = bookings.filter(b => b.status === 'pending').length;
                const confirmed = bookings.filter(b => b.status === 'confirmed').length;
                const waiting = bookings.filter(b => b.status === 'waiting').length;

                patientView.querySelector('p').innerHTML = `
                    لديك <strong>${pending}</strong> طلبات مراجعة، 
                    <strong>${confirmed}</strong> حجوزات مؤكدة، 
                    و <strong>${waiting}</strong> على قائمة الانتظار.`;
                
            } else if (userData.role === 'pharmacy') {
                // واجهة الصيدلي - الحفاظ على التحكم في الناف بار
                searchLink.style.display = 'none'; 
                pharmacistView.style.display = 'block';
                patientView.style.display = 'none';
                
                const pharmacyName = userData.details?.pharmacy_name || userData.full_name;
                const pharmaNameTag = pharmacistView.querySelector('h3');
                pharmaNameTag.innerHTML = `أهلاً دكتور، ${pharmacyName} <i class="fas fa-hand-holding-medical"></i>`;

                // --- تحديث الأرقام الحقيقية للصيدلي ---
                const newOrders = bookings.filter(b => b.status === 'pending').length;
                const activeConfirmed = bookings.filter(b => b.status === 'confirmed').length;

                pharmacistView.querySelector('p').innerHTML = `
                    يوجد <strong>${newOrders}</strong> طلبات جديدة تحتاج ردك، 
                    و <strong>${activeConfirmed}</strong> حجوزات مؤكدة بانتظار الاستلام.`;
            }
        } else {
            logout();
        }
    } catch (error) {
        console.error("خطأ في الاتصال بالسيرفر:", error);
    }
}
// [إضافة] دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'index.html'; // إعادة التوجيه للرئيسية كزائر
}
// ربط زر الخروج بالدالة
document.getElementById('logout-btn').addEventListener('click', logout);
// استدعاء الدالة عند التحميل
document.addEventListener('DOMContentLoaded', fetchUserProfile);

const backToTopBtn = document.getElementById("backToTop");
window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    // التحقق إذا كان السكرول أكثر من 400 بكسل
    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
        backToTopBtn.style.display = "block";
        // إضافة أنيميشن بسيط للظهور
        backToTopBtn.style.opacity = "1";
    } else {
        backToTopBtn.style.opacity = "0";
        // إخفاء الزر تماماً بعد الأنميشن
        setTimeout(() => {
            if (document.documentElement.scrollTop <= 400) {
                backToTopBtn.style.display = "none";
            }
        }, 300);
    }
}

// عند الضغط على الزر، العودة للأعلى بسلاسة
backToTopBtn.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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