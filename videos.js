// 연구용 영상 라이브러리 관리
class VideoLibrary {
    constructor() {
        this.currentCategory = 'current-affairs';
        this.isAdminMode = false;
        this.adminPassword = 'admin12';
        this.videos = this.loadVideos();

        this.init();
    }

    init() {
        // 초기 데이터 설정 (localStorage에 없으면)
        if (!this.videos || Object.keys(this.videos).length === 0) {
            console.log('📹 초기 데이터 로드 중...');
            this.videos = this.getDefaultVideos();
            this.saveVideos();
            console.log('✅ 초기 데이터 로드 완료:', Object.keys(this.videos));
        } else {
            console.log('📹 저장된 데이터 로드 완료:', Object.keys(this.videos));
        }

        // 이벤트 리스너 등록
        this.attachEventListeners();

        // 초기 렌더링
        this.renderAllCategories();
        console.log('✅ 영상 라이브러리 초기화 완료');
    }

    // 기본 예제 데이터
    getDefaultVideos() {
        return {
            'current-affairs': [
                { id: 1, title: 'KBS 뉴스 9 - 주요 시사 이슈', url: 'https://www.youtube.com/watch?v=CQ9Bc5L6T4I' },
                { id: 2, title: 'JTBC 뉴스룸 - 정치 분석', url: 'https://www.youtube.com/watch?v=grg9vLu9-KQ' },
                { id: 3, title: 'MBC 뉴스데스크 - 사회 이슈', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
                { id: 4, title: 'SBS 8뉴스 - 국제 정세', url: 'https://www.youtube.com/watch?v=VMDOJYwgM5g' },
                { id: 5, title: 'YTN 24시간 뉴스', url: 'https://www.youtube.com/watch?v=--LVNsWLjD0' }
            ],
            'economy': [
                { id: 6, title: '삼프로TV - 경제 트렌드 분석', url: 'https://www.youtube.com/watch?v=eVKRy4c9lZc' },
                { id: 7, title: '신사임당 - 주식 투자 전략', url: 'https://www.youtube.com/watch?v=FdYl55C9wbM' },
                { id: 8, title: '부읽남 - 부동산 시장 분석', url: 'https://www.youtube.com/watch?v=kDWFgG8G13A' },
                { id: 9, title: '슈카월드 - 경제 이슈 토크', url: 'https://www.youtube.com/watch?v=tVMcAGPfSEY' },
                { id: 10, title: '한국경제TV - 시장 동향', url: 'https://www.youtube.com/watch?v=0d9wqhCdxDk' }
            ],
            'science': [
                { id: 11, title: '과학쿠키 - 우주과학 이야기', url: 'https://www.youtube.com/watch?v=xAUJYP8tnRE' },
                { id: 12, title: 'Veritasium - 물리학 실험', url: 'https://www.youtube.com/watch?v=BLYoyLcdGPc' },
                { id: 13, title: '안될과학 - 과학 실험', url: 'https://www.youtube.com/watch?v=VKok7jFl-40' },
                { id: 14, title: 'Kurzgesagt - 우주와 생명', url: 'https://www.youtube.com/watch?v=h6fcK_fRYaI' },
                { id: 15, title: 'SciShow - 과학 상식', url: 'https://www.youtube.com/watch?v=L5TnWswqYKQ' }
            ],
            'it': [
                { id: 16, title: '노마드 코더 - 웹 개발 강의', url: 'https://www.youtube.com/watch?v=67stn7Pu7s4' },
                { id: 17, title: '드림코딩 - JavaScript 튜토리얼', url: 'https://www.youtube.com/watch?v=wcsVjmHrUQg' },
                { id: 18, title: '빵형의 개발도상국 - AI 프로젝트', url: 'https://www.youtube.com/watch?v=VVQH3EJ8e28' },
                { id: 19, title: 'Fireship - 최신 IT 트렌드', url: 'https://www.youtube.com/watch?v=Mus_vwhTCq0' },
                { id: 20, title: '코딩애플 - 실전 프로젝트', url: 'https://www.youtube.com/watch?v=1Jnz-TLFe-c' }
            ],
            'auto': [
                { id: 21, title: '카톡 - 신차 리뷰', url: 'https://www.youtube.com/watch?v=j-AdQeJRZfg' },
                { id: 22, title: '김한용의 MOCAR - 자동차 시승기', url: 'https://www.youtube.com/watch?v=Ew5kO3W2K_U' },
                { id: 23, title: '오토뷰 - 자동차 뉴스', url: 'https://www.youtube.com/watch?v=VrOXlI4Kx8M' },
                { id: 24, title: '카랩 - 자동차 비교', url: 'https://www.youtube.com/watch?v=YZr7FI_Dqxo' },
                { id: 25, title: '모터그래프 - 전기차 리뷰', url: 'https://www.youtube.com/watch?v=zEOOiR1U9Xk' }
            ],
            'general': [
                { id: 26, title: '워크맨 - 연예인 인터뷰', url: 'https://www.youtube.com/watch?v=ItQ_0GnwGIk' },
                { id: 27, title: '침착맨 - 예능 콘텐츠', url: 'https://www.youtube.com/watch?v=F9y1ccgCN0g' },
                { id: 28, title: '댓글보고 떠나요 - 일상 브이로그', url: 'https://www.youtube.com/watch?v=hN9E1FQc4dE' },
                { id: 29, title: '백종원의 요리비책 - 요리 레시피', url: 'https://www.youtube.com/watch?v=VNbLTz2Lmk0' },
                { id: 30, title: '피식대학 - 코미디 콘텐츠', url: 'https://www.youtube.com/watch?v=tuxp4tqbCRI' }
            ]
        };
    }

    // localStorage에서 데이터 로드
    loadVideos() {
        const stored = localStorage.getItem('videoLibrary');
        return stored ? JSON.parse(stored) : {};
    }

    // localStorage에 데이터 저장
    saveVideos() {
        localStorage.setItem('videoLibrary', JSON.stringify(this.videos));
    }

    // 유튜브 URL에서 비디오 ID 추출
    getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // 이벤트 리스너 등록
    attachEventListeners() {
        // 탭 클릭
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                this.switchCategory(category);
            });
        });

        // 관리자 버튼
        document.getElementById('admin-toggle').addEventListener('click', () => {
            this.toggleAdminMode();
        });

        // 영상 추가 폼
        document.getElementById('add-video-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addVideo();
        });
    }

    // 카테고리 전환
    switchCategory(category) {
        this.currentCategory = category;

        // 탭 버튼 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // 컨텐츠 표시
        document.querySelectorAll('.category-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(category).classList.add('active');
    }

    // 관리자 모드 토글
    toggleAdminMode() {
        if (!this.isAdminMode) {
            const password = prompt('관리자 비밀번호를 입력하세요:');
            if (password !== this.adminPassword) {
                alert('비밀번호가 올바르지 않습니다.');
                return;
            }
        }

        this.isAdminMode = !this.isAdminMode;

        const adminBtn = document.getElementById('admin-toggle');
        const adminPanel = document.getElementById('admin-panel');

        if (this.isAdminMode) {
            adminBtn.classList.add('active');
            adminBtn.innerHTML = '<i class="fas fa-unlock"></i>';
            adminPanel.classList.add('active');
            document.body.classList.add('admin-mode');
        } else {
            adminBtn.classList.remove('active');
            adminBtn.innerHTML = '<i class="fas fa-lock"></i>';
            adminPanel.classList.remove('active');
            document.body.classList.remove('admin-mode');
        }
    }

    // 영상 추가
    addVideo() {
        const title = document.getElementById('video-title').value.trim();
        const url = document.getElementById('video-url').value.trim();

        if (!title || !url) {
            alert('제목과 URL을 모두 입력해주세요.');
            return;
        }

        const videoId = this.getYouTubeVideoId(url);
        if (!videoId) {
            alert('올바른 유튜브 URL을 입력해주세요.');
            return;
        }

        // 현재 카테고리에 영상 추가
        if (!this.videos[this.currentCategory]) {
            this.videos[this.currentCategory] = [];
        }

        const newVideo = {
            id: Date.now(),
            title: title,
            url: url
        };

        this.videos[this.currentCategory].push(newVideo);
        this.saveVideos();
        this.renderCategory(this.currentCategory);

        // 폼 초기화
        document.getElementById('video-title').value = '';
        document.getElementById('video-url').value = '';

        alert('영상이 추가되었습니다!');
    }

    // 영상 삭제
    deleteVideo(category, videoId) {
        if (!confirm('정말로 이 영상을 삭제하시겠습니까?')) {
            return;
        }

        this.videos[category] = this.videos[category].filter(v => v.id !== videoId);
        this.saveVideos();
        this.renderCategory(category);
    }

    // 모든 카테고리 렌더링
    renderAllCategories() {
        Object.keys(this.videos).forEach(category => {
            this.renderCategory(category);
        });
    }

    // 특정 카테고리 렌더링
    renderCategory(category) {
        const grid = document.getElementById(`grid-${category}`);
        if (!grid) {
            console.error(`Grid not found for category: ${category}`);
            return;
        }

        const videos = this.videos[category] || [];

        if (videos.length === 0) {
            grid.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-video-slash"></i>
                    <p>등록된 영상이 없습니다.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = videos.map(video => {
            const videoId = this.getYouTubeVideoId(video.url);
            if (!videoId) {
                console.warn(`Invalid YouTube URL: ${video.url}`);
                return '';
            }
            return `
                <div class="video-card">
                    <div class="video-embed">
                        <iframe
                            src="https://www.youtube.com/embed/${videoId}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    <div class="video-info">
                        <h3 class="video-title">${this.escapeHtml(video.title)}</h3>
                        <div class="video-actions">
                            <button class="btn-delete" onclick="videoLibrary.deleteVideo('${category}', ${video.id})">
                                <i class="fas fa-trash"></i> 삭제
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 페이지 로드 시 초기화
let videoLibrary;
document.addEventListener('DOMContentLoaded', () => {
    videoLibrary = new VideoLibrary();
});
