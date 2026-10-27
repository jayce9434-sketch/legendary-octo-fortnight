'use strict';

const THEMES = ['field','factory','storm','cavern','sky','citadel'];

const BLOCK_TYPES = [
  {id:'wood',label:'Wood',hp:2.2,impact:0.86,score:240},
  {id:'thickwood',label:'Thick Wood',hp:3.5,impact:0.66,score:340},
  {id:'glass',label:'Glass',hp:0.9,impact:1.48,score:210,shatter:true},
  {id:'reinforcedglass',label:'Reinforced Glass',hp:2.4,impact:1.02,score:330,shatter:true},
  {id:'stone',label:'Stone',hp:4.1,impact:0.48,score:430},
  {id:'metal',label:'Metal',hp:5.5,impact:0.36,score:540},
  {id:'rivetedmetal',label:'Riveted Metal',hp:7.2,impact:0.27,score:650},
  {id:'ice',label:'Ice',hp:1.15,impact:1.24,score:260,ice:true,shatter:true},
  {id:'snow',label:'Snow',hp:0.72,impact:1.7,score:150,snow:true},
  {id:'sandstone',label:'Sandstone',hp:2.7,impact:0.76,score:300},
  {id:'crystal',label:'Crystal',hp:1.6,impact:1.15,score:420,crystal:true,shatter:true},
  {id:'bone',label:'Bone',hp:2.0,impact:0.95,score:280},
  {id:'rope',label:'Rope',hp:0.62,impact:1.85,score:170,light:true},
  {id:'chain',label:'Chain',hp:4.7,impact:0.43,score:480},
  {id:'honey',label:'Honey',hp:1.35,impact:1.0,score:260,sticky:true},
  {id:'explosive',label:'Explosive',hp:0.7,impact:1.7,score:500,explosive:true},
  {id:'spring',label:'Spring',hp:2.25,impact:0.82,score:390,spring:true},
  {id:'fan',label:'Fan',hp:2.5,impact:0.72,score:420,fan:true},
  {id:'magnet',label:'Magnet',hp:3.0,impact:0.62,score:450,magnet:true},
  {id:'teleporter',label:'Teleporter',hp:3.2,impact:0.6,score:520,teleporter:true}
];
const BLOCK_BY_ID = Object.fromEntries(BLOCK_TYPES.map((b,i)=>[b.id,{...b,index:i}]));

const ABILITIES = {
  boost:   {label:'Burst', desc:'Tap in flight for a straight speed burst.'},
  split:   {label:'Scatter', desc:'Tap in flight to release two side projectiles.'},
  bomb:    {label:'Blast', desc:'Tap in flight to trigger a close-range shockwave.'},
  drill:   {label:'Pierce', desc:'Tap in flight to harden the projectile and smash material.'},
  bounce:  {label:'Ricochet', desc:'Tap in flight to gain a powerful bounce and speed.'},
  gravity: {label:'Dive', desc:'Tap in flight to dive sharply toward the ground.'},
  brake:   {label:'Brake', desc:'Tap in flight to stall briefly, then drop.'}
};

function makeRoster(side) {
  const birdNames = ['Rook','Kestrel','Brim','Volt','Mistral','Pebble','Swoop','Cinder','Glint','Rattle','Nova','Warden','Echo','Torque','Nimbus','Quarry','Flare','Gale','Prism','Comet','Crown'];
  const pigNames  = ['Grunt','Tinker','Moss','Gasket','Bellow','Soot','Bramble','Rivet','Quake','Piston','Sly','Bog','Furnace','Crank','Dune','Brute','Rumble','Vault','Thorn','Kingpin','Regent'];
  const names = side === 'bird' ? birdNames : pigNames;
  const types = ['boost','split','bomb','drill','bounce','gravity','brake'];
  return names.map((name,i)=>({
    id:`${side}-${i}`, index:i, name, side, ability:types[i%types.length],
    power:1 + (i%5)*0.06, mass:1 + (i%4)*0.08,
    unlockLevel:i===0 ? 0 : i*10,
    infiniteCost:i===0 ? 0 : 12000 + i*4800,
    rarity:i<5?'Common':i<11?'Uncommon':i<16?'Rare':i<20?'Epic':'Legendary'
  }));
}
const ROSTERS = {bird:makeRoster('bird'), pig:makeRoster('pig')};

const STORY_NAMES = {
  bird:['Broken Orchard','Ironworks Break-In','Stormwall Harbor','Underroot Vaults','Cloudrail Siege','Citadel Approach','Glass Desert','Machine Canopy','Thunder Crown','Last Flight'],
  pig:['Scrapyard Rebellion','Timberline Raid','Floodgate Run','Deepworks Escape','Highwind Convoy','Royal Foundry','Crystal Burrow','Skyhook Heist','Blackstorm Keep','Final Claim']
};
const STORY_INTROS = {
  bird:[
    'The flock finds its supply route stripped bare. The trail leads through a fortified orchard.',
    'Recovered machine parts point toward an industrial network hidden behind the ridge.',
    'The chase reaches a harbor where violent wind turns every launch into a calculation.',
    'A retreating convoy disappears underground. The flock follows into unstable caverns.',
    'The enemy takes to the sky. The next route climbs through suspended rail platforms.',
    'The first citadel stands ahead, protected by layered walls and rotating defenses.',
    'A scorched glass basin hides experimental launch systems and buried stores.',
    'A machine forest has grown around the old power grid. Every structure moves.',
    'The storm engine is active. Its commanders are using the weather as a weapon.',
    'The last fortress opens. Every lesson from the campaign returns in one final assault.'
  ],
  pig:[
    'The pigs are done being used as disposable workers. The first stolen launcher starts a revolt.',
    'The rebellion needs lumber and parts, but the route is held by automated bird defenses.',
    'A floodgate complex blocks the escape corridor. The pigs choose the loud solution.',
    'The old deepworks contain enough machinery to build a real army if the tunnels hold.',
    'The convoy goes airborne. Cargo, guards, and launch platforms all move at once.',
    'A royal foundry is producing weapons for both sides. The pigs decide to take the factory.',
    'A crystal mine hides a prototype capsule system and a heavily armored warden.',
    'The rebellion steals skyhooks and turns them into a mobile fortress.',
    'The final loyalist keep activates a storm shield and locks down the region.',
    'The pigs reach the throne platform. Winning now means surviving the hardest defenses in the game.'
  ]
};
const BOSS_NAMES = {
  bird:['Root Ram','Mill Warden','Gale Barge','Burrow Maw','Rail Baron','Gate Engine','Glass Colossus','Canopy Core','Tempest Marshal','Iron Regent'],
  pig:['Yard Crusher','Timber Marshal','Flood Sentinel','Deep Drill','Convoy Ace','Forge Keeper','Crystal Warden','Skyhook Captain','Storm Chancellor','Crown Engine']
};
const LAYOUT_NAMES = ['Twin Towers','Suspension Bridge','Stair Fortress','Split Spires','Low Bunker','Stepped Pyramid','Crane Yard','Zigzag Keep','Gatehouse','Terraces','Blast Chain','Ice Shelf','Springworks','Magnet Vault','Portal Pair','Fan Alley','Crystal Garden','Honey Trap','Chainworks','Mixed Citadel'];

window.CRASH_CONTENT = {THEMES,BLOCK_TYPES,BLOCK_BY_ID,ABILITIES,ROSTERS,STORY_NAMES,STORY_INTROS,BOSS_NAMES,LAYOUT_NAMES};
