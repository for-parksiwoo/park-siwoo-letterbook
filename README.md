# 박시우 · 우리의 레터북

박시우 배우 레터북 제작을 위한 국내 서포터즈 참여 폼입니다. 정적 GitHub Pages 화면과 Google Apps Script를 연결해 응답을 Google Sheet에 바로 저장합니다.

## 파일 구성

```text
park-siwoo-letterbook/
├── index.html                    # 참여 폼
├── styles.css                    # 레터북 디자인
├── form.js                       # 글자 수·필수 항목·제출 처리
├── config.js                     # Google Apps Script 주소 입력
├── .nojekyll                     # GitHub Pages 설정
└── google-apps-script/
    └── Code.gs                   # Google Sheet 저장 프로그램
```

## Google Sheet 연결

1. Google Drive에서 빈 Google Sheet를 만들고 이름을 `박시우 레터북 응답`으로 정합니다.
2. 시트 상단에서 `확장 프로그램` → `Apps Script`를 엽니다.
3. 기본 코드를 모두 지우고 `google-apps-script/Code.gs`의 내용을 붙여넣은 뒤 저장합니다.
4. 함수 선택 메뉴에서 `setupSheet`를 선택하고 `실행`합니다. 처음 한 번은 Google 권한 승인이 필요합니다.
5. 오른쪽 위 `배포` → `새 배포` → 유형 `웹 앱`을 선택합니다.
6. 실행 계정은 `나`, 액세스 권한은 `모든 사용자`로 설정하고 배포합니다.
7. 발급된 `/exec`로 끝나는 웹 앱 URL을 복사합니다.
8. `config.js`의 빈 따옴표 안에 URL을 붙여넣습니다.

```js
window.LETTERBOOK_CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/발급된주소/exec"
};
```

Apps Script 코드를 나중에 수정했다면 `배포 관리`에서 새 버전으로 다시 배포해야 변경 내용이 적용됩니다.

## GitHub Pages 배포

1. 파일을 `for-parksiwoo/park-siwoo-letterbook` 저장소의 `main` 브랜치에 올립니다.
2. 저장소 `Settings` → `Pages`로 이동합니다.
3. Source는 `Deploy from a branch`, Branch는 `main`, 폴더는 `/(root)`를 선택합니다.
4. 배포 주소는 `https://for-parksiwoo.github.io/park-siwoo-letterbook/`입니다.

## 운영 시 확인 사항

- 공개 전 테스트 응답을 1건 제출하고 `응답` 시트의 모든 열이 채워지는지 확인합니다.
- X 아이디와 오픈채팅 닉네임은 확인용 개인정보이므로 시트 공유 권한을 운영진에게만 제한합니다.
- 제출된 답변은 운영진이 검토하고 욕설·비방·개인정보 노출 등이 있는 항목을 수록에서 제외합니다.
- 응답 모집이 끝나면 Apps Script 웹 앱 배포를 중지하거나 액세스 권한을 변경합니다.
