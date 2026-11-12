// Cole aqui a URL /exec da implantação do Apps Script.
window.MOVE_API_URL='COLE_AQUI_URL_DO_APPS_SCRIPT_EXEC';
window.moveApi=async function(payload){
 const url=window.MOVE_API_URL;
 if(!url||url.includes('COLE_AQUI'))throw Error('Configure MOVE_API_URL em connect.js');
 if(['banners','eventos','ping'].includes(payload.action)){
   return new Promise((resolve,reject)=>{const cb='moveCb'+Date.now()+Math.floor(Math.random()*9999);const s=document.createElement('script');const timer=setTimeout(()=>{cleanup();reject(Error('Tempo esgotado'))},16000);function cleanup(){clearTimeout(timer);delete window[cb];s.remove()};window[cb]=r=>{cleanup();r.ok?resolve(r):reject(Error(r.error||'Erro'))};s.onerror=()=>{cleanup();reject(Error('Falha de conexão'))};s.src=url+'?'+new URLSearchParams({...payload,callback:cb});document.head.appendChild(s)})
 }
 const r=await fetch(url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
 const j=await r.json();if(!j.ok)throw Error(j.error||'Erro de comunicação');return j;
};
