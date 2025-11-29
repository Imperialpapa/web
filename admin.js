// 관리자 모드 관리 클래스
class AdminMode {
    constructor() {
        this.isAdminMode = false;
        this.password = 'admin12'; // 관리자 비밀번호 (실제 사용 시 더 안전하게 관리해야 함)
        this.contentData = null;
        this.init();
    }

    init() {
        // 관리자 모드 UI 생성
        this.createAdminUI();

        // 이벤트 리스너 등록
        this.attachEventListeners();
    }

    createAdminUI() {
        // 관리자 모드 버튼 추가
        const adminButton = document.createElement('button');
        adminButton.id = 'admin-toggle';
        adminButton.className = 'admin-toggle-btn';
        adminButton.innerHTML = '<i class="fas fa-lock"></i>';
        adminButton.title = '관리자 모드';
        document.body.appendChild(adminButton);

        // 관리자 패널 추가
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-panel-content">
                <div class="admin-header">
                    <h3><i class="fas fa-shield-alt"></i> 관리자 모드</h3>
                    <button class="admin-close" id="admin-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="admin-body">
                    <p class="admin-status">편집 모드가 <span class="status-text">비활성화</span>되었습니다</p>
                    <div class="admin-actions">
                        <button class="admin-btn" id="save-content">
                            <i class="fas fa-save"></i> 변경사항 저장
                        </button>
                        <button class="admin-btn" id="download-json">
                            <i class="fas fa-download"></i> JSON 다운로드
                        </button>
                        <button class="admin-btn" id="upload-json-trigger">
                            <i class="fas fa-upload"></i> JSON 업로드
                        </button>
                        <input type="file" id="upload-json" accept=".json" style="display: none;">
                        <button class="admin-btn admin-btn-danger" id="reset-content">
                            <i class="fas fa-undo"></i> 초기화
                        </button>
                    </div>
                    <div class="admin-info">
                        <p><i class="fas fa-info-circle"></i> 편집 가능한 텍스트를 클릭하여 수정하세요</p>
                        <p><i class="fas fa-lightbulb"></i> 변경사항을 저장한 후 JSON을 다운로드하세요</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(adminPanel);
    }

    attachEventListeners() {
        // 관리자 모드 토글 버튼
        const adminToggle = document.getElementById('admin-toggle');
        adminToggle.addEventListener('click', () => this.requestPassword());

        // 패널 닫기 버튼
        const adminClose = document.getElementById('admin-close');
        adminClose.addEventListener('click', () => this.closeAdminPanel());

        // 저장 버튼
        const saveBtn = document.getElementById('save-content');
        saveBtn.addEventListener('click', () => this.saveContent());

        // JSON 다운로드 버튼
        const downloadBtn = document.getElementById('download-json');
        downloadBtn.addEventListener('click', () => this.downloadJSON());

        // JSON 업로드 버튼
        const uploadTrigger = document.getElementById('upload-json-trigger');
        const uploadInput = document.getElementById('upload-json');
        uploadTrigger.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', (e) => this.uploadJSON(e));

        // 초기화 버튼
        const resetBtn = document.getElementById('reset-content');
        resetBtn.addEventListener('click', () => this.resetContent());
    }

    requestPassword() {
        const userPassword = prompt('관리자 비밀번호를 입력하세요:');

        if (userPassword === this.password) {
            this.enableAdminMode();
        } else if (userPassword !== null) {
            alert('비밀번호가 올바르지 않습니다.');
        }
    }

    enableAdminMode() {
        this.isAdminMode = true;

        // 관리자 패널 표시
        const panel = document.getElementById('admin-panel');
        panel.classList.add('active');

        // 토글 버튼 아이콘 변경
        const toggleBtn = document.getElementById('admin-toggle');
        toggleBtn.innerHTML = '<i class="fas fa-unlock"></i>';
        toggleBtn.classList.add('active');

        // 상태 텍스트 업데이트
        const statusText = document.querySelector('.status-text');
        statusText.textContent = '활성화';
        statusText.style.color = '#4caf50';

        // 편집 가능한 요소들 활성화
        this.makeContentEditable();

        console.log('관리자 모드가 활성화되었습니다.');
    }

    disableAdminMode() {
        this.isAdminMode = false;

        // 관리자 패널 숨기기
        const panel = document.getElementById('admin-panel');
        panel.classList.remove('active');

        // 토글 버튼 아이콘 변경
        const toggleBtn = document.getElementById('admin-toggle');
        toggleBtn.innerHTML = '<i class="fas fa-lock"></i>';
        toggleBtn.classList.remove('active');

        // 편집 불가능하게 변경
        this.makeContentNonEditable();

        console.log('관리자 모드가 비활성화되었습니다.');
    }

    closeAdminPanel() {
        const panel = document.getElementById('admin-panel');
        panel.classList.remove('active');
    }

    makeContentEditable() {
        // Hero 섹션
        const heroTitle = document.querySelector('.hero-title');
        const heroDesc = document.querySelector('.hero-description');
        const heroPrimaryBtn = document.querySelector('.hero-buttons .btn-primary');
        const heroSecondaryBtn = document.querySelector('.hero-buttons .btn-secondary');

        this.setEditable(heroTitle);
        this.setEditable(heroDesc);
        this.setEditable(heroPrimaryBtn);
        this.setEditable(heroSecondaryBtn);

        // About 섹션
        const aboutTitle = document.querySelector('#about .section-title');
        const aboutSubtitle = document.querySelector('#about .section-subtitle');
        const aboutHeading = document.querySelector('.about-text h3');
        const aboutDesc = document.querySelector('.about-text > p');

        this.setEditable(aboutTitle);
        this.setEditable(aboutSubtitle);
        this.setEditable(aboutHeading);
        this.setEditable(aboutDesc);

        // About 통계
        const statNumbers = document.querySelectorAll('.stat-number');
        const statLabels = document.querySelectorAll('.stat-label');
        statNumbers.forEach(el => this.setEditable(el));
        statLabels.forEach(el => this.setEditable(el));

        // Projects 섹션
        const projectsTitle = document.querySelector('#projects .section-title');
        const projectsSubtitle = document.querySelector('#projects .section-subtitle');

        this.setEditable(projectsTitle);
        this.setEditable(projectsSubtitle);

        // 각 프로젝트 카드
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const title = card.querySelector('.project-title');
            const desc = card.querySelector('.project-description');
            const techTags = card.querySelectorAll('.tech-tag');

            this.setEditable(title);
            this.setEditable(desc);
            techTags.forEach(tag => this.setEditable(tag));
        });

        // Skills 섹션
        const skillsTitle = document.querySelector('#skills .section-title');
        const skillsSubtitle = document.querySelector('#skills .section-subtitle');

        this.setEditable(skillsTitle);
        this.setEditable(skillsSubtitle);

        // 각 스킬 카테고리
        const categoryTitles = document.querySelectorAll('.category-title');
        const skillNames = document.querySelectorAll('.skill-name');

        categoryTitles.forEach(el => this.setEditable(el));
        skillNames.forEach(el => this.setEditable(el));

        // Contact 섹션
        const contactTitle = document.querySelector('#contact .section-title');
        const contactSubtitle = document.querySelector('#contact .section-subtitle');

        this.setEditable(contactTitle);
        this.setEditable(contactSubtitle);

        // Contact 정보
        const contactDetails = document.querySelectorAll('.contact-details p');
        contactDetails.forEach(el => this.setEditable(el));

        // Footer
        const footerText = document.querySelector('.footer-text p');
        this.setEditable(footerText);
    }

    makeContentNonEditable() {
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.contentEditable = 'false';
            el.classList.remove('editable');
        });
    }

    setEditable(element) {
        if (element) {
            element.contentEditable = 'true';
            element.classList.add('editable');
        }
    }

    saveContent() {
        if (!this.isAdminMode) {
            alert('관리자 모드가 활성화되지 않았습니다.');
            return;
        }

        // 현재 페이지의 모든 편집된 내용을 수집
        const updatedContent = {
            hero: {
                title: document.querySelector('.hero-title').innerHTML,
                description: document.querySelector('.hero-description').textContent,
                primaryButton: document.querySelector('.hero-buttons .btn-primary').textContent,
                secondaryButton: document.querySelector('.hero-buttons .btn-secondary').textContent
            },
            about: {
                title: document.querySelector('#about .section-title').textContent,
                subtitle: document.querySelector('#about .section-subtitle').textContent,
                heading: document.querySelector('.about-text h3').textContent,
                description: document.querySelector('.about-text > p').textContent,
                stats: Array.from(document.querySelectorAll('.stat-item')).map(item => ({
                    number: item.querySelector('.stat-number').textContent,
                    label: item.querySelector('.stat-label').textContent
                }))
            },
            projects: {
                title: document.querySelector('#projects .section-title').textContent,
                subtitle: document.querySelector('#projects .section-subtitle').textContent,
                items: Array.from(document.querySelectorAll('.project-card')).map(card => ({
                    icon: card.querySelector('.project-image i').className.split(' ').pop(),
                    title: card.querySelector('.project-title').textContent,
                    description: card.querySelector('.project-description').textContent,
                    techStack: Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent),
                    demoLink: card.querySelector('.project-links a:first-child').getAttribute('href'),
                    codeLink: card.querySelector('.project-links a:last-child').getAttribute('href')
                }))
            },
            skills: {
                title: document.querySelector('#skills .section-title').textContent,
                subtitle: document.querySelector('#skills .section-subtitle').textContent,
                categories: Array.from(document.querySelectorAll('.skills-category')).map(category => ({
                    title: category.querySelector('.category-title').textContent,
                    items: Array.from(category.querySelectorAll('.skill-item')).map(item => ({
                        icon: item.querySelector('.skill-icon i').className,
                        name: item.querySelector('.skill-name').textContent,
                        level: parseInt(item.querySelector('.skill-progress').getAttribute('data-width'))
                    }))
                }))
            },
            contact: {
                title: document.querySelector('#contact .section-title').textContent,
                subtitle: document.querySelector('#contact .section-subtitle').textContent,
                info: {
                    email: document.querySelectorAll('.contact-details p')[0].textContent,
                    phone: document.querySelectorAll('.contact-details p')[1].textContent,
                    location: document.querySelectorAll('.contact-details p')[2].textContent
                }
            },
            footer: {
                copyright: document.querySelector('.footer-text p').innerHTML
            }
        };

        this.contentData = updatedContent;

        alert('변경사항이 저장되었습니다! 이제 JSON을 다운로드하세요.');
        console.log('저장된 콘텐츠:', updatedContent);
    }

    downloadJSON() {
        if (!this.contentData) {
            alert('먼저 변경사항을 저장해주세요.');
            return;
        }

        const dataStr = JSON.stringify(this.contentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'content.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('JSON 파일이 다운로드되었습니다!');
    }

    uploadJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);

                // content.json 파일로 페이지 업데이트
                if (window.loadContentFromData) {
                    window.loadContentFromData(content);
                    this.contentData = content;
                    alert('JSON 파일이 업로드되어 페이지에 적용되었습니다!');
                } else {
                    alert('페이지를 새로고침한 후 다시 시도해주세요.');
                }
            } catch (error) {
                alert('JSON 파일 형식이 올바르지 않습니다.');
                console.error('JSON 파싱 에러:', error);
            }
        };
        reader.readAsText(file);

        // 파일 입력 초기화
        event.target.value = '';
    }

    resetContent() {
        if (confirm('정말로 모든 변경사항을 초기화하시겠습니까?')) {
            location.reload();
        }
    }
}

// 페이지 로드 시 관리자 모드 초기화
window.addEventListener('DOMContentLoaded', () => {
    window.adminMode = new AdminMode();
});
