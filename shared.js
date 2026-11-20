/* SUMOMASTERS · lógica compartida (llaves + participantes). Los datos viven en localStorage. */
const SM=(()=>{
  const KEY="sumomasters_v2";
  const pairs=a=>a.flatMap(x=>[[x[0],x[1]],[x[2],x[3]]]);
  const META={
    megasumo:{title:"Megasumo",n:16,soccer:false,
      stages:["Octavos de final","Cuartos de final","Semifinal","Final","Campeón"],sh:["Llave","Cuartos","Semi"],
      seed:pairs([["Triple T","1.º A","Ratón","4.º B"],["Balerion","2.º C","Hojalata","3.º D"],["Ting Ling","1.º D","Oozma Kappa","4.º C"],["Megamente","2.º B","Código rojo","3.º A"],["Mini buey","1.º B","Apex","4.º A"],["Patrulla lobo Alpha","2.º D","NEXBOT","3.º C"],["Leviatán","1.º C","La pala","4.º D"],["Never Dissolved","2.º A","Onda dinamita","3.º B"]])},
    minisumo:{title:"Minisumo",n:16,soccer:false,
      stages:["Octavos de final","Cuartos de final","Semifinal","Final","Campeón"],sh:["Llave","Cuartos","Semi"],
      seed:pairs([["Becko","1.º A","Dom","2.º B"],["Pastelito","1.º C","Troyano robotics 03","2.º D"],["Troyano robótica 01","1.º E","El chivo","2.º F"],["Min","1.º G","Robocop","2.º H"],["Vort-x","1.º B","Harby","2.º A"],["Torneros SDR","1.º D","Atom","2.º C"],["Gurren Lagann","1.º F","Bebe Binario","2.º E"],["Neptuno","1.º H","Magik","2.º G"]])},
    "robo-soccer":{title:"Robo Soccer",n:16,soccer:true,
      stages:["Octavos de final","Cuartos de final","Semifinal","Final","Campeón"],sh:["Llave","Cuartos","Semi"],
      seed:pairs([["CJF Robotics","#1","Las Chivas","#16"],["Balmomikes","#8","Bendecidos","#9"],["RS Zamus","#4","Wolf Bots","#13"],["Virgenes FC","#5","Meca Boys","#12"],["Arjusu","#2","Nitro Bots","#15"],["Turbo Sordo","#7","Cuervos","#10"],["Rayo Joaquín","#3","RoboCop FC","#14"],["Los Rufianes","#6","Muppets","#11"]])}
  };
  const fresh=k=>{const m=META[k],sz=[];for(let n=m.n;n>=1;n>>=1)sz.push(n);
    return{tags:m.seed.map(x=>x[1]),rounds:sz.map((n,r)=>Array.from({length:n},(_,i)=>r?"":m.seed[i][0])),scores:sz.map(n=>Array(n).fill(null))}};
  const valid=(k,x)=>x&&x.rounds&&x.scores&&x.tags&&x.rounds.length===META[k].stages.length;
  const load=()=>{let s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
    const o={};for(const k in META)o[k]=valid(k,s&&s[k])?s[k]:fresh(k);return o};
  const save=S=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
  const clear=(t,r,i)=>{const R=t.rounds,old=R[r][i];R[r][i]="";t.scores[r][i]=null;
    if(r+1<R.length&&old&&R[r+1][i>>1]===old)clear(t,r+1,i>>1)};
  /* devuelve "ok" (avanzó), "undo" (se retiró) o false */
  const advance=(t,r,i)=>{const R=t.rounds,n=R[r][i];if(!n||r>=R.length-1)return false;
    const ni=i>>1,cur=R[r+1][ni];
    if(cur===n){clear(t,r+1,ni);return"undo"}
    if(cur)clear(t,r+1,ni);
    R[r+1][ni]=n;return"ok"};
  const rename=(t,a,b)=>t.rounds.forEach(rd=>rd.forEach((n,i)=>{if(n===a)rd[i]=b}));
  const reach=(t,n)=>{let m=-1;t.rounds.forEach((rd,r)=>{if(rd.includes(n))m=r});return m};
  const resetProgress=t=>{t.rounds.forEach((rd,r)=>{if(r)rd.fill("")});t.scores.forEach(s=>s.fill(null))};

  const CK="sumomasters_cfg";
  const cfg=()=>{let c={};try{c=JSON.parse(localStorage.getItem(CK))||{}}catch(e){}return{live:c.live!==false,gold:c.gold!==false,zap:c.zap!==false}};
  const setCfg=c=>{try{localStorage.setItem(CK,JSON.stringify(c))}catch(e){}};

  /* ⚡ Rayos eléctricos (mismo efecto del HTML original) */
  function zap(el){
    if(!cfg().zap)return;
    const cv=document.getElementById("lightning-overlay"),ctx=cv.getContext("2d");
    cv.width=innerWidth;cv.height=innerHeight;cv.classList.add("active");
    let x=cv.width*.4,y=cv.height*.45;
    if(el){el.classList.remove("electric-shock");void el.offsetWidth;el.classList.add("electric-shock");
      const b=el.getBoundingClientRect();x=b.left+b.width/2;y=b.top+b.height/2}
    let f=0;
    const bolt=(x1,y1,x2,y2,d,c,w)=>{
      if(d<4){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.shadowColor=c;ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();return}
      const mx=(x1+x2)/2+(Math.random()-.5)*d,my=(y1+y2)/2+(Math.random()-.5)*d;
      bolt(x1,y1,mx,my,d/2,c,w);bolt(mx,my,x2,y2,d/2,c,w)};
    (function loop(){
      ctx.clearRect(0,0,cv.width,cv.height);
      if(f<22){for(let i=0;i<7;i++){const a=Math.PI*2*i/7+Math.random()*.6,d=200+Math.random()*280;
        bolt(x,y,x+Math.cos(a)*d,y+Math.sin(a)*d,80,["#00f3ff","#fcee0a","#ff007f"][i%3],3);}
        f++;requestAnimationFrame(loop)}
      else{ctx.clearRect(0,0,cv.width,cv.height);cv.classList.remove("active")}
    })();
  }
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  return{CK,cfg,setCfg,META,fresh,load,save,advance,rename,reach,resetProgress,zap,esc,valid};
})();
