// Browser-generated ambience and temporary speech. No recordings or external services.
export function createAudio(notify){
 let context,master,wind,water,on=true,current;
 function init(){if(context)return;try{context=new(window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=on?.55:0;master.connect(context.destination);const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+Math.random()*.04-.02)/1.02;data[i]=last*3;}const source=context.createBufferSource();source.buffer=buffer;source.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;wind=context.createGain();wind.gain.value=.25;source.connect(filter).connect(wind).connect(master);source.start();const stream=context.createBufferSource();stream.buffer=buffer;stream.loop=true;const high=context.createBiquadFilter();high.type='highpass';high.frequency.value=1000;water=context.createGain();water.gain.value=.02;stream.connect(high).connect(water).connect(master);stream.start();}catch{notify('Audio unavailable. Subtitles remain enabled.');}}
 function cancel(){if('speechSynthesis'in window)speechSynthesis.cancel();}
 return {
  set(enabled){on=enabled;if(on){init();context?.resume().catch(()=>{});}if(master)master.gain.setTargetAtTime(on?.55:0,context.currentTime,.1);if(!on)cancel();},
  speak(text){if(!on||!('speechSynthesis'in window))return;cancel();current=new SpeechSynthesisUtterance(text);current.rate=.72;current.pitch=.65;current.volume=.7;const voices=speechSynthesis.getVoices(),v=voices.find(v=>v.lang==='en-GB')||voices.find(v=>v.lang.startsWith('en'));if(v)current.voice=v;speechSynthesis.speak(current);},
  step(){if(!on||!context||context.state!=='running')return;const osc=context.createOscillator(),g=context.createGain(),now=context.currentTime;osc.type='triangle';osc.frequency.setValueAtTime(75+Math.random()*25,now);osc.frequency.exponentialRampToValueAtTime(30,now+.1);g.gain.setValueAtTime(.11,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);osc.connect(g).connect(master);osc.onended=()=>{osc.disconnect();g.disconnect();};osc.start();osc.stop(now+.13);},
  update(t,distance){if(wind)wind.gain.value=.23+Math.sin(t*.2)*.05;if(water)water.gain.setTargetAtTime(Math.max(.02,.22-distance*.014),context.currentTime,.5);},
  pause(){context?.suspend().catch(()=>{});cancel();},resume(){if(on)context?.resume().catch(()=>{});},cancel,
  status(){return {enabled:on,context:context?.state||'not-started',speechSupported:'speechSynthesis'in window};}
 };
}
