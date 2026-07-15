# AI PULSE — 매일의 AI 뉴스 아카이브

매일 아침 08:00 (KST) 자동 발행되는 "오늘의 AI 뉴스" 데일리 브리핑을 날짜별로 누적 보관하는 아카이브입니다.

**라이브:** https://revfactory.github.io/ai-pulse/

## 구조
- `index.html` — 아카이브 허브(모든 호를 최신순으로 나열). `tools/build-index.js`로 자동 생성됨.
- `editions/YYYY-MM-DD.html` — 그날의 AI PULSE 전체 사이트(정적 우선, JS 없이도 표시).
- `editions.json` — 발행 목록 메타데이터.
- `tools/build-index.js` — `editions.json`을 읽어 `index.html`을 재생성.
- `.nojekyll` — GitHub Pages의 Jekyll 처리 비활성화.

## 매일 자동 갱신 흐름
1. 리포 클론
2. 오늘의 AI 뉴스 리서치 후 `editions/<오늘>.html` 생성
3. `editions.json`에 오늘 호 추가
4. `node tools/build-index.js`로 인덱스 재생성
5. 커밋 & 푸시 → GitHub Pages 자동 반영

수동 인덱스 재생성: `node tools/build-index.js`
