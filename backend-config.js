// 백엔드 설정
// 사용할 백엔드를 선택하세요: 'firebase' 또는 'supabase'

const BACKEND_CONFIG = {
    // 사용할 백엔드 선택
    provider: 'supabase', // 'firebase' 또는 'supabase'

    // 데모 모드 (백엔드 없이 localStorage만 사용)
    demoMode: false
};

// 현재 사용 중인 백엔드 제공자
function getBackendProvider() {
    return BACKEND_CONFIG.provider;
}

// 데모 모드 여부
function isDemoMode() {
    return BACKEND_CONFIG.demoMode;
}
