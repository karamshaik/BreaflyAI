
var S=[
"Photosynthesis is the process by which green plants make food. Chlorophyll in the leaves absorbs sunlight. The plant takes in carbon dioxide from the air through tiny pores called stomata and water from the soil through its roots. Using light energy, it converts these into glucose and releases oxygen. The overall reaction is 6CO2 + 6H2O gives C6H12O6 + 6O2. Photosynthesis takes place mainly in the chloroplasts. About 21 percent of the air we breathe is oxygen, much of it produced by this process.",
"The Indian independence movement against British rule lasted from 1857 to 1947. The revolt of 1857 was the first large uprising. The Indian National Congress was founded in 1885. Mahatma Gandhi returned to India in 1915 and led the Non-Cooperation Movement in 1920, the Salt March in 1930 and the Quit India Movement in 1942. India became independent on 15 August 1947, and the Constitution came into force on 26 January 1950.",
"A quadratic equation has the form ax^2 + bx + c = 0, where a is not zero. Its roots can be found with the quadratic formula x = (-b ± sqrt(b^2 - 4ac)) / 2a. The expression b^2 - 4ac is the discriminant. If it is greater than 0 there are two real roots, if it equals 0 there is one repeated root, and if it is less than 0 there are no real roots. For x^2 - 5x + 6 = 0 the roots are 2 and 3."];
var IMG='img/doc.svg',KEY='briefly:docs';
var $=function(i){return document.getElementById(i)},src=$('src'),out=$('out'),cache={};
[0,1,2].forEach(function(i){$('s'+i).onclick=function(){src.value=S[i];IMG=['img/science.svg','img/history.svg','img/maths.svg'][i];run()}});
function esc(t){var d=document.createElement('div');d.textContent=t==null?'':String(t);return d.innerHTML}
function words(t){return t.trim().split(/\s+/).filter(Boolean)}
// fallback: extractive summary (top sentences by keyword frequency)
function extract(t,len){
 var sents=t.match(/[^.!?\n]+[.!?]?/g)||[t],f={},stop=/^(the|a|an|and|or|of|to|in|is|it|that|by|as|for|on|with|are|was|from|this|which|its|be)$/;
 words(t.toLowerCase()).forEach(function(w){w=w.replace(/[^a-z0-9]/g,'');if(w.length>2&&!stop.test(w))f[w]=(f[w]||0)+1});
 var sc=sents.map(function(s,i){var v=0,n=0;words(s.toLowerCase()).forEach(function(w){w=w.replace(/[^a-z0-9]/g,'');if(f[w]){v+=f[w];n++}});return{s:s.trim(),i:i,v:n?v/Math.sqrt(n):0}});
 var k=len==='one line'?1:len==='short'?3:6;
 var top=sc.slice().sort(function(a,b){return b.v-a.v}).slice(0,k).sort(function(a,b){return a.i-b.i});
 var one=sc.slice().sort(function(a,b){return b.v-a.v})[0].s;
 if(words(one).length>25)one=words(one).slice(0,24).join(' ')+'…';
 return{oneLine:one,summary:top.map(function(x){return x.s}).join(' '),keyPoints:top.slice(0,4).map(function(x){return x.s}),keyTerms:[],questions:[],confidence:'low',fallback:true}}
function parse(t){var a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<0)throw 0;return JSON.parse(t.slice(a,b+1))}
function numsOK(r,text){var s=JSON.stringify(r).match(/\d+(\.\d+)?/g)||[],t=text;return s.filter(function(n){return t.indexOf(n)<0}).length===0}
async function ai(prompt){var r;try{r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt})})}catch(e){throw{code:'none'}}if(!r.ok)throw{code:'none'};return (await r.json()).text}
function chunks(t){var w=words(t),c=[];for(var i=0;i<w.length;i+=1000)c.push(w.slice(i,i+1000).join(' '));return c}
async function run(){
 var t=src.value.trim(),st=$('st'),len=$('len').value,lvl=$('lvl').value,lang=$('lang').value;
 if(!t){st.innerHTML='<span class="err">Please paste some text first.</span>';return}
 if(words(t).length<15){st.innerHTML='<span class="err">That text is too short to summarize. Add a few more sentences.</span>';return}
 var w=words(t);if(w.length>4000){t=w.slice(0,4000).join(' ');st.textContent='Only the first 4,000 words are used.'}
 var key=len+lvl+lang+t;if(cache[key]){show(cache[key],t);return}
 $('go').disabled=true;st.textContent='Summarizing…';var r;
 try{
  var base=t;
  if(chunks(t).length>1){var parts=[];for(var c of chunks(t)){st.textContent='Reading part '+(parts.length+1)+'…';parts.push(await ai('Summarize faithfully in under 120 words. Use only this text, keep numbers and terms exact:\n'+c))}base=parts.join('\n')}
  var p='You are an education assistant that summarizes study material. Rules: 1. Use ONLY information in the text. Do not add facts. 2. Keep all numbers, names, formulas and technical terms exactly as written. 3. Write at the reading level: '+lvl+'. 4. Write the output in '+lang+'; keep technical terms in English in brackets. 5. If the text is too short or unclear, say so instead of guessing. Length of "summary": '+len+' (one line under 25 words, short under 80, detailed under 200). Give 3 to 5 keyPoints and 3 questions. Return ONLY JSON: {"oneLine":"","summary":"","keyPoints":[],"keyTerms":[{"term":"","meaning":""}],"questions":[{"q":"","a":""}],"confidence":"high|medium|low"}\n\nTEXT:\n'+base;
  try{r=parse(await ai(p))}catch(e){if(e&&e.code==='none')throw e;r=parse(await ai(p))}
  if(!r.summary)throw 0;r.checked=numsOK(r,t)
 }catch(e){r=extract(t,len);r.why=e&&e.code==='none'?'AI is unavailable here':'AI call failed or returned invalid output'}
 cache[key]=r;show(r,t);$('go').disabled=false;st.textContent=''}
function show(r,t){
 var h='<div class="row"><span class="tag">Confidence: '+esc(r.confidence)+'</span>'+(r.fallback?'<span class="tag warn">Offline fallback: '+esc(r.why)+'. Showing key sentences from your text.</span>':'')+'</div>';
 if(r.checked===false)h+='<p class="warn">⚠ Some numbers in this summary were not found in your text. Check against the original.</p>';
 h+='<p class="one">'+esc(r.oneLine)+'</p><h3>Summary</h3><p>'+esc(r.summary)+'</p>';
 if(r.keyPoints&&r.keyPoints.length)h+='<h3>Key points</h3><ul>'+r.keyPoints.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>';
 if(r.keyTerms&&r.keyTerms.length)h+='<h3>Key terms</h3>'+r.keyTerms.map(function(x){return'<p class="term"><b>'+esc(x.term)+'</b>: '+esc(x.meaning)+'</p>'}).join('');
 if(r.questions&&r.questions.length)h+='<h3>Revision questions</h3>'+r.questions.map(function(x){return'<details><summary>'+esc(x.q)+'</summary><p>'+esc(x.a)+'</p></details>'}).join('');
 h+='<details><summary>Check against the original</summary><p class="mut" style="white-space:pre-wrap">'+esc(t)+'</p></details>';
 h+='<div class="row"><button id="cp">Copy notes</button><button id="pr">Print / Save PDF</button></div><p class="mut">Summaries can contain mistakes. Use as a revision aid, not a replacement for the source.</p>';
 out.innerHTML=h;
 var txt=[r.oneLine,r.summary].concat(r.keyPoints||[]).join('\n');
 $('cp').onclick=function(){var b=this;(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy notes'},1500)},function(){})};
 $('pr').onclick=function(){window.print()};
 var d=docs();d.unshift({img:IMG,title:t.split(/[.\n]/)[0].slice(0,50),date:new Date().toLocaleString(),opts:$('len').value+' / '+$('lvl').value+' / '+$('lang').value,sum:r.summary});
 try{localStorage.setItem(KEY,JSON.stringify(d.slice(0,20)))}catch(e){}table();IMG='img/doc.svg'}
function docs(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
function table(){var d=docs(),b=$('rows');b.innerHTML=d.length?d.map(function(x,i){return'<tr><td><img src="'+esc(x.img)+'" alt="Sample image"></td><td>'+esc(x.title)+'</td><td>'+esc(x.date)+'</td><td>'+esc(x.opts)+'</td><td>'+esc(x.sum)+'</td><td><button data-i="'+i+'">Delete</button></td></tr>'}).join(''):'<tr><td colspan="6" class="mut">No saved summaries yet. Summarize something and it appears here.</td></tr>';
 Array.prototype.forEach.call(b.querySelectorAll('button'),function(btn){btn.onclick=function(){var d=docs();d.splice(+btn.dataset.i,1);localStorage.setItem(KEY,JSON.stringify(d));table()}})}
table();
$('go').onclick=run;
// agent
async function ask(){
 var q=$('q').value.trim(),c=$('chat');if(!q)return;
 c.insertAdjacentHTML('beforeend','<div class="msg me">'+esc(q)+'</div>');$('q').value='';
 var m=document.createElement('div');m.className='msg';m.textContent='Thinking…';c.appendChild(m);$('ask').disabled=true;
 var d=src.value.trim().slice(0,12000);
 var p='You are a helpful study assistant. '+(d?'The user pasted this document:\n"""'+d+'"""\nIf the answer is in the document, start with "From your text:". If it is not, say "Not found in your text." then answer from general knowledge starting with "General knowledge:". Never invent quotes or page numbers.':'No document is provided; answer from general knowledge in simple language.')+'\n\nQuestion: '+q;
 try{m.textContent=await ai(p)||'No answer came back. Please try again.'}catch(e){m.innerHTML='<span class="err">'+(e&&e.code==='none'?'The AI agent is not available in this view. Start the server with an API key (see README).':'Something went wrong. Please try again.')+'</span>'}
 $('ask').disabled=false;c.scrollTop=c.scrollHeight}
$('ask').onclick=ask;$('q').onkeydown=function(e){if(e.key==='Enter')ask()};
