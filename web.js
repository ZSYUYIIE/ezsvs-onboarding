'use strict';
const $=id=>document.getElementById(id),build=window.EZSVS_BUILD,query=new URLSearchParams(location.search);
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
window.ezsvsSettings={touch:mobile||query.get('touch')==='1',lowPower:mobile,qa:query.get('qa')==='1'&&['localhost','127.0.0.1'].includes(location.hostname),name:'',language:webLanguage};
window.ezsvsErrors=[];window.addEventListener('error',e=>window.ezsvsErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.ezsvsErrors.push(String(e.reason)));
let instance,toastTimer,starting=false;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
window.ezsvsDownload=(blob,name)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);};
function send(method){if(instance)instance.SendMessage('EZSVSGame',method);}
function closeMenu(){$('menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');$('unity-canvas').focus();}
$('menu-toggle').onclick=()=>{const open=$('menu').hidden;$('menu').hidden=!open;$('menu-toggle').setAttribute('aria-expanded',String(open));if(open)send('WebBlur');};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else {await $('app').requestFullscreen();if(mobile&&screen.orientation?.lock)await screen.orientation.lock('landscape').catch(()=>{});}}catch(e){toast(tr('浏览器暂不支持全屏，请使用横屏窗口。'));}closeMenu();};
function validSave(raw){if(!raw||raw.length>2000000)throw Error(tr('存档为空或过大'));const e=JSON.parse(raw),s=JSON.parse(e.payload);let h=2166136261;for(const b of new TextEncoder().encode(e.payload))h=Math.imul(h^b,16777619)>>>0;if(h.toString(16).toUpperCase().padStart(8,'0')!==e.checksum)throw Error(tr('存档校验失败'));if(s.schema!==3||!Array.isArray(s.rules)||s.rules.length!==21||s.stage<0||s.stage>5||s.step<0||s.step>100||!Array.isArray(s.found)||!Array.isArray(s.log))throw Error(tr('不是本游戏的有效存档'));return raw;}
$('export').onclick=()=>{send('WebSave');try{const raw=validSave(localStorage.getItem('ezsvs-onboarding:v1:0'));ezsvsDownload(new Blob([raw],{type:'application/json'}),'EZSVS-progress.json');toast(tr('存档已交给浏览器下载。'));}catch(e){toast(tr('尚无有效培训存档，请先开始培训。'));}closeMenu();};
$('import').onclick=()=>$('save-file').click();
$('save-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error(tr('存档过大'));const raw=validSave(await file.text());if(!confirm(tr('导入后将恢复这份培训进度，并替换当前浏览器进度。继续吗？')))return;const key='ezsvs-onboarding:v1:0',old=localStorage.getItem(key);if(old)localStorage.setItem(key+':backup',old);localStorage.setItem(key,raw);location.reload();}catch(err){toast(tr('无法导入：')+err.message);}finally{e.target.value='';}};
$('help').onclick=()=>{$('help-dialog').showModal();send('WebBlur');};$('help-close').onclick=()=>{$('help-dialog').close();closeMenu();};
$('reload').onclick=()=>{send('WebSave');location.reload();};
window.addEventListener('ezsvs-saved',()=>{$('save-state').textContent=tr('已保存到本机 · ')+new Date().toLocaleTimeString();});
window.addEventListener('ezsvs-save-error',()=>toast(tr('浏览器未能保存进度。请导出存档，避免清理浏览器数据。')));
document.addEventListener('visibilitychange',()=>{if(document.hidden)send('WebBlur');});window.addEventListener('blur',()=>send('WebBlur'));window.addEventListener('pagehide',()=>send('WebSave'));
const canvas=$('unity-canvas');canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
function progress(value,message){$('progress').value=value;$('status').textContent=message;}
async function dataURL(){
 // The packer splits large compressed data into Git-friendly parts, all hosted on the same Pages origin.
 if(!build.parts)return build.data;
 const chunks=[];let bytes=0;for(const part of build.parts){const r=await fetch(part.url);if(!r.ok)throw Error(tr('素材下载失败：')+r.status);const data=await r.arrayBuffer();if(data.byteLength!==part.bytes)throw Error(tr('素材分片不完整，请重试'));chunks.push(data);bytes+=data.byteLength;progress(.72*bytes/build.dataBytes,tr('加载场景素材 ')+Math.round(bytes/1048576)+' / '+Math.round(build.dataBytes/1048576)+' MB');}
 return URL.createObjectURL(new Blob(chunks,{type:'application/octet-stream'}));
}
async function start(){if(starting)return;starting=true;$('launch').disabled=true;$('name').disabled=true;$('quality').disabled=true;$('language').disabled=true;$('loading').hidden=false;$('error').hidden=true;
 try{
  if(location.protocol==='file:')throw Error(tr('请通过本地预览服务或 GitHub Pages 链接打开，不能直接双击 HTML。'));
  const probe=document.createElement('canvas');if(!probe.getContext('webgl2'))throw Error(tr('此浏览器未启用 WebGL 2。请使用最新版 Chrome 或 Edge，并检查硬件加速。'));
  const q=$('quality').value;ezsvsSettings.lowPower=q==='balanced'||q==='auto'&&mobile;ezsvsSettings.name=$('name').value.trim();
  progress(.02,tr('准备图形引擎…'));const data=await dataURL();
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=build.loader;s.onload=resolve;s.onerror=()=>reject(Error(tr('引擎加载失败，请检查网络后重试')));document.body.appendChild(s);});
  const maxWidth=ezsvsSettings.lowPower?1440:1920,ratio=Math.max(.65,Math.min(devicePixelRatio||1,ezsvsSettings.lowPower?1:1.25,maxWidth/innerWidth));
  instance=await createUnityInstance(canvas,{dataUrl:data,frameworkUrl:build.framework,codeUrl:build.code,streamingAssetsUrl:'StreamingAssets',companyName:build.company,productName:build.product,productVersion:build.version,devicePixelRatio:ratio,matchWebGLToCanvasSize:true,cacheControl:url=>url.startsWith('blob:')?'no-store':'must-revalidate',showBanner:(m,t)=>{if(t==='error'){ezsvsErrors.push(m);console.error(m);toast(tr('运行异常，请从网页菜单保存进度后重新加载。'));}}},p=>progress(build.parts ? .72+.28*p : p,tr('正在展开场景与人物… ')+Math.round(p*100)+'%'));
  window.ezsvsInstance=instance;$('welcome').hidden=true;$('toolbar').hidden=false;canvas.focus();if(data.startsWith('blob:'))URL.revokeObjectURL(data);
 }catch(e){const reason=typeof e?.message==='string'&&e.message!=='undefined'?e.message:tr('浏览器未能启动三维引擎。请更新 Chrome，选择均衡画质并关闭其他大应用后重试。');$('error').textContent=tr('无法进入：')+reason+tr('\n可刷新重试；尚未开始的培训不会计入成绩。');$('error').hidden=false;$('launch').disabled=false;$('launch').textContent=tr('重试加载');starting=false;$('name').disabled=false;$('quality').disabled=false;$('language').disabled=false;}
}
$('launch').onclick=start;if(ezsvsSettings.qa)setTimeout(start,100);

function changeLanguage(language){
 if(language===webLanguage)return;
 send('WebSave');try{localStorage.setItem('ezsvs-language',language);}catch(e){}
 if(instance){const url=new URL(location.href);url.searchParams.set('lang',language);location.href=url.href;}
 else {webLanguage=language;ezsvsSettings.language=language;applyWebLanguage();const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);}
}
$('language').onchange=e=>changeLanguage(e.target.value);
$('switch-language').onclick=()=>changeLanguage(webLanguage==='en'?'zh':'en');
