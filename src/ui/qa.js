import {CloudAuth} from '../auth/supabase-rest.js';
import {CLOUD_URL,CLOUD_KEY} from '../auth/config.js';
import {BrowserSpeechAdapter} from '../speech-adapter/browser.js';

const auth=new CloudAuth(CLOUD_URL,CLOUD_KEY),speech=new BrowserSpeechAdapter(),root=document.querySelector('#app');
const names=['顧夜寒','陸沉','葉天','蕭戰','霍景深','蘇晚晚','姜黎','沈清秋','宋雲舒','安暖'];
let character=names[0],learnerTurns=[],conversation=[],busy=false,status='',draft='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const voiceError=code=>({'not-allowed':'麥克風權限遭拒，請檢查 Safari 網站設定。','audio-capture':'找不到麥克風。','no-speech':'沒有辨識到語音。','network':'語音辨識服務連線失敗。'}[code]||`語音辨識失敗：${code}`);
function render(){
 root.innerHTML=`<header><div class="bar"><div class="brand">TP927 <span class="version">管理者對話測試</span></div><a href="./index.html">返回首頁</a></div></header><main><h1>角色對話測試</h1><div class="notice">此頁限管理者測試角色回應。不建立訓練場次、不占每日三場、不儲存對話、不產生成績。角色目前採規則式回應，尚不是完整 AI 語意面談。</div><div class="card"><label>測試人物 <select id="character">${names.map(n=>`<option ${n===character?'selected':''}>${n}</option>`).join('')}</select></label><button class="secondary" id="reset">清除測試對話</button><p class="muted">可試問工作、轉職、時間、收入、保險及早會；多追問幾次，觀察資訊解鎖與角色一致性。</p></div><div class="chat" id="chat">${conversation.length?conversation.map(t=>`<div class="bubble ${t.role==='learner'?'me':''}">${esc(t.text)}</div>`).join(''):'<div class="bubble">你好，我們可以聊聊。</div>'}</div><div class="compose"><input id="utter" aria-label="測試對話內容" maxlength="1000" value="${esc(draft)}" placeholder="說話或輸入測試內容"><button class="secondary" id="mic" ${speech.supported?'':'disabled'}>🎙 說話</button><button class="primary" id="send" ${busy||learnerTurns.length>=40?'disabled':''}>送出</button></div><p id="status" role="status">${esc(status)}</p><button class="secondary" id="replay" ${!conversation.length||!speech.ttsSupported?'disabled':''}>播放上一句角色語音</button></main>`;
 const input=document.querySelector('#utter'),mic=document.querySelector('#mic'),indicator=document.querySelector('#status');
 const update=s=>{status=s;if(indicator.isConnected)indicator.textContent=s};
 const send=async()=>{const text=input.value.trim();if(!text||busy||learnerTurns.length>=40)return;busy=true;draft=text;update('角色正在回應…');document.querySelector('#send').disabled=true;
  try{const data=await auth.invoke('dialogue_test',{character,turns:[...learnerTurns,text]});learnerTurns.push(text);conversation=data.turns;draft='';busy=false;status=`已通過回應驗證。拒絕候選 ${data.validation.rejected} 次，安全回退 ${data.validation.fallbacks} 次。`;render();document.querySelector('#chat').scrollTop=1e8;speech.speak(conversation.at(-1).text)}catch(e){busy=false;update(e.message);document.querySelector('#send').disabled=false;return}};
 input.oninput=()=>{draft=input.value};input.onkeydown=e=>{if(e.key==='Enter')send()};document.querySelector('#send').onclick=send;
 document.querySelector('#character').onchange=e=>{speech.stop();character=e.target.value;learnerTurns=[];conversation=[];draft='';status='已更換人物，對話重新開始。';render()};
 document.querySelector('#reset').onclick=()=>{speech.stop();learnerTurns=[];conversation=[];draft='';status='已清除。';render()};
 document.querySelector('#replay').onclick=()=>{const reply=conversation.at(-1)?.text;update(reply&&speech.speak(reply)?'已要求播放角色語音。':'此裝置無法播放角色語音。')};
 mic.onclick=()=>{if(speech.recognition){speech.stop();update('正在停止收音…');return}update('正在請求麥克風…');try{speech.listen({onStart:()=>update('正在收音，請說話。'),onPartial:t=>{if(input.isConnected){input.value=t;draft=t;update('已辨識部分文字，可按送出。')}},onText:t=>{if(!input.isConnected)return;input.value=t;draft=t;speech.stop();send()},onError:e=>update(voiceError(e)),onEnd:()=>{if(mic.isConnected){mic.textContent='🎙 說話';if(status.startsWith('正在')||status.startsWith('已辨識'))update(draft?'辨識文字已留在輸入框，可按送出。':'收音結束，沒有辨識到文字。')}}});mic.textContent='停止收音'}catch(e){update(e.message)}};
}
auth.invoke('profile').then(({profile})=>{if(!profile.is_admin)throw Error('此頁僅限管理者');render()}).catch(e=>{root.innerHTML=`<main><p class="notice">${esc(e.message)}</p><a href="./index.html">返回登入頁</a></main>`});
