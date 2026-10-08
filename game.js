(()=>{
const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d');
const H=400,DIST=100,PPM=60,IDEAL=.22,N=6,TAU=Math.PI;
let W=800,S=1;
function rs(){const d=Math.min(devicePixelRatio||1,3);cv.width=innerWidth*d;cv.height=innerHeight*d;S=cv.height/H;W=cv.width/S}
addEventListener('resize',rs);rs();

/* ---------- save / look ---------- */
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const OPT={skin:['#f2c9a0','#d9a273','#a8744a','#6b4428','#3b2415'],hair:['#1b1b1b','#5a3a1e','#c9a24a','#d4472b','#e8e8e8'],shirt:['#ff3b5c','#2f8cff','#ffd23f','#2ee59d','#b05cff','#ffffff'],shorts:['#14171f','#2f8cff','#ff3b5c','#ffd23f','#ffffff']};
let look=Object.assign({skin:1,hair:0,shirt:1,shorts:0},ld('sr_look',{}));
let pb=ld('sr_pb',null);
const cols=l=>({skin:OPT.skin[l.skin],hair:OPT.hair[l.hair],shirt:OPT.shirt[l.shirt],shorts:OPT.shorts[l.shorts]});
const fmt=t=>t==null?'--':t.toFixed(2)+'s';
const sws=[];
Object.keys(OPT).forEach(k=>{const r=document.createElement('div');r.className='row';r.innerHTML='<span>'+k+'</span>';
  OPT[k].forEach((c,i)=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.onclick=()=>{look[k]=i;sv('sr_look',look);mark()};b._k=k;b._i=i;sws.push(b);r.appendChild(b)});$('cust').appendChild(r)});
function mark(){sws.forEach(b=>b.classList.toggle('on',look[b._k]===b._i))}mark();
$('pb').textContent=fmt(pb);

/* ---------- drawing helpers ---------- */
const dk=(h,f)=>{const n=parseInt(h.slice(1),16);return'rgb('+((n>>16&255)*f|0)+','+((n>>8&255)*f|0)+','+((n&255)*f|0)+')'};
const seg=(a,b,c,d,col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke()};
function runner(x,y,sc,p,v,c,lean){
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.lineCap='round';ctx.lineJoin='round';
  const amp=.5+Math.min(v,11)*.055,fl=.8+v*.06;lean=lean??(.1+Math.min(v,11)*.024);
  const J=ph=>{const a=Math.sin(ph)*amp+.05,f=.2+Math.max(0,Math.cos(ph))*fl,b=a-f;return{a,b,y:26*Math.cos(a)+26*Math.cos(b)}};
  const A=J(p),B=J(p+TAU),hy=-Math.max(A.y,B.y);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,1,22,4,0,0,7);ctx.fill();
  const sx=Math.sin(lean)*34,sy=hy-Math.cos(lean)*34;
  const leg=(L,far)=>{const sk=far?dk(c.skin,.68):c.skin,kx=26*Math.sin(L.a),ky=hy+26*Math.cos(L.a),fx=kx+26*Math.sin(L.b),fy=ky+26*Math.cos(L.b);
    seg(0,hy,kx,ky,sk,9);seg(kx,ky,fx,fy,sk,7);seg(fx,fy,fx+9*Math.cos(L.b),fy-9*Math.sin(L.b),far?'#aaa':'#fff',6);
    seg(0,hy,kx*.55,hy+(ky-hy)*.55,far?dk(c.shorts,.7):c.shorts,11)};
  const arm=(ph,far)=>{const g=-Math.sin(ph)*(.5+v*.07),ex=sx+17*Math.sin(g),ey=sy+17*Math.cos(g),h=g+1.25+Math.max(0,-Math.sin(ph))*.3,hx=ex+16*Math.sin(h),hyy=ey+16*Math.cos(h),sk=far?dk(c.skin,.68):c.skin;
    seg(sx,sy,ex,ey,far?dk(c.shirt,.7):c.shirt,7);seg(ex,ey,hx,hyy,sk,5.5);ctx.fillStyle=sk;ctx.beginPath();ctx.arc(hx,hyy,3.2,0,7);ctx.fill()};
  arm(p+TAU,true);leg(B,true);
  seg(0,hy,sx,sy,c.shirt,14);seg(0,hy,0,hy,c.shorts,12);
  leg(A,false);
  const hx=sx+Math.sin(lean+.1)*13,hh=sy-Math.cos(lean+.1)*13;
  seg(sx,sy,hx,hh,c.skin,6);ctx.fillStyle=c.skin;ctx.beginPath();ctx.arc(hx+2,hh-6,9,0,7);ctx.fill();
  ctx.fillStyle=c.hair;ctx.beginPath();ctx.arc(hx+1,hh-7,9.6,TAU*.72,TAU*1.78);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';ctx.fillRect(hx+6,hh-8,2.5,2.5);
  arm(p,false);ctx.restore();
}

/* ---------- scene ---------- */
const FAN=['#ff5d73','#ffd23f','#3ddc97','#4aa8ff','#b58cff','#ff9f43','#f1f1f1','#ff7ac8'];
function scene(camX,tm,exc,px){
  const g=ctx.createLinearGradient(0,0,0,200);g.addColorStop(0,'#150f34');g.addColorStop(.6,'#5b2a6e');g.addColorStop(1,'#ff8a5c');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,215);
  const tp=camX*PPM*.25;for(let i=Math.floor(tp/380)-1;i<tp/380+W/380+2;i++){const x=i*380-tp+60;ctx.fillStyle='#0d0a1f';ctx.fillRect(x-3,10,6,90);
    ctx.fillStyle='#fff6c8';for(let k=0;k<3;k++)for(let j=0;j<2;j++){ctx.beginPath();ctx.arc(x-11+k*11,16+j*11,4.5,0,7);ctx.fill()}
    ctx.fillStyle='rgba(255,246,200,.1)';ctx.beginPath();ctx.arc(x,26,34,0,7);ctx.fill()}
  ctx.fillStyle='#1a1233';ctx.fillRect(0,78,W,18);
  const sg=ctx.createLinearGradient(0,92,0,195);sg.addColorStop(0,'#2a1d4d');sg.addColorStop(1,'#1c1438');ctx.fillStyle=sg;ctx.fillRect(0,92,W,100);
  const cp=camX*PPM*.7;
  for(let r=0;r<4;r++){const y=98+r*21,sh=1-r*.06;
    for(let k=-1;k<W/15+2;k++){const i=Math.floor(cp/15)+k,sx=k*15-(cp%15+15)%15,h=((i*73856093)^(r*19349663))>>>0,c=FAN[h%8];
      const bob=Math.sin(tm*(5+h%4)+h)*(1+exc*3),up=Math.sin(tm*7+h)>.55-exc*1.1;
      ctx.fillStyle=dk(c,sh);ctx.fillRect(sx-4,y+8-bob,8,12);
      ctx.fillStyle=OPT.skin[h>>3&3];ctx.beginPath();ctx.arc(sx,y+4-bob,4.3,0,7);ctx.fill();
      if(up){seg(sx-4,y+11-bob,sx-7,y-3-bob,OPT.skin[h>>3&3],2);seg(sx+4,y+11-bob,sx+7,y-3-bob,OPT.skin[h>>3&3],2)}}}
  // wall / ad boards
  const w0=(camX-W*.3/PPM);
  for(let m=Math.floor(w0/10)*10-10;m<w0+W/PPM+10;m+=10){const x=(m-camX)*PPM+W*.3,k=((m/10)%3+3)%3;
    ctx.fillStyle=['#ff3b5c','#2f8cff','#ffd23f'][k];ctx.fillRect(x,190,PPM*10-3,26);
    ctx.fillStyle=k==2?'#1a1020':'#fff';ctx.font='italic 900 15px -apple-system,Arial';ctx.textAlign='left';ctx.fillText('SPRINT RUSH',x+10,208);
    if(m>=0&&m<=DIST){ctx.textAlign='right';ctx.fillText(m+'m',x+PPM*10-14,208)}}
  // track
  const tg=ctx.createLinearGradient(0,216,0,372);tg.addColorStop(0,'#a8402a');tg.addColorStop(1,'#c9593a');ctx.fillStyle=tg;ctx.fillRect(0,216,W,156);
  for(let m=Math.floor(w0);m<w0+W/PPM+2;m++){if(m%2==0){ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect((m-camX)*PPM+W*.3,216,PPM,156)}}
  ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<=N;i++){ctx.fillRect(0,300+(i-px-.5)*11-.7,W,1.4)}
  const gr=ctx.createLinearGradient(0,372,0,400);gr.addColorStop(0,'#2e7d4f');gr.addColorStop(1,'#1f5c3a');ctx.fillStyle=gr;ctx.fillRect(0,372,W,28);
  const line=(m,ch)=>{const x=(m-camX)*PPM+W*.3;if(x<-30||x>W+30)return;
    if(ch){for(let j=0;j<12;j++){ctx.fillStyle=j%2?'#fff':'#111';ctx.fillRect(x,230+j*11.5,5,11.5);ctx.fillStyle=j%2?'#111':'#fff';ctx.fillRect(x+5,230+j*11.5,5,11.5)}ctx.fillStyle='#fff';ctx.fillRect(x-2,150,3,80);ctx.fillRect(x+9,150,3,80);ctx.fillStyle='#ffd23f';ctx.fillRect(x-2,150,14,10);}
    else{ctx.fillStyle='#fff';ctx.fillRect(x,230,4,142)}};
  line(0,false);line(DIST,true);
}

/* ---------- state ---------- */
let st='menu',now=0,goT=0,setAt=0,goAt=0,raceT=0,finAt=0,P,AI=[],held=new Map();
const fresh=()=>({d:0,v:0,ph:0,stam:100,last:0,side:-1,cad:0,rt:null,fin:null,steps:0,lane:Math.floor(Math.random()*N)});
P=fresh();
const banner=(t,c)=>{const b=$('banner');b.className='';b.textContent=t;void b.offsetWidth;b.className='pop '+(c||'')};
const hit=id=>{const e=$(id);e.classList.remove('hit');void e.offsetWidth;e.classList.add('hit')};

function startRace(){
  P=fresh();$('menu').classList.add('hide');$('res').classList.add('hide');$('hud').classList.remove('hide');$('sub').textContent='';$('fb').textContent='';
  const lanes=[...Array(N).keys()].filter(i=>i!==P.lane);
  AI=lanes.map((l,i)=>({lane:l,d:0,v:0,ph:Math.random()*6,fin:null,react:.14+Math.random()*.14,max:9.3+Math.random()*1.35,c:{skin:OPT.skin[Math.random()*5|0],hair:OPT.hair[Math.random()*5|0],shirt:OPT.shirt[Math.random()*6|0],shorts:OPT.shorts[Math.random()*5|0]}}));
  st='ready';banner('On your marks');setAt=now+1.6;goAt=setAt+1+Math.random()*1.8;
}
function aiStep(a,tm,dt){
  if(tm>a.react){const tgt=a.max*(1-.0016*Math.max(0,a.d-55))+Math.sin(tm*2+a.react*20)*.15;a.v+=(tgt-a.v)*.8*dt}
  const od=a.d;a.d+=a.v*dt;a.ph+=dt*TAU*a.v/2.1;
  if(a.fin==null&&a.d>=DIST)a.fin=tm-dt+dt*(DIST-od)/(a.d-od);
}
function falseStart(msg){
  st='fs';banner('False start','bad');$('sub').textContent='';
  setTimeout(()=>{$('hud').classList.add('hide');$('banner').textContent='';
    $('res').innerHTML='<h2 style="color:#ff4560">False start</h2><p>'+msg+'</p><div class="btns"><button class="btn" id="again">Try again</button><button class="btn ghost" id="tomenu">Menu</button></div>';wire()},1100);
}
function step(side){
  let dt=P.steps?now-P.last:.28;if(dt<.06)return;
  const same=side===P.side,err=Math.abs(dt-IDEAL);let q=Math.max(.1,1-err/.16);if(same)q*=.25;
  P.v+=2.0*q*(.55+.45*P.stam/100);
  P.stam=Math.max(0,P.stam-(1.1+Math.max(0,1/dt-4.6)*1.6+(same?1.5:0)));
  P.cad=P.steps?P.cad*.55+(1/dt)*.45:1/dt;P.last=now;P.side=side;P.steps++;
  const f=$('fb');f.textContent=same?'ALTERNATE SIDES':q>.8?'PERFECT':dt<IDEAL?'TOO FAST':'TOO SLOW';f.style.color=same?'#ff4560':q>.8?'#3ddc97':'#ffb23d';
}
function tap(side){
  hit(side?'sr':'sl');
  if(st==='set'){falseStart('You moved before the gun.');return}
  if(st!=='run')return;
  if(P.rt===null){P.rt=now-goT;
    if(P.rt<.1){falseStart('Reaction of '+Math.round(P.rt*1000)+'ms is under 100ms, which counts as anticipating the gun.');return}
    $('sub').textContent='Reaction '+P.rt.toFixed(3)+'s'}
  step(side);
}
addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();held.set(e.pointerId,now);tap(e.clientX<innerWidth/2?0:1)},{passive:false});
['pointerup','pointercancel'].forEach(t=>addEventListener(t,e=>held.delete(e.pointerId)));
addEventListener('keydown',e=>{if(e.repeat)return;const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')tap(0);if(k==='arrowright'||k==='l')tap(1)});
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());

function showResults(){
  const tm=raceT;let g=0;AI.forEach(a=>{let t=tm;while(a.fin==null&&g++<20000){t+=.01;aiStep(a,t,.01)}});
  const list=[{n:'You',t:P.fin,me:1}].concat(AI.map((a,i)=>({n:'Rival '+(i+1),t:a.fin}))).sort((a,b)=>a.t-b.t);
  const place=list.findIndex(x=>x.me)+1,newPb=pb==null||P.fin<pb;if(newPb){pb=P.fin;sv('sr_pb',pb);$('pb').textContent=fmt(pb)}
  const ord=['1st','2nd','3rd','4th','5th','6th'][place-1];
  $('res').innerHTML='<h2>'+ord+' place</h2><p>Time <b>'+fmt(P.fin)+'</b> &middot; Reaction <b>'+P.rt.toFixed(3)+'s</b>'+(newPb?' &middot; <b style="color:#ffd23f">New personal best</b>':' &middot; Best '+fmt(pb))+'</p><table>'+list.map((x,i)=>'<tr class="'+(x.me?'me':'')+'"><td>'+(i+1)+'</td><td>'+x.n+'</td><td align="right">'+fmt(x.t)+'</td></tr>').join('')+'</table><div class="btns"><button class="btn" id="again">Race again</button><button class="btn ghost" id="tomenu">Menu</button></div>';
  st='done';$('hud').classList.add('hide');wire();
}
function wire(){const r=$('res');r.classList.remove('hide');$('again').onclick=startRace;$('tomenu').onclick=()=>{r.classList.add('hide');$('menu').classList.remove('hide');$('hud').classList.add('hide');$('banner').textContent='';$('sub').textContent='';st='menu'}}
$('go').onclick=startRace;

/* ---------- loop ---------- */
let prev=0;
function frame(ts){
  const dt=Math.min((ts-prev)/1000,.05);prev=ts;now=ts/1000;
  if(st==='ready'&&now>=setAt){st='set';banner('Set')}
  if(st==='set'&&now>=goAt){st='run';goT=now;banner('GO!','go');setTimeout(()=>{if(st==='run')$('banner').textContent=''},700)}
  if(st==='run'||st==='fin'){
    raceT=now-goT;
    if(st==='run'){
      let drag=.8;for(const t of held.values())if(now-t>.45)drag=2.4;
      P.v=Math.max(0,P.v-P.v*drag*dt);if(now-P.last>.5)P.stam=Math.min(100,P.stam+5*dt);
      if(now-P.last>.7)P.cad*=1-3*dt;
    }else P.v=Math.max(0,P.v-P.v*1.6*dt);
    const od=P.d;P.d+=P.v*dt;P.ph+=dt*TAU*P.v/2.1;
    if(st==='run'&&P.d>=DIST){P.fin=raceT-dt+dt*(DIST-od)/(P.d-od);st='fin';finAt=now;banner(fmt(P.fin),'go');$('fb').textContent=''}
    AI.forEach(a=>aiStep(a,raceT,dt));
    if(st==='fin'&&now-finAt>1.8)showResults();
  }
  // render
  ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);
  const camX=st==='menu'?0:Math.min(P.d,DIST+8),exc=st==='run'||st==='fin'?Math.min(1,.3+P.v/12+(P.d>85?.4:0)):.15;
  const pl=st==='menu'?2:P.lane;
  scene(camX,now,exc,pl);
  if(st==='menu'){runner(W*.74,300,1.7,now*3,0,cols(look),.12)}
  else{
    const all=AI.map(a=>({l:a.lane,d:a.d,ph:a.ph,v:a.v,c:a.c})).concat([{l:P.lane,d:P.d,ph:P.ph,v:P.v,c:cols(look),me:1}]).sort((a,b)=>a.l-b.l);
    all.forEach(r=>{const y=300+(r.l-P.lane)*11,sx=(r.d-camX)*PPM+W*.3;if(sx<-60||sx>W+60)return;
      runner(sx,y,1+(y-300)*.002,r.ph,r.v,r.c,r.me&&(st==='ready'||st==='set')?.5:undefined)})}
  // hud
  if(!$('hud').classList.contains('hide')){
    $('dist').textContent=Math.min(P.d,DIST).toFixed(1)+' m';
    $('time').textContent=(st==='run'?raceT:P.fin??0).toFixed(2);
    $('progf').style.width=Math.min(100,P.d)+'%';
    $('cadv').textContent=P.cad.toFixed(1);
    $('needle').style.left=Math.min(98,P.cad/9*100)+'%';
    const s=$('stam');s.style.width=P.stam+'%';s.style.background=P.stam>50?'#3ddc97':P.stam>25?'#ffb23d':'#ff4560';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
