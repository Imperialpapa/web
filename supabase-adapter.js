// Supabase 백엔드 어댑터
class SupabaseAdapter {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.subscriptions = {
            visitorCount: null,
            notices: null,
            guestPosts: null
        };
    }

    async init() {
        if (!checkSupabase()) {
            console.warn('Supabase가 초기화되지 않았습니다.');
            return false;
        }

        this.client = getSupabase();
        this.isInitialized = true;
        return true;
    }

    // 방문자 카운터 증가
    async incrementVisitorCount() {
        try {
            // Supabase RPC 함수 호출 (increment_visitor_count 함수 필요)
            const { data, error } = await this.client.rpc('increment_visitor_count');

            if (error) {
                // RPC 함수가 없으면 직접 업데이트
                console.warn('RPC 함수가 없습니다. 직접 업데이트를 시도합니다.');

                // 현재 카운트 가져오기
                const { data: currentData } = await this.client
                    .from('visitor_counter')
                    .select('count')
                    .single();

                const currentCount = currentData?.count || 0;
                const newCount = currentCount + 1;

                // 업데이트
                await this.client
                    .from('visitor_counter')
                    .upsert({ id: 1, count: newCount });

                return newCount;
            }

            return data;
        } catch (error) {
            console.error('방문자 카운터 증가 실패:', error);
            throw error;
        }
    }

    // 방문자 카운터 실시간 구독
    subscribeVisitorCount(callback) {
        // 실시간 구독 설정
        const channel = this.client
            .channel('visitor_counter_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'visitor_counter'
            }, (payload) => {
                callback(payload.new.count || 0);
            })
            .subscribe();

        this.subscriptions.visitorCount = channel;

        // 초기 데이터 로드
        this.client
            .from('visitor_counter')
            .select('count')
            .single()
            .then(({ data }) => {
                if (data) callback(data.count);
            });

        // 구독 해제 함수 반환
        return () => {
            if (this.subscriptions.visitorCount) {
                this.client.removeChannel(this.subscriptions.visitorCount);
                this.subscriptions.visitorCount = null;
            }
        };
    }

    // 공지사항 목록 가져오기
    async getNotices() {
        try {
            const { data, error } = await this.client
                .from('notices')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            throw error;
        }
    }

    // 공지사항 실시간 구독
    subscribeNotices(callback) {
        const channel = this.client
            .channel('notices_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notices'
            }, async () => {
                // 변경 발생 시 전체 목록 다시 로드
                const notices = await this.getNotices();
                callback(notices);
            })
            .subscribe();

        this.subscriptions.notices = channel;

        // 초기 데이터 로드
        this.getNotices().then(callback);

        // 구독 해제 함수 반환
        return () => {
            if (this.subscriptions.notices) {
                this.client.removeChannel(this.subscriptions.notices);
                this.subscriptions.notices = null;
            }
        };
    }

    // 공지사항 추가
    async addNotice(notice) {
        try {
            const { error } = await this.client
                .from('notices')
                .insert([notice]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('공지사항 추가 실패:', error);
            throw error;
        }
    }

    // 공지사항 삭제
    async deleteNotice(noticeId) {
        try {
            const { error } = await this.client
                .from('notices')
                .delete()
                .eq('id', noticeId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            throw error;
        }
    }

    // 방문자 글 목록 가져오기
    async getGuestPosts() {
        try {
            const { data, error } = await this.client
                .from('guest_posts')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('방문자 글 로드 실패:', error);
            throw error;
        }
    }

    // 방문자 글 실시간 구독
    subscribeGuestPosts(callback) {
        const channel = this.client
            .channel('guest_posts_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'guest_posts'
            }, async () => {
                // 변경 발생 시 전체 목록 다시 로드
                const posts = await this.getGuestPosts();
                callback(posts);
            })
            .subscribe();

        this.subscriptions.guestPosts = channel;

        // 초기 데이터 로드
        this.getGuestPosts().then(callback);

        // 구독 해제 함수 반환
        return () => {
            if (this.subscriptions.guestPosts) {
                this.client.removeChannel(this.subscriptions.guestPosts);
                this.subscriptions.guestPosts = null;
            }
        };
    }

    // 방문자 글 추가
    async addGuestPost(post) {
        try {
            const { error } = await this.client
                .from('guest_posts')
                .insert([post]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('방문자 글 추가 실패:', error);
            throw error;
        }
    }
}
