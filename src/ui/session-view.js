const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const statusLabel=s=>({review_required:'待複核',completed:'已驗證',active:'進行中'}[s]||s||'未知');

export function historyPage(sessions,{pendingOnly=false}={}){
 const rows=pendingOnly?sessions.filter(s=>s.status==='review_required'):sessions;
 return `<h1>${pendingOnly?'待複核紀錄':'訓練紀錄'}</h1><p class="muted">點選場次可查看個別紀錄；不提供完整錄音或逐字稿。</p>${rows.length?rows.map(s=>`<button class="session-row" type="button" data-session="${esc(s.id)}"><span>${esc(s.local_date)} · ${esc(s.character_name)} · LV${esc(s.level)}</span><span class="pill">${esc(statusLabel(s.status))}</span><span>查看紀錄 ›</span></button>`).join(''):'<div class="card">此處目前沒有場次。</div>'}`;
}

export function sessionDetailPage(s){
 const official=s.status==='completed'&&s.validatedResult;
 return `<h1>${esc(s.character)} · 單場紀錄</h1><div class="card"><div class="row"><span class="pill">${esc(statusLabel(s.status))}</span><span>LV${esc(s.level)}</span><span>${esc(s.localDate)}</span></div><p>面談時長：${s.durationMinutes===null?'待提供':`${esc(s.durationMinutes)} 分鐘`} · 學員文字對話比例：${s.talkRatio===null?'待提供':`${esc(s.talkRatio)}%`}</p><p>學員發言：${esc(s.learnerTurns)} 次</p>${official?`<h2>${s.validatedResult.pass?'PASS':'FAIL'} · ${esc(s.validatedResult.score)} 分</h2><p>已通過正式 Result Validator。</p>`:`<div class="notice"><strong>正式成績待複核</strong><p>目前的語意節點、七段話稿與七技巧評估尚未完成可靠驗證，因此不顯示推測分數、PASS/FAIL 或升級進度。這場紀錄已保留。</p></div>`}<p class="muted">此頁僅顯示摘要，不提供完整錄音或逐字稿。</p></div>`;
}
