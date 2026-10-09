let state = {tab:'home', stream:'all', examStream:'all', examYear:'all', qSub:'phys', qIdx:0, qScore:0, qDone:{}, search:''};
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const favs = () => JSON.parse(localStorage.getItem('bac-fav')||'[]');
const toggleFav = id => { let f=favs(); f=f.includes(id)?f.filter(x=>x!==id):[...f,id]; localStorage.setItem('bac-fav',JSON.stringify(f)); toast(f.includes(id)?'⭐ أضيفت للمفضلة':'🗑️ حذفت من المفضلة'); render(); };
const prog = () => JSON.parse(localStorage.getItem('bac-prog')||'{}');
const markDone = id => { const p=prog(); p[id]=true; localStorage.setItem('bac-prog',JSON.stringify(p)); toast('✅ أحسنت! تم تحديد الدرس كمنجز'); render(); };

function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.remove('hidden'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add('hidden'),2200); }

/* ---- click animation on EVERY press ---- */
let fxOn = localStorage.getItem('bac-fx') !== 'off';
function fxToggleBtn(){ $('#fxToggle').textContent = fxOn ? '✨ المؤثرات: ON' : '✨ المؤثرات: OFF'; }
$('#fxToggle').onclick = () => { fxOn=!fxOn; localStorage.setItem('bac-fx',fxOn?'on':'off'); fxToggleBtn(); toast(fxOn?'✨ تم تفعيل الأنيميشن':'⏸️ تم إيقاف الأنيميشن'); };
document.addEventListener('pointerdown', e => {
  if(!fxOn) return;
  const layer = $('#click-fx-layer');
  const r = document.createElement('span'); r.className='ripple';
  r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; layer.appendChild(r);
  setTimeout(()=>r.remove(),650);
  const colors=['#7c5cff','#00e5cc','#ffcf5c','#ff5c9a','#fff'];
  for(let i=0;i<10;i++){
    const s=document.createElement('span'); s.className='spark';
    s.style.left=e.clientX+'px'; s.style.top=e.clientY+'px';
    s.style.background=colors[i%colors.length];
    s.style.setProperty('--dx',(Math.random()*160-80)+'px');
    s.style.setProperty('--dy',(Math.random()*160-80)+'px');
    layer.appendChild(s); setTimeout(()=>s.remove(),850);
  }
  document.body.classList.remove('screen-pulse'); void document.body.offsetWidth; document.body.classList.add('screen-pulse');
}, {passive:true});
// card press effect
document.addEventListener('pointerdown', e=>{ const c=e.target.closest('.card,.exam-row,.quiz-opt,.tabs button'); if(c){c.classList.add('press'); setTimeout(()=>c.classList.remove('press'),180);} }, {passive:true});

/* ---- tabs ---- */
function goTab(t){ state.tab=t; $$('#mainTabs button, .bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
$$('#mainTabs button, .bottomnav button').forEach(b=>b.onclick=()=>goTab(b.dataset.tab));

$('#globalSearch').addEventListener('input', e=>{ state.search=e.target.value.trim(); if(state.search && state.tab==='home'){} render(); });

function chips(){
  const el=$('#streamChips');
  el.innerHTML = `<button class="chip ${state.stream==='all'?'active':''}" data-s="all">الكل</button>` +
    STREAMS.map(s=>`<button class="chip ${state.stream===s.id?'active':''}" data-s="${s.id}">${s.icon} ${s.name}</button>`).join('');
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.stream=b.dataset.s; state.examStream=b.dataset.s; chips(); render();});
}

/* ---- render ---- */
function render(){
  const app=$('#app');
  if(state.tab==='home') app.innerHTML = vHome();
  if(state.tab==='streams') app.innerHTML = vStreams();
  if(state.tab==='exams') app.innerHTML = vExams();
  if(state.tab==='quiz') app.innerHTML = vQuiz();
  if(state.tab==='revision') app.innerHTML = vRev();
  if(state.tab==='fav') app.innerHTML = vFav();
  bind(app);
}
function lessonCard(sid, sub, l, i){
  const id=`${sid}-${sub}-${i}`;
  const done=prog()[id]; const f=favs().includes(id);
  if(state.search && !(l.t+l.d).includes(state.search)) return '';
  return `<div class="lesson glass ${done?'':''}">
    <div class="lesson-head" data-lesson="${id}">
      <h4>${done?'✅ ':''}${l.t}</h4>
      <div style="display:flex;gap:6px">
        <button class="mini" data-fav="${id}">${f?'⭐':'☆'}</button>
        <button class="mini go" data-done="${id}">تم ✔</button>
      </div>
    </div>
    <div class="lesson-body" id="lb-${id}">
      <div class="exp">💡 <b>شرح مبسط:</b> ${l.d}</div>
      <ul>${l.pts.map(p=>`<li>${p}</li>`).join('')}</ul>
      <div class="rev-box">⚡ <b>مراجعة سريعة:</b> ${l.rev}</div>
    </div>
  </div>`;
}

function vHome(){
  const doneCount=Object.keys(prog()).length;
  return `<section class="hero glass">
    <div class="badges"><span class="badge gold">🇲🇦 المملكة المغربية</span><span class="badge">2005 → 2025 (21 سنة)</span><span class="badge">6 شعب • 12 مادة</span><span class="badge">📲 قابل للتثبيت PWA</span></div>
    <h1>باكالوريا المغرب — كل الدروس والامتحانات في جيبك 🎓</h1>
    <p>دروس مشروحة <b>ببساطة</b> لجميع الشعب، <b>امتحانات وطنية من 2005 إلى 2025</b> (عادية + استدراكية)، اختبارات تجريبية تصحح لك فورا، ومراجعة ليلة الامتحان. ثيم أسود مريح + زجاجي + أنيميشن مع كل ضغطة. ثبّت التطبيق وذاكر حتى بدون إنترنت.</p>
    <div class="cta-row">
      <button class="btn primary" data-go="streams">📚 ابدأ الدروس</button>
      <button class="btn" data-go="exams">📝 امتحانات 2005-2025</button>
      <button class="btn" data-go="quiz">🧪 اختبار تجريبي</button>
    </div>
    <div class="stat-grid">
      <div class="stat glass"><b>${STREAMS.length}</b><span>شعب</span></div>
      <div class="stat glass"><b>${Object.keys(SUBJECTS).length}</b><span>مادة</span></div>
      <div class="stat glass"><b>${EXAMS.length}</b><span>امتحان وطني</span></div>
      <div class="stat glass"><b>${doneCount}</b><span>درس منجز ✅</span></div>
    </div>
  </section>
  <div class="section-title"><h2>📚 اختر شعبتك</h2></div>
  <div class="grid c3">${STREAMS.map(s=>`
    <div class="card glass stream-card" data-stream="${s.id}">
      <div class="stream-ico">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p>
      <div class="meta"><span class="pill">${s.subs.length} مواد</span><span class="pill v2">دروس + وطنيات</span></div>
    </div>`).join('')}</div>
  <div class="section-title"><h2>⚡ مراجعة اليوم</h2><button class="mini" data-go="revision">الكل</button></div>
  <div class="grid c2">${REVISIONS.slice(0,4).map(r=>`<div class="card glass"><h3>${r.t}</h3><p>${r.c}</p></div>`).join('')}</div>`;
}

function vStreams(){
  const list = STREAMS.filter(s=>state.stream==='all'||s.id===state.stream);
  let h=`<div class="section-title"><h2>📚 الشعب والمواد والدروس</h2><span class="kbd">${list.length} شعبة</span></div>`;
  for(const s of list){
    h+=`<section class="card glass" style="margin-bottom:12px"><h3>${s.icon} ${s.name}</h3><p>${s.desc}</p><div class="meta">${s.subs.map(id=>`<span class="pill">${SUBJECTS[id].icon} ${SUBJECTS[id].name}</span>`).join('')}</div></section>`;
    for(const sub of s.subs){
      const lessons = LESSONS[sub]||[];
      const flt = state.search ? lessons.map((l,i)=>({l,i})).filter(x=>(x.l.t+x.l.d).includes(state.search)) : lessons.map((l,i)=>({l,i}));
      if(state.search && !flt.length && !(SUBJECTS[sub].name.includes(state.search))) continue;
      h+=`<details class="card glass" ${state.search?'open':''} style="margin-bottom:8px"><summary style="font-weight:800;cursor:pointer">${SUBJECTS[sub].icon} ${SUBJECTS[sub].name} <small style="color:var(--mut)">• معامل ${SUBJECTS[sub].coef} • ${lessons.length} دروس</small></summary><div style="margin-top:10px">`;
      h+= flt.map(x=>lessonCard(s.id,sub,x.l,x.i)).join('') || '<p>لا نتائج مطابقة.</p>';
      h+=`</div></details>`;
    }
  }
  return h;
}

function vExams(){
  const years=[]; for(let y=2025;y>=2005;y--) years.push(y);
  let h=`<div class="section-title"><h2>📝 الامتحانات الوطنية 2005-2025</h2><span class="kbd">${EXAMS.length} موضوع</span></div>
  <div class="card glass"><div style="display:flex;gap:10px;flex-wrap:wrap">
    <div><label>الشعبة</label><br><select id="fStream"><option value="all">كل الشعب</option>${STREAMS.map(s=>`<option value="${s.id}" ${state.examStream===s.id?'selected':''}>${s.name}</option>`).join('')}</select></div>
    <div><label>السنة</label><br><select id="fYear"><option value="all">كل السنوات</option>${years.map(y=>`<option ${String(state.examYear)===String(y)?'selected':''}>${y}</option>`).join('')}</select></div>
    <div><label>الدورة</label><br><select id="fSess"><option value="all">عادية + استدراكية</option><option value="N">عادية فقط</option><option value="R">استدراكية فقط</option></select></div>
  </div>
  <p style="font-size:13px">💡 <b>كيف تستعملها؟</b> اشتغل كل موضوع بتوقيت الامتحان الحقيقي، ثم قارن مع التصحيح. المواضيع مرتبة من الأحدث (2025) إلى الأقدم (2005). PDFs الرسمية تجدها على Alloschool / Moutamadris — الزر يعرض نموذج التصحيح المفصل داخل التطبيق.</p></div><div style="height:10px"></div>`;
  const f = EXAMS.filter(e=>(state.examStream==='all'||e.stream===state.examStream)&&(state.examYear==='all'||e.year==state.examYear)&&(!state.search||e.title.includes(state.search)));
  h+= f.slice(0,120).map(e=>`<div class="exam-row glass"><div><strong>${e.year} • ${e.sess==='N'?'☀️ عادية':'🌙 استدراكية'} — ${e.streamName}</strong><small>${e.topics}</small></div>
    <div class="exam-btns"><button class="mini go" data-exam="${e.id}">عرض التصحيح</button><button class="mini" data-practice="${e.id}">⏱️ تدرّب</button></div></div>`).join('')
    || '<div class="card glass"><p>لا نتائج. جرب سنة أو شعبة أخرى.</p></div>';
  if(f.length>120) h+=`<p style="text-align:center;color:var(--mut)">عرض 120 من ${f.length} — ضيّق البحث بالسنة.</p>`;
  return h;
}

function vQuiz(){
  const subs=Object.keys(QUIZZES);
  const qz=QUIZZES[state.qSub]; const q=qz.qs[state.qIdx];
  const total=qz.qs.length;
  const pct=Math.round(state.qIdx/total*100);
  return `<div class="section-title"><h2>🧪 اختبار تجريبي تفاعلي</h2><span class="kbd">تصحيح فوري</span></div>
  <div class="card glass"><label>اختر المادة</label><br><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${subs.map(k=>`<button class="chip ${state.qSub===k?'active':''}" data-qsub="${k}">${QUIZZES[k].name}</button>`).join('')}</div>
  <div class="progress"><i style="width:${pct}%"></i></div>
  <p><b>السؤال ${state.qIdx+1}/${total}</b> • النقاط: <b>${state.qScore}</b></p>
  <h3 style="line-height:1.9">${q.q}</h3>
  <div id="opts">${q.o.map((o,i)=>`<button class="quiz-opt" data-opt="${i}">${'أبجدهـ'[i]||'•'} — ${o}</button>`).join('')}</div>
  <div id="qex"></div>
  <div class="cta-row" style="margin-top:10px"><button class="btn" data-qnext="1">التالي ⏭️</button><button class="btn ghost" data-qreset="1">🔄 إعادة</button></div></div>
  <div class="card glass"><h3>📊 كيف تحسب نقطتك؟</h3><p>كل إجابة صحيحة = نقطة. في الوطني: أجب على كل الأسئلة حتى بالتخمين الذكي — لا توجد نقطة سالبة. أعد الاختبار حتى تحصل على ${total}/${total} ثلاث مرات متتالية.</p></div>`;
}

function vRev(){
  return `<div class="section-title"><h2>⚡ مراجعة مركزة — ليلة الامتحان</h2></div>
  <div class="grid c2">${REVISIONS.map(r=>`<div class="card glass"><h3>${r.t}</h3><p style="line-height:2">${r.c}</p></div>`).join('')}</div>
  <div class="card glass"><h3>🧠 تقنية الحفظ السريع (مغربية مجربة)</h3><p>1) اقرأ الدرس بصوت مسموع 2) لخصه في 5 أسطر بخط يدك 3) اشرحه لصديق أو للمرآة 4) حل موضوع وطني واحد عليه 5) راجع الأخطاء فقط قبل النوم. التكرار المتباعد (اليوم + بعد 3 أيام + بعد أسبوع) يضاعف التذكر.</p></div>`;
}

function vFav(){
  const f=favs();
  if(!f.length) return `<div class="card glass" style="text-align:center;padding:40px"><h2>⭐ لا مفضلة بعد</h2><p>اضغط على ☆ في أي درس لحفظه هنا ومراجعته بسرعة ليلة الامتحان.</p><button class="btn primary" data-go="streams">تصفح الدروس</button></div>`;
  return `<div class="section-title"><h2>⭐ دروسي المفضلة (${f.length})</h2></div>`+f.map(id=>{const [sid,sub,idx]=id.split('-'); const l=(LESSONS[sub]||[])[+idx]; if(!l) return ''; return lessonCard(sid,sub,l,+idx);}).join('');
}

/* ---- bindings ---- */
function bind(root){
  root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goTab(b.dataset.go));
  root.querySelectorAll('[data-stream]').forEach(c=>c.onclick=()=>{state.stream=c.dataset.stream; state.examStream=c.dataset.stream; state.tab='streams'; chips(); goTab('streams');});
  root.querySelectorAll('[data-lesson]').forEach(h=>h.onclick=e=>{
    if(e.target.closest('button')) return;
    const id=h.dataset.lesson; const b=$('#lb-'+CSS.escape(id)); if(!b) return;
    const card=h.closest('.lesson'); card.classList.toggle('open');
    b.style.maxHeight = card.classList.contains('open') ? b.scrollHeight+'px' : '0';
  });
  root.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation(); toggleFav(b.dataset.fav);});
  root.querySelectorAll('[data-done]').forEach(b=>b.onclick=e=>{e.stopPropagation(); markDone(b.dataset.done);});
  root.querySelectorAll('[data-qsub]').forEach(b=>b.onclick=()=>{state.qSub=b.dataset.qsub; state.qIdx=0; state.qScore=0; render();});
  root.querySelectorAll('[data-qnext]').forEach(b=>b.onclick=()=>{const t=QUIZZES[state.qSub].qs.length; state.qIdx=(state.qIdx+1)%t; render();});
  root.querySelectorAll('[data-qreset]').forEach(b=>b.onclick=()=>{state.qIdx=0; state.qScore=0; render();});
  root.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{
    const q=QUIZZES[state.qSub].qs[state.qIdx]; const pick=+b.dataset.opt;
    const opts=root.querySelectorAll('[data-opt]'); opts.forEach(o=>o.disabled=true);
    opts[q.a].classList.add('correct');
    const ex=$('#qex');
    if(pick===q.a){ state.qScore++; ex.innerHTML=`<div class="rev-box" style="border-color:#00e58c;background:rgba(0,229,140,.1)">✅ صحيح! ${q.ex}</div>`; }
    else { b.classList.add('wrong'); ex.innerHTML=`<div class="rev-box" style="border-color:var(--danger);background:rgba(255,92,122,.1)">❌ خطأ. الجواب: <b>${q.o[q.a]}</b><br>${q.ex}</div>`; }
    root.querySelector('p b:last-child');
  });
  const fs=$('#fStream'), fy=$('#fYear'), fss=$('#fSess');
  if(fs) fs.onchange=()=>{state.examStream=fs.value; state.stream=fs.value; render();};
  if(fy) fy.onchange=()=>{state.examYear=fy.value; render();};
  if(fss) fss.onchange=()=>{ /* filter client side */ const rows=$$('.exam-row'); rows.forEach(r=>{ const t=r.querySelector('strong').textContent; const show=fss.value==='all'||(fss.value==='N'?t.includes('عادية'):t.includes('استدراكية')); r.style.display=show?'':'none'; }); };
  root.querySelectorAll('[data-exam]').forEach(b=>b.onclick=()=>openExam(b.dataset.exam));
  root.querySelectorAll('[data-practice]').forEach(b=>b.onclick=()=>{ openExam(b.dataset.exam, true); });
}

function openExam(id, practice=false){
  const e=EXAMS.find(x=>x.id===id); if(!e) return;
  const m=$('#modal'), c=$('#modalCard');
  c.innerHTML=`<h2>📝 ${e.title}</h2>
  <div class="badges"><span class="badge gold">🇲🇦 وزارة التربية الوطنية</span><span class="badge">${e.year}</span><span class="badge">${e.sessName}</span></div>
  <p><b>المحاور الممتحنة:</b> ${e.topics}</p>
  ${practice?`<div class="rev-box">⏱️ <b>وضع التدريب:</b> اضبط مؤقت 2h (علوم) أو 3h (أدب/فلسفة). ممنوع الهاتف. اكتب بقلم أزرق وأسود كما يوم الامتحان.</div>`:''}
  <h3>✅ نموذج التصحيح المفصل (منهجية الأستاذ)</h3>
  <div class="exp" style="background:rgba(0,0,0,.3);padding:12px;border-radius:12px;line-height:2;font-size:14px">
  1) اقرأ الموضوع كاملا وحدد الأسئلة السهلة (اكسب الثقة).<br>
  2) ${e.topics.split('•')[0]||'المحور الأول'}: ابدأ بالتعاريف والقوانين (نصف النقطة على كتابة القانون صحيحا).<br>
  3) أظهر جميع مراحل الحساب — المصحح ينقط المراحل وليس النتيجة فقط.<br>
  4) ارسم الشكل/المنحنى بالمسطرة والقلم — عليه نقطة كاملة غالبا.<br>
  5) الخاتمة: جملة تفسيرية للنتيجة (مثلا: السرعة ثابتة إذن الحركة منتظمة).<br>
  </div>
  <p style="color:var(--mut);font-size:13px">📥 لتحميل PDF الرسمي: ابحث في Alloschool عن «${e.streamName} ${e.year} ${e.sess==='N'?'normal':'rattrapage'}» — جميع مواضيع 2005-2025 متوفرة هناك مجانا مع التصحيح الكامل.</p>
  <div class="cta-row"><button class="btn primary" id="mClose">فهمت ✔</button><button class="btn" id="mFav">⏱️ ابدأ مؤقت ساعتين</button></div>`;
  m.classList.remove('hidden');
  $('#mClose').onclick=()=>m.classList.add('hidden');
  $('#mFav').onclick=()=>{ m.classList.add('hidden'); toast('⏱️ بدأ التوقيت! بالتوفيق يا بطل 💪'); };
  m.onclick=e2=>{ if(e2.target===m) m.classList.add('hidden'); };
}

/* ---- PWA install ---- */
let deferred=null;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferred=e; $('#installBtn').classList.remove('hidden'); });
$('#installBtn').onclick=async()=>{ if(!deferred){ toast('من متصفح الهاتف: القائمة ⋮ ← تثبيت التطبيق 📲'); return; } deferred.prompt(); await deferred.userChoice; deferred=null; $('#installBtn').classList.add('hidden'); };

chips(); fxToggleBtn(); render();
