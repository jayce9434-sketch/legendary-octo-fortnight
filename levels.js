'use strict';

(function(){
  const C = window.CRASH_CONTENT;
  const ORIGIN = {x:178,y:548};
  const BASE_GRAVITY = 760;
  const GROUND = 620;

  function rng(seed){ let s=seed>>>0; return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;}; }
  function hash(side,n){let h=side==='bird'?0xB17D5EED:0x91C0A11;h^=Math.imul(n+17,2654435761);h^=h>>>16;return h>>>0;}
  function pick(r,a){return a[Math.floor(r()*a.length)%a.length];}
  function jitter(r,v){return (r()-.5)*v;}
  function add(blocks,mat,x,y,w,h,extra={}){blocks.push({x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h),mat,...extra});}

  function storyPalette(story,layout,r){
    const base=[
      ['wood','thickwood','glass','stone','rope'],
      ['metal','rivetedmetal','wood','explosive','chain'],
      ['glass','reinforcedglass','ice','fan','wood'],
      ['stone','bone','crystal','chain','sandstone'],
      ['wood','metal','spring','fan','rope'],
      ['stone','metal','rivetedmetal','magnet','reinforcedglass'],
      ['sandstone','glass','crystal','honey','explosive'],
      ['wood','metal','spring','magnet','teleporter'],
      ['stone','rivetedmetal','fan','magnet','crystal'],
      ['thickwood','reinforcedglass','rivetedmetal','explosive','teleporter']
    ][story-1].slice();
    const specials=['snow','ice','bone','rope','chain','honey','explosive','spring','fan','magnet','teleporter','crystal'];
    base.push(specials[layout%specials.length]);
    if(r()>.55) base.push(specials[(layout+story+3)%specials.length]);
    return [...new Set(base)];
  }

  function makeTarget(targets,x,y,r=25){targets.push({x:Math.round(x),y:Math.round(y),r,hp:1});}
  function platform(blocks,mat,x,y,w=130,h=22){add(blocks,mat,x-w/2,y,w,h);}
  function legs(blocks,mat,x,yTop,yBottom,spread=58,width=22){add(blocks,mat,x-spread-width/2,yTop,width,yBottom-yTop);add(blocks,mat,x+spread-width/2,yTop,width,yBottom-yTop);}
  function tower(blocks,pal,x,top,levels,r,variant=0){
    const floorH=22, span=118+variant*10;
    for(let i=0;i<levels;i++){
      const y=GROUND-(i+1)*74;
      platform(blocks,pick(r,pal),x,y,span-(i%2)*16,floorH);
      if(i<levels-1){
        add(blocks,pick(r,pal),x-span/2+8,y-52,20,52);
        add(blocks,pick(r,pal),x+span/2-28,y-52,20,52);
      }
    }
    return GROUND-levels*74-18;
  }

  function buildLayout(layout,side,n,story,r,difficulty,pal,blocks,targets){
    const shift=jitter(r,22); const x1=690+shift, x2=930+jitter(r,28), x3=1120+jitter(r,18);
    const special=pal[pal.length-1];
    const targetCount=1+((n+story)%3===0?1:0)+(difficulty>.72&&n%4===0?1:0);
    let slots=[];
    switch(layout){
      case 0: { // twin towers
        const y1=tower(blocks,pal,x1,0,3+(n%2),r,0), y2=tower(blocks,pal,x2,0,2+((n+1)%2),r,1);
        add(blocks,special,x1-18,GROUND-244,36,28); add(blocks,pick(r,pal),x2-78,GROUND-96,156,20);
        slots=[[x1,y1-16],[x2,y2-16]]; break;
      }
      case 1: { // bridge
        const py=430-jitter(r,18); legs(blocks,pick(r,pal),x1,py+22,GROUND,54,22); legs(blocks,pick(r,pal),x2,py+22,GROUND,54,22);
        platform(blocks,special,(x1+x2)/2,py,360,24); add(blocks,pick(r,pal),x1-75,GROUND-55,150,22); add(blocks,pick(r,pal),x2-75,GROUND-110,150,22);
        slots=[[x1,py-32],[x2,py-32],[(x1+x2)/2,py-32]]; break;
      }
      case 2: { // stair fortress
        for(let i=0;i<5;i++){const x=x1+i*92,y=GROUND-52-i*45;add(blocks,pick(r,pal),x-42,y,84,22);add(blocks,pick(r,pal),x-12,y+22,24,GROUND-(y+22));}
        add(blocks,special,x1+184,GROUND-255,44,34); slots=[[x1+92,GROUND-164],[x1+276,GROUND-254],[x1+368,GROUND-299]];break;
      }
      case 3: { // split spires
        [x1,x3].forEach((x,i)=>{const y=tower(blocks,pal,x,0,3+i%2,r,i);add(blocks,special,x-18,GROUND-168,36,28);slots.push([x-(i?55:0),y-(i?58:18)]);});
        platform(blocks,pick(r,pal),x2,GROUND-90,120,20); slots.push([x2,GROUND-125]); break;
      }
      case 4: { // bunker
        const y=GROUND-120; add(blocks,'stone',x1-90,y,26,120); add(blocks,pick(r,pal),x1+64,y,26,120); platform(blocks,special,x1,y-24,210,26);
        add(blocks,pick(r,pal),x2-100,GROUND-60,200,24); add(blocks,pick(r,pal),x2-20,GROUND-160,40,100); platform(blocks,pick(r,pal),x2,GROUND-184,150,22);
        slots=[[x1,y-58],[x2,GROUND-219]]; break;
      }
      case 5: { // pyramid
        for(let row=0;row<4;row++){for(let j=0;j<4-row;j++){add(blocks,pick(r,pal),x1+(j-(3-row)/2)*68-30,GROUND-(row+1)*50,60,22);}}
        add(blocks,special,x1-25,GROUND-228,50,36); slots=[[x1,GROUND-270],[x1+210,GROUND-150]]; platform(blocks,pick(r,pal),x1+210,GROUND-118,120,22);break;
      }
      case 6: { // crane yard
        add(blocks,'metal',x1-12,GROUND-250,24,250); platform(blocks,'rivetedmetal',x1+110,GROUND-250,245,20); add(blocks,'chain',x1+205,GROUND-230,20,115); add(blocks,special,x1+182,GROUND-115,46,30);
        tower(blocks,pal,x3,0,2,r,0); slots=[[x1+205,GROUND-286],[x3,GROUND-180]];break;
      }
      case 7: { // zigzag keep
        for(let i=0;i<6;i++){const x=x1+i*75,y=GROUND-55-(i%2)*95;platform(blocks,i===3?special:pick(r,pal),x,y,86,20);add(blocks,pick(r,pal),x-10,y+20,20,GROUND-(y+20));}
        slots=[[x1+75,GROUND-238],[x1+300,GROUND-238],[x1+375,GROUND-188]];break;
      }
      case 8: { // gatehouse
        add(blocks,pick(r,pal),x1-130,GROUND-220,30,220);add(blocks,pick(r,pal),x1+100,GROUND-220,30,220);platform(blocks,special,x1,GROUND-240,290,28);
        platform(blocks,pick(r,pal),x1,GROUND-95,150,20); add(blocks,pick(r,pal),x2-20,GROUND-170,40,170); slots=[[x1,GROUND-278],[x2,GROUND-206]];break;
      }
      case 9: { // terraces
        for(let i=0;i<4;i++){const x=x1+i*125,y=GROUND-45-i*58;platform(blocks,i===2?special:pick(r,pal),x,y,138,22);add(blocks,pick(r,pal),x-55,y+22,22,GROUND-(y+22));}
        slots=[[x1+125,GROUND-140],[x1+375,GROUND-256]];break;
      }
      case 10: { // blast chain
        for(let i=0;i<5;i++){const x=x1+i*88;platform(blocks,i%2?'wood':'thickwood',x,GROUND-75-(i%2)*38,82,20);add(blocks,'explosive',x-18,GROUND-112-(i%2)*38,36,34);}
        slots=[[x1+88,GROUND-175],[x1+352,GROUND-175]];break;
      }
      case 11: { // ice shelf
        for(let i=0;i<4;i++){const x=x1+i*112;platform(blocks,i%2?'ice':'snow',x,GROUND-70-i*34,128,22);add(blocks,'ice',x-12,GROUND-48-i*34,24,GROUND-(GROUND-48-i*34));}
        add(blocks,'reinforcedglass',x1+168,GROUND-252,48,30); slots=[[x1+112,GROUND-173],[x1+336,GROUND-241]];break;
      }
      case 12: { // springworks
        for(let i=0;i<4;i++){const x=x1+i*105;add(blocks,'spring',x-28,GROUND-52,56,52);platform(blocks,pick(r,pal),x,GROUND-128-(i%2)*45,96,20);}
        slots=[[x1+105,GROUND-210],[x1+315,GROUND-210]];break;
      }
      case 13: { // magnet vault
        add(blocks,'metal',x1-105,GROUND-210,28,210);add(blocks,'metal',x1+77,GROUND-210,28,210);platform(blocks,'rivetedmetal',x1,GROUND-230,238,24);add(blocks,'magnet',x1-30,GROUND-120,60,46);
        tower(blocks,pal,x2+120,0,3,r,0);slots=[[x1,GROUND-270],[x2+120,GROUND-252]];break;
      }
      case 14: { // portal pair
        add(blocks,'teleporter',x1-28,GROUND-94,56,54,{portalGroup:`p${n}`});add(blocks,'teleporter',x3-28,GROUND-230,56,54,{portalGroup:`p${n}`});
        tower(blocks,pal,x2,0,3,r,0);platform(blocks,pick(r,pal),x3,GROUND-260,120,20);slots=[[x2,GROUND-252],[x3-52,GROUND-298]];break;
      }
      case 15: { // fan alley
        for(let i=0;i<4;i++){const x=x1+i*110;add(blocks,'fan',x-27,GROUND-55,54,55,{fanDir:i%2?1:-1});platform(blocks,pick(r,pal),x,GROUND-145-(i%2)*42,96,22);}
        slots=[[x1+110,GROUND-225],[x1+330,GROUND-225]];break;
      }
      case 16: { // crystal garden
        for(let i=0;i<5;i++){const x=x1+i*86;add(blocks,i%2?'crystal':'glass',x-28,GROUND-70-(i%3)*50,56,70+(i%3)*50);if(i<4)platform(blocks,'reinforcedglass',x+43,GROUND-142-(i%2)*45,76,18);}
        slots=[[x1+86,GROUND-228],[x1+344,GROUND-178]];break;
      }
      case 17: { // honey trap
        for(let i=0;i<4;i++){const x=x1+i*118;add(blocks,'honey',x-34,GROUND-62,68,62);platform(blocks,i%2?'wood':'sandstone',x,GROUND-150-(i%2)*60,110,22);}
        slots=[[x1+118,GROUND-245],[x1+354,GROUND-245]];break;
      }
      case 18: { // chainworks
        add(blocks,'chain',x1-14,GROUND-250,28,250);add(blocks,'chain',x2-14,GROUND-205,28,205);platform(blocks,'thickwood',(x1+x2)/2,GROUND-250,300,22);add(blocks,'rope',x1+95,GROUND-228,24,115);platform(blocks,'bone',x3,GROUND-120,126,22);
        slots=[[(x1+x2)/2,GROUND-288],[x3,GROUND-158]];break;
      }
      default: { // mixed citadel
        tower(blocks,pal,x1,0,3,r,1); tower(blocks,pal,x2,0,4,r,0); add(blocks,'explosive',x1-20,GROUND-175,40,36);add(blocks,'magnet',x2-26,GROUND-260,52,42);add(blocks,'spring',x3-28,GROUND-56,56,56);platform(blocks,'reinforcedglass',x3,GROUND-155,120,22);
        slots=[[x1,GROUND-252],[x2,GROUND-326],[x3,GROUND-194]];break;
      }
    }
    // Choose target slots deterministically, with a small per-level offset so repeated archetypes are not copies.
    const rotated=slots.slice((n+story)%Math.max(1,slots.length)).concat(slots.slice(0,(n+story)%Math.max(1,slots.length)));
    for(let i=0;i<Math.min(targetCount,rotated.length);i++){
      const tx=rotated[i][0]+jitter(r,8), minY=tx>1080?340:tx>1020?300:tx>980?272:238;
      makeTarget(targets,tx,Math.max(minY,rotated[i][1]-42+jitter(r,6)),24+(n+i)%3);
    }
    if(!targets.length) makeTarget(targets,850,360,25);
  }

  function accessibleShot(tx,ty,gravity=BASE_GRAVITY){
    const dx=tx-ORIGIN.x,dy=ty-ORIGIN.y;
    // Favor a generous high arc so the certified solution clears scenery instead of demanding a flat pixel-perfect shot.
    let t=Math.max(1.16,Math.min(1.72,.70+dx/950));
    let vx=dx/t,vy=(dy-.5*gravity*t*t)/t;
    if(Math.hypot(vx,vy)>970)t=Math.max(1.08,t-.08);
    vx=dx/t;vy=(dy-.5*gravity*t*t)/t;return{vx,vy,t,speed:Math.hypot(vx,vy)};
  }

  function makeRegular(side,n,story,local,r,difficulty,theme){
    const layout=(n*7+story*3+(side==='pig'?9:0))%20;
    const pal=storyPalette(story,layout,r);const blocks=[],targets=[],cores=[];
    buildLayout(layout,side,n,story,r,difficulty,pal,blocks,targets);
    // Visual perches keep targets grounded without changing the certified collision path.
    for(const t of targets) add(blocks,pick(r,['wood','rope','bone']),t.x-40,t.y+t.r-2,80,14,{decorative:true});
    // Add one small optional demolition core to selected levels, not every level.
    if((n+layout)%6===0){
      const t=targets[0];const cx=t.x+95+jitter(r,20),cy=t.y+25+jitter(r,10);cores.push({x:cx,y:cy,r:18,blast:118,certified:true});
      // Keep the main target directly solvable; the core is an alternate destruction route and scoring target.
    }
    const gravity=theme==='sky'?700:theme==='cavern'?805:BASE_GRAVITY;
    const wind=theme==='storm'?(side==='bird'?1:-1)*(28+(n%5)*12):theme==='sky'?jitter(r,34):0;
    return {
      id:`${side}-${n}`,side,number:n,story,local,theme,type:'regular',layout,layoutName:C.LAYOUT_NAMES[layout],mechanic:pal[pal.length-1],
      title:`${C.STORY_NAMES[side][story-1]}: ${C.LAYOUT_NAMES[layout]}`,
      gravity,wind,birds:Math.max(3,targets.length+2),cores,targets,blocks,boss:null,
      certifiedShots:targets.map(t=>accessibleShot(t.x,t.y,gravity)),coins:180+Math.round(n*4.5),stars:[4700+local*95,7300+local*145,9900+local*195]
    };
  }

  function makeBoss(side,n,story,local,r,difficulty,theme,bossClass){
    const final=bossClass==='final',major=bossClass==='major';const hp=final?6:major?4:3;const blocks=[];
    const layout=(story*5+local+(side==='pig'?7:0))%20;const pal=storyPalette(story,layout,r);
    const bx=930+jitter(r,25),by=430+jitter(r,12);const weak=[];
    const positions=final?[[-140,-122],[-48,-140],[48,-140],[140,-122],[-92,-78],[92,-78]]:major?[[-110,-112],[94,-112],[-72,-72],[82,-72]]:[[-96,-100],[88,-92],[0,-70]];
    positions.slice(0,hp).forEach(([dx,dy],i)=>weak.push({x:Math.round(bx+dx),y:Math.round(by+dy),r:22+(i%2),alive:true}));
    // Boss shell changes by story and boss tier instead of being one repeated wall.
    const shellMat=final?'rivetedmetal':major?pick(r,['metal','stone','reinforcedglass']):pick(r,pal);
    platform(blocks,shellMat,bx,GROUND-72,430,26);
    add(blocks,pick(r,pal),bx-190,GROUND-210,28,138);add(blocks,pick(r,pal),bx+162,GROUND-210,28,138);
    platform(blocks,pick(r,pal),bx,GROUND-232,340,22);
    if(major||final){add(blocks,pal[pal.length-1],bx-35,GROUND-155,70,48);add(blocks,'explosive',bx+125,GROUND-122,42,36);}
    if(final){
      add(blocks,'magnet',bx-164,GROUND-150,52,44);add(blocks,'spring',bx+88,GROUND-54,58,54);
      if(story%2===0){add(blocks,'teleporter',bx-260,GROUND-92,56,52,{portalGroup:`boss${n}`});add(blocks,'teleporter',bx+238,GROUND-260,56,52,{portalGroup:`boss${n}`});}
      else {add(blocks,'fan',bx-260,GROUND-56,56,56,{fanDir:1});add(blocks,'fan',bx+228,GROUND-56,56,56,{fanDir:-1});}
    }
    const gravity=theme==='sky'?700:theme==='cavern'?805:BASE_GRAVITY;const wind=theme==='storm'?(final?64:36)*(side==='bird'?1:-1):0;
    return {
      id:`${side}-${n}`,side,number:n,story,local,theme,type:bossClass,layout,layoutName:`${bossClass} arena`,mechanic:pal[pal.length-1],
      title:`${final?'Final Boss':major?'Major Boss':'Boss'}: ${C.BOSS_NAMES[side][story-1]}`,gravity,wind,birds:hp+3,cores:[],targets:[],blocks,
      boss:{name:C.BOSS_NAMES[side][story-1],story,x:bx,y:by,w:330,h:280,hp,maxHp:hp,weak,phase:1,attackClock:0},
      certifiedShots:weak.map(w=>accessibleShot(w.x,w.y,gravity)),coins:(final?1800:major?900:550)+n*5,stars:[6800+local*110,10100+local*165,13200+local*225]
    };
  }

  function generateLevel(side,n){
    n=Math.max(1,Math.min(200,n|0));const story=Math.ceil(n/20),local=((n-1)%20)+1;const r=rng(hash(side,n));const difficulty=(n-1)/199;const theme=C.THEMES[(story-1)%C.THEMES.length];
    if(local===20)return makeBoss(side,n,story,local,r,difficulty,theme,'final');
    if(local===10)return makeBoss(side,n,story,local,r,difficulty,theme,'major');
    if(local===5||local===15)return makeBoss(side,n,story,local,r,difficulty,theme,'boss');
    return makeRegular(side,n,story,local,r,difficulty,theme);
  }

  function validateTrajectory(level,shot,target){
    const dt=1/120;let x=ORIGIN.x,y=ORIGIN.y,vx=shot.vx,vy=shot.vy,best=1e9;
    for(let i=0;i<420;i++){vx+=(level.wind||0)*dt;vy+=level.gravity*dt;x+=vx*dt;y+=vy*dt;best=Math.min(best,Math.hypot(x-target.x,y-target.y));if(y>700||x>1325)break;}return best;
  }
  function correctedShot(level,target){
    let s=accessibleShot(target.x,target.y,level.gravity);if(!level.wind)return s;
    for(let k=0;k<8;k++){const dt=1/120;let x=ORIGIN.x,y=ORIGIN.y,vx=s.vx,vy=s.vy,best={d:1e9,x,y,t:1};for(let i=0;i<420;i++){vx+=(level.wind||0)*dt;vy+=level.gravity*dt;x+=vx*dt;y+=vy*dt;const d=Math.hypot(x-target.x,y-target.y);if(d<best.d)best={d,x,y,t:Math.max(.1,i*dt)};if(y>700||x>1325)break;}s.vx-=(best.x-target.x)/best.t;s.vy-=(best.y-target.y)/best.t;}s.speed=Math.hypot(s.vx,s.vy);return s;
  }
  function trajectoryBlocked(level,shot,target){
    const dt=1/120;let x=ORIGIN.x,y=ORIGIN.y,vx=shot.vx,vy=shot.vy;
    for(let i=0;i<420;i++){
      vx+=(level.wind||0)*dt;vy+=level.gravity*dt;x+=vx*dt;y+=vy*dt;
      if(Math.hypot(x-target.x,y-target.y)<target.r+23)return false;
      for(const b of level.blocks){
        if(b.decorative||['fan','magnet','teleporter','rope','chain'].includes(b.mat))continue;
        const cx=Math.max(b.x,Math.min(x,b.x+b.w)),cy=Math.max(b.y,Math.min(y,b.y+b.h));if((x-cx)*(x-cx)+(y-cy)*(y-cy)<=22*22)return true;
      }
      if(y>700||x>1325)break;
    }return true;
  }
  function fingerprint(level){
    const b=level.blocks.map(x=>`${x.mat}:${Math.round(x.x/4)}:${Math.round(x.y/4)}:${Math.round(x.w/4)}:${Math.round(x.h/4)}`).sort().join('|');
    const t=(level.boss?level.boss.weak:level.targets).map(x=>`${Math.round(x.x/4)}:${Math.round(x.y/4)}`).join('|');return `${level.type}/${level.gravity}/${Math.round(level.wind)}/${b}/${t}`;
  }
  function validateAll(){
    const failures=[],seen=new Map(),types=new Set(),layouts=new Set();let pass=0;
    for(const side of ['bird','pig'])for(let n=1;n<=200;n++){
      const level=generateLevel(side,n);level.blocks.forEach(b=>types.add(b.mat));layouts.add(level.layoutName);const sig=fingerprint(level);let valid=true,maxMiss=0;const duplicateOf=seen.get(sig)||null;
      if(duplicateOf)valid=false;else seen.set(sig,`${side}-${n}`);
      const goals=level.boss?level.boss.weak:level.targets;const corrected=[];
      for(const t of goals){const s=correctedShot(level,t);corrected.push(s);const miss=validateTrajectory(level,s,t);maxMiss=Math.max(maxMiss,miss);if(miss>t.r+9||s.speed>989.5||s.speed<250||trajectoryBlocked(level,s,t))valid=false;}
      if(level.birds<goals.length||goals.some(t=>t.r<20))valid=false;
      if(valid)pass++;else failures.push({side,n,type:level.type,layout:level.layoutName,maxMiss:+maxMiss.toFixed(2),speeds:corrected.map(s=>+s.speed.toFixed(1)),duplicate:duplicateOf});
    }
    return{pass,total:400,failures,uniqueLayouts:seen.size,blockTypesUsed:types.size,blockTypes:[...types].sort(),layoutFamilies:layouts.size};
  }

  window.CRASH_LEVELS={ORIGIN,GRAVITY:BASE_GRAVITY,generateLevel,validateAll,correctedShot};
})();
