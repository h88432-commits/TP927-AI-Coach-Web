import {NODES,SCRIPT_NODES,SKILLS} from '../core/rules.js';
import {reportMetrics} from './admin-report.js';

const names=['顧夜寒','陸沉','葉天','蕭戰','霍景深','蘇晚晚','姜黎','沈清秋','宋雲舒','安暖'];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line=(label,value)=>`<div class="item">${escape(label)} <strong>${escape(value)}</strong></div>`;
export function learnerAbility(sessions){
 const m=reportMetrics(sessions);
 return `<h1>我的能力</h1><p class="muted">正式成績僅計入 Result Validator 已驗證場次；${m.review} 場待複核。</p><div class="grid"><div class="card"><h2>7 技巧</h2>${SKILLS.map((x,i)=>line(x,m.skills[i])).join('')}</div><div class="card"><h2>13 節點</h2>${NODES.map((x,i)=>line(x,m.nodes[i])).join('')}</div><div class="card"><h2>7 話稿</h2>${SCRIPT_NODES.map((n,i)=>line(NODES[n],m.scripts[i])).join('')}</div></div>`;
}
export function characterGallery(sessions){
 return `<h1>人物圖鑑</h1><p class="muted">遇見後解鎖；不顯示人物的隱藏需求或攻略。</p><div class="grid">${names.map(name=>{const rows=sessions.filter(s=>s.character_name===name);const official=rows.filter(s=>s.status==='completed'&&Number.isFinite(s.validated_result?.score));return `<div class="card"><h2>${rows.length?escape(name):'???'}</h2><p>遭遇 ${rows.length} 次</p><small>PASS ${official.length?official.filter(s=>s.validated_result.pass).length:'待複核'} · 最高分 ${official.length?Math.max(...official.map(s=>s.validated_result.score)):'待複核'}</small></div>`}).join('')}</div>`;
}
export function materialsPage(scripts){
 const purposes=['理解對方有意義的需求','確認自己的理解並取得認同','說明招募意願、原因與保險認識','說明保險的意義與功能','連接保險意義與公司發展','介紹公司','介紹自己','介紹單位','連接單位與收入、時間','說明何謂卓越','說明卓越解決什麼','說明卓越創造什麼','收操並邀請參加早會'];
 return `<h1>927 正式教材</h1><div class="card"><h2>完整訪綱與節點目的</h2><ol>${NODES.map((name,i)=>`<li class="item"><strong>${escape(name)}</strong><p>${escape(purposes[i])}</p></li>`).join('')}</ol><h3>兩個過橋</h3><p>保險意義 → 公司有沒有發展性 → 公司介紹；單位介紹 → 賺錢與時間／收入累積 → 卓越。</p></div>${Object.entries(scripts).map(([id,s])=>`<div class="card"><details><summary>${escape(id)} ${escape(s.title)}</summary><p style="white-space:pre-line">${escape(s.text)}</p></details></div>`).join('')}`;
}
