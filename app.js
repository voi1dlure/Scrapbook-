(() => {
  "use strict";
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const DEFAULTS = clone(window.SCRAPBOOK_CONTENT);
  const STORAGE_KEY = "volumeOneScrapbook_v1";
  let content = loadContent();
  let currentTrack = 0, currentJoke = -1, activeTab = "text";
  let toastTimer;
  let activeMemorySegment = null;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function loadContent(){ try { const raw=localStorage.getItem(STORAGE_KEY); if(!raw){ localStorage.setItem("volumeOnePlaylistVersion","3"); return clone(DEFAULTS); } const merged=mergeDeep(clone(DEFAULTS),JSON.parse(raw)); if(localStorage.getItem("volumeOnePlaylistVersion")!=="3"){ merged.playlist=clone(DEFAULTS.playlist); localStorage.setItem("volumeOnePlaylistVersion","3"); localStorage.setItem(STORAGE_KEY,JSON.stringify(merged)); } return merged; } catch(e){ return clone(DEFAULTS); } }
  function mergeDeep(target, source){ if(!source||typeof source!=="object")return target; Object.keys(source).forEach(k=>{if(source[k]&&typeof source[k]==="object"&&!Array.isArray(source[k])&&target[k]&&typeof target[k]==="object"&&!Array.isArray(target[k]))mergeDeep(target[k],source[k]);else target[k]=source[k];});return target; }
  function saveContent(){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(content));return true;}catch(e){toast("Browser storage is full. Export your content backup.");return false;} }
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
  function safeURL(url){if(!url)return "";try{const u=new URL(url,location.href);return ["http:","https:","data:","blob:"].includes(u.protocol)?u.href:"";}catch{return ""}}
  function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
  function render(){
    document.title = `${content.siteSettings.hisName || "[HIS NAME]"} / Personal Record`;
    $("#hisName").textContent=content.siteSettings.hisName||"[HIS NAME]";
    $("#specimenName").textContent=content.siteSettings.hisName||"[HIS NAME]";
    $("#heroTitle").textContent=content.openingScreen.title;
    $("#heroSubtitle").textContent=content.openingScreen.subtitle;
    $("#heroAnnotation").textContent=content.openingScreen.annotation;
    $("#openArchive").innerHTML=`${escapeHTML(content.openingScreen.buttonLabel||"OPEN THE ARCHIVE")} <span>↘</span>`;
    $("#smallThingsText").textContent=content.smallThingsText;
    $("#letterTitle").textContent=content.thankYouLetter.title;
    $("#letterBody").innerHTML=content.thankYouLetter.body.split(/\n\s*\n/).map(p=>`<p>${escapeHTML(p)}</p>`).join("");
    $("#letterClosing").textContent=content.thankYouLetter.closing;
    $("#finalMessage").textContent=content.finalPage.message;
    $("#footerText").textContent=content.finalPage.footer;
    renderEventCards();renderGallery();renderFieldNotes();renderPlaylist();renderJoke(true);renderISC();renderNYC();renderFuturePlans();renderPhotoPlaceholders();
    updateCounter();
  }
  function renderEventCards(){
    const t=content.teachersDayMemories||{}, b=content.birthdayMemories||{};
    const tc=$("#teachersCard"), bc=$("#birthdayCard");
    if(tc){const visual=tc.querySelector(".chapter-visual"), body=tc.querySelector(".chapter-body"); if(visual){visual.innerHTML=t.image?`<img class="event-card-photo" src="${escapeHTML(safeURL(t.image))}" alt="Teachers’ Day memory"><span class="event-photo-caption">${escapeHTML(t.photoCaption||"TEACHERS’ DAY / PHOTO FILE")}</span>`:`<span class="scribble">${escapeHTML(t.photoCaption||"the plan was simple. allegedly.")}</span><div class="visual-stamp">T-DAY<br>FILES</div><span class="visual-bottom mono">PLANNING DEPT. / OPEN CASE</span>`;} if(body){body.querySelector("h3").textContent=t.title||"Teachers’ Day, in theory.";body.querySelector("p:not(.eyebrow)").textContent=t.intro||"Add your Teachers’ Day story in Edit Archive.";}}
    if(bc){const visual=bc.querySelector(".chapter-visual"), body=bc.querySelector(".chapter-body"); if(visual){visual.innerHTML=b.image?`<img class="event-card-photo" src="${escapeHTML(safeURL(b.image))}" alt="Birthday memory"><span class="event-photo-caption">${escapeHTML(b.photoCaption||"BIRTHDAY / PHOTO FILE")}</span>`:`<div class="birthday-number">${escapeHTML(b.numberLabel||"+1")}</div><span class="birthday-caption handwritten">${escapeHTML(b.photoCaption||"limited-edition human")}</span><span class="visual-bottom mono">CLASSIFIED FOR DIGNITY</span>`;} if(body){body.querySelector("h3").textContent=b.title||"Birthday archive.";body.querySelector("p:not(.eyebrow)").textContent=b.intro||"Add your birthday story in Edit Archive.";}}
  }
  function renderPhotoPlaceholders(){
    const heroArt=$(".hero-art"), finalPhoto=$("#finalPhoto"), yearPhoto=$("#yearPhotoFrame");
    if(heroArt){
      const existing=heroArt.querySelector(".cover-full-image");
      if(existing)existing.remove();
      heroArt.classList.remove("has-cover-photo");
      if(content.openingScreen.photo){
        const img=document.createElement("img");img.className="cover-full-image";img.src=content.openingScreen.photo;img.alt="Scrapbook cover photograph";
        heroArt.prepend(img);heroArt.classList.add("has-cover-photo");
      }
    }
    const apply=(el,url,label)=>{if(!el)return;const old=el.querySelector("img");if(old)old.remove();const ph=el.querySelector(".placeholder-sky");if(url){if(ph)ph.style.display="none";const img=document.createElement("img");img.src=url;img.alt=label;img.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:contain";el.prepend(img);}else if(ph)ph.style.display="";};
    apply(finalPhoto,content.finalPage.photo,"Final scrapbook photograph");
    if(yearPhoto){yearPhoto.querySelectorAll("img").forEach(img=>img.remove());const label=yearPhoto.querySelector("span");if(content.yearPhoto){if(label)label.style.display="none";const img=document.createElement("img");img.src=content.yearPhoto;img.alt="A photo that feels like this year";img.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover";yearPhoto.prepend(img);yearPhoto.classList.add("has-year-photo");}else{if(label)label.style.display="";yearPhoto.classList.remove("has-year-photo");}}
    const specimen=$(".specimen-photo");
    if(specimen){specimen.querySelectorAll("img").forEach(img=>img.remove());const placeholders=[...specimen.children].filter(el=>!el.classList.contains("portfolio-photo-label"));placeholders.forEach(el=>el.style.display=content.fieldNotesPhoto?"none":"");if(content.fieldNotesPhoto){const img=document.createElement("img");img.src=content.fieldNotesPhoto;img.alt="Portfolio photograph";img.className="portfolio-photo";specimen.prepend(img);}}
  }
  function renderGallery(){
    const gallery=$("#memoryGallery");gallery.innerHTML="";
    content.photoGallery.forEach((m,i)=>{
      const b=document.createElement("button");b.className="memory-frame";b.type="button";b.dataset.memoryId=m.id;
      const image=m.image?safeURL(m.image):"";
      b.innerHTML=`<div class="memory-image">${image?`<img loading="lazy" src="${escapeHTML(image)}" alt="${escapeHTML(m.title)}">`:`<div class="memory-placeholder">${escapeHTML(m.location||"YOUR PHOTO HERE")}</div>`}</div><div class="memory-caption"><span class="mono">${escapeHTML(m.date||"UNDATED")} · ${escapeHTML(m.id||"MEMORY")}</span><strong>${escapeHTML(m.title||"Untitled memory")}</strong><span>${escapeHTML(m.caption||"")}</span></div>`;
      b.addEventListener("click",()=>openMemory(m.id));gallery.appendChild(b);
    });
    $("#counter").textContent=`FRAME ${String(Math.min(content.photoGallery.length,99)).padStart(3,"0")} / ${String(content.photoGallery.length).padStart(3,"0")}`;
  }
  function openMemory(id){
    const m=content.photoGallery.find(x=>x.id===id);if(!m)return;
    $("#storyEyebrow").textContent=`MEMORY FILE / ${m.date||"UNDATED"} / ${m.location||"UNFILED"}`;
    $("#storyTitle").textContent=m.title||"A memory";
    const img=m.image?safeURL(m.image):"";
    $("#storyContent").innerHTML=`${img?`<img class="story-photo" src="${escapeHTML(img)}" alt="${escapeHTML(m.title)}">`:""}<p><strong>${escapeHTML(m.caption||"")}</strong></p><p>${escapeHTML(m.story||"Add the full story in Edit Archive.")}</p>`;
    const related=[];
    const track=content.playlist.find(t=>t.id===m.songId);
    if(track)related.push(`<button class="related-link" data-related-track="${escapeHTML(track.id)}">♫ PLAY THIS MEMORY’S SONG${m.songStart!==""&&m.songStart!=null?` FROM ${fmtTime(Number(m.songStart)||0)}`:""}${m.songEnd!==""&&m.songEnd!=null?` TO ${fmtTime(Number(m.songEnd)||0)}`:""} — ${escapeHTML(track.title)}</button>`);
    const plan=content.futurePlans.find(p=>p.id===m.relatedPlan)||content.futurePlans.find(p=>p.linkedMemoryId===m.id);
    if(plan)related.push(`<button class="related-link" data-related-plan="${escapeHTML(plan.id)}">↗ FUTURE PLAN — ${escapeHTML(plan.title)}</button>`);

    $("#storyRelated").innerHTML=related.join("");
    $("#storyRelated").querySelectorAll("[data-related-track]").forEach(el=>el.addEventListener("click",()=>{const i=content.playlist.findIndex(t=>t.id===el.dataset.relatedTrack);if(i>=0){setTrack(i);$("#storyModal").hidden=true;document.body.classList.remove("modal-open");scrollToId("soundtrack");}}));
    $("#storyRelated").querySelectorAll("[data-related-plan]").forEach(el=>el.addEventListener("click",()=>{ $("#storyModal").hidden=true;document.body.classList.remove("modal-open");scrollToId("volumeTwo");}));
    $("#storyModal").hidden=false;document.body.classList.add("modal-open");
    if(m.songId)playMemorySong(m);
  }
  async function playMemorySong(memory){
    const index=content.playlist.findIndex(t=>t.id===memory.songId);if(index<0){toast("Choose a connected song in Edit Archive → Memories first.");return;}
    await setTrack(index,false);
    const start=Math.max(0,Number(memory.songStart)||0);
    activeMemorySegment={memoryId:memory.id,end:Number(memory.songEnd)>start?Number(memory.songEnd):null};
    if(audio.readyState<1)await new Promise(resolve=>{audio.addEventListener("loadedmetadata",resolve,{once:true});audio.addEventListener("error",resolve,{once:true});});
    try{audio.currentTime=start;}catch(e){}
    await playAudio();
    if(activeMemorySegment?.end&&activeMemorySegment.end<=start){activeMemorySegment.end=null;toast("End time must be later than start time.");}
  }
  function renderFieldNotes(){const list=$("#observationList");list.innerHTML=content.fieldNotes.map(n=>`<div class="observation"><span class="mono">${escapeHTML(n.label)}</span><p>${escapeHTML(n.text)}</p></div>`).join("");}
  const audio=$("#audioElement");
  let activeAudioObjectURL = "";
  const AUDIO_DB_NAME = "volumeOneScrapbookAudio";
  const AUDIO_STORE = "tracks";
  function openAudioDB(){return new Promise((resolve,reject)=>{if(!("indexedDB" in window)){reject(new Error("This browser does not support local audio storage."));return;}const req=indexedDB.open(AUDIO_DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(AUDIO_STORE))db.createObjectStore(AUDIO_STORE);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("Could not open audio storage."));});}
  async function storeAudioFile(trackId,file){const db=await openAudioDB();return new Promise((resolve,reject)=>{const tx=db.transaction(AUDIO_STORE,"readwrite");tx.objectStore(AUDIO_STORE).put({blob:file,name:file.name,type:file.type||"audio/mpeg",size:file.size},trackId);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error||new Error("Could not save audio."));};});}
  async function getStoredAudio(trackId){const db=await openAudioDB();return new Promise((resolve,reject)=>{const tx=db.transaction(AUDIO_STORE,"readonly");const req=tx.objectStore(AUDIO_STORE).get(trackId);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error("Could not load audio."));tx.oncomplete=()=>db.close();tx.onerror=()=>{db.close();reject(tx.error||new Error("Could not read audio."));};});}
  async function removeStoredAudio(trackId){try{const db=await openAudioDB();await new Promise((resolve,reject)=>{const tx=db.transaction(AUDIO_STORE,"readwrite");tx.objectStore(AUDIO_STORE).delete(trackId);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}catch(e){}}
  function setAudioSource(src){if(activeAudioObjectURL){URL.revokeObjectURL(activeAudioObjectURL);activeAudioObjectURL="";}audio.pause();audio.removeAttribute("src");audio.load();if(src)audio.src=src;}
  function renderPlaylist(){
    const t=content.playlist[currentTrack]||content.playlist[0];if(!t)return;
    $("#trackTitle").textContent=t.title;$("#trackArtist").textContent=t.artist;
    $("#trackNumber").textContent=`A / ${String(currentTrack+1).padStart(2,"0")}`;
    $("#trackMemory").innerHTML=`<span class="mono">CONNECTED MEMORY / ${escapeHTML(t.memoryId||"NOT LINKED")}</span><p>${escapeHTML(t.note||"No note added yet.")}</p><p class="tiny-muted">${t.localAudioName?`AUDIO FILE ADDED · ${escapeHTML(t.localAudioName)}`:(t.source?"Direct audio source set. Press play to listen.":"Add an audio file for this song in EDIT ARCHIVE → SOUNDTRACK. It will play here without opening another website.")}</p>${t.memoryId?`<button class="text-link" id="openLinkedMemory">OPEN CONNECTED MEMORY ↗</button>`:""}`;
    $("#openLinkedMemory")?.addEventListener("click",()=>openMemory(t.memoryId));
    const list=$("#playlist");list.innerHTML=content.playlist.map((x,i)=>`<button class="playlist-item ${i===currentTrack?"active":""}" data-track="${i}"><span>${escapeHTML(x.title)}<small>${escapeHTML(x.artist)}</small></span><span>${String(i+1).padStart(2,"0")}</span></button>`).join("");
    $$(".playlist-item",list).forEach(b=>b.addEventListener("click",()=>setTrack(Number(b.dataset.track))));
  }
  async function setTrack(i,autoplay=false){if(!content.playlist.length)return;activeMemorySegment=null;currentTrack=(i+content.playlist.length)%content.playlist.length;const t=content.playlist[currentTrack];setAudioSource("");$("#playTrack").textContent="▶";$("#playTrack").setAttribute("aria-label","Play");$("#reels").querySelectorAll(".reel").forEach(r=>r.classList.remove("spinning"));$("#audioNote").textContent="Add your audio file for this track in EDIT ARCHIVE → SOUNDTRACK, then press play. Music plays inside this page.";renderPlaylist();try{const saved=await getStoredAudio(t.id);if(saved?.blob){activeAudioObjectURL=URL.createObjectURL(saved.blob);audio.src=activeAudioObjectURL;}else if(t.source){audio.src=safeURL(t.source)||"";}}catch(e){if(t.source)audio.src=safeURL(t.source)||"";}if(autoplay)playAudio();}
  async function playAudio(){if(!audio.src)await setTrack(currentTrack,false);if(!audio.src){toast("Add an audio file for this track in EDIT ARCHIVE → SOUNDTRACK first.");return;}try{await audio.play();$("#playTrack").textContent="Ⅱ";$("#playTrack").setAttribute("aria-label","Pause");$("#reels").querySelectorAll(".reel").forEach(r=>r.classList.add("spinning"));$("#audioNote").textContent="Now playing. Audio can be stopped any time.";}catch(e){$("#audioNote").textContent="This audio file could not be played. Try a supported audio file such as MP3 or M4A.";toast("Could not play this audio file. Try another file format.");}}
  audio.addEventListener("pause",()=>{$("#playTrack").textContent="▶";$("#playTrack").setAttribute("aria-label","Play");$("#reels").querySelectorAll(".reel").forEach(r=>r.classList.remove("spinning"));});
  audio.addEventListener("play",()=>{$("#playTrack").textContent="Ⅱ";$("#reels").querySelectorAll(".reel").forEach(r=>r.classList.add("spinning"));});
  audio.addEventListener("timeupdate",()=>{if(activeMemorySegment?.end&&audio.currentTime>=activeMemorySegment.end){activeMemorySegment=null;audio.pause();return;}if(audio.duration){$("#progress").value=audio.currentTime/audio.duration*100;$("#elapsed").textContent=fmtTime(audio.currentTime);$("#duration").textContent=fmtTime(audio.duration);}});
  audio.addEventListener("ended",()=>setTrack(currentTrack+1,true));
  audio.addEventListener("error",()=>{if(audio.src)$("#audioNote").textContent="This audio source could not be played. Try a permitted direct audio URL."});
  function fmtTime(n){if(!Number.isFinite(n))return "--:--";return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(Math.floor(n%60)).padStart(2,"0")}`;}
  function renderJoke(choose=false){if(choose)currentJoke=-1;const jokes=content.jokes;if(!jokes.length){$("#jokeText").textContent="Add jokes in the editor.";$("#jokeCount").textContent="NO LAB NOTES";return;}let next;if(jokes.length===1)next=0;else{do{next=Math.floor(Math.random()*jokes.length)}while(next===currentJoke)}currentJoke=next;$("#jokeText").textContent=jokes[currentJoke];$("#jokeCount").textContent=`LAB NOTE ${String(currentJoke+1).padStart(3,"0")} / ${String(jokes.length).padStart(3,"0")}`;}
  function renderISC(){
    const saved=readLocal("iscChecks",{}), items=content.iscSection.checklist;
    $("#revisionChecklist").innerHTML=items.map((x,i)=>`<label class="check-row"><input type="checkbox" data-check="${i}" ${saved[i]?"checked":""}><span>${escapeHTML(x)}</span></label>`).join("");
    $("#examDayList").innerHTML=content.iscSection.examDay.map((x,i)=>`<label class="check-row"><input type="checkbox" data-examday="${i}" ${readLocal("examDayChecks",{})[i]?"checked":""}><span>${escapeHTML(x)}</span></label>`).join("");
    $$("[data-check]").forEach(el=>el.addEventListener("change",()=>{const s=readLocal("iscChecks",{});s[el.dataset.check]=el.checked;writeLocal("iscChecks",s);updateRevisionProgress();}));
    $$("[data-examday]").forEach(el=>el.addEventListener("change",()=>{const s=readLocal("examDayChecks",{});s[el.dataset.examday]=el.checked;writeLocal("examDayChecks",s);}));
    const date=content.iscSection.examDate||content.siteSettings.examDate||"";$("#examDate").value=date;updateCountdown();
    $("#examDate").onchange=()=>{content.iscSection.examDate=$("#examDate").value;content.siteSettings.examDate=$("#examDate").value;saveContent();updateCountdown();toast("Exam date saved in this browser.");};
    $("#motivationMessage").hidden=true;updateRevisionProgress();
  }
  function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem("scrapbook_"+key)||"null")??fallback}catch{return fallback}}
  function writeLocal(key,val){try{localStorage.setItem("scrapbook_"+key,JSON.stringify(val))}catch{}}
  function updateRevisionProgress(){const checks=readLocal("iscChecks",{}),total=content.iscSection.checklist.length,done=Object.values(checks).filter(Boolean).length,pct=total?Math.round(done/total*100):0;$("#progressPercent").textContent=pct+"%";$("#revisionBar").style.width=pct+"%";$("#checkCount").textContent=`${done} / ${total}`;}
  function updateCountdown(){const d=$("#examDate").value;if(!d){$("#countdown").textContent="SET A DATE";return;}const target=new Date(d+"T00:00:00");const now=new Date();now.setHours(0,0,0,0);const days=Math.ceil((target-now)/86400000);$("#countdown").textContent=days<0?`${Math.abs(days)} DAYS AGO`:days===0?"TODAY":`${days} DAYS`;}
  function renderNYC(){
    const dests=content.newYorkTravelGuide;$("#destinationCount").textContent=`${String(dests.length).padStart(2,"0")} PLACES`;
    $("#mapPins").innerHTML=dests.map((d,i)=>`<button class="map-pin" title="${escapeHTML(d.title)}" aria-label="Open ${escapeHTML(d.title)}" data-dest="${escapeHTML(d.id)}" style="left:${d.x||50}%;top:${d.y||50}%">${i+1}</button>`).join("");
    $("#destinations").innerHTML=dests.map((d,i)=>`<article class="destination-item ${d.done?"done":""}" id="${escapeHTML(d.id)}"><span class="dest-number">${String(i+1).padStart(2,"0")}</span><div><h4>${escapeHTML(d.title)}</h4><p>${escapeHTML(d.description)}</p><p class="dest-note">${escapeHTML(d.caption||"")}</p>${d.budget?`<p class="mono">EST. BUDGET: ${escapeHTML(d.budget)}</p>`:""}${d.note?`<p>${escapeHTML(d.note)}</p>`:""}${d.link?`<a href="${escapeHTML(safeURL(d.link))}" target="_blank" rel="noopener noreferrer">OFFICIAL / INFO LINK ↗</a>`:""}</div><input type="checkbox" aria-label="Mark ${escapeHTML(d.title)} as planned" data-done-dest="${escapeHTML(d.id)}" ${d.done?"checked":""}></article>`).join("");
    $$(".map-pin").forEach(b=>b.addEventListener("click",()=>{const el=document.getElementById(b.dataset.dest);el?.scrollIntoView({behavior:"smooth",block:"center"});$$(".map-pin").forEach(p=>p.classList.toggle("active",p===b));}));
    $$("[data-done-dest]").forEach(el=>el.addEventListener("change",()=>{const d=dests.find(x=>x.id===el.dataset.doneDest);if(d){d.done=el.checked;saveContent();el.closest(".destination-item").classList.toggle("done",el.checked);}}));
    $("#bucketItems").innerHTML=content.bucketList.map((b,i)=>`<label class="bucket-row"><input type="checkbox" data-bucket="${escapeHTML(b.id)}" ${b.done?"checked":""}><span>${escapeHTML(b.text)}</span></label>`).join("");
    $$("[data-bucket]").forEach(el=>el.addEventListener("change",()=>{const b=content.bucketList.find(x=>x.id===el.dataset.bucket);if(b){b.done=el.checked;saveContent();}}));
  }
  function renderFuturePlans(){const el=$("#futurePlans");el.innerHTML=content.futurePlans.map(p=>`<div class="future-plan"><div><strong>${escapeHTML(p.title)}</strong><br><span>${escapeHTML(p.note||"")}</span></div><button data-plan="${escapeHTML(p.id)}" aria-label="Open related memory">↗</button></div>`).join("");$$("[data-plan]").forEach(b=>b.addEventListener("click",()=>{const p=content.futurePlans.find(x=>x.id===b.dataset.plan);if(p?.linkedMemoryId)openMemory(p.linkedMemoryId);else toast("Link a memory to this plan in the editor.");}));}
  function updateCounter(){const count=content.photoGallery.length;$("#counter").textContent=`FRAME ${String(Math.min(count,99)).padStart(3,"0")} / ${String(count).padStart(3,"0")}`;}
  function openEditor(tab="text"){activeTab=tab;$("#editorDrawer").hidden=false;renderEditor();document.body.classList.add("modal-open");}
  function closeEditor(){ $("#editorDrawer").hidden=true;document.body.classList.remove("modal-open");}
  function field(label,path,value,type="text",placeholder=""){return `<label class="editor-field"><span>${escapeHTML(label)}</span>${type==="textarea"?`<textarea data-path="${escapeHTML(path)}" placeholder="${escapeHTML(placeholder)}">${escapeHTML(value)}</textarea>`:`<input data-path="${escapeHTML(path)}" type="${type}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}">`}</label>`;}
  function renderEditor(){
    $$(".editor-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===activeTab));
    const pane=$("#editorPane");
    if(activeTab==="text"){
      pane.innerHTML=`<p class="editor-help">Edit the most-used copy here. Save changes to update the visitor view in this browser.</p>
      ${field("Friend's name","siteSettings.hisName",content.siteSettings.hisName)}
      <div class="editor-row">${field("Archive year","siteSettings.archiveYear",content.siteSettings.archiveYear)}${field("Exam date","iscSection.examDate",content.iscSection.examDate,"date")}</div>
      ${field("Opening heading","openingScreen.title",content.openingScreen.title,"textarea")}
      ${field("Opening subtitle","openingScreen.subtitle",content.openingScreen.subtitle,"textarea")}
      ${field("Opening annotation","openingScreen.annotation",content.openingScreen.annotation)}
      ${field("Small things journal","smallThingsText",content.smallThingsText,"textarea")}
      <h3 class="editor-section-title">HIS PORTFOLIO / FIELD NOTES</h3>
      ${content.fieldNotes.map((note,i)=>`${field(`Portfolio detail ${i+1} label`,`fieldNotes.${i}.label`,note.label)}${field(`Portfolio detail ${i+1} text`,`fieldNotes.${i}.text`,note.text,"textarea")}`).join("")}
      <p class="editor-help">Change the portfolio descriptions here. Add or replace the portfolio photograph under PHOTOS.</p>
      <h3 class="editor-section-title">TEACHERS’ DAY LORE</h3>
      ${field("Teachers’ Day title","teachersDayMemories.title",content.teachersDayMemories.title)}
      ${field("Teachers’ Day introduction","teachersDayMemories.intro",content.teachersDayMemories.intro,"textarea")}
      ${(content.teachersDayMemories.sections||[]).map((section,i)=>`${field(`Teachers’ Day section ${i+1} heading`,`teachersDayMemories.sections.${i}.title`,section.title)}${field(`Teachers’ Day section ${i+1} story`,`teachersDayMemories.sections.${i}.text`,section.text,"textarea")}`).join("")}
      ${(content.teachersDayMemories.captions||[]).map((caption,i)=>field(`Teachers’ Day caption ${i+1}`,`teachersDayMemories.captions.${i}`,caption)).join("")}
      ${field("Teachers’ Day photo label","teachersDayMemories.photoCaption",content.teachersDayMemories.photoCaption||"TEACHERS’ DAY / PHOTO FILE")}
      <h3 class="editor-section-title">BIRTHDAY LORE</h3>
      ${field("Birthday title","birthdayMemories.title",content.birthdayMemories.title)}
      ${field("Birthday introduction","birthdayMemories.intro",content.birthdayMemories.intro,"textarea")}
      ${field("Birthday message","birthdayMemories.message",content.birthdayMemories.message||"","textarea")}
      ${(content.birthdayMemories.captions||[]).map((caption,i)=>field(`Birthday caption ${i+1}`,`birthdayMemories.captions.${i}`,caption)).join("")}
      ${field("Birthday photo label","birthdayMemories.photoCaption",content.birthdayMemories.photoCaption||"BIRTHDAY / PHOTO FILE")}
      ${field("Letter heading","thankYouLetter.title",content.thankYouLetter.title)}
      ${field("Complete thank-you letter","thankYouLetter.body",content.thankYouLetter.body,"textarea")}
      ${field("Letter closing","thankYouLetter.closing",content.thankYouLetter.closing)}
      ${field("Final page message","finalPage.message",content.finalPage.message,"textarea")}
      ${field("Footer","finalPage.footer",content.finalPage.footer)}
      <label class="check-row"><input id="eggsToggle" type="checkbox" ${content.siteSettings.enableEasterEggs?"checked":""}><span>Enable optional easter eggs</span></label>`;
    } else if(activeTab==="memories"){
      pane.innerHTML=`<p class="editor-help">Each memory connects its photograph, story, song, clue, and future plan using a unique ID. Use these controls to edit, add, remove, or reorder entries.</p><div id="memoryEditorList">${content.photoGallery.map((m,i)=>`<div class="editor-memory"><strong>${escapeHTML(m.title)}</strong><p>${escapeHTML(m.id)} · ${escapeHTML(m.date||"undated")} · ${escapeHTML(m.caption||"")}</p><div class="editor-memory-actions"><button data-edit-memory="${i}">EDIT</button><button data-move-memory="${i}" data-dir="-1" ${i===0?"disabled":""}>↑ MOVE UP</button><button data-move-memory="${i}" data-dir="1" ${i===content.photoGallery.length-1?"disabled":""}>↓ MOVE DOWN</button><button data-delete-memory="${i}">DELETE</button></div></div>`).join("")}</div><button class="outline-button" id="newMemory">＋ ADD MEMORY</button><div id="memoryForm"></div>`;
      $$("#memoryEditorList [data-edit-memory]").forEach(b=>b.onclick=()=>editMemory(Number(b.dataset.editMemory)));
      $$("#memoryEditorList [data-move-memory]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.moveMemory),j=i+Number(b.dataset.dir);if(j<0||j>=content.photoGallery.length)return;[content.photoGallery[i],content.photoGallery[j]]=[content.photoGallery[j],content.photoGallery[i]];renderEditor();});
      $$("#memoryEditorList [data-delete-memory]").forEach(b=>b.onclick=()=>{if(confirm("Delete this memory from the current archive?")){const m=content.photoGallery.splice(Number(b.dataset.deleteMemory),1)[0];content.playlist.forEach(t=>{if(t.memoryId===m.id)t.memoryId="";});renderEditor();}});
      $("#newMemory").onclick=()=>{const id="memory-"+String(Date.now()).slice(-6);content.photoGallery.push({id,title:"New memory",date:"2026",location:"",caption:"",story:"",image:"",songId:"",songStart:"",songEnd:"",clue:false,relatedPlan:"",layout:"medium"});renderEditor();editMemory(content.photoGallery.length-1);};
    } else if(activeTab==="soundtrack"){
      pane.innerHTML=`<p class="editor-help">Upload an audio file from your phone or computer for each song. It will play directly inside this scrapbook, without opening YouTube. Common formats such as MP3, M4A, and WAV work in most modern browsers. Your audio files stay in this browser on this device.</p>
      <div id="trackEditorList">${content.playlist.map((t,i)=>`<div class="editor-memory" style="margin-bottom:14px"><strong>TRACK ${String(i+1).padStart(2,"0")}${i===0?" · OPENING SONG":""}</strong>${field("Song title",`playlist.${i}.title`,t.title)}${field("Artist",`playlist.${i}.artist`,t.artist)}<label class="editor-field"><span>Choose audio file</span><input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" data-audio-track="${i}"></label><p class="editor-help" data-audio-status="${i}">${t.localAudioName?`Saved audio: ${escapeHTML(t.localAudioName)}`:(t.source?"A direct audio URL is set.":"No audio file added yet. Choose a file to make this track playable.")}</p>${field("Direct audio URL (optional)",`playlist.${i}.source`,t.source||"")}${field("Memory note",`playlist.${i}.note`,t.note||"","textarea")}<button class="editor-small-button" data-delete-track="${i}">REMOVE TRACK</button></div>`).join("")}</div><button class="outline-button" id="addTrack">＋ ADD SONG</button>`;
      pane.querySelectorAll("[data-path]").forEach(el=>el.addEventListener("change",()=>{const parts=el.dataset.path.split(".");const i=Number(parts[1]);const key=parts[2];if(content.playlist[i])content.playlist[i][key]=el.value;}));
      $$('[data-audio-track]').forEach(input=>input.addEventListener("change",async()=>{const file=input.files?.[0];if(!file)return;const i=Number(input.dataset.audioTrack),track=content.playlist[i];if(!track)return;if(!file.type.startsWith("audio/")&&!/\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file.name)){toast("Choose an audio file such as MP3, M4A, WAV, or OGG.");return;}const status=$(`[data-audio-status="${i}"]`);if(status)status.textContent="Saving audio file…";try{await storeAudioFile(track.id,file);track.localAudioName=file.name;track.source="";saveContent();if(status)status.textContent=`Saved audio: ${file.name}`;toast("Audio added. Press play to listen inside the scrapbook.");if(i===currentTrack)setTrack(i);}catch(e){if(status)status.textContent="Could not save this audio file in this browser.";toast("Could not save audio. Try a smaller file or another browser.");}}));
      $$('[data-delete-track]').forEach(b=>b.onclick=()=>{if(content.playlist.length<=1){toast("Keep at least one song in the playlist.");return;}const removed=content.playlist.splice(Number(b.dataset.deleteTrack),1)[0];removeStoredAudio(removed.id);if(currentTrack>=content.playlist.length)currentTrack=content.playlist.length-1;setTrack(currentTrack);renderEditor();});
      $("#addTrack").onclick=()=>{content.playlist.push({id:"track-"+String(Date.now()).slice(-6),title:"New song",artist:"Artist",source:"",listenUrl:"",memoryId:"",note:"Add a note about this song.",embed:""});renderEditor();};
    } else if(activeTab==="photos"){
      pane.innerHTML=`<p class="editor-help">Choose images from your phone or computer. Selected images are embedded in this browser's saved content, so large photos can fill browser storage. Keep original files backed up separately and use compressed JPG/WebP images where possible.</p>
      <div class="upload-box"><label class="editor-field"><span>Cover photograph</span><input type="file" id="coverUpload" accept="image/*"></label><label class="editor-field"><span>Portfolio / field notes photograph</span><input type="file" id="portfolioUpload" accept="image/*"></label><label class="editor-field"><span>Photo that feels like this year (beside the letter)</span><input type="file" id="yearPhotoUpload" accept="image/*"></label><label class="editor-field"><span>Final page photograph</span><input type="file" id="finalUpload" accept="image/*"></label></div>
      <h3 class="editor-section-title">EVENT PHOTOS</h3>
      <div class="editor-memory"><strong>Teachers’ Day lore</strong><p>${content.teachersDayMemories.image?"Photo added":"No photo selected yet"}</p><label class="editor-field"><span>Choose / replace Teachers’ Day photo</span><input type="file" id="teachersDayUpload" accept="image/*"></label>${content.teachersDayMemories.image?`<button class="editor-small-button" id="removeTeachersDayPhoto">REMOVE PHOTO</button>`:""}</div>
      <div class="editor-memory"><strong>Birthday archive</strong><p>${content.birthdayMemories.image?"Photo added":"No photo selected yet"}</p><label class="editor-field"><span>Choose / replace birthday photo</span><input type="file" id="birthdayUpload" accept="image/*"></label>${content.birthdayMemories.image?`<button class="editor-small-button" id="removeBirthdayPhoto">REMOVE PHOTO</button>`:""}</div>
      <h3 style="font:22px var(--serif)">Memory photographs</h3><div id="photoEditorList">${content.photoGallery.map((m,i)=>`<div class="editor-memory"><strong>${escapeHTML(m.title)}</strong><p>${m.image?"Photo added":"No photo selected yet"}</p><label class="editor-field"><span>Choose / replace image</span><input type="file" accept="image/*" data-photo-memory="${i}"></label>${m.image?`<button class="editor-small-button" data-remove-photo="${i}">REMOVE PHOTO</button>`:""}</div>`).join("")}</div>
      <p class="editor-help">Image selection saves only after you click SAVE CHANGES. This browser-only build does not upload images to a shared online server.</p>`;
      $("#coverUpload").onchange=e=>readImage(e.target.files[0],url=>content.openingScreen.photo=url);
      $("#portfolioUpload").onchange=e=>readImage(e.target.files[0],url=>{content.fieldNotesPhoto=url;renderEditor();});
      $("#finalUpload").onchange=e=>readImage(e.target.files[0],url=>content.finalPage.photo=url);
      $("#yearPhotoUpload").onchange=e=>readImage(e.target.files[0],url=>{content.yearPhoto=url;renderEditor();});
      $("#teachersDayUpload").onchange=e=>readImage(e.target.files[0],url=>{content.teachersDayMemories.image=url;renderEditor();});
      $("#birthdayUpload").onchange=e=>readImage(e.target.files[0],url=>{content.birthdayMemories.image=url;renderEditor();});
      $("#removeTeachersDayPhoto")?.addEventListener("click",()=>{content.teachersDayMemories.image="";renderEditor();});
      $("#removeBirthdayPhoto")?.addEventListener("click",()=>{content.birthdayMemories.image="";renderEditor();});
      $$("[data-photo-memory]").forEach(el=>el.onchange=e=>readImage(e.target.files[0],url=>content.photoGallery[Number(el.dataset.photoMemory)].image=url));
      $$("[data-remove-photo]").forEach(el=>el.onclick=()=>{content.photoGallery[Number(el.dataset.removePhoto)].image="";renderEditor();});
    } else {
      pane.innerHTML=`<p class="editor-help">Export your full content as a JSON backup. Import it on another device or after reinstalling the site. This includes text and any embedded image data, so image-heavy backups can be large.</p><button class="button button-dark" id="exportBackup">EXPORT CONTENT BACKUP (.JSON)</button><div style="height:18px"></div><label class="editor-field"><span>Import a previous JSON backup</span><input id="importBackup" type="file" accept="application/json,.json"></label><p class="editor-help">You can also edit the original content.js file before publishing. Browser edits do not automatically modify content.js or update a public hosting service.</p><button class="outline-button" id="copyContent">COPY CONTENT JSON</button><div style="height:18px"></div><label class="editor-field"><span>Current data (advanced)</span><textarea id="jsonEditor" style="min-height:170px;font-family:var(--mono);font-size:10px">${escapeHTML(JSON.stringify(content,null,2))}</textarea></label><button class="outline-button" id="applyJson">VALIDATE & APPLY JSON</button>`;
      $("#exportBackup").onclick=exportBackup;
      $("#importBackup").onchange=importBackup;
      $("#copyContent").onclick=()=>{navigator.clipboard?.writeText(JSON.stringify(content,null,2)).then(()=>toast("JSON copied."),()=>toast("Copy not available. Use export instead."));};
      $("#applyJson").onclick=()=>{try{const obj=JSON.parse($("#jsonEditor").value);if(!obj.siteSettings||!obj.photoGallery)throw new Error("Required fields missing");content=mergeDeep(clone(DEFAULTS),obj);saveContent();render();renderEditor();toast("JSON validated and applied.");}catch(e){toast("Could not apply JSON: "+e.message);}};
    }
    pane.querySelectorAll("[data-path]").forEach(el=>el.addEventListener("change",()=>{setPath(content,el.dataset.path,el.value);}));
    $("#eggsToggle")?.addEventListener("change",e=>content.siteSettings.enableEasterEggs=e.target.checked);
  }
  function setPath(obj,path,value){const keys=path.split(".");let cur=obj;keys.slice(0,-1).forEach(k=>cur=cur[k]);cur[keys[keys.length-1]]=value;}
  function editMemory(i){
    const m=content.photoGallery[i];if(!m)return;const form=$("#memoryForm");
    form.innerHTML=`<div class="editor-memory" style="background:#e7e1d4;padding:14px;margin-top:16px"><p class="eyebrow mono">EDIT MEMORY / ${escapeHTML(m.id)}</p>${field("Title",`mem.${i}.title`,m.title)}<div class="editor-row">${field("Date",`mem.${i}.date`,m.date)}${field("Location",`mem.${i}.location`,m.location)}</div>${field("Short caption",`mem.${i}.caption`,m.caption,"textarea")}${field("Full story",`mem.${i}.story`,m.story,"textarea")}${field("Connected song ID",`mem.${i}.songId`,m.songId,"text","e.g. track-001")}${field("Song start time (seconds)",`mem.${i}.songStart`,m.songStart??"","number","e.g. 42")}${field("Song end time (seconds)",`mem.${i}.songEnd`,m.songEnd??"","number","e.g. 58")}${field("Related future plan ID",`mem.${i}.relatedPlan`,m.relatedPlan,"text","e.g. plan-001")}<button id="closeMemoryForm" class="outline-button">DONE EDITING THIS MEMORY</button></div>`;
    form.querySelectorAll("[data-path]").forEach(el=>el.onchange=()=>{const path=el.dataset.path.split(".").slice(2).join(".");m[path]=el.value;});

    $("#closeMemoryForm").onclick=()=>{renderEditor();};
  }
  function readImage(file,callback){if(!file)return;if(!file.type.startsWith("image/")){toast("Please choose an image file.");return;}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=1500,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);callback(canvas.toDataURL("image/jpeg",.82));toast("Image prepared. Save changes to keep it in this browser.");};img.onerror=()=>toast("Could not read this image.");img.src=reader.result;};reader.readAsDataURL(file);}
  function exportBackup(){const blob=new Blob([JSON.stringify(content,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="volume-one-content-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Content backup exported.");}
  function importBackup(e){const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const obj=JSON.parse(r.result);if(!obj.siteSettings||!obj.photoGallery)throw new Error("This does not look like a scrapbook backup.");content=mergeDeep(clone(DEFAULTS),obj);saveContent();render();renderEditor();toast("Backup imported.");}catch(err){toast("Import failed: "+err.message);}};r.readAsText(file);}
  $("#openArchive").addEventListener("click",()=>scrollToId("year"));
  $("#backToTop").addEventListener("click",()=>scrollToId("top"));
  $("#menuToggle").addEventListener("click",()=>{const nav=$("#siteNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));$("#menuToggle span").textContent=open?"−":"＋";});
  $$("#siteNav a").forEach(a=>a.addEventListener("click",()=>{$("#siteNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}));
  $("#openEditor").addEventListener("click",()=>openEditor("text"));$("#closeEditor").addEventListener("click",closeEditor);
  $$(".editor-tab").forEach(b=>b.addEventListener("click",()=>{activeTab=b.dataset.tab;renderEditor();}));
  $("#saveEdits").addEventListener("click",()=>{saveContent();render();closeEditor();toast("Changes saved in this browser.");});
  $("#resetEdits").addEventListener("click",()=>{if(confirm("Reset the local archive to the original content.js defaults? This removes local edits.")){content=clone(DEFAULTS);localStorage.removeItem(STORAGE_KEY);render();renderEditor();toast("Local edits reset.");}});
  $("#playTrack").addEventListener("click",()=>audio.paused?playAudio():audio.pause());
  $("#playMeButton").addEventListener("click",()=>{if(currentTrack!==0){setTrack(0,true);return;}if(audio.paused){playAudio();}else{audio.pause();}});
  $("#prevTrack").addEventListener("click",()=>setTrack(currentTrack-1));$("#nextTrack").addEventListener("click",()=>setTrack(currentTrack+1));
  $("#progress").addEventListener("input",()=>{if(audio.duration)audio.currentTime=Number($("#progress").value)/100*audio.duration;});
  $("#volume").addEventListener("input",()=>audio.volume=Number($("#volume").value));audio.volume=.7;
  $("#muteButton").addEventListener("click",()=>{audio.muted=!audio.muted;$("#muteButton").textContent=audio.muted?"MUTED":"SOUND ON";});
  $("#playlistToggle").addEventListener("click",()=>{const list=$("#playlist");list.hidden=!list.hidden;$("#playlistToggle").textContent=list.hidden?"PLAYLIST ＋":"PLAYLIST −";});
  $("#enterPlayMusic").addEventListener("click",()=>{scrollToId("soundtrack");playAudio();});
  $("#nextJoke").addEventListener("click",()=>renderJoke());
  $$("[data-open-story]").forEach(b=>b.addEventListener("click",()=>{const type=b.dataset.openStory;const item=content[type==="teachers"?"teachersDayMemories":"birthdayMemories"];$("#storyEyebrow").textContent=type==="teachers"?"EVENT FILE / TEACHERS’ DAY":"EVENT FILE / BIRTHDAY";$("#storyTitle").textContent=item.title;$("#storyContent").innerHTML=`${item.image?`<img class="story-photo" src="${escapeHTML(safeURL(item.image))}" alt="${escapeHTML(item.title)}">`:""}<p>${escapeHTML(item.intro||"")}</p>${(item.sections||[]).map(s=>`<h3 style="font:22px var(--serif);margin:22px 0 5px">${escapeHTML(s.title)}</h3><p>${escapeHTML(s.text)}</p>`).join("")}${item.message?`<p>${escapeHTML(item.message)}</p>`:""}<p><strong>Sample captions</strong></p><ul>${(item.captions||[]).map(c=>`<li>${escapeHTML(c)}</li>`).join("")}</ul>`;$("#storyRelated").innerHTML=`<button class="related-link" id="goGallery">OPEN PHOTO ARCHIVE ↗</button>`;$("#goGallery").onclick=()=>{ $("#storyModal").hidden=true;document.body.classList.remove("modal-open");scrollToId("lore");};$("#storyModal").hidden=false;document.body.classList.add("modal-open");}));
  $$("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>{$("#storyModal").hidden=true;document.body.classList.remove("modal-open");}));
  $("#storyModal").addEventListener("keydown",e=>{if(e.key==="Escape"){$("#storyModal").hidden=true;document.body.classList.remove("modal-open");}});
  $("#addMemoryButton").addEventListener("click",()=>openEditor("memories"));
  $("#editLetterShortcut").addEventListener("click",()=>openEditor("text"));
  $("#addChecklistItem").addEventListener("click",()=>{const text=prompt("What should be on the checklist?");if(text?.trim()){content.iscSection.checklist.push(text.trim());saveContent();renderISC();toast("Checklist item added.");}});
  $("#motivationButton").addEventListener("click",()=>{const messages=content.iscSection.messages;$("#motivationMessage").textContent=messages[Math.floor(Math.random()*messages.length)]||"One paper at a time. You have got this.";$("#motivationMessage").hidden=false;});
  $("#revealMotivation").addEventListener("click",()=>{const msg=content.iscSection.hiddenMessage;$("#hiddenMotivation").innerHTML=`<span class="handwritten">${escapeHTML(msg)}</span>`;});
  $("#addFuturePlan").addEventListener("click",()=>{const title=prompt("What future plan should we save?");if(title?.trim()){content.futurePlans.push({id:"plan-"+String(Date.now()).slice(-6),title:title.trim(),note:"Add the details in Edit Archive.",linkedMemoryId:""});saveContent();renderFuturePlans();toast("Future plan added.");}});
  // Optional easter eggs. Tiny symbols remain unobtrusive and are keyboard accessible.
  if(content.siteSettings.enableEasterEggs){
    $(".clover")?.setAttribute("tabindex","0");$(".clover")?.setAttribute("role","button");$(".clover")?.setAttribute("aria-label","Reveal a hidden friendship note");
    const clover=()=>toast("A tiny note for the archive: ordinary days count, too.");
    $(".clover")?.addEventListener("click",clover);$(".clover")?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();clover();}});
    let cassetteClicks=0;$("#reels").addEventListener("click",()=>{cassetteClicks++;if(cassetteClicks>=3){cassetteClicks=0;toast("This mixtape has been scientifically overthought.");}});
    $(".tiny-star").addEventListener("click",()=>toast("Unexpected message: keep the silly photographs."));
  }
  // keyboard-friendly Escape handling
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#storyModal").hidden){$("#storyModal").hidden=true;document.body.classList.remove("modal-open");}if(!$("#editorDrawer").hidden)closeEditor();}});
  const surpriseScreen=$("#surpriseScreen");
  const dismissSurprise=()=>{surpriseScreen.classList.add("surprise-dismissed");document.body.classList.remove("surprise-open");};
  $("#surpriseYes").addEventListener("click",dismissSurprise);
  // The playful NO option deliberately reveals the surprise too.
  $("#surpriseNo").addEventListener("click",dismissSurprise);
  document.body.classList.add("surprise-open");
  render();
  setTrack(0);
})();
