// التحقق من هوية المريض
(function protectPatientRoute() {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'customer') {
        window.location.href = "../index.html";
    }
})();
 
function openTab(evt, tabName) {
    let i, tabContent, tabBtns;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
        tabContent[i].classList.remove("active");
    }
    tabBtns = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

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

document.addEventListener('DOMContentLoaded', () => {
    // تشغيل جلب البيانات فور تحميل الصفحة
    loadPatientDashboard();
});

async function loadPatientDashboard() {
    const userId = localStorage.getItem('userId');
    
    // تعريف الحاويات في الـ HTML
    const activeResContainer = document.getElementById('active-res');
    const waitListContainer = document.getElementById('wait-list');
    const ordersContainer = document.getElementById('orders');
    const historyContainer = document.getElementById('history');

    try {
        const response = await fetch(`https://mahmoud2albehwar.pythonanywhere.com/api/public/my-bookings?user_id=${userId}`);
        const result = await response.json();

        if (result.status === 'success') {
            // مسح البيانات الوهمية (Static) الموجودة في الـ HTML قبل الرسم
            activeResContainer.innerHTML = '';
            waitListContainer.innerHTML = '';
            ordersContainer.innerHTML = '';
            historyContainer.innerHTML = '';

            if (result.data.length === 0) {
                checkEmptyTabs();
                return;
            }

        result.data.forEach(booking => {
            const card = createBookingCard(booking);
            const status = booking.status.toLowerCase(); // تحويل الحالة لحروف صغيرة لضمان المطابقة

            if (status === 'completed') {
                historyContainer.appendChild(card);
            } else if (status === 'waiting') {
                waitListContainer.appendChild(card);
            } else if (status === 'confirmed') {
                activeResContainer.appendChild(card);
            } else if (status === 'pending' || status === 'accepted') { 
                // أضفت 'accepted' احتياطاً لو السيرفر بيرسلها بهذا الاسم
                ordersContainer.appendChild(card);
            } else if (status === 'cancelled') {
                historyContainer.appendChild(card);
            }
        });

            // تفقد التبويبات الفارغة لإظهار رسالة "لا توجد بيانات"
            checkEmptyTabs();
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}

function createBookingCard(booking) {
    const div = document.createElement('div');
    
    // تحويل الحالة لحروف صغيرة لضمان مطابقتها مع الـ CSS والمنطق البرمجي
    const status = booking.status ? booking.status.toLowerCase() : 'pending';
    div.className = `dash-card status-${status}`;
    
    // 1. توليد رابط خرائط جوجل ذكي (الرابط اليدوي أو الإحداثيات)
    let mapUrl = "#";
    if (booking.google_maps_link && booking.google_maps_link.trim() !== "") {
        mapUrl = booking.google_maps_link;
    } else if (booking.latitude && booking.longitude) {
        mapUrl = `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`;
    }

    // 2. تنسيق وقت الانتهاء (للحجوزات المؤكدة)
    const expiryDate = booking.expires_at ? new Date(booking.expires_at).toLocaleString('ar-EG', {
        hour: '2-digit', 
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
    }) : '';

    div.innerHTML = `
        <div class="card-header-flex">
            <h3><i class="fas fa-pills"></i> ${booking.med_name || 'دواء غير مسمى'}</h3>
            <span class="code">#${booking.booking_code || '---'}</span>
        </div>
        
        <div class="card-details">
            <p><i class="fas fa-hospital"></i> <strong>الصيدلية:</strong> ${booking.pharmacy_name || 'غير محدد'}</p>
            
            <p>
                <i class="fas fa-phone-alt"></i> <strong>للتواصل:</strong> 
                <a href="tel:${booking.pharmacy_phone}" style="color: var(--primary); text-decoration: none; font-weight: bold;">
                    ${booking.pharmacy_phone || 'لا يوجد رقم'}
                </a>
            </p>

            <p><i class="fas fa-map-marker-alt"></i> <strong>المنطقة:</strong> ${booking.pharmacy_area || 'العنوان غير متوفر'}</p>
            
            ${status === 'waiting' && booking.queue_rank ? `
                <div class="queue-badge" style="background: #e6f7ff; color: #1890ff; padding: 5px 10px; border-radius: 5px; display: inline-block; margin-top: 5px;">
                    <i class="fas fa-users"></i> أنت رقم <strong>${booking.queue_rank}</strong> في الانتظار
                </div>
            ` : ''}

            ${status === 'confirmed' ? `
                <div class="expiry-timer" style="color: #e67e22; font-weight: bold; margin-top: 5px;">
                    <i class="fas fa-clock"></i> استلم قبل: ${expiryDate}
                </div>
            ` : ''}
        </div>

        <div class="card-actions" style="margin-top: 15px; display: flex; gap: 10px;">
            ${mapUrl !== "#" ? `
                <a href="${mapUrl}" target="_blank" class="btn-small outline" style="flex:1; text-align:center; text-decoration:none;">
                    <i class="fas fa-location-arrow"></i> الموقع
                </a>
            ` : `
                <button class="btn-small outline disabled" style="flex:1; opacity:0.5; cursor:not-allowed;">الموقع غير متوفر</button>
            `}

            ${['pending', 'confirmed', 'waiting', 'accepted'].includes(status) ? `
                <button onclick="cancelBooking('${booking.booking_id}')" class="btn-small" style="flex:1; background:#ff4d4f; color:white; border:none; cursor:pointer;">
                    إلغاء الطلب
                </button>
            ` : ''}
        </div>
    `;
    return div;
}

async function cancelBooking(id) {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    try {
        const res = await fetch('https://mahmoud2albehwar.pythonanywhere.com/api/public/cancel-booking', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ booking_id: id })
        });
        const result = await res.json();
        if (result.status === 'success') {
            alert("تم الإلغاء بنجاح");
            loadPatientDashboard(); // إعادة تحميل البيانات
        }
    } catch (e) { alert("فشل الإلغاء"); }
}

function checkEmptyTabs() {
    const tabs = ['active-res', 'wait-list', 'orders', 'history'];
    tabs.forEach(id => {
        const container = document.getElementById(id);
        if (container.innerHTML.trim() === '') {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center; padding: 40px;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; color: #ccc;"></i>
                    <p style="color: #888; margin-top: 10px;">لا توجد بيانات حالياً في هذا القسم</p>
                </div>`;
        }
    });
}