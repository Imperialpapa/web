// Firebase 백엔드 어댑터
class FirebaseAdapter {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    async init() {
        if (!checkFirebase()) {
            console.warn('Firebase가 초기화되지 않았습니다.');
            return false;
        }

        this.db = getDatabase();
        this.isInitialized = true;
        return true;
    }

    // 방문자 카운터 증가
    async incrementVisitorCount() {
        try {
            const counterRef = this.db.ref('visitorCount');
            const snapshot = await counterRef.once('value');
            const currentCount = snapshot.val() || 0;
            const newCount = currentCount + 1;
            await counterRef.set(newCount);
            return newCount;
        } catch (error) {
            console.error('방문자 카운터 증가 실패:', error);
            throw error;
        }
    }

    // 방문자 카운터 실시간 구독
    subscribeVisitorCount(callback) {
        const counterRef = this.db.ref('visitorCount');
        counterRef.on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            callback(count);
        });

        // 구독 해제 함수 반환
        return () => counterRef.off('value');
    }

    // 공지사항 목록 가져오기
    async getNotices() {
        try {
            const noticesRef = this.db.ref('notices');
            const snapshot = await noticesRef.orderByChild('timestamp').once('value');

            const notices = [];
            snapshot.forEach(childSnapshot => {
                notices.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            return notices.reverse(); // 최신순
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            throw error;
        }
    }

    // 공지사항 실시간 구독
    subscribeNotices(callback) {
        const noticesRef = this.db.ref('notices');
        noticesRef.on('value', (snapshot) => {
            const notices = [];
            snapshot.forEach(childSnapshot => {
                notices.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            callback(notices.reverse());
        });

        return () => noticesRef.off('value');
    }

    // 공지사항 추가
    async addNotice(notice) {
        try {
            const noticesRef = this.db.ref('notices');
            await noticesRef.push(notice);
            return true;
        } catch (error) {
            console.error('공지사항 추가 실패:', error);
            throw error;
        }
    }

    // 공지사항 삭제
    async deleteNotice(noticeId) {
        try {
            await this.db.ref(`notices/${noticeId}`).remove();
            return true;
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            throw error;
        }
    }

    // 방문자 글 목록 가져오기
    async getGuestPosts() {
        try {
            const postsRef = this.db.ref('guestPosts');
            const snapshot = await postsRef.orderByChild('timestamp').limitToLast(50).once('value');

            const posts = [];
            snapshot.forEach(childSnapshot => {
                posts.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            return posts.reverse(); // 최신순
        } catch (error) {
            console.error('방문자 글 로드 실패:', error);
            throw error;
        }
    }

    // 방문자 글 실시간 구독
    subscribeGuestPosts(callback) {
        const postsRef = this.db.ref('guestPosts');
        postsRef.limitToLast(50).on('value', (snapshot) => {
            const posts = [];
            snapshot.forEach(childSnapshot => {
                posts.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            callback(posts.reverse());
        });

        return () => postsRef.off('value');
    }

    // 방문자 글 추가
    async addGuestPost(post) {
        try {
            const postsRef = this.db.ref('guestPosts');
            await postsRef.push(post);
            return true;
        } catch (error) {
            console.error('방문자 글 추가 실패:', error);
            throw error;
        }
    }
}
