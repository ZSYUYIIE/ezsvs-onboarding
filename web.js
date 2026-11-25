'use strict';
const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
const build=window.EZSVS_BUILD=EZSVSAssets.selectBuild(window.EZSVS_BUILDS,window.EZSVS_BUILD);
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
window.ezsvsSettings={touch:mobile||query.get('touch')==='1',lowPower:mobile,qa:query.get('qa')==='1'&&['localhost','127.0.0.1'].includes(location.hostname),review:query.get('review')==='1'&&['localhost','127.0.0.1'].includes(location.hostname),name:'',language:webLanguage};
window.ezsvsErrors=[];window.addEventListener('error',e=>window.ezsvsErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.ezsvsErrors.push(String(e.reason)));
let instance,toastTimer,starting=false,displayObserver;
let qualityChoice='auto';try{const saved=localStorage.getItem('ezsvs-display-quality');if(['auto','high','balanced'].includes(saved))qualityChoice=saved;}catch(e){}
$('quality').value=qualityChoice;$('runtime-quality').value=qualityChoice;
function renderSize(width,height,dpr,quality){
 const high=quality==='high',balanced=quality==='balanced';
 const edge=high?2560:balanced?1600:2160,pixels=high?3686400:balanced?1440000:2592000;
 const density=Math.max(.5,Math.min(dpr||1,mobile?1.5:high?2:balanced?1:1.5,edge/Math.max(width,height),Math.sqrt(pixels/(width*height))));
 return {width:Math.max(1,Math.round(width*density)),height:Math.max(1,Math.round(height*density)),density};
}
function updateDisplay(){
 const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
 const size=renderSize(rect.width,rect.height,devicePixelRatio,qualityChoice);
 if(instance?.Module)instance.Module.devicePixelRatio=size.density;
 if(canvas.width!==size.width)canvas.width=size.width;if(canvas.height!==size.height)canvas.height=size.height;
 window.ezsvsDisplay={...(window.ezsvsDisplay||{}),cssWidth:rect.width,cssHeight:rect.height,renderWidth:size.width,renderHeight:size.height,density:size.width/rect.width,quality:qualityChoice};
}
function chooseQuality(value){qualityChoice=value;$('quality').value=value;$('runtime-quality').value=value;try{localStorage.setItem('ezsvs-display-quality',value);}catch(e){}if(instance)updateDisplay();}
$('quality').onchange=e=>chooseQuality(e.target.value);
$('runtime-quality').onchange=e=>{chooseQuality(e.target.value);closeMenu();};
window.ezsvsRenderSize=renderSize;
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
const stageAreas=build.stageAreas||[];
const courseAreas=[...new Set(stageAreas)];
const preparedAreas=new Set();
let currentArea,backgroundArea,startupAreaJob;
function storedProgress(){
 for(const key of ['ezsvs-onboarding:v1:0','ezsvs-onboarding:v1:0:backup']){
  try{return JSON.parse(JSON.parse(validSave(localStorage.getItem(key))).payload);}
  catch(error){}
 }
 return null;
}
function canPrepare(){
 const connection=navigator.connection;
 return !ezsvsSettings.qa&&!ezsvsSettings.review&&!document.hidden
  &&!connection?.saveData&&!['2g','slow-2g'].includes(connection?.effectiveType);
}
function areaDownloads(area){
 return (build.areaBundles?.[area]||[]).filter(name=>build.bundles?.[name]&&!EZSVSAssets.stats.loadedBundles.includes(name));
}
function nextUnpreparedArea(){
 return courseAreas.slice(courseAreas.indexOf(currentArea)+1).find(area=>!preparedAreas.has(area));
}
async function prepareUpcomingArea(){
 if(!currentArea||backgroundArea||startupAreaJob||!canPrepare())return;
 const area=nextUnpreparedArea();
 if(!area)return;
 backgroundArea=area;
 const complete=await EZSVSAssets.prefetch(areaDownloads(area),()=>canPrepare()&&nextUnpreparedArea()===area);
 if(complete)preparedAreas.add(area);
 backgroundArea=null;
}
window.addEventListener('ezsvs-saved',()=>{
 $('save-state').textContent=tr('已保存到本机 · ')+new Date().toLocaleTimeString();
 if(!canPrepare())return;
 const save=storedProgress();
 if(!save||save.finished)currentArea=null;
 else if(save.place===stageAreas[save.stage])currentArea=save.place;
 void prepareUpcomingArea();
});
window.addEventListener('ezsvs-save-error',()=>toast(tr('浏览器未能保存进度。请导出存档，避免清理浏览器数据。')));
document.addEventListener('visibilitychange',()=>{if(document.hidden)send('WebBlur');});window.addEventListener('blur',()=>send('WebBlur'));window.addEventListener('pagehide',()=>send('WebSave'));
const canvas=$('unity-canvas');canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
function progress(value,message){
 const bar=$('progress'),next=Math.max(bar.value,value);
 if(next!==bar.value)bar.value=next;
 $('status').textContent=message;
}
let gameReady=false;
window.addEventListener('ezsvs-ready',()=>{gameReady=true;performance.mark('ezsvs-opening-ready');});
async function waitForOpening(showOpening){
 if(!build.bundles||gameReady)return;
 showOpening();
 let lastActivity=performance.now();
 while(!gameReady&&!EZSVSAssets.hasFailedBundle()&&!ezsvsErrors.length){
  // Give Unity control if a local decode or startup error stops progress.
  if(EZSVSAssets.stats.active)lastActivity=performance.now();
  else if(performance.now()-lastActivity>5000)break;
  await new Promise(resolve=>setTimeout(resolve,100));
 }
}
function prepareStartupAreas(reportOpening,reportEntry){
 if(!canPrepare())return Promise.resolve(false);
 const openingBundles=areaDownloads(courseAreas[0]);
 const opening=EZSVSAssets.prepare(openingBundles,reportOpening);
 const save=storedProgress();
 if(save?.finished)return Promise.resolve(false);
 const resumeArea=save&&stageAreas[save.stage]!==courseAreas[0]?stageAreas[save.stage]:null;
 const area=resumeArea||courseAreas[1];
 const bundles=areaDownloads(area).filter(name=>!openingBundles.includes(name));
 if(!bundles.length)return Promise.resolve(false);
 // New players have the outdoor introduction to finish the remaining lobby downloads.
 // Resume can go straight to its floor, so prepare all of that floor's bundles up front.
 const priority=resumeArea?bundles:bundles.slice(0,2),remaining=bundles.slice(priority.length);
 const priorityReady=opening.then(()=>canPrepare()&&EZSVSAssets.prepare(priority,reportEntry));
 const job=priorityReady.then(async ready=>{
  if(!ready)return;
  performance.mark('ezsvs-entry-priority-ready');
  if(remaining.length&&(!canPrepare()||!await EZSVSAssets.prepare(remaining,()=>{})))return;
  preparedAreas.add(area);
  performance.mark('ezsvs-entry-area-ready');
 });
 startupAreaJob=job;
 void job.finally(()=>{
  if(startupAreaJob===job)startupAreaJob=null;
  void prepareUpcomingArea();
 });
 return priorityReady;
}
async function waitForEntry(priorityReady){
 // Keep an optional download from indefinitely blocking an otherwise playable title.
 let timer;
 try{
  await Promise.race([priorityReady,new Promise(resolve=>{timer=setTimeout(resolve,10000);})]);
 }finally{clearTimeout(timer);}
}
async function dataURL(){
 // The packer splits large compressed data into Git-friendly parts, all hosted on the same Pages origin.
 if(!build.parts)return build.data;
 return EZSVSAssets.file({parts:build.parts,bytes:build.dataBytes},(bytes,total)=>progress(.02+.61*bytes/total,tr('加载场景素材 ')+Math.round(bytes/1048576)+' / '+Math.round(total/1048576)+' MB'));
}
let unityLoader;
function loadUnityLoader(){
 if(!unityLoader)unityLoader=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=build.loader;
  script.onload=resolve;
  script.onerror=()=>{script.remove();reject(Error(tr('引擎加载失败，请检查网络后重试')));};
  document.body.appendChild(script);
 }).catch(error=>{unityLoader=null;throw error;});
 return unityLoader;
}
async function start(){if(starting)return;starting=true;$('launch').disabled=true;$('name').disabled=true;$('quality').disabled=true;$('language').disabled=true;$('loading').hidden=false;$('error').hidden=true;
 let data;
 const preloads=[];
 try{
  if(location.protocol==='file:')throw Error(tr('请通过本地预览服务或 GitHub Pages 链接打开，不能直接双击 HTML。'));
  const probe=document.createElement('canvas');if(!probe.getContext('webgl2'))throw Error(tr('此浏览器未启用 WebGL 2。请使用最新版 Chrome 或 Edge，并检查硬件加速。'));
  const q=$('quality').value;chooseQuality(q);ezsvsSettings.lowPower=mobile||q==='balanced';ezsvsSettings.name=$('name').value.trim();
  $('progress').value=0;
  progress(.02,tr('准备图形引擎…'));
  performance.mark('ezsvs-startup-start');
  const sceneData=dataURL().then(url=>{data=url;performance.mark('ezsvs-core-data-ready');});
  for(const url of [build.framework,build.code]){
   const link=document.createElement('link');
   link.rel='preload';link.as='fetch';link.crossOrigin='anonymous';link.href=url;
   document.head.appendChild(link);preloads.push(link);
  }
  const [sceneResult,loaderResult]=await Promise.allSettled([sceneData,loadUnityLoader()]);
  if(sceneResult.status==='rejected')throw sceneResult.reason;
  if(loaderResult.status==='rejected')throw loaderResult.reason;
  let openingProgress=0,entryProgress=0,waitingForOpening=false,waitingForEntry=false;
  const showOpening=()=>progress(.75+.12*openingProgress,tr('正在准备开场人物与场景…'));
  const showEntry=()=>progress(.88+.11*entryProgress,tr('正在准备培训场景… '));
  const priorityReady=prepareStartupAreas((done,total)=>{
   openingProgress=done/total;
   if(waitingForOpening)showOpening();
  },(done,total)=>{
   entryProgress=done/total;
   if(waitingForEntry)showEntry();
  });
  updateDisplay();
  instance=await createUnityInstance(canvas,{dataUrl:data,frameworkUrl:build.framework,codeUrl:build.code,streamingAssetsUrl:build.streamingAssets||'StreamingAssets',companyName:build.company,productName:build.product,productVersion:build.version,devicePixelRatio:window.ezsvsDisplay.density,matchWebGLToCanvasSize:true,cacheControl:url=>url.startsWith('blob:')?'no-store':'must-revalidate',showBanner:(m,t)=>{if(t==='error'){ezsvsErrors.push(m);console.error(m);toast(tr('运行异常，请从网页菜单保存进度后重新加载。'));}}},p=>progress(build.parts ? .63+.12*p : .02+.73*p,tr('正在展开场景与人物… ')));
  performance.mark('ezsvs-unity-ready');
  window.ezsvsInstance=instance;displayObserver=new ResizeObserver(()=>updateDisplay());displayObserver.observe(canvas);window.addEventListener('resize',updateDisplay);document.addEventListener('fullscreenchange',updateDisplay);updateDisplay();
  waitingForOpening=true;
  await waitForOpening(showOpening);
  waitingForOpening=false;
  if(gameReady&&startupAreaJob){
   waitingForEntry=true;
   showEntry();
   await waitForEntry(priorityReady);
   waitingForEntry=false;
  }
  progress(1,tr('培训已就绪'));
  $('welcome').hidden=true;$('toolbar').hidden=false;canvas.focus();
 }catch(e){const reason=typeof e?.message==='string'&&e.message!=='undefined'?e.message:tr('浏览器未能启动三维引擎。请更新 Chrome，选择均衡画质并关闭其他大应用后重试。');$('error').textContent=tr('无法进入：')+reason+tr('\n可刷新重试；尚未开始的培训不会计入成绩。');$('error').hidden=false;$('launch').disabled=false;$('launch').textContent=tr('重试加载');starting=false;$('name').disabled=false;$('quality').disabled=false;$('language').disabled=false;}
 finally{
  if(data?.startsWith('blob:'))URL.revokeObjectURL(data);
  for(const link of preloads)link.remove();
 }
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

