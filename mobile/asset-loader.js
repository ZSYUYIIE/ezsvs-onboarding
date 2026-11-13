'use strict';
// Content-addressed, bounded downloads shared by startup data and streamed areas.
window.EZSVSAssets=(()=>{
 const stats=window.ezsvsAssetStats={networkBytes:0,cacheBytes:0,requests:0,retries:0,corruptions:0,active:0,maxActive:0,loadedBundles:[],cacheUnavailable:false};
 const pending=new Map(),states=new Map(),waiting=[];let slots=0;
 const cachePromise=(async()=>{try{return await caches.open('ezsvs-verified-assets-v1');}catch(e){stats.cacheUnavailable=true;return null;}})();
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 function selectBuild(variants,fallback){
  if(!variants)return fallback;
  // Select from actual GPU support, not the user-agent. Keep the existing ETC2
  // path as the fallback for devices without desktop S3TC texture support.
  const probe=document.createElement('canvas'),gl=probe.getContext('webgl2');
  const desktop=!!gl?.getExtension('WEBGL_compressed_texture_s3tc');
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  return variants[desktop?'desktop':'mobile']||fallback;
 }
 async function limited(work){if(slots>=3)await new Promise(r=>waiting.push(r));else slots++;stats.active++;stats.maxActive=Math.max(stats.maxActive,stats.active);try{return await work();}finally{stats.active--;if(waiting.length)waiting.shift()();else slots--;}}
 async function valid(bytes,part){if(bytes.byteLength!==part.bytes)return false;if(!crypto.subtle)throw Error('HTTPS is required to verify game resources');const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')===part.sha256;}
 async function partBytes(part){
  const key=new URL('__ezsvs_verified__/'+part.sha256,location.href).href,cache=await cachePromise;
  if(cache)try{const old=await cache.match(key);if(old){const bytes=await old.arrayBuffer();if(await valid(bytes,part)){stats.cacheBytes+=bytes.byteLength;return bytes;}stats.corruptions++;await cache.delete(key);}}catch(e){stats.cacheUnavailable=true;}
  for(let attempt=0;attempt<4;attempt++){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
   try{stats.requests++;const response=await fetch(part.url,{signal:controller.signal,cache:'no-store'});if(!response.ok){const error=Error('Resource HTTP '+response.status);error.permanent=response.status>=400&&response.status<500&&![408,429].includes(response.status);throw error;}
    const bytes=await response.arrayBuffer();stats.networkBytes+=bytes.byteLength;
    if(!await valid(bytes,part)){stats.corruptions++;throw Error('Resource integrity check failed');}
    if(cache)try{await cache.put(key,new Response(bytes,{headers:{'Content-Type':'application/octet-stream'}}));}catch(e){stats.cacheUnavailable=true;}
    return bytes;
   }catch(e){if(attempt===3||e.permanent)throw e;stats.retries++;await pause(500*2**attempt);}finally{clearTimeout(timer);}
  }
 }
 async function getPart(part){let promise=pending.get(part.sha256);if(!promise){promise=limited(()=>partBytes(part));pending.set(part.sha256,promise);}try{return await promise;}finally{if(pending.get(part.sha256)===promise)pending.delete(part.sha256);}}
 async function file(spec,onProgress){let received=0;const blocks=await Promise.all(spec.parts.map(async part=>{const bytes=await getPart(part);received+=bytes.byteLength;onProgress?.(received,spec.bytes);return bytes;}));return URL.createObjectURL(new Blob(blocks,{type:'application/octet-stream'}));}
 function request(name){if(states.has(name))return;const state={status:0,url:'',progress:0};states.set(name,state);const spec=(window.EZSVS_BUILD.bundles||{})[name];if(!spec){state.status=-1;state.error='Missing area package';return;}
  file(spec,(done,total)=>state.progress=done/total).then(url=>{state.url=url;state.progress=1;state.status=1;}).catch(e=>{state.error=String(e.message||e);state.status=-1;});
 }
 function release(name){const s=states.get(name);if(s?.url){URL.revokeObjectURL(s.url);s.url='';}if(!stats.loadedBundles.includes(name))stats.loadedBundles.push(name);}
 function unload(name){const s=states.get(name);if(s?.url)URL.revokeObjectURL(s.url);states.delete(name);const i=stats.loadedBundles.indexOf(name);if(i>=0)stats.loadedBundles.splice(i,1);(stats.unloadedBundles??=[]).push(name);if(stats.unloadedBundles.length>64)stats.unloadedBundles.shift();}
 function reset(){for(const [name,s] of states)if(s.status<0){if(s.url)URL.revokeObjectURL(s.url);states.delete(name);}}
 return {file,request,unload,selectBuild,status:name=>states.get(name)?.status??0,url:name=>states.get(name)?.url||'',progress:name=>states.get(name)?.progress||0,release,reset,stats};
})();
