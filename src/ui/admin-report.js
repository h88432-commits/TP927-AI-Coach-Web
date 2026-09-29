import {NODES,SCRIPT_NODES,SKILLS} from '../core/rules.js';

const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const percent=(n,d)=>d?`${Math.round(n/d*100)}%`:'待複核';
const mean=a=>a.length?`${Math.round(a.reduce((x,y)=>x+y,0)/a.length)} 分`:'待複核';
const valid=s=>s.status==='completed'&&s.validated_result&&typeof s.validated_result.pass==='boolean'&&Number.isFinite(s.validated_result.score)&&Array.isArray(s.validated_result.nodes)&&s.validated_result.nodes.length===13&&Array.isArray(s.validated_result.scripts)&&s.validated_result.scripts.length===7&&Array.isArray(s.validated_result.skills)&&s.validated_result.skills.length===7;
export function dateBounds(mode,today,from='',to=''){
 if(mode==='custom')return {from,to};
 if(mode==='month')return {from:today.slice(0,7)+'-01',to:today};
 const d=new Date(`${today}T00:00:00Z`);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
 return {from:d.toISOString().slice(0,10),to:today};
}
export function filterSessions(sessions,bounds){return sessions.filter(s=>s.local_date>=bounds.from&&s.local_date<=bounds.to)}
export function reportMetrics(sessions){
 const completed=sessions.filter(valid),days=new Set(sessions.map(s=>s.local_date)).size;
 const series=(key,index)=>completed.map(s=>s.validated_result[key]?.[index]).filter(n=>Number.isFinite(n));
 return {days,sessions:sessions.length,review:sessions.filter(s=>s.status==='review_required').length,completed:completed.length,passRate:percent(completed.filter(s=>s.validated_result.pass===true).length,completed.length),skills:SKILLS.map((_,i)=>mean(series('skills',i))),nodes:NODES.map((_,i)=>percent(completed.filter(s=>s.validated_result.nodes[i]===true).length,completed.length)),scripts:SCRIPT_NODES.map((_,i)=>mean(series('scripts',i))),invite:percent(completed.filter(s=>s.validated_result.morningMeetingInviteSuccess===true).length,completed.length)};
}
const item=(label,value)=>`<div class="item"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`;
function detail(m){
 const weakNodes=m.completed?NODES.map((name,i)=>({name,rate:parseInt(m.nodes[i],10)})).filter(x=>x.rate<100).sort((a,b)=>a.rate-b.rate).slice(0,3).map(x=>x.name).join('、')||'無漏點':'待複核';
 const weakScripts=m.completed?SCRIPT_NODES.map((n,i)=>({name:NODES[n],score:parseInt(m.scripts[i],10)})).filter(x=>Number.isFinite(x.score)&&x.score<80).sort((a,b)=>a.score-b.score).slice(0,3).map(x=>x.name).join('、')||'無低於 80 分的話稿':'待複核';
 return `<div class="grid"><div class="card"><h3>7 技巧平均</h3>${SKILLS.map((x,i)=>item(x,m.skills[i])).join('')}</div><div class="card"><h3>13 節點完成率與漏點</h3><p>常見漏點：${escape(weakNodes)}</p>${NODES.map((x,i)=>item(`${i+1}. ${x}`,m.nodes[i])).join('')}</div><div class="card"><h3>7 話稿平均與弱項</h3><p>弱項：${escape(weakScripts)}</p>${SCRIPT_NODES.map((n,i)=>item(NODES[n],m.scripts[i])).join('')}</div></div>`;
}
export function renderAdminReport(data,{mode='week',today,from='',to='',person='all'}={}){
 const bounds=dateBounds(mode,today,from,to),selected=data.profiles.find(p=>p.id===person);
 const all=filterSessions(data.sessions,bounds),rows=selected?all.filter(s=>s.user_id===person):all,m=reportMetrics(rows);
 const options=data.profiles.map(p=>`<option value="${escape(p.id)}" ${p.id===person?'selected':''}>${escape(p.display_name)}</option>`).join('');
 const filters=`<div class="row admin-filters"><label>期間 <select id="admin-mode"><option value="week" ${mode==='week'?'selected':''}>本週</option><option value="month" ${mode==='month'?'selected':''}>本月</option><option value="custom" ${mode==='custom'?'selected':''}>自訂日期</option></select></label><label>成員 <select id="admin-person"><option value="all">單位總覽</option>${options}</select></label>${mode==='custom'?`<label>起 <input type="date" id="admin-from" value="${escape(from)}"></label><label>迄 <input type="date" id="admin-to" value="${escape(to)}"></label>`:''}</div>`;
 if(mode==='custom'&&(!from||!to||from>to))return filters+'<p class="notice">請選擇有效的起迄日期。</p>';
 const summary=`<p class="muted">${escape(bounds.from)} 至 ${escape(bounds.to)} · ${selected?escape(selected.display_name):'全單位'} · 僅已驗證成績納入分數統計；待複核與進行中的場次不計入。</p><div class="grid"><div class="card"><h3>練習天數 / 總場次</h3><div class="stat">${m.days} 天 / ${m.sessions} 場</div></div><div class="card"><h3>PASS rate</h3><div class="stat">${m.passRate}</div></div><div class="card"><h3>AI 早會邀約成功率（模擬結果）</h3><div class="stat">${m.invite}</div></div><div class="card"><h3>待複核</h3><div class="stat">${m.review} 場</div></div></div>`;
 const week=reportMetrics(filterSessions(data.sessions.filter(s=>s.user_id===person),dateBounds('week',today)));
 const personal=selected?`<div class="card"><h3>等級與升級進度</h3><p>LV${escape(selected.level)}${selected.lv3_completed?' · LV3 完成':''} · 升級進度：${m.completed?`${m.completed} 場已驗證，正式等級以系統記錄為準`:'待複核'}</p><p>本週練習：${week.days} 天 / ${week.sessions} 場</p><h3>每場歷史成績</h3>${rows.length?rows.map(s=>`<button class="session-row" type="button" data-admin-session="${escape(s.id)}"><span>${escape(s.local_date)} · ${escape(s.character_name)} · LV${escape(s.level)}</span><span>${valid(s)?`${escape(s.validated_result.score)} 分 · ${s.validated_result.pass?'PASS':'FAIL'}`:escape(s.status==='review_required'?'待複核':s.status)}</span><span>查看摘要 ›</span></button>`).join(''):'此期間尚無場次。'}</div>`:'';
 return filters+summary+detail(m)+personal;
}
