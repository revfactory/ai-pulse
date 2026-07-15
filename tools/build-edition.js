#!/usr/bin/env node
/*
 * build-edition.js — AI PULSE 개별 호(號) 생성기
 * data/<date>.json + tools/edition-template.html → editions/<date>.html
 * 정적 우선(static-first): 생성된 HTML은 JS 없이도 모든 콘텐츠가 보이며,
 * JS가 켜지면 "더 보기" 모달 팝업 / 출처 링크 / 로고 홈이동이 활성화된다.
 *
 * 사용법:  node tools/build-edition.js 2026-07-15
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const date = process.argv[2];
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('usage: node tools/build-edition.js YYYY-MM-DD');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', date + '.json'), 'utf8'));
const tpl = fs.readFileSync(path.join(ROOT, 'tools', 'edition-template.html'), 'utf8');

// 표시용 텍스트 이스케이프(태그 금지 영역)
const escText = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// 속성값 이스케이프( <b> 등은 그대로 두어 모달 innerHTML에서 렌더되게 함 )
const escAttr = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const [Y, M, D] = date.split('-').map(Number);
const MM = String(M).padStart(2, '0'), DD = String(D).padStart(2, '0');
const WD_EN = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const wdEn = WD_EN[new Date(Date.UTC(Y, M - 1, D)).getUTCDay()];

function modalAttrs(o){
  return `data-modal data-cat="${escAttr(o.cat)}" data-catclass="${escAttr(o.catClass)}" `
       + `data-title="${escAttr(o.title)}" data-src="${escAttr(o.src)}" data-url="${escAttr(o.url)}" `
       + `data-detail="${escAttr(o.detail || o.body)}"`;
}
function sourceFoot(o){
  return `<div class="foot"><a class="src" href="${escAttr(o.url)}" target="_blank" rel="noopener" `
       + `onclick="event.stopPropagation()">출처 · ${escText(o.src)} ↗</a>`
       + `<span class="more">더 보기 →</span></div>`;
}

// FEATURE
const f = data.feature;
const featKeys = (f.keys || []).map(k => `<span class="kbig"><b>${escText(k[0])}</b> ${escText(k[1])}</span>`).join('\n          ');
const FEATURE =
`      <div class="feature reveal tilt" ${modalAttrs(f)}>
        <div class="rank">01</div>
        <div class="cat ${f.catClass}">${escText(f.cat)}</div>
        <h3>${escText(f.title)}</h3>
        <p>${f.body}</p>
        <div class="keys">${featKeys}</div>
        ${sourceFoot(f)}
      </div>`;

// CARDS
const CARDS = data.stories.map((s, i) =>
`      <article class="card tilt reveal" ${modalAttrs(s)}><span class="glowdot"></span>
        <div class="idx">/ ${String(i + 2).padStart(2, '0')}</div>
        <div class="cat ${s.catClass}">${escText(s.cat)}</div>
        <h4>${escText(s.title)}</h4>
        <p>${s.body}</p>
        ${sourceFoot(s)}
      </article>`).join('\n\n');

// STATS
const STATS = data.stats.map(s =>
`      <div class="stat reveal"><div class="num" data-n="${escAttr(s.n)}" data-suf="${escAttr(s.suf || '')}">${escText(s.n)}${s.suf ? `<span class="u">${escText(s.suf)}</span>` : ''}</div><div class="lab">${escText(s.lab)}</div></div>`
).join('\n');

// TIMELINE
const TIMELINE = data.timeline.map(t =>
`      <div class="tl-row reveal"><div class="tl-time">${escText(t.time)}</div><div class="tl-body"><h5>${escText(t.title)}</h5><p>${escText(t.desc)}</p></div></div>`
).join('\n');

// TICKER (내용 × 2로 무한 슬라이드)
const tickOne = data.ticker.map(t => `    <span>◈ ${t}</span>`).join('\n');
const TICKER = tickOne + '\n' + tickOne;

// HERO (3줄, 가운데 줄은 그라디언트)
const h = data.hero;
const HERO =
`      <span class="l"><span>${escText(h[0])}</span></span>
      <span class="l"><span class="grad">${escText(h[1])}</span></span>
      <span class="l"><span>${escText(h[2])}</span></span>`;

const repl = {
  '{{TITLE}}': `AI PULSE · ${Y}.${MM}.${DD} — 오늘의 AI 뉴스`,
  '{{DESC}}': escAttr(data.desc || `${Y}년 ${M}월 ${D}일 오늘의 AI 뉴스 브리핑.`),
  '{{LOADER_DATE}}': `${Y}.${MM}.${DD}`,
  '{{TICKER}}': TICKER,
  '{{DATELABEL}}': escText(data.dateLabel),
  '{{HERO}}': HERO,
  '{{HEROSUB}}': data.heroSub,
  '{{DATECHIP}}': `${MM}.${DD}`,
  '{{FEATURE}}': FEATURE,
  '{{CARDS}}': CARDS,
  '{{STATS}}': STATS,
  '{{TLHEAD}}': `${MM}.${DD}의 궤적`,
  '{{TLSUB}}': escText(data.timelineSub || '하루를 관통한 사건의 순서.'),
  '{{TIMELINE}}': TIMELINE,
  '{{FOOTERDATE}}': `${Y}.${MM}.${DD}`,
  '{{CLOCK}}': `${Y}·${MM}·${DD}·${wdEn}`,
};

let out = tpl;
for (const [k, v] of Object.entries(repl)) out = out.split(k).join(v);

const leftover = out.match(/\{\{[A-Z_]+\}\}/g);
if (leftover) { console.error('미치환 토큰:', leftover); process.exit(1); }

fs.writeFileSync(path.join(ROOT, 'editions', date + '.html'), out, 'utf8');
console.log(`editions/${date}.html 생성 완료 — 카드 ${data.stories.length}개 + 피처 1`);
