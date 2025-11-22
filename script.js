document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 캐싱 (성능 최적화)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const navbar = document.querySelector('.navbar');
    const contactForm = document.querySelector('.contact-form');
    const projectCards = document.querySelectorAll('.project-card');
    const skillBars = document.querySelectorAll('.skill-progress');
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

    // 네비게이션 링크 맵 캐싱 (스크롤 이벤트 최적화)
    const navLinkMap = new Map();
    sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        const link = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
        if (link) navLinkMap.set(sectionId, link);
    });

    // 모바일 메뉴 토글
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // 네비게이션 링크 클릭 시 메뉴 닫기
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // 스크롤 네비게이션 (캐시된 맵 사용)
    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                const navLink = navLinkMap.get(sectionId);
                if (navLink) navLink.classList.add('active');
            }
        });
    }

    // 스킬 바 애니메이션 (캐시된 요소 사용)
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            if (targetWidth) {
                bar.style.width = targetWidth + '%';
            }
        });
    }

    // 스크롤 애니메이션 관찰자
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // 스킬 섹션이 보일 때 스킬 바 애니메이션 시작
                if (entry.target.id === 'skills') {
                    setTimeout(animateSkillBars, 300);
                }
            }
        });
    }, observerOptions);

    // 애니메이션 요소들 관찰
    animatedElements.forEach(el => observer.observe(el));

    // 섹션들도 관찰하여 애니메이션 적용
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 히어로 섹션 애니메이션
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.style.cssText = 'opacity: 0; transform: translateY(30px); transition: all 0.8s ease;';

            setTimeout(() => {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 200);
        }
    }, 500);

    // 폼 제출 처리
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                showNotification('모든 필드를 입력해주세요.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }

            showNotification('메시지가 성공적으로 전송되었습니다!', 'success');
            contactForm.reset();
        });
    }

    // 이메일 유효성 검사
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // 알림 타임아웃 ID 저장 (메모리 누수 방지)
    let notificationTimeoutId = null;

    // 알림 메시지 표시
    function showNotification(message, type = 'success') {
        // 기존 타임아웃 취소
        if (notificationTimeoutId) {
            clearTimeout(notificationTimeoutId);
        }

        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : '#EF4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // 애니메이션으로 표시
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // 닫기 버튼 이벤트
        notification.querySelector('.notification-close').addEventListener('click', () => {
            hideNotification(notification);
        });

        // 5초 후 자동으로 숨기기
        notificationTimeoutId = setTimeout(() => {
            hideNotification(notification);
        }, 5000);
    }

    // 알림 숨기기
    function hideNotification(notification) {
        if (!notification) return;
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    // 스크롤 시 네비게이션 배경 변경 (캐시된 navbar 사용)
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    }

    // 프로젝트 카드 호버 효과
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 페이지 로드 완료 시 초기 애니메이션
    window.addEventListener('load', function() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.remove(), 300);
        }

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.animation = 'fadeInUp 1s ease forwards';
        }
    });

    // 성능 최적화: 스크롤 이벤트 throttling
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 스크롤 이벤트 (단일 throttled 리스너로 통합)
    window.addEventListener('scroll', throttle(function() {
        scrollActive();
        handleNavbarScroll();
    }, 100));
});
