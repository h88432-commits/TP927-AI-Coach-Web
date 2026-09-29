export class BrowserSpeechAdapter {
 constructor(){this.Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;this.supported=Boolean(this.Recognition&&globalThis.speechSynthesis);this.recognition=null}
 listen({onText,onError,onEnd}){if(!this.Recognition)throw Error('此瀏覽器目前不支援即時語音辨識');const r=new this.Recognition();r.lang='zh-TW';r.continuous=false;r.interimResults=false;r.onresult=e=>onText(e.results[e.results.length-1][0].transcript);r.onerror=e=>onError(e.error);r.onend=onEnd;this.recognition=r;r.start()}
 stop(){this.recognition?.stop()}
 speak(text){if(!globalThis.speechSynthesis)return false;globalThis.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';u.rate=1;globalThis.speechSynthesis.speak(u);return true}
}
export class RealtimeSpeechAdapter {async listen(){throw Error('尚未配置 Realtime provider')}async speak(){throw Error('尚未配置 Realtime provider')}}
