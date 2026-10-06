(()=>{
const DB=window.GASTRO_SUMMARIES||[];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const content=$("#content"), breadcrumbs=$("#breadcrumbs"), backBtn=$("#backBtn");
const totalTopics=DB.reduce((n,m)=>n+m.disciplines.reduce((a,d)=>a+d.topics.length,0),0);
$("#summaryTotal").textContent=totalTopics;

const key="gastro-resumos-v1";
let state={favorites:[],read:[],recent:[]};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(key)||"{}"));}catch(e){}
const save=()=>{localStorage.setItem(key,JSON.stringify(state));updateProgress();};
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const topicId=(m,d,t)=>[m.id,d.title,t.title].join("|");
const allRows=()=>DB.flatMap(m=>m.disciplines.flatMap(d=>d.topics.map(t=>({m,d,t,id:topicId(m,d,t)}))));

function updateProgress(){
 const pct=Math.round((new Set(state.read).size/Math.max(totalTopics,1))*100);
 $("#readPercent").textContent=pct+"%";$("#readProgress").style.width=pct+"%";
 $("#favCount").textContent=state.favorites.length;
}
function crumb(parts){breadcrumbs.innerHTML=parts.map((p,i)=>'<span>'+esc(p)+'</span>'+(i<parts.length-1?' <b>›</b> ':'')).join("");}
function setRecent(id){state.recent=state.recent.filter(x=>x!==id);state.recent.unshift(id);state.recent=state.recent.slice(0,12);save();}
function setHash(parts){location.hash=parts.map(encodeURIComponent).join("/");}
function parseHash(){return location.hash.replace(/^#/,"").split("/").filter(Boolean).map(decodeURIComponent);}
function cover(theme,num,label){return '<div class="card-cover theme-'+theme+'"><span class="card-num">'+esc(num)+' · '+esc(label)+'</span></div>';}

function home(){
 backBtn.hidden=true; crumb(["Caderno de Gastronomia","Resumos"]);
 content.innerHTML='<article class="page"><div class="page-cover"><span class="cover-word">Gastronomia</span></div><div class="page-icon">🍴</div><h1>Caderno do Estudante de Gastronomia</h1><p class="page-sub">Biblioteca acadêmica de resumos pronta para revisar conteúdos da graduação, estudar para provas e organizar temas recorrentes em avaliações e concursos. Os conteúdos estão divididos em seis grandes módulos, depois por disciplina e assunto.</p><div class="properties"><span class="property">▤ '+totalTopics+' resumos</span><span class="property">◫ '+DB.reduce((n,m)=>n+m.disciplines.length,0)+' disciplinas</span><span class="property">▦ 6 módulos</span><span class="property">✓ progresso de leitura</span></div><div class="divider"></div><div class="section-title"><div><h2>Galeria de módulos</h2><p>Abra um módulo para visualizar as disciplinas e todos os resumos disponíveis.</p></div></div><section class="gallery">'+DB.map(m=>'<article class="gallery-card module-card" data-module="'+m.id+'>'+cover(m.theme,"Módulo "+m.number,m.disciplines.length+" disciplinas")+'<div class="card-body"><h3>'+m.icon+' '+esc(m.title)+'</h3><p>'+esc(m.description)+'</p><div class="tags"><span class="tag">'+m.disciplines.reduce((n,d)=>n+d.topics.length,0)+' resumos</span><span class="tag">Galeria</span></div></div></article>').join("")+'</section></article>';
 $$(".module-card").forEach(el=>el.onclick=()=>setHash(["modulo",el.dataset.module]));
}

function moduleView(mid){
 const m=DB.find(x=>x.id===mid);if(!m)return home();
 backBtn.hidden=false;backBtn.onclick=()=>setHash([]);
 crumb(["Resumos",m.title]);
 content.innerHTML='<article class="page"><div class="page-cover theme-'+m.theme+'"><span class="cover-word">'+esc(m.title)+'</span></div><div class="page-icon">'+m.icon+'</div><h1>'+esc(m.title)+'</h1><p class="page-sub">'+esc(m.description)+'</p><div class="properties"><span class="property">'+m.disciplines.length+' disciplinas</span><span class="property">'+m.disciplines.reduce((n,d)=>n+d.topics.length,0)+' resumos completos</span></div><div class="divider"></div><div class="section-title"><div><h2>Disciplinas</h2><p>Cada disciplina abre uma nova galeria de assuntos.</p></div></div><section class="gallery">'+m.disciplines.map((d,i)=>'<article class="gallery-card discipline-card" data-i="'+i+'>'+cover(m.theme,String(i+1).padStart(2,"0"),d.topics.length+" assuntos")+'<div class="card-body"><h3>'+d.icon+' '+esc(d.title)+'</h3><p>'+esc(d.description)+'</p><div class="tags"><span class="tag">'+d.topics.length+' resumos</span><span class="tag">Disciplina</span></div></div></article>').join("")+'</section></article>';
 $$(".discipline-card").forEach(el=>el.onclick=()=>setHash(["disciplina",m.id,el.dataset.i]));
}

function disciplineView(mid,di){
 const m=DB.find(x=>x.id===mid), d=m?.disciplines[Number(di)]; if(!m||!d)return home();
 backBtn.hidden=false;backBtn.onclick=()=>setHash(["modulo",m.id]);
 crumb(["Resumos",m.title,d.title]);
 content.innerHTML='<article class="page"><div class="page-icon">'+d.icon+'</div><h1>'+esc(d.title)+'</h1><p class="page-sub">'+esc(d.description)+'</p><div class="properties"><span class="property">'+d.topics.length+' assuntos</span><span class="property">Resumo + pontos-chave + foco de prova + aplicação</span></div><div class="divider"></div><div class="section-title"><div><h2>Assuntos da disciplina</h2><p>Abra qualquer assunto para estudar o conteúdo completo.</p></div></div><div class="topic-list">'+d.topics.map((t,i)=>{const id=topicId(m,d,t),fav=state.favorites.includes(id),read=state.read.includes(id);return '<article class="topic-card" data-topic="'+i+'"><div class="topic-top"><div><h3>'+String(i+1).padStart(2,"0")+'. '+esc(t.title)+'</h3><p>'+esc(t.summary.slice(0,190))+(t.summary.length>190?"…":"")+'</p></div><button class="favorite '+(fav?"on":"")+'" data-fav="'+i+'" title="Favoritar">'+(fav?"★":"☆")+'</button></div><div class="topic-meta">'+(read?"✓ Lido":"○ Não lido")+' · '+esc(t.keywords.slice(0,3).join(" · "))+'</div></article>';}).join("")+'</div></article>';
 $$(".topic-card").forEach(el=>el.onclick=e=>{if(e.target.closest(".favorite"))return;setHash(["resumo",m.id,di,el.dataset.topic]);});
 $$("[data-fav]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();const t=d.topics[Number(btn.dataset.fav)],id=topicId(m,d,t);toggleFav(id);disciplineView(mid,di);});
}

function summaryView(mid,di,ti){
 const m=DB.find(x=>x.id===mid),d=m?.disciplines[Number(di)],t=d?.topics[Number(ti)]; if(!m||!d||!t)return home();
 const id=topicId(m,d,t);setRecent(id);
 backBtn.hidden=false;backBtn.onclick=()=>setHash(["disciplina",m.id,di]);
 crumb(["Resumos",m.title,d.title,t.title]);
 const fav=state.favorites.includes(id),read=state.read.includes(id);
 content.innerHTML='<article class="page summary-page"><div class="page-icon">'+d.icon+'</div><div class="properties"><span class="property">'+esc(m.title)+'</span><span class="property">'+esc(d.title)+'</span></div><h1 class="summary-title">'+esc(t.title)+'</h1><p class="page-sub">Resumo acadêmico organizado para revisão rápida e estudo aprofundado.</p><div class="read-row"><button id="readToggle" class="'+(read?"done":"")+'">'+(read?"✓ Marcado como lido":"○ Marcar como lido")+'</button><button id="favToggle">'+(fav?"★ Remover dos favoritos":"☆ Adicionar aos favoritos")+'</button></div><section class="summary-box"><h3>Resumo</h3><p>'+esc(t.summary)+'</p></section><section class="summary-box"><h3>Pontos-chave</h3><ul class="bullet-list">'+t.points.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></section><div class="callout"><div>📝</div><div><b>Foco para prova e concurso</b><p>'+esc(t.exam)+'</p></div></div><div class="callout"><div>👩‍🍳</div><div><b>Aplicação prática</b><p>'+esc(t.practice)+'</p></div></div><section class="summary-box"><h3>Palavras-chave para revisão</h3><div class="tags">'+t.keywords.map(x=>'<span class="tag">'+esc(x)+'</span>').join("")+'</div></section></article>';
 $("#readToggle").onclick=()=>{toggleRead(id);summaryView(mid,di,ti);};
 $("#favToggle").onclick=()=>{toggleFav(id);summaryView(mid,di,ti);};
}
function toggleFav(id){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();}
function toggleRead(id){state.read=state.read.includes(id)?state.read.filter(x=>x!==id):[...state.read,id];save();}
function resolveId(id){return allRows().find(r=>r.id===id);}

function favorites(){
 backBtn.hidden=false;backBtn.onclick=()=>setHash([]);crumb(["Caderno","Favoritos"]);
 const rows=state.favorites.map(resolveId).filter(Boolean);
 content.innerHTML='<article class="page"><div class="page-icon">★</div><h1>Favoritos</h1><p class="page-sub">Resumos marcados para voltar rapidamente durante a revisão.</p><div class="divider"></div>'+(rows.length?'<div class="topic-list">'+rows.map(r=>'<article class="topic-card favorite-hit" data-id="'+esc(r.id)+'"><h3>'+esc(r.t.title)+'</h3><p>'+esc(r.d.title)+' · '+esc(r.m.title)+'</p></article>').join("")+'</div>':'<div class="empty"><strong>Nenhum favorito ainda</strong><span>Use a estrela dentro das disciplinas ou dos resumos.</span></div>')+'</article>';
 $$(".favorite-hit").forEach(el=>el.onclick=()=>openRow(resolveId(el.dataset.id)));
}
function recent(){
 backBtn.hidden=false;backBtn.onclick=()=>setHash([]);crumb(["Caderno","Recentes"]);
 const rows=state.recent.map(resolveId).filter(Boolean);
 content.innerHTML='<article class="page"><div class="page-icon">◷</div><h1>Recentes</h1><p class="page-sub">Últimos resumos abertos neste navegador.</p><div class="divider"></div>'+(rows.length?'<div class="topic-list">'+rows.map(r=>'<article class="topic-card recent-hit" data-id="'+esc(r.id)+'"><h3>'+esc(r.t.title)+'</h3><p>'+esc(r.d.title)+' · '+esc(r.m.title)+'</p></article>').join("")+'</div>':'<div class="empty"><strong>Nenhum resumo aberto ainda</strong><span>Seus últimos conteúdos aparecerão aqui.</span></div>')+'</article>';
 $$(".recent-hit").forEach(el=>el.onclick=()=>openRow(resolveId(el.dataset.id)));
}
function openRow(r){
 if(!r)return;const di=r.m.disciplines.indexOf(r.d),ti=r.d.topics.indexOf(r.t);setHash(["resumo",r.m.id,di,ti]);
}

function search(q){
 q=(q||"").trim().toLowerCase();
 const rows=allRows().filter(r=>!q||[r.m.title,r.d.title,r.t.title,r.t.summary,...r.t.points,...r.t.keywords].join(" ").toLowerCase().includes(q)).slice(0,40);
 $("#searchResults").innerHTML=rows.map(r=>'<button class="search-hit" data-id="'+esc(r.id)+'"><strong>'+esc(r.t.title)+'</strong><span>'+esc(r.d.title)+' · '+esc(r.m.title)+'</span></button>').join("")||'<div class="empty"><strong>Nenhum resultado</strong><span>Tente outro termo.</span></div>';
 $$(".search-hit").forEach(el=>el.onclick=()=>{$("#searchModal").hidden=true;openRow(resolveId(el.dataset.id));});
}

function router(){
 const p=parseHash();
 $("#sidebar").classList.remove("open");
 if(!p.length)return home();
 if(p[0]==="modulo")return moduleView(p[1]);
 if(p[0]==="disciplina")return disciplineView(p[1],p[2]);
 if(p[0]==="resumo")return summaryView(p[1],p[2],p[3]);
 if(p[0]==="favoritos")return favorites();
 if(p[0]==="recentes")return recent();
 home();
}
$("#homeBtn").onclick=()=>setHash([]);
$("#favBtn").onclick=()=>setHash(["favoritos"]);
$("#recentBtn").onclick=()=>setHash(["recentes"]);
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
$("#searchBtn").onclick=()=>{$("#searchModal").hidden=false;$("#globalSearch").value="";search("");setTimeout(()=>$("#globalSearch").focus(),20);};
$("#closeSearch").onclick=()=>$("#searchModal").hidden=true;
$("#searchModal").onclick=e=>{if(e.target.id==="searchModal")$("#searchModal").hidden=true;};
$("#globalSearch").oninput=e=>search(e.target.value);
$("#sidebarSearch").onkeydown=e=>{if(e.key==="Enter"){$("#searchModal").hidden=false;$("#globalSearch").value=e.target.value;search(e.target.value);}};
window.addEventListener("hashchange",router);
updateProgress();router();
})();