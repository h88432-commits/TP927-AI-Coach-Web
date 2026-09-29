import {BrowserSpeechAdapter} from '../speech-adapter/browser.js';

// This is a UI and device test. It does not call the training API or create a session.
const root=document.querySelector('#app'),speech=new BrowserSpeechAdapter();
let page='home',draft='',status='尚未開始',turns=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const receipt='測試文字已收到。此頁只測試輸入與語音設備，沒有角色回應。';
const voiceError=code=>({'not-allowed':'麥克風權限遭拒，請檢查 Safari 網站設定。','audio-capture':'找不到麥克風。','no-speech':'沒有辨識到語音。','network':'語音辨識服務連線失敗。'}[code]||`語音辨識失敗：${code}`);
function shell(body){root.innerHTML=`<header><div class="bar"><div class="brand">TP927 <span class="version">介面與語音測試</span></div><a href="./index.html">正式首頁</a></div></header><main><div class="notice"><strong>這頁沒有 AI 對話。</strong>只測試麥克風、輸入、送出、返回及語音播放。要測角色回應，請使用 <a href="./qa.html">管理者角色對話測試</a>（需登入管理者，不計入每日三場）。</div>${body}</main>`}
function render(){
 if(page==='home'){
  shell(`<h1>測試首頁</h1><div class="card"><h2>角色對話測試</h2><p>由後端角色邏輯回應，可連續提問；目前仍是規則式互動。</p><p><a class="primary" href="./qa.html">進入管理者角色對話測試</a></p></div><div class="card"><h2>麥克風與介面測試</h2><p>只測返回首頁、說話轉文字、送出按鈕和裝置語音播放。重新整理會清除此頁文字。</p><button class="secondary" id="open">${turns.length?'繼續設備測試':'進入設備測試'}</button></div><p><a href="./index.html">返回正式網站</a></p>`);
  document.querySelector('#open').onclick=()=>{page='training';render()};return;
 }
 shell(`<button class="secondary" id="home">返回測試首頁</button><h1>設備測試</h1><p class="muted">送出的文字只暫留本頁；這裡不會產生 AI 回應。<a href="./qa.html">前往角色對話測試</a></p><div class="chat" id="chat">${turns.length?turns.map(t=>`<div class="bubble ${t.role==='learner'?'me':''}">${esc(t.text)}</div>`).join(''):'<div class="bubble">請說一句話，測試收音與送出。</div>'}</div><div class="compose"><input id="utter" aria-label="設備測試內容" value="${esc(draft)}" placeholder="說話或輸入測試內容"><button class="secondary" id="mic" ${speech.supported?'':'disabled'}>🎙 說話</button><button class="primary" id="send">送出測試文字</button></div><p id="mic-state" role="status">${esc(status)}</p><div class="row"><button class="secondary" id="play" ${speech.ttsSupported?'':'disabled'}>播放設備示範語音</button><button class="secondary" id="clear">清除測試文字</button></div>`);
 const input=document.querySelector('#utter'),mic=document.querySelector('#mic'),state=document.querySelector('#mic-state');
 input.oninput=()=>{draft=input.value};
 const update=s=>{status=s;if(state.isConnected)state.textContent=s};
 const send=()=>{const text=input.value.trim();if(!text)return update('請先說話或輸入文字。');speech.stop();draft='';turns.push({role:'learner',text},{role:'device',text:receipt});status='測試文字已顯示於本頁；沒有傳送到正式系統。';render()};
 document.querySelector('#send').onclick=send;
 input.onkeydown=e=>{if(e.key==='Enter')send()};
 mic.onclick=()=>{if(speech.recognition){speech.stop();update('正在停止收音…');return}update('正在請求麥克風…');try{speech.listen({onStart:()=>update('正在收音，請說一句話。'),onPartial:t=>{if(input.isConnected){input.value=t;draft=t;update('已辨識部分文字，可以按「送出測試文字」。')}},onText:t=>{if(!input.isConnected||page!=='training')return;input.value=t;draft=t;send()},onError:e=>update(voiceError(e)),onEnd:()=>{if(mic.isConnected){mic.textContent='🎙 說話';if(status.startsWith('正在')||status.startsWith('已辨識部分文字'))update(draft?'辨識文字已留在輸入框，可按「送出測試文字」。':'收音結束，沒有辨識到文字。')}}});mic.textContent='停止收音'}catch(e){update(e.message)}};
 document.querySelector('#home').onclick=()=>{page='home';speech.stop();render()};
 document.querySelector('#play').onclick=()=>update(speech.speak('你好，這是設備語音播放測試。')?'已要求播放設備示範語音。':'此裝置無法播放示範語音。');
 document.querySelector('#clear').onclick=()=>{speech.stop();turns=[];draft='';status='已清除示範對話';render()};
}
render();
