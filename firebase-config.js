// Firebase 설정
// Firebase Console (https://console.firebase.google.com/)에서 프로젝트를 생성하고
// 여기에 실제 설정 값을 입력하세요

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화
let database = null;
let isFirebaseInitialized = false;

function initializeFirebase() {
    try {
        // Firebase가 로드되었는지 확인
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK가 로드되지 않았습니다.');
            return false;
        }

        // Firebase 설정이 유효한지 확인
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn('Firebase 설정이 필요합니다. firebase-config.js 파일을 확인하세요.');
            return false;
        }

        // Firebase 초기화
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        isFirebaseInitialized = true;
        console.log('Firebase가 성공적으로 초기화되었습니다.');
        return true;
    } catch (error) {
        console.error('Firebase 초기화 실패:', error);
        return false;
    }
}

// Firebase가 초기화되었는지 확인하는 함수
function checkFirebase() {
    return isFirebaseInitialized && database !== null;
}

// 데이터베이스 참조 가져오기
function getDatabase() {
    return database;
}
