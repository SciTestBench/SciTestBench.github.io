/* SciTestBench site: shared data, charts and interactions */
/* ---------- data (from the paper) ---------- */
const ROWS=[
 ["Opus 5.5","Claude Code",56.4,50],
 ["Sonnet 5.5","Claude Code",20.1,23],
 ["DeepSeek-V4.1-Flash","Claude Code",19.5,11],
 ["GPT-6 Sol","Codex",49.7,45],
 ["GPT-6.1 Sol","Codex",64.4,57],
 ["GPT-6 Astra","Codex",53.7,54],
 ["GPT-6.1 Sol","mini-SWE-agent",57.0,56],
 ["Sonnet 5.5","mini-SWE-agent",28.2,30]];
const FAMILIES=387;
const CFG=["Opus 5.5 (CC)","Sonnet 5.5 (CC)","DS-V4.1-Flash (CC)","GPT-6 Sol (Codex)","GPT-6.1 Sol (Codex)","GPT-6 Astra (Codex)","GPT-6.1 Sol (mini-SWE)","Sonnet 5.5 (mini-SWE)"];
// Fig. 4: All | Sci easy/med/hard | SWE easy/med/hard | Composition Sci/Joint/SWE
const DIFF=[
 [56.4,60,56,50,62,58,34,58,55,58],
 [20.1,24,20,12,27,18,8,23,18,22],
 [19.5,27,17,9,24,20,4,21,15,25],
 [49.7,53,52,35,62,47,25,48,49,51],
 [64.4,71,68,38,72,66,36,57,63,70],
 [53.7,56,58,36,62,52,34,64,53,51],
 [57.0,61,60,38,67,55,36,59,55,60],
 [28.2,35,25,23,40,25,6,33,23,34]];
const DIFF_COLS=[["All","",""],["Science difficulty","easy","38%"],["","medium","46%"],["","hard","16%"],["SWE difficulty","easy","38%"],["","medium","49%"],["","hard","13%"],["Composition","Sci.","13%"],["","Joint","53%"],["","SWE","34%"]];
// Appendix: repository-level family counts. [repo, IDs, families, Opus, Sonnet, DS, GPT-6 Sol, GPT-6.1 Sol, Astra, 6.1 Sol mini, Sonnet mini]
const SAN=[
 ["Biopython",43,42,5,3,1,5,6,6,6,3],["Astropy",29,28,5,3,1,5,6,6,6,3],["ObsPy",31,27,1,0,0,1,1,1,1,0],
 ["Pymatgen",34,32,7,3,2,6,8,7,8,4],["PySCF",34,34,3,1,1,3,3,3,3,2],["QuTiP",35,35,7,3,1,6,8,7,8,4],
 ["yt",43,43,7,3,1,6,8,7,7,4],["SunPy",39,39,4,2,1,4,5,5,5,3],["Nilearn",39,38,3,1,1,2,3,3,3,2],
 ["Scanpy",36,36,5,3,1,5,6,6,6,3],["DeepChem",37,33,3,1,1,2,3,3,3,2]];
const DOMAINS=[["Chemistry",36],["Physics",22],["Materials Science",21],["Astronomy",9],["Life Sciences",7],["Geoscience †",3]];
const REPORTS=[["Biopython",11],["Astropy",9],["Pymatgen",7],["OpenMM",5],["Scanpy",5],["QuTiP",4],["yt",4],["DeepChem",3],["SunPy",3],["Nilearn",2],["ObsPy",2],["PySCF",1]];
const AUDIT=[["Base not fail",61.5,[["Fail to expose buggy behavior",53.8],["Mismatch with the reference fix",7.7]]],
 ["Gold not pass",38.5,[["Mismatch with the reference fix",23.1],["Misunderstand scientific premise",15.4]]]];

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const root=document.documentElement;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function isDark(){return root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches}

// tooltip
const tip=$("#tip");
document.addEventListener("mouseover",e=>{const t=e.target.closest("[data-tip]");if(!t)return;tip.innerHTML=t.dataset.tip;tip.classList.add("on")});
document.addEventListener("mouseout",e=>{if(e.target.closest("[data-tip]"))tip.classList.remove("on")});
document.addEventListener("mousemove",e=>{if(!tip.classList.contains("on"))return;const w=tip.offsetWidth;let x=e.clientX+14;if(x+w>innerWidth-8)x=e.clientX-w-14;tip.style.left=x+"px";tip.style.top=(e.clientY+16)+"px"});

// horizontal bars
function hbars(el,data,max,fmt=v=>v,tipf){
  el.innerHTML=data.map(([l,v])=>`<div class="hb" data-tip="${tipf?tipf(l,v):`<b>${l}</b>: ${fmt(v)}`}"><span class="lab">${l}</span><span class="trk"><i data-w="${(v/max*100).toFixed(1)}"></i></span><span class="val">${fmt(v)}</span></div>`).join("");
}
const E=id=>document.getElementById(id);
if(E("domBars"))hbars(E("domBars"),DOMAINS,40,v=>v,(l,v)=>`<b>${l}</b>: ${v}% of issue tasks`);
if(E("bankBars"))hbars(E("bankBars"),SAN.map(r=>[r[0],r[1]]).sort((a,b)=>b[1]-a[1]),45,v=>v,(l,v)=>{const r=SAN.find(x=>x[0]===l);return `<b>${l}</b>: ${r[1]} sanitizers, ${r[2]} families`});
if(E("repBars"))hbars(E("repBars"),REPORTS,12,v=>v,(l,v)=>`<b>${l}</b>: ${v} upstream report${v>1?"s":""}`);

// audit chart
if(E("auditChart"))E("auditChart").innerHTML=`<h4>Failure mechanisms &middot; share of audited GPT-6.1 Sol failures</h4>`+AUDIT.map(([g,v,subs])=>`<div class="ag"><div class="ag-h"><b>${g}</b><span>${v}%</span></div><div class="hbars">${subs.map(([l,s],i)=>`<div class="hb ${i?"sub2":""}" data-tip="<b>${g}</b> &middot; ${l}: ${s}%"><span class="lab">${l}</span><span class="trk"><i data-w="${(s/61.5*100).toFixed(1)}"></i></span><span class="val">${s}%</span></div>`).join("")}</div></div>`).join("")+`<p class="chart-note">Base: buggy revision; gold: reference-fixed revision. Bars are scaled to the largest group.</p>`;

/* ---------- leaderboard ---------- */
const maxIssue=Math.max(...ROWS.map(r=>r[2])),maxSan=Math.max(...ROWS.map(r=>r[3]));
const state={k:"issue",h:"all"};
const tb=$("#lb tbody");let lbShown=false;
function renderLB(){
  if(!tb)return;
  const i=state.k==="issue"?2:3;
  const rows=ROWS.filter(r=>state.h==="all"||r[1]===state.h).sort((a,b)=>b[i]-a[i]);
  let rank=0,prev=null;
  tb.innerHTML=rows.map((r,n)=>{
    if(r[i]!==prev){rank=n+1;prev=r[i]}
    const rk=rank<=3?`<span class="medal m${rank}">${rank}</span>`:rank,a=state.k==="issue";
    return `<tr class="${rank===1?"top":""}"><td class="rk">${rk}</td>
      <td class="model"><b>${r[0]}</b><span class="pill">${r[1]}</span></td>
      <td class="n ${a?"act":"dim"}"><span class="bar"><i data-w="${(r[2]/maxIssue*100).toFixed(1)}"></i></span><span class="v">${r[2].toFixed(1)}</span></td>
      <td class="n ${a?"dim":"act"}"><span class="bar"><i data-w="${(r[3]/maxSan*100).toFixed(1)}"></i></span><span class="v">${r[3]}</span><span style="color:var(--ink3);font-size:12.5px"> / ${FAMILIES}</span></td></tr>`;
  }).join("");
  $$("#lb th.sort").forEach(h=>h.classList.toggle("on",h.dataset.k===state.k));
  $$("#metric button").forEach(b=>b.classList.toggle("on",b.dataset.k===state.k));
  if(lbShown)grow(tb);
}
$$("#lb th.sort,#metric button").forEach(el=>el.onclick=()=>{state.k=el.dataset.k;renderLB()});
$$("#harness button").forEach(b=>b.onclick=()=>{state.h=b.dataset.h;$$("#harness button").forEach(x=>x.classList.toggle("on",x===b));renderLB()});
renderLB();

/* ---------- dumbbells ---------- */
function dumbbell(el,items,max,unit){
  el.innerHTML=items.map(([m,nat,natv,mini])=>{
    const a=natv/max*100,b=mini/max*100,lo=Math.min(a,b),hi=Math.max(a,b),d=(mini-natv);
    const ds=(d>0?"+":"")+(Number.isInteger(d)?d:d.toFixed(1));
    return `<div class="db"><span class="lab">${m}<small>mini ${ds}</small></span><div class="trk" data-a="${a}" data-b="${b}">
      <span class="ln" style="left:0;width:0" data-l="${lo}" data-wd="${hi-lo}"></span>
      <span class="dot" style="left:0;background:var(--s1)" data-x="${a}" data-tip="<b>${m}</b> in ${nat}: ${natv}${unit}"><span>${natv}</span></span>
      <span class="dot m" style="left:0;background:var(--s2)" data-x="${b}" data-tip="<b>${m}</b> in mini-SWE-agent: ${mini}${unit}"><span>${mini}</span></span>
      </div></div>`;}).join("");
}
if(E("dbIssue"))dumbbell(E("dbIssue"),[["GPT-6.1 Sol","Codex",64.4,57.0],["Sonnet 5.5","Claude Code",20.1,28.2]],70,"%");
if(E("dbSan"))dumbbell(E("dbSan"),[["GPT-6.1 Sol","Codex",57,56],["Sonnet 5.5","Claude Code",23,30]],60," families");

/* ---------- heatmaps ---------- */
const RAMP_L=["#f1f6fd","#cde2fb","#9ec5f4","#6da7ec","#3987e5","#256abf","#184f95","#0d366b"];
const RAMP_D=["#1a2330","#182c45","#184f95","#1c5cab","#2a78d6","#5598e7","#86b6ef","#b7d3f6"];
function hex2rgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function ramp(t){const R=isDark()?RAMP_D:RAMP_L;t=Math.max(0,Math.min(1,t));const x=t*(R.length-1),i=Math.min(R.length-2,Math.floor(x)),f=x-i;
  const a=hex2rgb(R[i]),b=hex2rgb(R[i+1]);return `rgb(${a.map((v,k)=>Math.round(v+(b[k]-v)*f)).join(",")})`}
function inkFor(t){return isDark()?(t>.62?"#0b1a2e":"#e7eaee"):(t>.5?"#ffffff":"#16191f")}
function gradCSS(){const R=isDark()?RAMP_D:RAMP_L;return `linear-gradient(90deg,${R.join(",")})`}
function cell(v,t,tipTxt){return `<td class="c" style="background:${ramp(t)};color:${inkFor(t)}" data-t="${t}" data-tip="${tipTxt}">${v}</td>`}
function drawDiff(){
  if(!E("diffHM"))return;
  const grp=[[0,1],[1,3],[4,3],[7,3]];
  let h=`<thead><tr><th></th>`+grp.map(([s,n],gi)=>(gi?`<th class="gap"></th>`:"")+`<th class="grp" colspan="${n}">${DIFF_COLS[s][0]}</th>`).join("")+`</tr><tr><th></th>`;
  DIFF_COLS.forEach((c,j)=>{if(j===1||j===4||j===7)h+=`<th class="gap"></th>`;h+=`<th>${c[1]||"&nbsp;"}<small>${c[2]||"&nbsp;"}</small></th>`});
  h+=`</tr></thead><tbody>`;
  DIFF.forEach((r,i)=>{h+=`<tr><td class="rl">${CFG[i].replace(/ \((.*)\)/,' <small>($1)</small>')}</td>`;
    r.forEach((v,j)=>{if(j===1||j===4||j===7)h+=`<td class="gap"></td>`;
      const g=j===0?"Overall":(j<4?"Science "+DIFF_COLS[j][1]:j<7?"SWE "+DIFF_COLS[j][1]:"Composition: "+DIFF_COLS[j][1]);
      h+=cell(j===0?v.toFixed(1):v,v/100,`<b>${CFG[i]}</b><br>${g}: ${v}% F&rarr;P`)});
    h+=`</tr>`});
  $("#diffHM").innerHTML=h+`</tbody>`;$("#diffGrad").style.background=gradCSS();
}
function drawSan(){
  if(!E("sanHM"))return;
  let h=`<thead><tr><th></th><th class="grp" colspan="2">Bank</th><th class="gap"></th><th class="grp" colspan="3">Claude Code</th><th class="gap"></th><th class="grp" colspan="3">Codex</th><th class="gap"></th><th class="grp" colspan="2">mini-SWE-agent</th></tr>
  <tr><th></th><th>IDs</th><th>Fam.</th><th class="gap"></th><th>Opus 5.5</th><th>Sonnet 5.5</th><th>DS-V4.1</th><th class="gap"></th><th>GPT-6 Sol</th><th>GPT-6.1 Sol</th><th>GPT-6 Astra</th><th class="gap"></th><th>GPT-6.1 Sol</th><th>Sonnet 5.5</th></tr></thead><tbody>`;
  const cfgIdx=[0,1,2,3,4,5,6,7];
  SAN.forEach(r=>{h+=`<tr><td class="rl">${r[0]}</td><td class="plain">${r[1]}</td><td class="plain">${r[2]}</td>`;
    r.slice(3).forEach((v,k)=>{if(k===0||k===3||k===6)h+=`<td class="gap"></td>`;h+=cell(v,v/8,`<b>${CFG[cfgIdx[k]]}</b><br>${r[0]}: ${v} of ${r[2]} families`)});h+=`</tr>`});
  const tot=[0,1,2,3,4,5,6,7].map(k=>SAN.reduce((s,r)=>s+r[3+k],0));
  h+=`<tr class="tot"><td class="rl">Total</td><td class="plain">400</td><td class="plain">387</td>`+tot.map((v,k)=>(k===0||k===3||k===6?`<td class="gap"></td>`:"")+`<td class="plain" style="color:var(--ink)" data-tip="<b>${CFG[k]}</b>: ${v} of 387 families">${v}</td>`).join("")+`</tr></tbody>`;
  $("#sanHM").innerHTML=h;$("#sanGrad").style.background=gradCSS();
}
drawDiff();drawSan();

/* ---------- figure tabs ---------- */
$$("#figTabs button").forEach(b=>b.onclick=()=>{$$("#figTabs button").forEach(x=>x.classList.toggle("on",x===b));$$(".figpane").forEach(f=>f.hidden=f.dataset.f!==b.dataset.f)});

/* ---------- animation on scroll ---------- */
function grow(scope){scope.querySelectorAll("[data-w]").forEach(i=>{if(reduce){i.style.width=i.dataset.w+"%";return}requestAnimationFrame(()=>requestAnimationFrame(()=>i.style.width=i.dataset.w+"%"))})}
function dots(scope){scope.querySelectorAll(".db .trk").forEach(t=>{t.querySelectorAll(".dot").forEach(d=>d.style.left=d.dataset.x+"%");const l=t.querySelector(".ln");l.style.left=l.dataset.l+"%";l.style.width=l.dataset.wd+"%"})}
function countUp(el){const end=+el.dataset.count;if(reduce||end<10){el.textContent=end;return}const t0=performance.now(),dur=1100;
  (function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(end*e);if(p<1)requestAnimationFrame(f)})(t0)}
$$("[data-count]").forEach(el=>{if(!reduce&&+el.dataset.count>=10)el.textContent="0"});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const t=e.target;t.classList.add("in");
  grow(t);dots(t);t.querySelectorAll("[data-count]").forEach(countUp);if(tb&&t.contains(tb))lbShown=true;io.unobserve(t)}),{threshold:.15});
$$(".reveal,.stats,.glance,.dumb,.impact").forEach(el=>io.observe(el));
// fallback: animate anything still hidden after load (e.g., print or very tall viewports)
addEventListener("load",()=>setTimeout(()=>$$(".reveal:not(.in)").forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight){el.classList.add("in");grow(el);dots(el)}}),400));

/* ---------- misc ---------- */
if(E("cp"))E("cp").onclick=function(){const t=$("#bibtex").innerText,s=this.querySelector("span");const done=()=>{s.textContent="Copied";setTimeout(()=>s.textContent="Copy",1600)};
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,done);else done()};
const tbtn=$("#theme");
function icon(){tbtn.innerHTML=`<svg class="i"><use href="#${isDark()?"sun":"moon"}"/></svg>`}
try{const s=localStorage.getItem("theme");if(s)root.dataset.theme=s}catch(e){}
icon();drawDiff();drawSan();
tbtn.onclick=()=>{root.dataset.theme=isDark()?"light":"dark";try{localStorage.setItem("theme",root.dataset.theme)}catch(e){}icon();drawDiff();drawSan()};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{icon();drawDiff();drawSan()});
// mark the current page in the nav
const here=location.pathname.split("/").pop()||"index.html";
$$("nav .links a").forEach(l=>{if(l.getAttribute("href")===here)l.classList.add("cur")});
