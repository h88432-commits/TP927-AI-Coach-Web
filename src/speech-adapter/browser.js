export class BrowserSpeechAdapter {
 constructor(){this.Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;this.supported=Boolean(this.Recognition);this.ttsSupported=Boolean(globalThis.speechSynthesis&&globalThis.SpeechSynthesisUtterance);this.recognition=null}
 listen({onStart=()=>{},onText,onPartial=()=>{},onError,onEnd=()=>{}}){
  if(!this.Recognition)throw Error('此瀏覽器目前不支援即時語音辨識');
  if(this.recognition)throw Error('正在收音，請先停止');
  const r=new this.Recognition();r.lang='zh-TW';r.continuous=false;r.interimResults=true;
  r.onstart=onStart;
  let delivered=false;
  r.onresult=e=>{const result=e.results[e.results.length-1],transcript=result?.[0]?.transcript?.trim();if(!transcript||delivered)return;if(result.isFinal===false)onPartial(transcript);else{delivered=true;onText(transcript)}};
  r.onerror=e=>onError(e.error||'unknown');
  r.onend=()=>{if(this.recognition===r)this.recognition=null;onEnd()};
  this.recognition=r;
  try{r.start()}catch(e){this.recognition=null;throw e}
 }
 stop(){this.recognition?.stop()}
 speak(text){if(!this.ttsSupported)return false;try{globalThis.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';u.rate=1;globalThis.speechSynthesis.speak(u);return true}catch{return false}}
}
export class RealtimeSpeechAdapter {async listen(){throw Error('尚未配置 Realtime provider')}async speak(){throw Error('尚未配置 Realtime provider')}}
