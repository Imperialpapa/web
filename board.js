// 게시판 및 방문자 카운터 관리 (어댑터 패턴 사용)
class BoardManager {
    constructor() {
        this.backend = null;
        this.visitorCount = 0;
        this.notices = [];
        this.guestPosts = [];
        this.isInitialized = false;
        this.unsubscribeFunctions = [];
    }

    // 초기화
    async init() {
        // 데모 모드 확인
        if (isDemoMode()) {
            console.log('데모 모드로 작동 중...');
            this.initDemoMode();
            return;
        }

        // 백엔드 어댑터 선택
        const provider = getBackendProvider();

        if (provider === 'firebase') {
            initializeFirebase();
            this.backend = new FirebaseAdapter();
        } else if (provider === 'supabase') {
            initializeSupabase();
            this.backend = new SupabaseAdapter();
        } else {
            console.error('알 수 없는 백엔드 제공자:', provider);
            this.initDemoMode();
            return;
        }

        // 백엔드 초기화
        const initialized = await this.backend.init();
        if (!initialized) {
            console.warn(`${provider} 초기화 실패. 데모 모드로 전환합니다.`);
            this.initDemoMode();
            return;
        }

        this.isInitialized = true;
        console.log(`${provider} 백엔드로 초기화되었습니다.`);

        // 방문자 카운터 초기화 및 증가
        await this.initVisitorCounter();

        // 실시간 업데이트 리스너 등록
        this.setupRealtimeListeners();
    }

    // 데모 모드 (백엔드 없이 작동)
    initDemoMode() {
        console.log('로컬 스토리지로 작동 중...');

        // localStorage 사용
        this.visitorCount = parseInt(localStorage.getItem('visitorCount') || '0') + 1;
        localStorage.setItem('visitorCount', this.visitorCount.toString());
        this.updateVisitorCountDisplay(this.visitorCount);

        // 데모 공지사항
        this.notices = JSON.parse(localStorage.getItem('notices') || '[]');
        this.renderNotices();

        // 데모 방문자 글
        this.guestPosts = JSON.parse(localStorage.getItem('guestPosts') || '[]');
        this.renderGuestPosts();
    }

    // 방문자 카운터 초기화
    async initVisitorCounter() {
        try {
            const count = await this.backend.incrementVisitorCount();
            this.visitorCount = count;
            this.updateVisitorCountDisplay(count);
        } catch (error) {
            console.error('방문자 카운터 초기화 실패:', error);
        }
    }

    // 방문자 카운터 표시 업데이트
    updateVisitorCountDisplay(count) {
        const counterElement = document.getElementById('visitor-count');
        if (counterElement) {
            this.animateNumber(counterElement, count);
        }
    }

    // 숫자 애니메이션
    animateNumber(element, targetNumber) {
        const duration = 1000;
        const startNumber = 0;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(startNumber + (targetNumber - startNumber) * progress);
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }

    // 실시간 업데이트 리스너 설정
    setupRealtimeListeners() {
        if (!this.isInitialized) return;

        // 방문자 카운터 실시간 업데이트
        const unsubVisitorCount = this.backend.subscribeVisitorCount((count) => {
            this.visitorCount = count;
            this.updateVisitorCountDisplay(count);
        });
        this.unsubscribeFunctions.push(unsubVisitorCount);

        // 공지사항 실시간 업데이트
        const unsubNotices = this.backend.subscribeNotices((notices) => {
            this.notices = notices;
            this.renderNotices();
        });
        this.unsubscribeFunctions.push(unsubNotices);

        // 방문자 게시판 실시간 업데이트
        const unsubGuestPosts = this.backend.subscribeGuestPosts((posts) => {
            this.guestPosts = posts;
            this.renderGuestPosts();
        });
        this.unsubscribeFunctions.push(unsubGuestPosts);
    }

    // 정리 (필요시 구독 해제)
    cleanup() {
        this.unsubscribeFunctions.forEach(unsub => {
            if (typeof unsub === 'function') {
                unsub();
            }
        });
        this.unsubscribeFunctions = [];
    }

    // 공지사항 렌더링
    renderNotices() {
        const noticeList = document.getElementById('notice-list');
        if (!noticeList) return;

        if (this.notices.length === 0) {
            noticeList.innerHTML = '<div class="empty-notice">등록된 공지사항이 없습니다.</div>';
            return;
        }

        // 관리자 모드 여부 확인
        const isAdminMode = window.adminMode && window.adminMode.isAdminMode;

        noticeList.innerHTML = this.notices.map(notice => `
            <div class="notice-item" data-id="${notice.id || ''}">
                <div class="notice-header">
                    <h4 class="notice-title">${this.escapeHtml(notice.title)}</h4>
                    <div class="notice-meta">
                        <span class="notice-date">${this.formatDate(notice.timestamp)}</span>
                        ${isAdminMode ? `
                            <div class="admin-actions">
                                <button class="admin-action-btn edit-notice-btn" data-id="${notice.id}" title="수정">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="admin-action-btn delete-notice-btn" data-id="${notice.id}" title="삭제">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="notice-content">${this.escapeHtml(notice.content)}</div>
                ${notice.isAdmin || notice.is_admin ? '<span class="notice-badge">관리자</span>' : ''}
            </div>
        `).join('');

        // 관리자 모드일 때 이벤트 리스너 추가
        if (isAdminMode) {
            this.attachNoticeAdminButtons();
        }
    }

    // 방문자 게시판 렌더링
    renderGuestPosts() {
        const postList = document.getElementById('guest-post-list');
        if (!postList) return;

        if (this.guestPosts.length === 0) {
            postList.innerHTML = '<div class="empty-posts">첫 번째 방문 기록을 남겨주세요!</div>';
            return;
        }

        // 관리자 모드 여부 확인
        const isAdminMode = window.adminMode && window.adminMode.isAdminMode;

        postList.innerHTML = this.guestPosts.map(post => `
            <div class="guest-post-item" data-id="${post.id || ''}">
                <div class="post-header">
                    <span class="post-author">${this.escapeHtml(post.author || '익명')}</span>
                    <div class="post-meta">
                        <span class="post-date">${this.formatDate(post.timestamp)}</span>
                        ${isAdminMode ? `
                            <button class="admin-action-btn delete-post-btn" data-id="${post.id}" title="삭제">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="post-content">${this.escapeHtml(post.content)}</div>
            </div>
        `).join('');

        // 관리자 모드일 때 이벤트 리스너 추가
        if (isAdminMode) {
            this.attachGuestPostAdminButtons();
        }
    }

    // 공지사항 관리자 버튼 이벤트 연결
    attachNoticeAdminButtons() {
        // 수정 버튼
        document.querySelectorAll('.edit-notice-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const noticeId = e.currentTarget.getAttribute('data-id');
                const notice = this.notices.find(n => n.id == noticeId);
                if (!notice) return;

                const newTitle = prompt('공지사항 제목을 입력하세요:', notice.title);
                if (!newTitle || newTitle.trim() === '') return;

                const newContent = prompt('공지사항 내용을 입력하세요:', notice.content);
                if (!newContent || newContent.trim() === '') return;

                await this.updateNotice(noticeId, newTitle, newContent);
            });
        });

        // 삭제 버튼
        document.querySelectorAll('.delete-notice-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const noticeId = e.currentTarget.getAttribute('data-id');
                await this.deleteNotice(noticeId);
            });
        });
    }

    // 방명록 관리자 버튼 이벤트 연결
    attachGuestPostAdminButtons() {
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.getAttribute('data-id');
                await this.deleteGuestPost(postId);
            });
        });
    }

    // 방문자 글 작성
    async submitGuestPost(author, content) {
        if (!content || content.trim() === '') {
            alert('내용을 입력해주세요.');
            return false;
        }

        const post = {
            author: author || '익명',
            content: content.trim(),
            timestamp: Date.now()
        };

        if (!this.isInitialized) {
            // localStorage에 저장
            this.guestPosts.unshift(post);
            localStorage.setItem('guestPosts', JSON.stringify(this.guestPosts));
            this.renderGuestPosts();
            return true;
        }

        try {
            await this.backend.addGuestPost(post);
            return true;
        } catch (error) {
            console.error('방문자 글 작성 실패:', error);
            alert('글 작성에 실패했습니다. 다시 시도해주세요.');
            return false;
        }
    }

    // 공지사항 작성 (관리자 전용)
    async addNotice(title, content) {
        console.log('📢 [BoardManager] addNotice 호출됨');
        console.log('📢 [BoardManager] 제목:', title);
        console.log('📢 [BoardManager] 내용:', content);

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return false;
        }

        const notice = {
            title: title.trim(),
            content: content.trim(),
            timestamp: Date.now(),
            is_admin: true
        };

        console.log('📢 [BoardManager] 생성된 notice 객체:', notice);

        if (!this.isInitialized) {
            // localStorage에 저장
            console.log('📢 [BoardManager] localStorage에 저장');
            this.notices.unshift(notice);
            localStorage.setItem('notices', JSON.stringify(this.notices));
            this.renderNotices();
            return true;
        }

        try {
            console.log('📢 [BoardManager] backend.addNotice() 호출');
            await this.backend.addNotice(notice);
            console.log('✅ [BoardManager] 공지사항 추가 성공');
            return true;
        } catch (error) {
            console.error('🔴 [BoardManager] 공지사항 작성 실패:', error);
            alert('공지사항 작성에 실패했습니다.');
            return false;
        }
    }

    // 공지사항 수정 (관리자 전용)
    async updateNotice(noticeId, title, content) {
        console.log('📢 [BoardManager] updateNotice 호출됨', noticeId);

        if (!noticeId || !title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return false;
        }

        const updates = {
            title: title.trim(),
            content: content.trim()
        };

        if (!this.isInitialized) {
            // localStorage에서 수정
            const index = this.notices.findIndex(n => n.id === noticeId);
            if (index !== -1) {
                this.notices[index] = { ...this.notices[index], ...updates };
                localStorage.setItem('notices', JSON.stringify(this.notices));
                this.renderNotices();
            }
            return true;
        }

        try {
            console.log('📢 [BoardManager] backend.updateNotice() 호출');
            await this.backend.updateNotice(noticeId, updates);
            console.log('✅ [BoardManager] 공지사항 수정 성공');
            return true;
        } catch (error) {
            console.error('🔴 [BoardManager] 공지사항 수정 실패:', error);
            alert('공지사항 수정에 실패했습니다.');
            return false;
        }
    }

    // 공지사항 삭제 (관리자 전용)
    async deleteNotice(noticeId) {
        console.log('📢 [BoardManager] deleteNotice 호출됨', noticeId);

        if (!noticeId) return false;

        if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            return false;
        }

        if (!this.isInitialized) {
            // localStorage에서 삭제
            this.notices = this.notices.filter(n => n.id !== noticeId);
            localStorage.setItem('notices', JSON.stringify(this.notices));
            this.renderNotices();
            return true;
        }

        try {
            console.log('📢 [BoardManager] backend.deleteNotice() 호출');
            await this.backend.deleteNotice(noticeId);
            console.log('✅ [BoardManager] 공지사항 삭제 성공');
            return true;
        } catch (error) {
            console.error('🔴 [BoardManager] 공지사항 삭제 실패:', error);
            alert('공지사항 삭제에 실패했습니다.');
            return false;
        }
    }

    // 방명록 글 삭제 (관리자 전용)
    async deleteGuestPost(postId) {
        console.log('📢 [BoardManager] deleteGuestPost 호출됨', postId);

        if (!postId) return false;

        if (!confirm('정말로 이 방명록 글을 삭제하시겠습니까?')) {
            return false;
        }

        if (!this.isInitialized) {
            // localStorage에서 삭제
            this.guestPosts = this.guestPosts.filter(p => p.id !== postId);
            localStorage.setItem('guestPosts', JSON.stringify(this.guestPosts));
            this.renderGuestPosts();
            return true;
        }

        try {
            console.log('📢 [BoardManager] backend.deleteGuestPost() 호출');
            await this.backend.deleteGuestPost(postId);
            console.log('✅ [BoardManager] 방명록 글 삭제 성공');
            return true;
        } catch (error) {
            console.error('🔴 [BoardManager] 방명록 글 삭제 실패:', error);
            alert('방명록 글 삭제에 실패했습니다.');
            return false;
        }
    }

    // HTML 이스케이프 (XSS 방지)
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 날짜 포맷팅
    formatDate(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // 1분 이내
        if (diff < 60000) {
            return '방금 전';
        }

        // 1시간 이내
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}분 전`;
        }

        // 24시간 이내
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}시간 전`;
        }

        // 그 외
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// 전역 BoardManager 인스턴스
let boardManager = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // 약간의 지연 후 BoardManager 초기화 (SDK 로딩 대기)
    setTimeout(async () => {
        boardManager = new BoardManager();
        window.boardManager = boardManager; // 전역으로 노출
        await boardManager.init();

        // 방문자 게시판 폼 이벤트 리스너
        const guestForm = document.getElementById('guest-post-form');
        if (guestForm) {
            guestForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const authorInput = document.getElementById('guest-author');
                const contentInput = document.getElementById('guest-content');

                const author = authorInput.value.trim() || '익명';
                const content = contentInput.value.trim();

                const success = await boardManager.submitGuestPost(author, content);

                if (success) {
                    // 폼 초기화
                    authorInput.value = '';
                    contentInput.value = '';

                    // 성공 메시지
                    showBoardNotification('글이 등록되었습니다!', 'success');
                }
            });
        }
    }, 1000);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (boardManager) {
        boardManager.cleanup();
    }
});

// 알림 메시지 표시
function showBoardNotification(message, type = 'success') {
    // script.js의 showNotification 함수 사용 시도
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }

    // 간단한 alert로 대체
    alert(message);
}
