// ── MISSION BANK (20 total — 5 sampled per session) ──────────────────────────
//
// Each step:   id (matches a COMMANDS entry), desc (human language shown in queue),
//              body (body-part keys to highlight), hold? (engage toggle), release? (disengage toggle)

const MISSION_BANK = [

  // 1 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Drink water",
    flavor: "Hydration threshold is critical.",
    steps: [
      { id: "walk_to",        desc: "Walk to the kitchen.",                                          body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Locate the glass.",                                        body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach toward the glass.",                                  body: ["arm_right_upper","arm_right_lower"] },
      { id: "open_hand",      desc: "Open your grip.",                                          body: ["hand_right"] },
      { id: "grip_fingers",   desc: "Close fingers around the glass.",                          body: ["hand_right"] },
      { id: "raise_arm",      desc: "Lift the glass to mouth level.",                           body: ["arm_right_upper","arm_right_lower"] },
      { id: "open_mouth",     desc: "Open your mouth.",                                         body: ["mouth"] },
      { id: "tilt_forearm",   desc: "Tilt the glass so liquid flows out.",                      body: ["arm_right_lower","hand_right"] },
      { id: "swallow",        desc: "Contract throat. Swallow.",                                body: ["throat"] },
      { id: "lower_arm",      desc: "Set the glass back down.",                                 body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 2 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Wave hello",
    flavor: "Social acknowledgment protocol.",
    steps: [
      { id: "scan_visual",    desc: "Spot the person you're greeting.",                         body: ["eyes"] },
      { id: "raise_arm",      desc: "Raise your arm to about shoulder height.",                 body: ["arm_right_upper","arm_right_lower"] },
      { id: "extend_fingers", desc: "Spread your fingers flat.",                                body: ["hand_right"] },
      { id: "oscillate_wrist",desc: "Pivot your wrist side to side a few times.",               body: ["arm_right_lower","hand_right"] },
      { id: "lower_arm",      desc: "Bring your arm back down.",                                body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 3 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Sit down",
    flavor: "Energy conservation mode.",
    steps: [
      { id: "scan_visual",    desc: "Locate a seat.",                                           body: ["eyes"] },
      { id: "rotate_torso",   desc: "Turn around so your back faces the chair.",                body: ["torso"] },
      { id: "bend_knees",     desc: "Bend your knees to begin lowering.",                       body: ["leg_left","leg_right"] },
      { id: "lower_body",     desc: "Slowly lower yourself onto the seat.",                     body: ["torso","leg_left","leg_right"] },
      { id: "relax_muscles",  desc: "Release tension. Let the chair take your weight.",         body: ["torso"] },
    ]
  },

  // 4 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Pick up object",
    flavor: "Item on a lower surface. Retrieve it.",
    steps: [
      { id: "scan_visual",      desc: "Find the object on the floor.",                          body: ["eyes"] },
      { id: "bend_torso",       desc: "Lean your torso forward.",                               body: ["torso"] },
      { id: "extend_arm",       desc: "Reach your arm down toward it.",                         body: ["arm_right_upper","arm_right_lower"] },
      { id: "open_hand",        desc: "Open your fingers to prepare a grip.",                   body: ["hand_right"] },
      { id: "grip_fingers",     desc: "Close fingers around the object.",                       body: ["hand_right"] },
      { id: "raise_arm",        desc: "Lift your arm with the object.",                         body: ["arm_right_upper","arm_right_lower"] },
      { id: "straighten_torso", desc: "Stand back upright.",                                    body: ["torso"] },
    ]
  },

  // 5 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Suppress sneeze",
    flavor: "Nasal irritant detected. Social protocol: suppress.",
    steps: [
      { id: "detect_stimulus",  desc: "Nasal sensors firing. Identify the sensation.",          body: ["head"] },
      { id: "raise_arm",        desc: "Bring your hand toward your face.",                      body: ["arm_right_upper","arm_right_lower"] },
      { id: "extend_fingers",   desc: "Position fingers over the nose.",                        body: ["hand_right"] },
      { id: "grip_fingers",     desc: "Pinch the nose bridge firmly.",                          body: ["hand_right"] },
      { id: "seal_mouth",       desc: "Clamp your mouth shut. Build pressure.",                 body: ["mouth"] },
      { id: "tense_diaphragm",  desc: "Tighten your core. Resist the expulsion.",               body: ["torso"] },
    ]
  },

  // 6 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Brush teeth",
    flavor: "Oral hygiene cycle.",
    steps: [
      { id: "walk_to",        desc: "Walk to the bathroom.",                                         body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Find the toothbrush.",                                     body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for the brush.",                                     body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Pick up the toothbrush.",                                  body: ["hand_right"] },
      { id: "raise_arm",      desc: "Bring the brush to your mouth.",                           body: ["arm_right_upper","arm_right_lower"] },
      { id: "open_mouth",     desc: "Open your mouth and position the brush at your teeth.",    body: ["mouth"] },
      { id: "oscillate_wrist",desc: "Scrub in small circles across all teeth. Two minutes.",    body: ["arm_right_lower","hand_right"] },
      { id: "spit",           desc: "Lean over the sink. Expel toothpaste.",                    body: ["mouth","throat"] },
      { id: "lower_arm",      desc: "Return the brush to the holder.",                          body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 7 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Wash hands",
    flavor: "Sanitization required.",
    steps: [
      { id: "walk_to",        desc: "Walk to the sink.",                                             body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Locate the sink and soap dispenser.",                      body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach toward the faucet handle.",                          body: ["arm_right_upper","arm_right_lower"] },
      { id: "rotate_wrist",   desc: "Turn the faucet. Start the water flow.",                   body: ["arm_right_lower","hand_right"] },
      { id: "open_hand",      desc: "Place hands under the running water.",                     body: ["hand_left","hand_right"] },
      { id: "press_button",   desc: "Press the soap dispenser.",                                body: ["hand_right"] },
      { id: "grip_fingers",   desc: "Rub hands together. Lather the soap.",                     body: ["hand_left","hand_right"] },
      { id: "oscillate_wrist",desc: "Keep scrubbing. Cover all surfaces. 20 seconds.",          body: ["hand_left","hand_right","arm_left_lower","arm_right_lower"] },
      { id: "rotate_wrist",   desc: "Turn the faucet off.",                                     body: ["arm_right_lower","hand_right"] },
    ]
  },

  // 8 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Open a door",
    flavor: "Obstacle blocking passage.",
    steps: [
      { id: "walk_to",        desc: "Walk to the door.",                                             body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Identify the door and its handle.",                        body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach out toward the handle.",                             body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Grip the door handle.",                                    body: ["hand_right"] },
      { id: "rotate_wrist",   desc: "Turn the handle to release the latch.",                    body: ["arm_right_lower","hand_right"] },
      { id: "pull_object",    desc: "Pull the door toward you.",                                body: ["arm_right_upper","arm_right_lower"] },
      { id: "lower_arm",      desc: "Release the handle. Step through.",                        body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 9 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Vacuum the floor",
    flavor: "Surface contamination detected.",
    steps: [
      { id: "walk_to",        desc: "Walk to where the vacuum is stored.",                           body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Locate the vacuum cleaner.",                               body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for the vacuum handle.",                             body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Grip the handle firmly.",                                  body: ["hand_right"] },
      { id: "press_button",   desc: "Press the power button. Motor engages.",                   body: ["hand_right"] },
      { id: "push_object",    desc: "Push the vacuum forward along the floor.",                 body: ["arm_left_upper","arm_left_lower","arm_right_upper","arm_right_lower"] },
      { id: "pull_object",    desc: "Draw the vacuum back toward you.",                         body: ["arm_left_upper","arm_left_lower","arm_right_upper","arm_right_lower"] },
      { id: "press_button",   desc: "Press power button again. Motor off.",                     body: ["hand_right"] },
    ]
  },

  // 10 ────────────────────────────────────────────────────────────────────────
  {
    name: "Wash dishes",
    flavor: "Accumulated residue on surfaces.",
    steps: [
      { id: "walk_to",        desc: "Walk to the kitchen sink.",                                     body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Spot a dirty dish and find the sponge.",                   body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for the dish.",                                      body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Pick up the dish.",                                        body: ["hand_right"] },
      { id: "rotate_wrist",   desc: "Turn on the faucet. Wet the dish.",                        body: ["arm_left_lower","hand_left"] },
      { id: "open_hand",      desc: "Pick up the sponge with the other hand.",                  body: ["hand_left"] },
      { id: "oscillate_wrist",desc: "Scrub the dish in circular strokes.",                      body: ["hand_left","arm_left_lower"] },
      { id: "tilt_forearm",   desc: "Rinse the dish under the running water.",                  body: ["arm_right_lower","hand_right"] },
      { id: "lower_arm",      desc: "Place the dish in the drying rack.",                       body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 11 ────────────────────────────────────────────────────────────────────────
  {
    name: "Make coffee",
    flavor: "Caffeine levels are low.",
    steps: [
      { id: "walk_to",        desc: "Walk to the coffee maker.",                                     body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Locate the coffee maker and an empty mug.",                body: ["eyes"] },
      { id: "extend_arm",     desc: "Open the water reservoir.",                                body: ["arm_right_upper","arm_right_lower"] },
      { id: "tilt_forearm",   desc: "Pour water into the reservoir.",                           body: ["arm_right_lower","hand_right"] },
      { id: "lower_arm",      desc: "Close the reservoir lid.",                                 body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Insert a coffee pod.",                                     body: ["hand_right"] },
      { id: "press_button",   desc: "Press brew. Heating cycle begins.",                        body: ["hand_right"] },
      { id: "extend_arm",     desc: "Reach for the filled mug.",                                body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Grip the mug handle.",                                     body: ["hand_right"] },
      { id: "raise_arm",      desc: "Lift the mug.",                                            body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 12 ────────────────────────────────────────────────────────────────────────
  {
    name: "Tie a shoelace",
    flavor: "Tripping hazard detected.",
    steps: [
      { id: "scan_visual",      desc: "Locate the untied shoelace.",                            body: ["eyes"] },
      { id: "bend_knees",       desc: "Bend your knees to lower toward the floor.",             body: ["leg_left","leg_right"] },
      { id: "bend_torso",       desc: "Lean your torso forward to reach the shoe.",             body: ["torso"] },
      { id: "grip_fingers",     desc: "Gather both lace ends in your hands.",                   body: ["hand_left","hand_right"] },
      { id: "extend_fingers",   desc: "Cross the laces and form an initial loop.",              body: ["hand_left","hand_right"] },
      { id: "oscillate_wrist",  desc: "Loop and thread. Form the bow.",                        body: ["hand_left","hand_right","arm_left_lower","arm_right_lower"] },
      { id: "straighten_torso", desc: "Return upright. Test tightness.",                       body: ["torso"] },
    ]
  },

  // 13 ────────────────────────────────────────────────────────────────────────
  {
    name: "Answer the phone",
    flavor: "Incoming call detected.",
    steps: [
      { id: "walk_to",        desc: "Walk toward the ringing phone.",                                body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Locate the ringing phone.",                                body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for the device.",                                    body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Pick it up.",                                              body: ["hand_right"] },
      { id: "raise_arm",      desc: "Bring the phone up toward your ear.",                      body: ["arm_right_upper","arm_right_lower"] },
      { id: "press_button",   desc: "Press the answer button.",                                 body: ["hand_right"] },
      { id: "open_mouth",     desc: "Open your mouth. Respond to the caller.",                  body: ["mouth"] },
    ]
  },

  // 15 ────────────────────────────────────────────────────────────────────────
  {
    name: "Eat with a fork",
    flavor: "Caloric intake required.",
    steps: [
      { id: "scan_visual",    desc: "Find the plate and your fork.",                            body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for the fork.",                                      body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Pick it up.",                                              body: ["hand_right"] },
      { id: "raise_arm",      desc: "Position the fork above the food.",                        body: ["arm_right_upper","arm_right_lower"] },
      { id: "extend_arm",     desc: "Lower the fork and pierce the food.",                      body: ["arm_right_lower","hand_right"] },
      { id: "raise_arm",      desc: "Lift the loaded fork toward your mouth.",                  body: ["arm_right_upper","arm_right_lower"] },
      { id: "open_mouth",     desc: "Open your mouth.",                                         body: ["mouth"] },
      { id: "swallow",        desc: "Chew and swallow.",                                        body: ["throat","mouth"] },
      { id: "lower_arm",      desc: "Return the fork to the plate.",                            body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 16 ────────────────────────────────────────────────────────────────────────
  {
    name: "Turn off the light",
    flavor: "Unnecessary energy expenditure detected.",
    steps: [
      { id: "walk_to",        desc: "Walk to the light switch.",                                     body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Spot the light switch on the wall.",                       body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach toward the switch.",                                 body: ["arm_right_upper","arm_right_lower"] },
      { id: "extend_fingers", desc: "Extend your index finger toward the switch.",              body: ["hand_right"] },
      { id: "press_button",   desc: "Press the switch down. Circuit opens.",                    body: ["hand_right"] },
      { id: "lower_arm",      desc: "Lower your arm.",                                          body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 17 ────────────────────────────────────────────────────────────────────────
  {
    name: "Put on a jacket",
    flavor: "Ambient temperature is low.",
    steps: [
      { id: "scan_visual",    desc: "Locate the jacket.",                                       body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for it.",                                            body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Grip the jacket by the collar.",                           body: ["hand_right"] },
      { id: "raise_arm",      desc: "Lift the jacket and hold it overhead.",                    body: ["arm_right_upper","arm_right_lower"] },
      { id: "extend_arm",     desc: "Thread your right arm into the sleeve.",                   body: ["arm_right_upper","arm_right_lower"] },
      { id: "rotate_torso",   desc: "Swing the jacket around onto your shoulders.",             body: ["torso"] },
      { id: "lower_arm",      desc: "Thread your left arm in. Let the jacket settle.",          body: ["arm_left_upper","arm_left_lower"] },
    ]
  },

  // 18 ────────────────────────────────────────────────────────────────────────
  {
    name: "Open a jar",
    flavor: "Sealed container. Manual extraction required.",
    steps: [
      { id: "scan_visual",    desc: "Find the jar.",                                            body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for it.",                                            body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Grip the jar body with your non-dominant hand.",           body: ["hand_left"] },
      { id: "open_hand",      desc: "Position your dominant hand over the lid.",                body: ["hand_right"] },
      { id: "grip_fingers",   desc: "Grip the lid firmly.",                                     body: ["hand_right"] },
      { id: "rotate_wrist",   desc: "Apply counterclockwise torque to the lid.",                body: ["arm_right_lower","hand_right"] },
      { id: "extend_fingers", desc: "Lift and remove the loosened lid.",                        body: ["hand_right"] },
    ]
  },

  // 19 ────────────────────────────────────────────────────────────────────────
  {
    name: "Blow your nose",
    flavor: "Nasal passage obstructed.",
    steps: [
      { id: "walk_to",        desc: "Walk to where the tissues are.",                                body: ["leg_left","leg_right","shin_left","shin_right"] },
      { id: "scan_visual",    desc: "Find a tissue.",                                           body: ["eyes"] },
      { id: "extend_arm",     desc: "Reach for the tissue.",                                    body: ["arm_right_upper","arm_right_lower"] },
      { id: "grip_fingers",   desc: "Take the tissue in hand.",                                 body: ["hand_right"] },
      { id: "raise_arm",      desc: "Bring the tissue to your nose.",                           body: ["arm_right_upper","arm_right_lower"] },
      { id: "seal_mouth",     desc: "Close your mouth to redirect airflow.",                    body: ["mouth"] },
      { id: "tense_diaphragm",desc: "Exhale sharply through your nose.",                        body: ["torso"] },
      { id: "lower_arm",      desc: "Dispose of the tissue.",                                   body: ["arm_right_upper","arm_right_lower"] },
    ]
  },

  // 20 ────────────────────────────────────────────────────────────────────────
  {
    name: "Stand up from chair",
    flavor: "Prolonged inactivity. Time to move.",
    steps: [
      { id: "scan_visual",      desc: "Check the space in front of you is clear.",              body: ["eyes"] },
      { id: "extend_arm",       desc: "Place your hands on the armrests or your thighs.",       body: ["arm_left_upper","arm_right_upper","arm_left_lower","arm_right_lower"] },
      { id: "open_hand",        desc: "Flatten your palms to push.",                            body: ["hand_left","hand_right"] },
      { id: "bend_knees",       desc: "Lean forward slightly. Engage your legs.",               body: ["leg_left","leg_right"] },
      { id: "straighten_torso", desc: "Push down and rise. Extend your legs.",                  body: ["torso","leg_left","leg_right"] },
      { id: "relax_muscles",    desc: "Stand steady. Distribute your weight.",                  body: ["torso","leg_left","leg_right"] },
    ]
  },

];

// ── COMMAND GROUPS ────────────────────────────────────────────────────────────
const COMMAND_GROUPS = [
  {
    label: "Vision",
    cmds: [
      { id: "scan_visual",      label: "Scan visual field" },
    ]
  },
  {
    label: "Mouth & throat",
    cmds: [
      { id: "open_mouth",       label: "Open mouth" },
      { id: "seal_mouth",       label: "Seal mouth" },
      { id: "swallow",          label: "Swallow" },
      { id: "spit",             label: "Spit" },
    ]
  },
  {
    label: "Arms",
    cmds: [
      { id: "raise_arm",        label: "Raise arm" },
      { id: "lower_arm",        label: "Lower arm" },
      { id: "extend_arm",       label: "Extend arm" },
      { id: "tilt_forearm",     label: "Tilt forearm" },
    ]
  },
  {
    label: "Wrist",
    cmds: [
      { id: "oscillate_wrist",  label: "Oscillate wrist" },
      { id: "rotate_wrist",     label: "Rotate wrist" },
    ]
  },
  {
    label: "Hands & fingers",
    cmds: [
      { id: "open_hand",        label: "Open hand" },
      { id: "grip_fingers",     label: "Grip fingers" },
      { id: "extend_fingers",   label: "Extend fingers" },
    ]
  },
  {
    label: "Torso",
    cmds: [
      { id: "rotate_torso",     label: "Rotate torso" },
      { id: "bend_torso",       label: "Bend torso" },
      { id: "straighten_torso", label: "Straighten torso" },
      { id: "relax_muscles",    label: "Relax muscles" },
      { id: "tense_diaphragm",  label: "Tense diaphragm" },
    ]
  },
  {
    label: "Legs",
    cmds: [
      { id: "walk_to",          label: "Walk to location" },
      { id: "bend_knees",       label: "Bend knees" },
      { id: "lower_body",       label: "Lower body" },
    ]
  },
  {
    label: "Interaction",
    cmds: [
      { id: "push_object",      label: "Push object" },
      { id: "pull_object",      label: "Pull object" },
      { id: "press_button",     label: "Press button" },
    ]
  },
  {
    label: "Sensory",
    cmds: [
      { id: "detect_stimulus",  label: "Detect nasal stimulus" },
    ]
  },
];

const COMMANDS = COMMAND_GROUPS.flatMap(g => g.cmds);

// ── BODY MAP ──────────────────────────────────────────────────────────────────
const BODY_MAP = {
  eyes:             ["bp-eyes", "bp-eyes2"],
  mouth:            ["bp-mouth"],
  throat:           ["bp-throat"],
  head:             ["bp-head"],
  torso:            ["bp-torso"],
  arm_right_upper:  ["bp-arm_right_upper"],
  arm_right_lower:  ["bp-arm_right_lower"],
  hand_right:       ["bp-hand_right"],
  arm_left_upper:   ["bp-arm_left_upper"],
  arm_left_lower:   ["bp-arm_left_lower"],
  hand_left:        ["bp-hand_left"],
  leg_left:         ["bp-leg_left"],
  leg_right:        ["bp-leg_right"],
  shin_left:        ["bp-shin_left"],
  shin_right:       ["bp-shin_right"],
};

// ── STATE ─────────────────────────────────────────────────────────────────────
const MISSIONS_PER_SESSION = 5;

let state = {};

function newState() {
  return {
    session:    sampleMissions(MISSIONS_PER_SESSION),
    missionIdx: 0,
    stepIdx:    0,
    score:      0,
    timeLeft:   90,
    timerHandle: null,
    ended:      false,
    stepErrors: 0,   // wrong attempts on the current step — resets on correct
  };
}

function sampleMissions(n) {
  return [...MISSION_BANK].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", () => {
    document.getElementById("end-screen").classList.add("hidden");
    startGame();
  });
});

function startGame() {
  state = newState();
  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  buildControlPanel();
  loadMission();
  startTimer();
}

// ── CONTROL PANEL ─────────────────────────────────────────────────────────────
function buildControlPanel() {
  const grid = document.getElementById("buttons-grid");
  grid.innerHTML = "";
  COMMAND_GROUPS.forEach(group => {
    const section = document.createElement("div");
    section.className = "cmd-group";

    const lbl = document.createElement("div");
    lbl.className = "cmd-group-label";
    lbl.textContent = group.label;
    section.appendChild(lbl);

    group.cmds.forEach(cmd => {
      const btn = document.createElement("button");
      btn.className = "cmd-btn";
      btn.dataset.cmdId = cmd.id;
      btn.textContent = cmd.label;
      btn.addEventListener("click", () => handleCommand(cmd.id, btn));
      section.appendChild(btn);
    });

    grid.appendChild(section);
  });
}

// ── MISSION LOADING ───────────────────────────────────────────────────────────
function loadMission() {
  const m = state.session[state.missionIdx];
  document.getElementById("hud-directive-text").textContent = m.name;
  document.getElementById("hud-mission-text").textContent =
    `${state.missionIdx + 1} / ${MISSIONS_PER_SESSION}`;

  buildStepsList(m);
  clearBodyHighlights();
  updateStepView();
}

function buildStepsList(mission) {
  const list = document.getElementById("steps-list");
  list.innerHTML = "";
  mission.steps.forEach((step, i) => {
    const div = document.createElement("div");
    div.className = "step-item pending";
    div.dataset.idx = i;

    div.innerHTML = `
      <span class="step-num">${String(i + 1).padStart(2, "0")}.</span>
      <span class="step-body">${step.desc}</span>
      <span class="step-check"></span>
    `;
    list.appendChild(div);
  });
}

function updateStepView() {
  const mission = state.session[state.missionIdx];
  document.querySelectorAll(".step-item").forEach((el, i) => {
    el.classList.remove("pending", "current", "done");
    const chk = el.querySelector(".step-check");
    if (i < state.stepIdx) {
      el.classList.add("done");
      chk.textContent = "✓";
    } else if (i === state.stepIdx) {
      el.classList.add("current");
      chk.textContent = "";
    } else {
      el.classList.add("pending");
      chk.textContent = "";
    }
  });

  const current = document.querySelector(".step-item.current");
  if (current) current.scrollIntoView({ block: "nearest", behavior: "smooth" });

  const hint = document.getElementById("step-hint");
  hint.textContent = state.stepIdx === 0 ? mission.flavor : "";

}

// ── COMMAND HANDLING ──────────────────────────────────────────────────────────
function handleCommand(cmdId, btn) {
  if (state.ended) return;

  const mission = state.session[state.missionIdx];
  const step    = mission.steps[state.stepIdx];

  if (cmdId !== step.id) {
    flashBtn(btn, false);
    applyPenalty();
    return;
  }

  document.querySelectorAll(".cmd-group").forEach(g => g.classList.remove("cmd-group--dim"));
  flashBtn(btn, true);
  highlightBody(step.body);
  state.score      += 10;
  state.stepIdx    += 1;
  state.stepErrors  = 0;
  state.timeLeft = Math.min(state.timeLeft + (state.stepErrors === 0 ? 10 : 7), 120);
  updateScore();
  updateTimer();
  showFeedback("Done", true);

  if (state.stepIdx >= mission.steps.length) {
    setButtonsEnabled(false);
    setTimeout(() => {
      clearBodyHighlights();
      state.missionIdx++;
      state.stepIdx = 0;
      if (state.missionIdx >= MISSIONS_PER_SESSION) {
        endGame(true);
      } else {
        showFeedback("Mission complete", true);
        setTimeout(() => {
          loadMission();
          setButtonsEnabled(true);
        }, 1000);
      }
    }, 700);
  } else {
    updateStepView();
  }
}

function applyPenalty() {
  const deduction = state.stepErrors === 0 ? 4 : 2;
  state.stepErrors += 1;
  // Activate dimming hint on the first mistake
  if (state.stepErrors === 1) {
    const step = state.session[state.missionIdx].steps[state.stepIdx];
    document.querySelectorAll(".cmd-group").forEach(group => {
      const hasAnswer = !!group.querySelector(`[data-cmd-id="${step.id}"]`);
      group.classList.toggle("cmd-group--dim", !hasAnswer);
    });
  }
  state.score    = Math.max(0, state.score - 5);
  state.timeLeft = Math.max(0, state.timeLeft - deduction);
  updateScore();
  updateTimer();
  showFeedback(`−${deduction}s`, false);
  if (state.timeLeft <= 0) endGame(false);
}

// ── BODY HIGHLIGHTING ─────────────────────────────────────────────────────────
function highlightBody(parts) {
  clearBodyHighlights();
  parts.forEach(key => {
    (BODY_MAP[key] || []).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("active");
    });
  });
  setTimeout(clearBodyHighlights, 900);
}

function clearBodyHighlights() {
  Object.values(BODY_MAP).flat().forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────

function flashBtn(btn, good) {
  const cls = good ? "flash-good" : "flash-bad";
  btn.classList.add(cls);
  setTimeout(() => btn.classList.remove(cls), 380);
}

function showFeedback(msg, good) {
  const fb = document.getElementById("feedback");
  fb.textContent = msg;
  fb.className = good ? "fb-good" : "fb-bad";
  fb.classList.remove("hidden");
  fb.style.animation = "none";
  fb.offsetHeight; // reflow
  fb.style.animation = "";
  clearTimeout(fb._hide);
  fb._hide = setTimeout(() => fb.classList.add("hidden"), 950);
}

function setButtonsEnabled(on) {
  document.querySelectorAll(".cmd-btn").forEach(b => (b.disabled = !on));
  if (!on) {
    document.querySelectorAll(".cmd-group").forEach(g => g.classList.remove("cmd-group--dim"));
  }
}

function updateScore() {
  document.getElementById("hud-score-text").textContent = state.score;
}

function updateTimer() {
  const el = document.getElementById("hud-timer-text");
  el.textContent = Math.max(0, state.timeLeft);
  el.className = state.timeLeft <= 10 ? "urgent" : "";
}

// ── TIMER ─────────────────────────────────────────────────────────────────────
function startTimer() {
  updateTimer();
  state.timerHandle = setInterval(() => {
    state.timeLeft--;
    updateTimer();
    if (state.timeLeft <= 0) endGame(false);
  }, 1000);
}

// ── END GAME ──────────────────────────────────────────────────────────────────
function endGame(allComplete) {
  if (state.ended) return;
  state.ended = true;
  clearInterval(state.timerHandle);

  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.remove("hidden");

  document.getElementById("end-title").textContent =
    allComplete ? "All directives complete" : "Time's up";

  document.getElementById("end-message").textContent = allComplete
    ? "Every directive translated and executed. The mind spoke; the body obeyed."
    : `${state.missionIdx} of ${MISSIONS_PER_SESSION} directives completed before the clock ran out.`;

  document.getElementById("end-score-text").textContent = state.score;
}
