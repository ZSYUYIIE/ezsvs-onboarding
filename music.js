'use strict';
// Replaces the game's background music with Audio/team-work-loop.mp3 without
// changing the Unity build. The game ships one long clip (about 62 s, the
// music) and a few short sound effects, so any clip longer than
// MUSIC_MIN_SECONDS is treated as the music. Unity's own music volume, mute and
// pause still apply because the new track plays through Unity's audio channel.
// Credit: "Team Work (Loop)" by Corporate Music Zone, CC BY 4.0,
// https://corporate-music-zone.bandcamp.com (via free-stock-music.com).
(function(){
 const MUSIC_URL=new URL('Audio/team-work-loop.mp3',document.baseURI).href;
 const MUSIC_MIN_SECONDS=20;
 const MUSIC_MIN_BYTES=400000;
 let trackBytes=null;
 const replacements=new WeakSet();
 function loadTrack(){
  if(!trackBytes)trackBytes=fetch(MUSIC_URL).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer();});
  return trackBytes;
 }
 // Chrome and Edge: Unity decodes every clip with decodeAudioData.
 const proto=(window.BaseAudioContext||window.AudioContext||window.webkitAudioContext||{}).prototype;
 if(proto&&proto.decodeAudioData){
  const original=proto.decodeAudioData;
  proto.decodeAudioData=function(data,onSuccess,onError){
   const ctx=this;
   const decoded=original.call(ctx,data).then(buffer=>{
    if(buffer.duration<MUSIC_MIN_SECONDS)return buffer;
    return loadTrack().then(bytes=>original.call(ctx,bytes.slice(0))).then(track=>{replacements.add(track);return track;}).catch(error=>{console.warn('EZSVS music replacement failed, keeping original:',error);return buffer;});
   });
   decoded.then(b=>{if(onSuccess)onSuccess(b);},e=>{if(onError)onError(e);});
   return decoded;
  };
 }
 // Unity may set loop points from the original clip; loop the new track whole.
 if(window.AudioBufferSourceNode){
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){
   if(this.buffer&&replacements.has(this.buffer)){this.loopStart=0;this.loopEnd=0;}
   return start.apply(this,args);
  };
 }
 // Safari and Firefox: Unity streams large clips through an <audio> element
 // created from a Blob URL.
 const createObjectURL=URL.createObjectURL;
 URL.createObjectURL=function(object){
  if(object instanceof Blob&&/^audio\//.test(object.type)&&object.size>=MUSIC_MIN_BYTES)return MUSIC_URL;
  return createObjectURL.call(URL,object);
 };
 const revokeObjectURL=URL.revokeObjectURL;
 URL.revokeObjectURL=function(url){if(url===MUSIC_URL)return;return revokeObjectURL.call(URL,url);};
})();
