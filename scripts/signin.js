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

//ارسال بيانات التسجيل و التحقق منها مع التوجيه للرئيسية
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // --- الجزء الخاص بالتأكد من تفعيل الحساب (الرابط القادم من Flask) ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
        alert("🎉 تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.");
        // تنظيف الرابط لشكل جمالي
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- معالجة تسجيل الدخول ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // سحب البيانات (استخدمنا querySelector لأن الـ inputs معندهاش IDs)
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'جاري التحقق...';

            const response = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                // حفظ التوكن ومعلومات المستخدم
                localStorage.setItem('userToken', result.session);
                localStorage.setItem('userId', result.user);

                alert('تم تسجيل الدخول بنجاح!');
                // التوجه للرئيسية
                window.location.href = '../index.html';
            } else {
                alert('خطأ: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال بالسيرفر');
        } finally {
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerText = 'دخول';
        }
    });
});