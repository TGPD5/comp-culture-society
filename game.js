// ── Data ─────────────────────────────────────────────────────────────────────

const ITEMS = {
  // Tier 0 – starting primitives
  stone:     { name:"Stone",       icon:"🪨", tier:0, desc:"Abundant. The foundation of everything." },
  wood:      { name:"Wood",        icon:"🪵", tier:0, desc:"Flexible, burnable, buildable." },
  bone:      { name:"Bone",        icon:"🦴", tier:0, desc:"Hard organic remnant." },
  mud:       { name:"Mud",         icon:"🟫", tier:0, desc:"Clay-like earth mixed with water." },
  sand:      { name:"Sand",        icon:"⬛", tier:0, desc:"Silica grains. Seems useless — for now." },
  hide:      { name:"Hide",        icon:"🟤", tier:0, desc:"Animal skin, rough and raw." },

  // Tier 1
  fire:      { name:"Fire",        icon:"🔥", tier:1, desc:"Transforms everything it touches." },
  sharpstone:{ name:"Sharp Stone", icon:"🔪", tier:1, desc:"Knapped to an edge. The first tool." },
  rope:      { name:"Rope",        icon:"🪢", tier:1, desc:"Strips of hide or bark, twisted tight." },
  brick:     { name:"Brick",       icon:"🧱", tier:1, desc:"Sun-dried mud. Permanent shelter becomes possible." },
  charcoal:  { name:"Charcoal",    icon:"⬜", tier:1, desc:"Wood transformed by fire. Burns hotter." },
  ash:       { name:"Ash",         icon:"🌫️", tier:1, desc:"Residue of fire. Alkaline, reactive." },

  // Tier 2
  glass:     { name:"Glass",       icon:"🫙", tier:2, desc:"Sand fused by intense heat. Transparent solids!" },
  bronze:    { name:"Bronze",      icon:"🥉", tier:2, desc:"Copper-tin alloy. Harder than stone." },
  ironore:   { name:"Iron Ore",    icon:"⚙️",  tier:2, desc:"Rust-red rock hiding metal within." },
  wheel:     { name:"Wheel",       icon:"⭕", tier:2, desc:"Reduces friction. Multiplies motion." },
  papyrus:   { name:"Papyrus",     icon:"📜", tier:2, desc:"Pressed reed fibres. Knowledge can be written." },
  lens:      { name:"Lens",        icon:"🔍", tier:2, desc:"Curved glass that bends light." },

  // Tier 3
  iron:      { name:"Iron",        icon:"🔩", tier:3, desc:"Smelted from ore. Stronger than bronze." },
  paper:     { name:"Paper",       icon:"📄", tier:3, desc:"Pulped wood flattened thin. Mass writing." },
  gear:      { name:"Gear",        icon:"⚙️",  tier:3, desc:"Toothed wheel for transmitting force." },
  aqueduct:  { name:"Aqueduct",    icon:"🏛️", tier:3, desc:"Water moved at scale. Civilisation multiplies." },
  printing:  { name:"Printing Press",icon:"🖨️",tier:3, desc:"Knowledge copied at speed. Ideas compound." },
  telescope: { name:"Telescope",   icon:"🔭", tier:3, desc:"Distant stars made close. Cosmology cracks open." },

  // Tier 4
  steel:     { name:"Steel",       icon:"🗡️",  tier:4, desc:"Iron refined with carbon. The industrial age waits." },
  electricity:{ name:"Electricity",icon:"⚡", tier:4, desc:"Controlled electrons. Everything changes." },
  vacuum:    { name:"Vacuum Tube", icon:"💡", tier:4, desc:"Glass + electricity. First electronic amplifier." },
  calculus:  { name:"Calculus",    icon:"∫",  tier:4, desc:"Mathematics of change. Science accelerates." },
  steam:     { name:"Steam Engine",icon:"🚂", tier:4, desc:"Heat converted to work. First machine labour." },
  chemistry: { name:"Chemistry",   icon:"⚗️",  tier:4, desc:"Element theory formalised. Materials unlock." },

  // Tier 5
  transistor:{ name:"Transistor",  icon:"📦", tier:5, desc:"Solid-state switch. No heat, no fragility." },
  algorithm: { name:"Algorithm",   icon:"📐", tier:5, desc:"A precise recipe for solving problems." },
  binary:    { name:"Binary Code", icon:"01", tier:5, desc:"All information as two states. Turing's gift." },
  memory:    { name:"Memory (RAM)",icon:"🧠", tier:5, desc:"Cheap, fast, re-writable storage." },
  compiler:  { name:"Compiler",    icon:"⌨️",  tier:5, desc:"Translates human language into machine ops." },

  // Tier 6
  microchip: { name:"Microchip",   icon:"💾", tier:6, desc:"Millions of transistors on a grain of sand. You taught sand to think." },
  os:        { name:"Operating System",icon:"🖥️",tier:6,desc:"Software that manages all other software." },
  network:   { name:"Network",     icon:"🌐", tier:6, desc:"Machines connected. Knowledge flows freely." },
  database:  { name:"Database",    icon:"🗄️",  tier:6, desc:"Structured memory at massive scale." },

  // Tier 7 – Augmented Intelligence
  ai_model:  { name:"AI Model",    icon:"🤖", tier:7, desc:"Statistical pattern engine. Augments human judgment." },
  augmented: { name:"Augmented Mind",icon:"🧬",tier:7, desc:"Human + machine. The frontier, open and vast." },
};

// Combine recipes: [input1, input2] → output
// Also used for workshop crafting.
const RECIPES = [
  { inputs:["stone","stone"],       output:"sharpstone",  energyCost:5 },
  { inputs:["wood","stone"],        output:"sharpstone",  energyCost:4 },
  { inputs:["wood","fire"],         output:"charcoal",    energyCost:6 },
  { inputs:["stone","fire"],        output:"ash",         energyCost:6 },
  { inputs:["wood","bone"],         output:"rope",        energyCost:5 },
  { inputs:["hide","sharpstone"],   output:"rope",        energyCost:5 },
  { inputs:["mud","fire"],          output:"brick",       energyCost:8 },
  { inputs:["sand","fire"],         output:"glass",       energyCost:14 },
  { inputs:["charcoal","sand"],     output:"glass",       energyCost:12 },
  { inputs:["stone","charcoal"],    output:"ironore",     energyCost:10 },
  { inputs:["ironore","fire"],      output:"bronze",      energyCost:12 },
  { inputs:["wheel","wood"],        output:"wheel",       energyCost:8 },
  { inputs:["sharpstone","wood"],   output:"wheel",       energyCost:10 },
  { inputs:["papyrus","sharpstone"],output:"papyrus",     energyCost:8 },
  { inputs:["mud","rope"],          output:"papyrus",     energyCost:9 },
  { inputs:["glass","lens"],        output:"lens",        energyCost:12 },
  { inputs:["glass","glass"],       output:"lens",        energyCost:10 },
  { inputs:["ironore","charcoal"],  output:"iron",        energyCost:18 },
  { inputs:["bronze","charcoal"],   output:"iron",        energyCost:16 },
  { inputs:["papyrus","wheel"],     output:"paper",       energyCost:12 },
  { inputs:["wood","wheel"],        output:"gear",        energyCost:10 },
  { inputs:["iron","wheel"],        output:"gear",        energyCost:12 },
  { inputs:["brick","rope"],        output:"aqueduct",    energyCost:20 },
  { inputs:["paper","gear"],        output:"printing",    energyCost:22 },
  { inputs:["lens","iron"],         output:"telescope",   energyCost:20 },
  { inputs:["iron","charcoal"],     output:"steel",       energyCost:22 },
  { inputs:["steam","steel"],       output:"steam",       energyCost:18 },
  { inputs:["gear","steam"],        output:"steam",       energyCost:15 },
  { inputs:["glass","electricity"], output:"vacuum",      energyCost:28 },
  { inputs:["steel","fire"],        output:"electricity", energyCost:25 },
  { inputs:["lens","telescope"],    output:"calculus",    energyCost:25 },
  { inputs:["printing","calculus"], output:"calculus",    energyCost:20 },
  { inputs:["chemistry","fire"],    output:"chemistry",   energyCost:22 },
  { inputs:["ash","water"],         output:"chemistry",   energyCost:15 },
  { inputs:["vacuum","electricity"],output:"transistor",  energyCost:35 },
  { inputs:["steel","electricity"], output:"transistor",  energyCost:38 },
  { inputs:["calculus","paper"],    output:"algorithm",   energyCost:30 },
  { inputs:["printing","algorithm"],output:"algorithm",   energyCost:25 },
  { inputs:["algorithm","paper"],   output:"binary",      energyCost:28 },
  { inputs:["electricity","binary"],output:"memory",      energyCost:32 },
  { inputs:["algorithm","binary"],  output:"compiler",    energyCost:35 },
  { inputs:["transistor","sand"],   output:"microchip",   energyCost:45 },
  { inputs:["transistor","glass"],  output:"microchip",   energyCost:42 },
  { inputs:["microchip","compiler"],output:"os",          energyCost:40 },
  { inputs:["microchip","memory"],  output:"database",    energyCost:38 },
  { inputs:["os","network"],        output:"network",     energyCost:35 },
  { inputs:["microchip","network"], output:"network",     energyCost:36 },
  { inputs:["database","algorithm"],output:"ai_model",    energyCost:50 },
  { inputs:["compiler","memory"],   output:"ai_model",    energyCost:48 },
  { inputs:["ai_model","calculus"], output:"augmented",   energyCost:60 },
  { inputs:["ai_model","algorithm"],output:"augmented",   energyCost:58 },
];

// Research projects unlock new items or provide bonuses
const RESEARCH = [
  {
    id:"r_fire", name:"Harness Fire", era:0,
    desc:"Observe lightning strikes. Learn to keep embers alive.",
    energyCost:20, moneyCost:0, successChance:0.6,
    unlocks:["fire"], bonus:null,
    prereqs:[],
  },
  {
    id:"r_wheel", name:"The Wheel", era:1,
    desc:"Circular cross-sections reduce rolling friction.",
    energyCost:35, moneyCost:0, successChance:0.55,
    unlocks:["wheel"], bonus:null,
    prereqs:["r_fire"],
  },
  {
    id:"r_writing", name:"Writing", era:1,
    desc:"Symbols can encode meaning. Cuneiform, then script.",
    energyCost:30, moneyCost:0, successChance:0.5,
    unlocks:["papyrus"], bonus:{type:"passiveEnergy", val:1},
    prereqs:["r_fire"],
  },
  {
    id:"r_metallurgy", name:"Metallurgy", era:2,
    desc:"Rock + heat = metal. Transforms warfare and toolmaking.",
    energyCost:50, moneyCost:0, successChance:0.45,
    unlocks:["ironore","bronze"], bonus:null,
    prereqs:["r_fire"],
  },
  {
    id:"r_optics", name:"Optics", era:2,
    desc:"Light bends through transparent media.",
    energyCost:45, moneyCost:10, successChance:0.5,
    unlocks:["lens"], bonus:null,
    prereqs:["r_writing"],
  },
  {
    id:"r_printing", name:"Moveable Type", era:3,
    desc:"Individual letter blocks: knowledge multiplies.",
    energyCost:60, moneyCost:20, successChance:0.55,
    unlocks:["printing"], bonus:{type:"passiveEnergy", val:2},
    prereqs:["r_writing","r_metallurgy"],
  },
  {
    id:"r_scientific", name:"Scientific Method", era:3,
    desc:"Hypothesis, experiment, iteration. Turns luck into progress.",
    energyCost:70, moneyCost:30, successChance:0.5,
    unlocks:[], bonus:{type:"researchBoost", val:0.15},
    prereqs:["r_printing"],
  },
  {
    id:"r_electricity", name:"Electricity", era:4,
    desc:"Static, then current. Franklin, Volta, Faraday.",
    energyCost:80, moneyCost:50, successChance:0.45,
    unlocks:["electricity"], bonus:null,
    prereqs:["r_scientific","r_metallurgy"],
  },
  {
    id:"r_calculus", name:"Calculus & Analysis", era:4,
    desc:"Newton and Leibniz describe rates of change.",
    energyCost:75, moneyCost:40, successChance:0.5,
    unlocks:["calculus"], bonus:{type:"researchBoost", val:0.1},
    prereqs:["r_scientific"],
  },
  {
    id:"r_chemistry", name:"Atomic Theory", era:4,
    desc:"Matter is made of elements. Mendeleev's table.",
    energyCost:80, moneyCost:50, successChance:0.45,
    unlocks:["chemistry"], bonus:null,
    prereqs:["r_scientific"],
  },
  {
    id:"r_steam", name:"Steam Power", era:4,
    desc:"Boil water, move pistons. The first machine labour.",
    energyCost:90, moneyCost:60, successChance:0.5,
    unlocks:["steam"], bonus:{type:"passiveEnergy", val:5},
    prereqs:["r_metallurgy","r_calculus"],
  },
  {
    id:"r_electronics", name:"Electronics", era:5,
    desc:"Thermionic valves, then transistors: electron control.",
    energyCost:120, moneyCost:100, successChance:0.4,
    unlocks:["vacuum","transistor"], bonus:null,
    prereqs:["r_electricity","r_chemistry"],
  },
  {
    id:"r_information", name:"Information Theory", era:5,
    desc:"Shannon: information is measurable. All data is bits.",
    energyCost:100, moneyCost:80, successChance:0.45,
    unlocks:["binary","algorithm"], bonus:{type:"researchBoost",val:0.1},
    prereqs:["r_calculus","r_printing"],
  },
  {
    id:"r_semiconductor", name:"Semiconductor Physics", era:5,
    desc:"Doped silicon switches billions of times per second.",
    energyCost:140, moneyCost:120, successChance:0.4,
    unlocks:["microchip"], bonus:null,
    prereqs:["r_electronics","r_chemistry"],
  },
  {
    id:"r_software", name:"Software & Compilers", era:6,
    desc:"Programs that write programs. Ada Lovelace → Grace Hopper.",
    energyCost:130, moneyCost:100, successChance:0.45,
    unlocks:["compiler","os"], bonus:{type:"passiveEnergy",val:8},
    prereqs:["r_information","r_semiconductor"],
  },
  {
    id:"r_networking", name:"Networking", era:6,
    desc:"ARPANET → TCP/IP → internet. Machines talking to machines.",
    energyCost:150, moneyCost:120, successChance:0.45,
    unlocks:["network","database"], bonus:{type:"passiveMoney",val:5},
    prereqs:["r_software"],
  },
  {
    id:"r_ml", name:"Machine Learning", era:6,
    desc:"Systems that improve from data. The pattern underneath patterns.",
    energyCost:200, moneyCost:200, successChance:0.4,
    unlocks:["ai_model"], bonus:null,
    prereqs:["r_software","r_information"],
  },
  {
    id:"r_augmented", name:"Augmented Intelligence", era:7,
    desc:"Humans + machines: judgment amplified, not replaced.",
    energyCost:250, moneyCost:300, successChance:0.45,
    unlocks:["augmented"], bonus:{type:"win",val:true},
    prereqs:["r_ml","r_networking"],
  },
];

// Deployable items: once in inventory they can be deployed for passive gains
const DEPLOYABLES = [
  { item:"fire",       effect:"passiveEnergy", val:0.5, label:"+0.5 ⚡/s" },
  { item:"wheel",      effect:"passiveEnergy", val:1,   label:"+1 ⚡/s" },
  { item:"papyrus",    effect:"passiveEnergy", val:0.8, label:"+0.8 ⚡/s (stored knowledge)" },
  { item:"printing",   effect:"passiveEnergy", val:2,   label:"+2 ⚡/s (ideas spread)" },
  { item:"steam",      effect:"passiveEnergy", val:5,   label:"+5 ⚡/s (machine labour)" },
  { item:"electricity",effect:"passiveEnergy", val:3,   label:"+3 ⚡/s" },
  { item:"aqueduct",   effect:"passiveMoney",  val:2,   label:"+2 💰/s" },
  { item:"network",    effect:"passiveMoney",  val:8,   label:"+8 💰/s" },
  { item:"database",   effect:"passiveMoney",  val:5,   label:"+5 💰/s" },
  { item:"os",         effect:"passiveEnergy", val:6,   label:"+6 ⚡/s" },
  { item:"ai_model",   effect:"passiveEnergy", val:15,  label:"+15 ⚡/s (tireless computation)" },
];

const ERAS = [
  { threshold:0,   name:"Stone Age",        color:"#8888aa" },
  { threshold:2,   name:"Early Bronze Age", color:"#aabb77" },
  { threshold:5,   name:"Classical Antiquity",color:"#ccaa55" },
  { threshold:9,   name:"Medieval Period",  color:"#aa8844" },
  { threshold:13,  name:"Age of Reason",    color:"#88aacc" },
  { threshold:19,  name:"Industrial Age",   color:"#cc8844" },
  { threshold:25,  name:"Information Age",  color:"#55aacc" },
  { threshold:32,  name:"Augmented Age",    color:"#aa55cc" },
];

// Serendipitous discoveries – fire, wheel etc. can just 'happen'
const SERENDIPITY = [
  { item:"fire",       weight:12, prereqs:[] },
  { item:"sharpstone", weight:20, prereqs:[] },
  { item:"rope",       weight:10, prereqs:["sharpstone"] },
  { item:"ash",        weight:8,  prereqs:["fire"] },
  { item:"charcoal",   weight:8,  prereqs:["fire","wood"] },
  { item:"glass",      weight:3,  prereqs:["fire","sand"] },
  { item:"ironore",    weight:3,  prereqs:["fire","stone"] },
];

// ── State ─────────────────────────────────────────────────────────────────────

const STATE = {
  energy:         50,
  money:          0,
  passiveEnergy:  0.2,   // per second
  passiveMoney:   0,
  researchBoost:  0,     // additive bonus to success chance
  inventory:      {},    // itemId → count
  discovered:     new Set(),
  deployed:       new Set(),
  researchDone:   new Set(),
  activeResearch: null,  // { id, progress 0-1, ticksLeft }
  combineSlots:   [null, null],
  tickCount:      0,
  unlockedResearch: new Set(["r_fire"]),
  totalDiscovered: 0,
};

// seed with starting items
["stone","stone","stone","wood","wood","bone","mud","sand","hide"].forEach(id => {
  STATE.inventory[id] = (STATE.inventory[id]||0) + 1;
  STATE.discovered.add(id);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function addItem(id, count=1) {
  STATE.inventory[id] = (STATE.inventory[id]||0) + count;
  if (!STATE.discovered.has(id)) {
    STATE.discovered.add(id);
    STATE.totalDiscovered++;
    checkEraUnlocks();
    checkResearchUnlocks();
    log(`Discovered: ${ITEMS[id].name}!`, "discovery");
    notify(`New discovery: ${ITEMS[id].icon} ${ITEMS[id].name}`, "good");
  }
}

function spendEnergy(amt) {
  if (STATE.energy < amt) return false;
  STATE.energy -= amt;
  return true;
}

function spendMoney(amt) {
  if (STATE.money < amt) return false;
  STATE.money -= amt;
  return true;
}

function getEra() {
  const disc = STATE.totalDiscovered;
  let era = ERAS[0];
  for (const e of ERAS) { if (disc >= e.threshold) era = e; }
  return era;
}

function checkEraUnlocks() {
  checkResearchUnlocks();
}

function checkResearchUnlocks() {
  for (const r of RESEARCH) {
    if (STATE.unlockedResearch.has(r.id)) continue;
    const prereqsMet = r.prereqs.every(p => STATE.researchDone.has(p));
    if (prereqsMet) STATE.unlockedResearch.add(r.id);
  }
}

function trySerendipity() {
  const available = SERENDIPITY.filter(s =>
    s.prereqs.every(p => STATE.discovered.has(p)) &&
    !STATE.discovered.has(s.item)
  );
  if (!available.length) return;
  const total = available.reduce((a,b)=>a+b.weight,0);
  let roll = Math.random() * total;
  for (const s of available) {
    roll -= s.weight;
    if (roll <= 0) {
      addItem(s.item);
      log(`Serendipitous discovery: ${ITEMS[s.item].name}!`, "serendipity");
      notify(`✨ Serendipity! You stumbled upon ${ITEMS[s.item].icon} ${ITEMS[s.item].name}`, "good");
      return;
    }
  }
}

function findRecipe(a, b) {
  return RECIPES.find(r =>
    (r.inputs[0]===a && r.inputs[1]===b) ||
    (r.inputs[0]===b && r.inputs[1]===a)
  );
}

// ── Game loop ─────────────────────────────────────────────────────────────────

setInterval(tick, 500);

function tick() {
  STATE.tickCount++;

  // passive income and entropy drain (1 energy per 30s = 1/60 per 500ms tick)
  STATE.energy += STATE.passiveEnergy * 0.5 - (1 / 60);
  STATE.money  += STATE.passiveMoney  * 0.5;

  // serendipity – ~1% per tick
  if (Math.random() < 0.01) trySerendipity();

  // active research progress
  if (STATE.activeResearch) {
    STATE.activeResearch.ticksLeft--;
    STATE.activeResearch.progress = 1 - STATE.activeResearch.ticksLeft / STATE.activeResearch.totalTicks;
    if (STATE.activeResearch.ticksLeft <= 0) finishResearch();
  }

  // cap energy & money
  STATE.energy = Math.max(0, Math.min(STATE.energy, 9999));
  STATE.money  = Math.max(0, Math.min(STATE.money,  9999));

  render();
}

function finishResearch() {
  const r = RESEARCH.find(x => x.id === STATE.activeResearch.id);
  const success = Math.random() < (r.successChance + STATE.researchBoost);
  STATE.activeResearch = null;
  STATE.researchDone.add(r.id);
  checkResearchUnlocks();

  if (success) {
    r.unlocks.forEach(id => addItem(id, 1));
    if (r.bonus) applyBonus(r.bonus);
    log(`Research complete: "${r.name}" succeeded!`, "success");
    notify(`Research succeeded: ${r.name}`, "good");
    if (r.bonus?.type === "win") winGame();
  } else {
    log(`Research failed: "${r.name}" — no breakthrough this time.`, "fail");
    notify(`Research failed: ${r.name}. You learned from the attempt.`, "bad");
    // partial refund
    STATE.energy += r.energyCost * 0.3;
  }
}

function applyBonus(bonus) {
  if (bonus.type === "passiveEnergy") { STATE.passiveEnergy += bonus.val; log(`Passive energy +${bonus.val}/s`, "info"); }
  if (bonus.type === "passiveMoney")  { STATE.passiveMoney  += bonus.val; log(`Passive money +${bonus.val}/s`, "info"); }
  if (bonus.type === "researchBoost") { STATE.researchBoost += bonus.val; log(`Research success +${(bonus.val*100).toFixed(0)}%`, "info"); }
}

function winGame() {
  setTimeout(()=>{
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0f;color:#c8c8d4;font-family:'Courier New',monospace;text-align:center;gap:20px">
        <div style="font-size:3rem">🧬</div>
        <div style="font-size:1.4rem;color:#aa55cc;letter-spacing:3px">AUGMENTED MIND ACHIEVED</div>
        <div style="max-width:480px;font-size:0.85rem;color:#888;line-height:1.8">
          You began with stone and bone.<br>You harnessed fire, shaped metal, captured light, formalised mathematics,
          bottled electricity, and ultimately taught sand to think.<br><br>
          Not to replace the human mind — but to <em style="color:#c8c8d4">amplify</em> it.<br><br>
          Machines now handle what is repetitive. Humans now focus on what is irreplaceable:
          <em style="color:#c8c8d4">judgment, wonder, and the next frontier.</em>
        </div>
        <button onclick="location.reload()" style="background:#1e1e30;border:1px solid #5555aa;color:#aaaaff;padding:10px 24px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:0.85rem;margin-top:10px">
          Begin Again
        </button>
      </div>`;
  }, 800);
}

// ── Actions ───────────────────────────────────────────────────────────────────

function selectCombineSlot(itemId) {
  // fill first empty slot, then second, then cycle
  if (STATE.combineSlots[0] === null) {
    STATE.combineSlots[0] = itemId;
  } else if (STATE.combineSlots[1] === null) {
    STATE.combineSlots[1] = itemId;
  } else {
    STATE.combineSlots[0] = STATE.combineSlots[1];
    STATE.combineSlots[1] = itemId;
  }
  render();
}

function clearSlot(idx) {
  STATE.combineSlots[idx] = null;
  render();
}

function doCombine() {
  const [a, b] = STATE.combineSlots;
  if (!a || !b) return;

  // check we own both
  const aCount = STATE.inventory[a]||0;
  const bCount = STATE.inventory[b]||0;
  const sameItem = a === b;
  if (sameItem && aCount < 2) { notify("Not enough of that item.", "bad"); return; }
  if (!sameItem && (aCount < 1 || bCount < 1)) { notify("You don't have those items.", "bad"); return; }

  const recipe = findRecipe(a, b);
  if (!recipe) {
    log(`No known combination for ${ITEMS[a].name} + ${ITEMS[b].name}.`, "fail");
    notify("No known combination — keep experimenting.", "bad");
    return;
  }

  if (!spendEnergy(recipe.energyCost)) {
    notify(`Need ${recipe.energyCost} ⚡ energy.`, "bad");
    return;
  }

  // consume inputs
  STATE.inventory[a]--;
  if (a !== b) STATE.inventory[b]--;
  else STATE.inventory[a]--;

  addItem(recipe.output);
  log(`Combined ${ITEMS[a].name} + ${ITEMS[b].name} → ${ITEMS[recipe.output].name}`, "success");
  STATE.combineSlots = [null, null];
  render();
}

function startResearch(id) {
  if (STATE.activeResearch) { notify("Already researching something.", "bad"); return; }
  const r = RESEARCH.find(x=>x.id===id);
  if (!r || STATE.researchDone.has(id)) return;
  if (!STATE.unlockedResearch.has(id)) { notify("Prerequisites not met.", "bad"); return; }
  if (!spendEnergy(r.energyCost)) { notify(`Need ${r.energyCost} ⚡`, "bad"); return; }
  if (r.moneyCost > 0 && !spendMoney(r.moneyCost)) {
    STATE.energy += r.energyCost; // refund
    notify(`Need ${r.moneyCost} 💰`, "bad"); return;
  }
  const ticks = 20; // ~10 seconds
  STATE.activeResearch = { id, progress:0, ticksLeft:ticks, totalTicks:ticks };
  log(`Researching: ${r.name}...`, "info");
}

function deployItem(item) {
  if (STATE.deployed.has(item)) { notify("Already deployed.", "bad"); return; }
  if (!(STATE.inventory[item] > 0)) { notify("You don't have that item.", "bad"); return; }
  const d = DEPLOYABLES.find(x=>x.item===item);
  if (!d) return;
  STATE.deployed.add(item);
  applyBonus({ type: d.effect, val: d.val });
  log(`Deployed ${ITEMS[item].name}: ${d.label}`, "success");
  notify(`Deployed ${ITEMS[item].icon} ${ITEMS[item].name} — ${d.label}`, "good");
  render();
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function render() {
  renderHeader();
  renderInventory();
  renderWorkshop();
  renderRight();
}

function renderHeader() {
  document.getElementById('era-name').textContent = getEra().name;
  document.getElementById('energy-val').textContent = Math.floor(STATE.energy);
  document.getElementById('money-val').textContent  = Math.floor(STATE.money);
  document.getElementById('passive-display').textContent =
    `+${STATE.passiveEnergy.toFixed(1)} ⚡/s  +${STATE.passiveMoney.toFixed(1)} 💰/s`;
}

function renderInventory() {
  const el = document.getElementById('inv-list');
  const items = Object.entries(STATE.inventory).filter(([,c])=>c>0);
  items.sort((a,b)=>(ITEMS[a[0]]?.tier||0)-(ITEMS[b[0]]?.tier||0));

  el.innerHTML = items.map(([id,count])=>{
    const item = ITEMS[id];
    const sel = STATE.combineSlots.includes(id) ? ' selected' : '';
    return `<div class="inv-item${sel}" onclick="selectCombineSlot('${id}')"
              onmouseenter="showTip(event,'${id}')" onmouseleave="hideTip()">
      <div class="item-name">${item.icon} ${item.name}</div>
      <div class="item-tier">Tier ${item.tier}</div>
      <div class="item-count">×${count}</div>
    </div>`;
  }).join('');
}

function renderWorkshop() {
  // slots
  for (let i=0;i<2;i++) {
    const el = document.getElementById(`slot-${i}`);
    const id = STATE.combineSlots[i];
    if (id) {
      const item = ITEMS[id];
      el.innerHTML = `<span class="slot-icon">${item.icon}</span><span class="slot-name">${item.name}</span>`;
      el.classList.add('filled');
    } else {
      el.innerHTML = i===0 ? 'Click item' : 'Click item';
      el.classList.remove('filled');
    }
  }

  // hint label
  const [a,b] = STATE.combineSlots;
  const hintEl = document.getElementById('combine-hint');
  if (a && b) {
    const r = findRecipe(a,b);
    hintEl.textContent = r
      ? `→ ${ITEMS[r.output].name}  (costs ${r.energyCost} ⚡)`
      : '→ unknown combination';
    hintEl.style.color = r ? '#66aa66' : '#aa6666';
  } else {
    hintEl.textContent = '';
  }

  document.getElementById('btn-combine').disabled = !(a && b);

  // research
  renderResearch();
}

function renderResearch() {
  const el = document.getElementById('research-cards');
  const toShow = RESEARCH.filter(r => STATE.unlockedResearch.has(r.id) && !STATE.researchDone.has(r.id));

  el.innerHTML = toShow.map(r => {
    const isActive = STATE.activeResearch?.id === r.id;
    const progress = isActive ? STATE.activeResearch.progress : 0;
    const canAfford = STATE.energy >= r.energyCost && STATE.money >= r.moneyCost;

    return `<div class="research-card${isActive?' in-progress':''}" onclick="${isActive?'':'startResearch(\''+r.id+'\')'}">
      <div class="rc-name">${r.name}</div>
      <div class="rc-desc">${r.desc}</div>
      <div class="rc-cost">⚡${r.energyCost}${r.moneyCost>0?' 💰'+r.moneyCost:''}</div>
      <div class="rc-chance">Success: ${Math.round((r.successChance+STATE.researchBoost)*100)}%</div>
      ${isActive ? `<div class="progress-bar"><div class="progress-fill" style="width:${progress*100}%"></div></div>` : ''}
    </div>`;
  }).join('') || '<div style="color:#333355;font-size:0.72rem">No research available yet — discover more items.</div>';
}

function renderRight() {
  // tech tree summary
  const ttEl = document.getElementById('tech-list');
  const tiers = [0,1,2,3,4,5,6,7];
  ttEl.innerHTML = tiers.map(t => {
    const tierItems = Object.values(ITEMS).filter(i=>i.tier===t);
    const discovered = tierItems.filter(i=>STATE.discovered.has(Object.keys(ITEMS).find(k=>ITEMS[k]===i)));
    if (!discovered.length) return '';
    return `<div style="font-size:0.65rem;color:#444466;margin-bottom:2px">Tier ${t}</div>` +
      discovered.map(i=>`<div class="tech-node unlocked"><span class="tn-name">${i.icon} ${i.name}</span><div class="tn-effect">${i.desc.slice(0,50)}…</div></div>`).join('');
  }).join('');

  // deployables
  const depEl = document.getElementById('deploy-list');
  const available = DEPLOYABLES.filter(d => (STATE.inventory[d.item]||0)>0 || STATE.deployed.has(d.item));
  depEl.innerHTML = available.map(d => {
    const item = ITEMS[d.item];
    const done = STATE.deployed.has(d.item);
    return `<div class="deploy-item">
      <div class="di-name">${item.icon} ${item.name}</div>
      <div class="di-desc">${d.label}</div>
      <button class="btn-deploy" onclick="deployItem('${d.item}')" ${done?'disabled':''}>
        ${done ? 'Deployed ✓' : 'Deploy'}
      </button>
    </div>`;
  }).join('') || '<div style="color:#333355;font-size:0.72rem">Nothing deployable yet.</div>';
}

// ── Log ───────────────────────────────────────────────────────────────────────

const LOG_MAX = 60;
const logEntries = [];

function log(msg, type="info") {
  logEntries.unshift({ msg, type });
  if (logEntries.length > LOG_MAX) logEntries.pop();
  const el = document.getElementById('log-area');
  el.innerHTML = logEntries.map(e=>`<div class="log-entry ${e.type}">${e.msg}</div>`).join('');
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function showTip(e, id) {
  const item = ITEMS[id];
  if (!item) return;
  const tip = document.getElementById('tooltip');
  tip.innerHTML = `<strong>${item.icon} ${item.name}</strong> (Tier ${item.tier})<br>${item.desc}`;
  tip.style.display = 'block';
  tip.style.left = (e.clientX + 14) + 'px';
  tip.style.top  = (e.clientY - 10) + 'px';
}

function hideTip() {
  document.getElementById('tooltip').style.display = 'none';
}

// ── Notifications ─────────────────────────────────────────────────────────────

function notify(msg, type="") {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2600);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

window.onload = () => {
  log("You stand at the dawn of everything. Stone. Wood. Bone. Begin.", "info");
  log("Combine items from your inventory. Research unlocks new ones.", "info");
  log("Deploy discoveries to earn passive energy and money.", "info");
  render();
};
