/* BST shared code — loaded by index.html, vendor.html, admin.html */
const SB_URL='https://bzpxnqnoykqexsavvqao.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cHhucW5veWtxZXhzYXZ2cWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMjI3OTgsImV4cCI6MjExMDc5ODc5OH0.608RjVcnMIspoFt9LAAuvqv8I2AR3gtTZj3dfvepie8';
const sb=supabase.createClient(SB_URL,SB_KEY);
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const naira=n=>'₦'+Number(n||0).toLocaleString();
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),3500)}
function modal(html){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="sheet"><button class="x" aria-label="Close">×</button>${html}</div>`;m.onclick=e=>{if(e.target===m||e.target.className==='x')m.remove()};document.body.append(m);return m}
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('New version ready. Refresh the page to update.')})})}).catch(()=>{}));
async function profile(){const{data:{session}}=await sb.auth.getSession();if(!session)return null;const{data}=await sb.from('profiles').select('*').eq('id',session.user.id).single();return data}
function logout(){sb.auth.signOut().then(()=>location.reload())}
function loginForm(el,done,signup=false){
 el.innerHTML=`<form class="card auth"><h2>${signup?'Create account':'Log in'}</h2>${signup?'<input name=name placeholder="Full name" required><input name=phone placeholder="Phone number">':''}<input name=email type=email placeholder="Email" required><input name=password type=password minlength=6 placeholder="Password (6+ characters)" required><button class=btn>${signup?'Sign up':'Log in'}</button><a href="#" class=sw>${signup?'Have an account? Log in':'New here? Create an account'}</a></form>`;
 el.querySelector('.sw').onclick=e=>{e.preventDefault();loginForm(el,done,!signup)};
 el.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
  const r=signup?await sb.auth.signUp({email:f.email,password:f.password,options:{data:{name:f.name,phone:f.phone}}}):await sb.auth.signInWithPassword({email:f.email,password:f.password});
  if(r.error)return toast(r.error.message);
  if(signup&&!r.data.session)return toast('Check your email to confirm, then log in.');
  done()}}
async function gate(roles,render){
 const p=await profile(),app=$('#app');
 if(!p){loginForm(app,()=>gate(roles,render));return}
 if(!roles.includes(p.role)){app.innerHTML=`<div class="card auth"><h2>No access</h2><p>This account is a ${esc(p.role)} account and can't open this page.</p><button class=btn onclick="logout()">Log out</button></div>`;return}
 bell(p);render(p)}
async function bell(p){
 const el=$('#bell');if(!el)return;
 el.innerHTML='🔔<b id=nb hidden></b>';let list=[];
 const load=async()=>{const{data}=await sb.from('notifications').select('*').eq('user_id',p.id).order('created_at',{ascending:false}).limit(30);list=data||[];const u=list.filter(x=>!x.read).length;$('#nb').hidden=!u;$('#nb').textContent=u};
 await load();
 el.onclick=async()=>{
  if('Notification' in window&&Notification.permission==='default')await Notification.requestPermission();
  modal(`<h3>Notifications</h3>${list.map(n=>`<div class="note ${n.read?'':'new'}"><b>${esc(n.title)}</b><p>${esc(n.body)}</p><small>${new Date(n.created_at).toLocaleString()}</small></div>`).join('')||'<p class=muted>Nothing yet.</p>'}`);
  await sb.from('notifications').update({read:true}).eq('user_id',p.id).eq('read',false);load()};
 sb.channel('n'+p.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+p.id},async e=>{
  toast(e.new.title);load();
  if('Notification' in window&&Notification.permission==='granted'){const r=await navigator.serviceWorker.ready;r.showNotification(e.new.title,{body:e.new.body,icon:'icon-192.png',badge:'icon-192.png'})}}).subscribe()}
/* Install App button + splash */
let _ip;
const _standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const _ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(_standalone){const sp=document.createElement('div');sp.id='splash';sp.innerHTML='<div class="logo">BST</div><p>BIN SAEED TEXTILE</p>';document.body.append(sp);setTimeout(()=>sp.classList.add('hide'),700);setTimeout(()=>sp.remove(),1200)}
else{
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();_ip=e});
 const b=document.createElement('button');b.className='btn inst';b.textContent='⬇ Install App';
 b.onclick=async()=>{
  if(_ip){_ip.prompt();await _ip.userChoice;_ip=null;return}
  modal(_ios?'<h3>Install on iPhone</h3><p>1. Open this page in <b>Safari</b>.</p><p>2. Tap the <b>Share</b> button (square with an arrow).</p><p>3. Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</p>':'<h3>Install BIN SAEED</h3><p>Open this page in <b>Chrome</b> (not inside WhatsApp or Facebook), tap the <b>⋮</b> menu, then <b>Install app</b> or <b>Add to Home screen</b>.</p><p class=muted>If you do not see it, refresh once and try again.</p>')};
 addEventListener('appinstalled',()=>b.remove());document.body.append(b)}
