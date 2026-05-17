const STAGE_WIDTH = 480;
const STAGE_HEIGHT = 360;
const STORAGE_KEY = "scratchjr_html5_clone_project_v1";
const SYNC_ENDPOINT = "./sync-assets.php";
const DEFAULT_BRANCH = "chromebook-optimize";
const DEFAULT_SPRITE_COSTUME_PATH = "svglibrary/Star.svg";

const STAGE_BACKGROUND_PRESETS = [
  {
    id: "sky",
    type: "gradient",
    css: "linear-gradient(180deg, #f2f9ff 0%, #e8f4ff 56%, #dce9f7 100%)",
  },
  {
    id: "sunset",
    type: "gradient",
    css: "linear-gradient(180deg, #ffdebe 0%, #ffd5b3 38%, #f8c4eb 72%, #bfdcf9 100%)",
  },
  {
    id: "page",
    type: "image",
    path: "assets/pagebkg.png",
    fallbackColor: "#e8f4ff",
  },
  {
    id: "rays",
    type: "image",
    path: "assets/start/rays.png",
    fallbackColor: "#ffeec0",
  },
  {
    id: "custom",
    type: "color",
  },
];

const DEFAULT_STAGE_BACKGROUND = {
  preset: "sky",
  color: "#E8F4FF",
};

const FALLBACK_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#38b7d8"/>
        <stop offset="100%" stop-color="#1fb57a"/>
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#g)"/>
  </svg>`
)}`;

const FALLBACK_CAT = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <path d="M19 31l23 10 6-20z" fill="#f7b14a"/>
    <path d="M101 31L78 41l-6-20z" fill="#f7b14a"/>
    <circle cx="60" cy="66" r="44" fill="#f2a12f"/>
    <circle cx="43" cy="60" r="8" fill="#fff"/>
    <circle cx="77" cy="60" r="8" fill="#fff"/>
    <circle cx="43" cy="60" r="3" fill="#1f2e40"/>
    <circle cx="77" cy="60" r="3" fill="#1f2e40"/>
    <ellipse cx="60" cy="79" rx="10" ry="7" fill="#ffd4a8"/>
    <path d="M53 83c2 3 4 5 7 5s5-2 7-5" fill="none" stroke="#ba6a2c" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 70h18M84 70h18M15 78h22M83 78h22" stroke="#ba6a2c" stroke-width="3" stroke-linecap="round"/>
  </svg>`
)}`;

const BLOCK_CATEGORIES = [
  { id: "triggers", label: "Start" },
  { id: "motion", label: "Movimento" },
  { id: "looks", label: "Aspetto" },
  { id: "sound", label: "Suono" },
  { id: "control", label: "Controllo" },
];

const BLOCK_LIBRARY = {
  start: {
    type: "start",
    category: "triggers",
    label: "Bandiera verde",
    color: "#F4D64E",
    icon: "assets/blockicons/greenFlag.svg",
    argDefs: [],
  },
  onTap: {
    type: "onTap",
    category: "triggers",
    label: "Al tocco",
    color: "#F4D64E",
    icon: "assets/blockicons/OnTouch.svg",
    argDefs: [],
  },
  moveRight: {
    type: "moveRight",
    category: "motion",
    label: "Avanti",
    color: "#4CA9EA",
    icon: "assets/blockicons/Foward.svg",
    argDefs: [{ key: "steps", kind: "number", min: 1, max: 10, step: 1, defaultValue: 1 }],
  },
  moveLeft: {
    type: "moveLeft",
    category: "motion",
    label: "Indietro",
    color: "#4CA9EA",
    icon: "assets/blockicons/Back.svg",
    argDefs: [{ key: "steps", kind: "number", min: 1, max: 10, step: 1, defaultValue: 1 }],
  },
  moveUp: {
    type: "moveUp",
    category: "motion",
    label: "Vai in su",
    color: "#4CA9EA",
    icon: "assets/blockicons/Up.svg",
    argDefs: [{ key: "steps", kind: "number", min: 1, max: 10, step: 1, defaultValue: 1 }],
  },
  moveDown: {
    type: "moveDown",
    category: "motion",
    label: "Vai in giu",
    color: "#4CA9EA",
    icon: "assets/blockicons/Down.svg",
    argDefs: [{ key: "steps", kind: "number", min: 1, max: 10, step: 1, defaultValue: 1 }],
  },
  turnRight: {
    type: "turnRight",
    category: "motion",
    label: "Gira a destra",
    color: "#4CA9EA",
    icon: "assets/blockicons/Right.svg",
    argDefs: [{ key: "turns", kind: "number", min: 1, max: 12, step: 1, defaultValue: 1 }],
  },
  turnLeft: {
    type: "turnLeft",
    category: "motion",
    label: "Gira a sinistra",
    color: "#4CA9EA",
    icon: "assets/blockicons/Left.svg",
    argDefs: [{ key: "turns", kind: "number", min: 1, max: 12, step: 1, defaultValue: 1 }],
  },
  say: {
    type: "say",
    category: "looks",
    label: "Dici",
    color: "#BC8CFF",
    icon: "assets/blockicons/Say.svg",
    argDefs: [{ key: "text", kind: "text", maxLength: 60, defaultValue: "Ciao!" }],
  },
  grow: {
    type: "grow",
    category: "looks",
    label: "Ingrandisci",
    color: "#BC8CFF",
    icon: "assets/blockicons/Grow.svg",
    argDefs: [{ key: "amount", kind: "number", min: 1, max: 5, step: 1, defaultValue: 1 }],
  },
  shrink: {
    type: "shrink",
    category: "looks",
    label: "Riduci",
    color: "#BC8CFF",
    icon: "assets/blockicons/Shrink.svg",
    argDefs: [{ key: "amount", kind: "number", min: 1, max: 5, step: 1, defaultValue: 1 }],
  },
  show: {
    type: "show",
    category: "looks",
    label: "Mostra",
    color: "#BC8CFF",
    icon: "assets/blockicons/Appear.svg",
    argDefs: [],
  },
  hide: {
    type: "hide",
    category: "looks",
    label: "Nascondi",
    color: "#BC8CFF",
    icon: "assets/blockicons/Disappear.svg",
    argDefs: [],
  },
  popSound: {
    type: "popSound",
    category: "sound",
    label: "Suono pop",
    color: "#6FC263",
    icon: "assets/blockicons/Speaker.svg",
    argDefs: [],
  },
  wait: {
    type: "wait",
    category: "control",
    label: "Attendi",
    color: "#F19A47",
    icon: "assets/blockicons/Wait.svg",
    argDefs: [{ key: "seconds", kind: "number", min: 0, max: 10, step: 0.5, defaultValue: 1 }],
  },
  stop: {
    type: "stop",
    category: "control",
    label: "Stop",
    color: "#F19A47",
    icon: "assets/blockicons/Stop.svg",
    argDefs: [],
  },
};

const TRIGGER_BLOCKS = new Set(["start", "onTap"]);

const state = {
  ui: {},
  project: null,
  selectedSpriteId: null,
  activeCategory: "triggers",
  runtime: {
    session: 0,
    active: false,
    timers: new Set(),
  },
  sync: {
    inFlight: false,
    message: "In attesa...",
  },
  sortables: {
    palette: null,
    script: null,
  },
};

let uidCounter = 0;
let saveTimer = null;

window.addEventListener("DOMContentLoaded", () => {
  boot();
});

function boot() {
  collectUi();
  wireUiEvents();
  state.project = loadProject();
  state.selectedSpriteId = state.project.sprites[0].id;
  state.ui.projectNameInput.value = state.project.name;
  syncStageBackgroundControls();

  renderCategoryTabs();
  renderPalette();
  renderSpriteStrip();
  renderStage();
  renderScriptList();
  setupSortables();
  updateSyncState(state.sync.message);
  setRunControls(false);

  if (isLocalDevHost()) {
    cleanupScratchCaches();
  } else {
    registerServiceWorker();
  }
  syncOriginalAssets();
}

function collectUi() {
  state.ui.projectNameInput = byId("projectNameInput");
  state.ui.syncAssetsBtn = byId("syncAssetsBtn");
  state.ui.syncState = byId("syncState");
  state.ui.runBtn = byId("runBtn");
  state.ui.stopBtn = byId("stopBtn");
  state.ui.resetSpriteBtn = byId("resetSpriteBtn");
  state.ui.addSpriteBtn = byId("addSpriteBtn");
  state.ui.exportBtn = byId("exportBtn");
  state.ui.importInput = byId("importInput");
  state.ui.stage = byId("stage");
  state.ui.speechBubble = byId("speechBubble");
  state.ui.spriteStrip = byId("spriteStrip");
  state.ui.scriptList = byId("scriptList");
  state.ui.scriptEmptyHint = byId("scriptEmptyHint");
  state.ui.categoryTabs = byId("categoryTabs");
  state.ui.paletteList = byId("paletteList");
  state.ui.stageBackgroundPreset = byId("stageBackgroundPreset");
  state.ui.stageBackgroundColor = byId("stageBackgroundColor");
}

function wireUiEvents() {
  state.ui.projectNameInput.addEventListener("input", (event) => {
    state.project.name = event.target.value.trim() || "Nuovo progetto";
    touchProject();
  });

  state.ui.syncAssetsBtn.addEventListener("click", () => {
    syncOriginalAssets({ manual: true });
  });

  state.ui.runBtn.addEventListener("click", () => {
    runFromGreenFlag();
  });

  state.ui.stopBtn.addEventListener("click", () => {
    stopRuntime();
  });

  state.ui.addSpriteBtn.addEventListener("click", () => {
    addSprite();
  });

  state.ui.resetSpriteBtn.addEventListener("click", () => {
    resetSelectedSprite();
  });

  state.ui.exportBtn.addEventListener("click", () => {
    exportProjectJson();
  });

  state.ui.importInput.addEventListener("change", (event) => {
    importProjectJson(event);
  });

  state.ui.stageBackgroundPreset.addEventListener("change", (event) => {
    setStageBackgroundPreset(event.target.value);
  });

  state.ui.stageBackgroundColor.addEventListener("input", (event) => {
    setStageBackgroundColor(event.target.value);
  });
}

function setupSortables() {
  if (typeof Sortable === "undefined") {
    setupNativeDragAndDrop();
    return;
  }

  state.sortables.palette = new Sortable(state.ui.paletteList, {
    group: {
      name: "scratchjr-blocks",
      pull: "clone",
      put: false,
    },
    sort: false,
    animation: 120,
    forceFallback: true,
    fallbackOnBody: true,
    ghostClass: "sortable-ghost",
  });

  state.sortables.script = new Sortable(state.ui.scriptList, {
    group: {
      name: "scratchjr-blocks",
      pull: false,
      put: true,
    },
    animation: 130,
    forceFallback: true,
    fallbackOnBody: true,
    delay: 80,
    delayOnTouchOnly: true,
    filter: "input,button",
    preventOnFilter: false,
    ghostClass: "sortable-ghost",
    onAdd: (event) => {
      onScriptAddFromPalette(event);
    },
    onUpdate: (event) => {
      onScriptReorder(event);
    },
  });
}

function setupNativeDragAndDrop() {
  state.ui.scriptList.addEventListener("dragover", (event) => {
    if (!event.dataTransfer) {
      return;
    }
    const types = event.dataTransfer.types ? Array.from(event.dataTransfer.types) : [];
    if (!types.includes("text/x-scratchjr-block")) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  });

  state.ui.scriptList.addEventListener("drop", (event) => {
    if (!event.dataTransfer) {
      return;
    }
    const blockType = event.dataTransfer.getData("text/x-scratchjr-block");
    if (!blockType || !BLOCK_LIBRARY[blockType]) {
      return;
    }
    event.preventDefault();
    appendBlockToCurrentScript(blockType);
  });
}

function onScriptAddFromPalette(event) {
  const type = event.item.dataset.blockType;
  event.item.remove();
  if (!type || !BLOCK_LIBRARY[type]) {
    return;
  }

  const sprite = getSelectedSprite();
  if (!sprite) {
    return;
  }

  const newBlock = makeBlock(type);
  sprite.script.splice(event.newIndex, 0, newBlock);
  touchProject();
  renderScriptList();
}

function onScriptReorder(event) {
  const sprite = getSelectedSprite();
  if (!sprite || event.oldIndex === event.newIndex) {
    return;
  }

  const [moved] = sprite.script.splice(event.oldIndex, 1);
  if (!moved) {
    return;
  }
  sprite.script.splice(event.newIndex, 0, moved);
  touchProject();
  renderScriptList();
}

function renderCategoryTabs() {
  state.ui.categoryTabs.innerHTML = "";
  for (const category of BLOCK_CATEGORIES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-tab";
    if (category.id === state.activeCategory) {
      button.classList.add("active");
    }
    button.textContent = category.label;
    button.addEventListener("click", () => {
      state.activeCategory = category.id;
      renderCategoryTabs();
      renderPalette();
    });
    state.ui.categoryTabs.appendChild(button);
  }
}

function renderPalette() {
  state.ui.paletteList.innerHTML = "";
  const blocks = Object.values(BLOCK_LIBRARY).filter((item) => item.category === state.activeCategory);

  for (const def of blocks) {
    const item = document.createElement("li");
    item.className = "palette-block";
    item.dataset.blockType = def.type;
    item.draggable = true;
    item.style.setProperty("--block-color", def.color);

    const iconWrap = document.createElement("span");
    iconWrap.className = "block-icon";
    iconWrap.appendChild(buildIconImage(def.icon, def.label));

    const label = document.createElement("span");
    label.className = "block-label";
    label.textContent = def.label;

    item.append(iconWrap, label);
    item.addEventListener("dragstart", (event) => {
      if (!event.dataTransfer) {
        return;
      }
      event.dataTransfer.setData("text/x-scratchjr-block", def.type);
      event.dataTransfer.effectAllowed = "copy";
    });
    item.addEventListener("click", () => {
      appendBlockToCurrentScript(def.type);
    });
    state.ui.paletteList.appendChild(item);
  }
}

function renderSpriteStrip() {
  state.ui.spriteStrip.innerHTML = "";
  for (const sprite of state.project.sprites) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "sprite-chip";
    if (sprite.id === state.selectedSpriteId) {
      chip.classList.add("active");
    }
    chip.innerHTML = `<span class="dot"></span><span>${sprite.name}</span>`;
    chip.addEventListener("click", () => {
      selectSprite(sprite.id);
    });
    state.ui.spriteStrip.appendChild(chip);
  }
}

function renderStage() {
  const stage = state.ui.stage;
  applyStageBackground();
  const existingNodes = new Map();
  for (const node of stage.querySelectorAll(".stage-sprite")) {
    existingNodes.set(node.dataset.spriteId, node);
  }

  const validIds = new Set();
  for (const sprite of state.project.sprites) {
    validIds.add(sprite.id);
    let node = existingNodes.get(sprite.id);
    if (!node) {
      node = document.createElement("button");
      node.type = "button";
      node.className = "stage-sprite";
      node.dataset.spriteId = sprite.id;
      const image = document.createElement("img");
      image.draggable = false;
      image.alt = sprite.name;
      image.addEventListener(
        "error",
        () => {
          image.src = FALLBACK_CAT;
        },
        { once: true }
      );
      node.appendChild(image);
      node.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        const spriteId = event.currentTarget.dataset.spriteId;
        selectSprite(spriteId);
        runFromTap(spriteId);
      });
      stage.appendChild(node);
    }
    updateStageSpriteNode(node, sprite);
  }

  for (const [spriteId, node] of existingNodes.entries()) {
    if (!validIds.has(spriteId)) {
      node.remove();
    }
  }
}

function updateStageSpriteNode(node, sprite) {
  const leftPercent = (sprite.x / STAGE_WIDTH) * 100;
  const topPercent = (sprite.y / STAGE_HEIGHT) * 100;
  node.style.left = `${leftPercent}%`;
  node.style.top = `${topPercent}%`;
  node.style.opacity = sprite.visible ? "1" : "0";
  node.style.transform = `translate(-50%, -50%) rotate(${sprite.rotation}deg) scale(${sprite.scale})`;
  node.classList.toggle("selected", sprite.id === state.selectedSpriteId);

  const image = node.querySelector("img");
  const source = resolveAssetUrl(sprite.costumePath);
  if (image.dataset.source !== source) {
    image.dataset.source = source;
    image.src = source;
  }
}

function applyStageBackground() {
  const stage = state.ui.stage;
  const background = getStageBackground();
  const preset = getStageBackgroundPreset(background.preset);

  stage.style.backgroundColor = "";
  stage.style.backgroundImage = "";
  stage.style.backgroundRepeat = "no-repeat";
  stage.style.backgroundPosition = "center";
  stage.style.backgroundSize = "cover";

  if (preset.type === "gradient") {
    stage.style.background = preset.css;
    return;
  }

  if (preset.type === "image") {
    stage.style.backgroundColor = preset.fallbackColor || background.color;
    stage.style.backgroundImage = `url("${resolveAssetUrl(preset.path)}")`;
    return;
  }

  stage.style.background = normalizeHexColor(background.color, DEFAULT_STAGE_BACKGROUND.color);
}

function setStageBackgroundPreset(presetId) {
  const preset = getStageBackgroundPreset(presetId);
  const background = getStageBackground();
  background.preset = preset.id;
  touchProject();
  syncStageBackgroundControls();
  renderStage();
}

function setStageBackgroundColor(inputColor) {
  const background = getStageBackground();
  background.color = normalizeHexColor(inputColor, DEFAULT_STAGE_BACKGROUND.color);
  touchProject();
  syncStageBackgroundControls();
  renderStage();
}

function syncStageBackgroundControls() {
  const background = getStageBackground();
  const preset = getStageBackgroundPreset(background.preset);
  state.ui.stageBackgroundPreset.value = preset.id;
  state.ui.stageBackgroundColor.value = normalizeHexColor(background.color, DEFAULT_STAGE_BACKGROUND.color);
  state.ui.stageBackgroundColor.disabled = preset.id !== "custom";
}

function getStageBackground() {
  if (!state.project.stage || typeof state.project.stage !== "object") {
    state.project.stage = {
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      background: { ...DEFAULT_STAGE_BACKGROUND },
    };
  }
  if (!state.project.stage.background || typeof state.project.stage.background !== "object") {
    state.project.stage.background = { ...DEFAULT_STAGE_BACKGROUND };
  }
  return state.project.stage.background;
}

function getStageBackgroundPreset(presetId) {
  const preset = STAGE_BACKGROUND_PRESETS.find((entry) => entry.id === presetId);
  if (preset) {
    return preset;
  }
  return STAGE_BACKGROUND_PRESETS[0];
}

function renderScriptList() {
  const sprite = getSelectedSprite();
  state.ui.scriptList.innerHTML = "";

  if (!sprite || sprite.script.length === 0) {
    state.ui.scriptEmptyHint.hidden = false;
    return;
  }

  state.ui.scriptEmptyHint.hidden = true;

  for (const block of sprite.script) {
    const def = BLOCK_LIBRARY[block.type];
    if (!def) {
      continue;
    }

    const item = document.createElement("li");
    item.className = "script-block";
    item.dataset.blockId = block.id;
    item.dataset.blockType = block.type;
    item.style.setProperty("--block-color", def.color);

    const iconWrap = document.createElement("span");
    iconWrap.className = "block-icon";
    iconWrap.appendChild(buildIconImage(def.icon, def.label));

    const label = document.createElement("span");
    label.className = "block-label";
    label.textContent = def.label;

    item.append(iconWrap, label);

    if (def.argDefs.length > 0) {
      const argInput = buildArgInput(block, def.argDefs[0]);
      item.appendChild(argInput);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "block-label";
      spacer.textContent = "";
      item.appendChild(spacer);
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "block-remove";
    removeButton.textContent = "x";
    removeButton.title = "Rimuovi blocco";
    removeButton.addEventListener("click", () => {
      removeBlock(block.id);
    });
    item.appendChild(removeButton);

    state.ui.scriptList.appendChild(item);
  }
}

function buildArgInput(block, argDef) {
  const input = document.createElement("input");
  input.className = "block-arg";
  input.dataset.argKey = argDef.key;

  if (argDef.kind === "number") {
    input.type = "number";
    input.min = String(argDef.min);
    input.max = String(argDef.max);
    input.step = String(argDef.step);
    input.value = String(readNumberArg(block, argDef));
  } else {
    input.type = "text";
    input.maxLength = argDef.maxLength;
    input.value = readTextArg(block, argDef);
  }

  input.addEventListener("input", () => {
    if (argDef.kind === "number") {
      const parsed = parseFloat(input.value);
      if (Number.isFinite(parsed)) {
        block.args[argDef.key] = clamp(parsed, argDef.min, argDef.max);
      }
    } else {
      block.args[argDef.key] = input.value.slice(0, argDef.maxLength);
    }
    touchProject();
  });

  return input;
}

function buildIconImage(path, alt) {
  const image = document.createElement("img");
  image.src = resolveAssetUrl(path);
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener(
    "error",
    () => {
      image.src = FALLBACK_ICON;
    },
    { once: true }
  );
  return image;
}

function appendBlockToCurrentScript(type) {
  const sprite = getSelectedSprite();
  if (!sprite || !BLOCK_LIBRARY[type]) {
    return;
  }
  sprite.script.push(makeBlock(type));
  touchProject();
  renderScriptList();
}

function removeBlock(blockId) {
  const sprite = getSelectedSprite();
  if (!sprite) {
    return;
  }
  sprite.script = sprite.script.filter((item) => item.id !== blockId);
  touchProject();
  renderScriptList();
}

function selectSprite(spriteId) {
  if (!state.project.sprites.some((sprite) => sprite.id === spriteId)) {
    return;
  }
  state.selectedSpriteId = spriteId;
  renderSpriteStrip();
  renderStage();
  renderScriptList();
}

function addSprite() {
  const index = state.project.sprites.length + 1;
  const sprite = createSprite(`Sprite ${index}`, randomBetween(80, 400), randomBetween(80, 280));
  sprite.script = [makeBlock("onTap"), makeBlock("say")];
  state.project.sprites.push(sprite);
  selectSprite(sprite.id);
  touchProject();
  renderSpriteStrip();
  renderStage();
  renderScriptList();
}

function resetSelectedSprite() {
  const sprite = getSelectedSprite();
  if (!sprite) {
    return;
  }
  sprite.x = 160;
  sprite.y = 190;
  sprite.rotation = 0;
  sprite.scale = 1;
  sprite.visible = true;
  hideSpeechBubble();
  touchProject();
  renderStage();
}

function runFromGreenFlag() {
  if (state.project.sprites.length === 0) {
    return;
  }

  const session = beginRuntime();
  const tasks = state.project.sprites.map((sprite) => runSpriteTrigger(sprite, "start", session));
  Promise.allSettled(tasks).then(() => {
    if (isLiveSession(session)) {
      finishRuntime();
    }
  });
}

function runFromTap(spriteId) {
  const sprite = state.project.sprites.find((entry) => entry.id === spriteId);
  if (!sprite) {
    return;
  }

  const session = beginRuntime();
  runSpriteTrigger(sprite, "onTap", session).finally(() => {
    if (isLiveSession(session)) {
      finishRuntime();
    }
  });
}

function beginRuntime() {
  stopRuntime();
  state.runtime.session += 1;
  state.runtime.active = true;
  setRunControls(true);
  return state.runtime.session;
}

function finishRuntime() {
  state.runtime.active = false;
  hideSpeechBubble();
  setRunControls(false);
}

function stopRuntime() {
  state.runtime.session += 1;
  for (const timer of state.runtime.timers) {
    window.clearTimeout(timer);
  }
  state.runtime.timers.clear();
  state.runtime.active = false;
  hideSpeechBubble();
  setRunControls(false);
}

function setRunControls(isRunning) {
  state.ui.runBtn.disabled = isRunning;
  state.ui.stopBtn.disabled = !isRunning;
}

function isLiveSession(session) {
  return session === state.runtime.session;
}

async function runSpriteTrigger(sprite, triggerType, session) {
  const startIndices = [];
  for (let i = 0; i < sprite.script.length; i += 1) {
    if (sprite.script[i].type === triggerType) {
      startIndices.push(i + 1);
    }
  }

  const branches = startIndices.map((index) => runBlockSequence(sprite, index, session));
  await Promise.allSettled(branches);
}

async function runBlockSequence(sprite, startIndex, session) {
  for (let i = startIndex; i < sprite.script.length; i += 1) {
    if (!isLiveSession(session)) {
      return;
    }

    const block = sprite.script[i];
    if (!block || TRIGGER_BLOCKS.has(block.type)) {
      return;
    }

    const shouldContinue = await executeBlock(sprite, block, session);
    if (!shouldContinue) {
      return;
    }
  }
}

async function executeBlock(sprite, block, session) {
  switch (block.type) {
    case "moveRight": {
      const steps = clamp(readNumeric(block.args.steps, 1), 1, 10);
      moveSprite(sprite, steps * 24, 0);
      renderStage();
      await waitFor(220 + steps * 25, session);
      return true;
    }
    case "moveLeft": {
      const steps = clamp(readNumeric(block.args.steps, 1), 1, 10);
      moveSprite(sprite, -steps * 24, 0);
      renderStage();
      await waitFor(220 + steps * 25, session);
      return true;
    }
    case "moveUp": {
      const steps = clamp(readNumeric(block.args.steps, 1), 1, 10);
      moveSprite(sprite, 0, -steps * 24);
      renderStage();
      await waitFor(220 + steps * 25, session);
      return true;
    }
    case "moveDown": {
      const steps = clamp(readNumeric(block.args.steps, 1), 1, 10);
      moveSprite(sprite, 0, steps * 24);
      renderStage();
      await waitFor(220 + steps * 25, session);
      return true;
    }
    case "turnRight": {
      const turns = clamp(readNumeric(block.args.turns, 1), 1, 12);
      sprite.rotation += turns * 30;
      renderStage();
      await waitFor(190 + turns * 20, session);
      return true;
    }
    case "turnLeft": {
      const turns = clamp(readNumeric(block.args.turns, 1), 1, 12);
      sprite.rotation -= turns * 30;
      renderStage();
      await waitFor(190 + turns * 20, session);
      return true;
    }
    case "grow": {
      const amount = clamp(readNumeric(block.args.amount, 1), 1, 5);
      sprite.scale = clamp(sprite.scale + amount * 0.15, 0.45, 2.8);
      renderStage();
      await waitFor(190, session);
      return true;
    }
    case "shrink": {
      const amount = clamp(readNumeric(block.args.amount, 1), 1, 5);
      sprite.scale = clamp(sprite.scale - amount * 0.15, 0.45, 2.8);
      renderStage();
      await waitFor(190, session);
      return true;
    }
    case "show": {
      sprite.visible = true;
      renderStage();
      await waitFor(160, session);
      return true;
    }
    case "hide": {
      sprite.visible = false;
      renderStage();
      await waitFor(160, session);
      return true;
    }
    case "say": {
      const text = String(block.args.text || "Ciao!").trim().slice(0, 60) || "Ciao!";
      showSpeechBubble(sprite, text);
      await waitFor(1300, session);
      if (isLiveSession(session)) {
        hideSpeechBubble();
      }
      return true;
    }
    case "wait": {
      const seconds = clamp(readNumeric(block.args.seconds, 1), 0, 10);
      await waitFor(seconds * 1000, session);
      return true;
    }
    case "popSound": {
      playPop();
      await waitFor(180, session);
      return true;
    }
    case "stop": {
      return false;
    }
    default:
      return true;
  }
}

function moveSprite(sprite, deltaX, deltaY) {
  const margin = 24;
  sprite.x = clamp(sprite.x + deltaX, margin, STAGE_WIDTH - margin);
  sprite.y = clamp(sprite.y + deltaY, margin, STAGE_HEIGHT - margin);
}

function waitFor(durationMs, session) {
  return new Promise((resolve) => {
    if (!isLiveSession(session)) {
      resolve();
      return;
    }

    const timer = window.setTimeout(() => {
      state.runtime.timers.delete(timer);
      resolve();
    }, Math.max(0, Math.floor(durationMs)));

    state.runtime.timers.add(timer);
  });
}

function showSpeechBubble(sprite, text) {
  const bubble = state.ui.speechBubble;
  const left = clamp((sprite.x / STAGE_WIDTH) * 100 + 5, 6, 80);
  const top = clamp((sprite.y / STAGE_HEIGHT) * 100 - 16, 4, 82);
  bubble.textContent = text;
  bubble.style.left = `${left}%`;
  bubble.style.top = `${top}%`;
  bubble.hidden = false;
}

function hideSpeechBubble() {
  state.ui.speechBubble.hidden = true;
}

function playPop() {
  const audio = new Audio(resolveAssetUrl("pop.mp3"));
  audio.volume = 0.6;
  audio.play().catch(() => {
    // Playback can fail without user gesture in some browsers.
  });
}

async function syncOriginalAssets(options = {}) {
  if (state.sync.inFlight) {
    return;
  }

  state.sync.inFlight = true;
  const scope = options.manual ? "full" : "core";
  updateSyncState(`Scarico grafica locale (${scope})...`);

  try {
    const params = new URLSearchParams({
      scope,
      branch: state.project.assetSource.branch || DEFAULT_BRANCH,
      t: Date.now().toString(),
    });
    const response = await fetch(`${SYNC_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || payload.ok !== true) {
      throw new Error(payload && payload.error ? payload.error : "payload non valido");
    }

    state.project.assetSource.provider = "GitHub -> locale";
    state.project.assetSource.endpoint = SYNC_ENDPOINT;
    state.project.assetSource.branch = payload.branch || state.project.assetSource.branch || DEFAULT_BRANCH;
    state.project.assetSource.scope = payload.scope || scope;
    state.project.assetSource.lastSyncAt = payload.timestamp || new Date().toISOString();
    state.project.assetSource.downloaded = Math.max(0, Math.floor(readNumeric(payload.downloaded, 0)));
    state.project.assetSource.skipped = Math.max(0, Math.floor(readNumeric(payload.skipped, 0)));
    state.project.assetSource.failed = Math.max(0, Math.floor(readNumeric(payload.failed, 0)));
    touchProject();

    renderPalette();
    renderScriptList();
    renderStage();

    const when = new Date(state.project.assetSource.lastSyncAt).toLocaleTimeString();
    updateSyncState(
      `Grafica locale OK (+${state.project.assetSource.downloaded}, gia presenti ${state.project.assetSource.skipped}, errori ${state.project.assetSource.failed}) - ${state.project.assetSource.scope} - ${when}`
    );
  } catch (error) {
    if (location.protocol !== "http:" && location.protocol !== "https:") {
      updateSyncState("Sync locale fallita: avvia con php -S localhost:8000");
    } else {
      updateSyncState("Sync locale fallita: verifica connessione e permessi di scrittura");
    }
  } finally {
    state.sync.inFlight = false;
  }
}

function resolveAssetUrl(relativePath) {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  return `./${encodeURI(normalized)}`;
}

function updateSyncState(message) {
  state.sync.message = message;
  state.ui.syncState.textContent = message;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  if (location.protocol !== "http:" && location.protocol !== "https:") {
    updateSyncState("Service worker non attivo su file://");
    return;
  }

  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    updateSyncState("Service worker non disponibile");
  }
}

function isLocalDevHost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "::1";
}

async function cleanupScratchCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const scriptUrl = registration.active && registration.active.scriptURL ? registration.active.scriptURL : "";
        if (scriptUrl.endsWith("/sw.js")) {
          await registration.unregister();
        }
      }
    }

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.filter((name) => name.startsWith("scratchjr-")).map((name) => caches.delete(name))
      );
    }
  } catch (error) {
    // Ignore cache cleanup errors; app can still run without offline cache.
  }
}

function exportProjectJson() {
  const output = JSON.stringify(state.project, null, 2);
  const blob = new Blob([output], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(state.project.name)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importProjectJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state.project = normalizeProject(parsed);
    state.selectedSpriteId = state.project.sprites[0].id;
    state.ui.projectNameInput.value = state.project.name;
    syncStageBackgroundControls();
    persistProject();

    renderCategoryTabs();
    renderPalette();
    renderSpriteStrip();
    renderStage();
    renderScriptList();
    updateSyncState("JSON caricato.");
  } catch (error) {
    updateSyncState("JSON non valido.");
  } finally {
    event.target.value = "";
  }
}

function loadProject() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultProject();
    }
    return normalizeProject(JSON.parse(raw));
  } catch (error) {
    return createDefaultProject();
  }
}

function persistProject() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
}

function touchProject() {
  state.project.updatedAt = new Date().toISOString();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    persistProject();
  }, 180);
}

function createDefaultProject() {
  return {
    version: "1.0",
    name: "Nuovo progetto",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stage: {
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      background: { ...DEFAULT_STAGE_BACKGROUND },
    },
    assetSource: {
      provider: "GitHub -> locale",
      endpoint: SYNC_ENDPOINT,
      branch: DEFAULT_BRANCH,
      scope: "core",
      lastSyncAt: null,
      downloaded: 0,
      skipped: 0,
      failed: 0,
    },
    sprites: [createSprite("Gatto", 160, 190)],
  };
}

function normalizeProject(raw) {
  const fallback = createDefaultProject();
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const sprites = Array.isArray(raw.sprites)
    ? raw.sprites.map((item, index) => normalizeSprite(item, index)).filter(Boolean)
    : [];

  return {
    version: typeof raw.version === "string" ? raw.version : fallback.version,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : fallback.name,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : fallback.createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : fallback.updatedAt,
    stage: {
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      background: normalizeStageBackground(raw.stage && raw.stage.background, fallback.stage.background),
    },
    assetSource: normalizeAssetSource(raw.assetSource, fallback.assetSource),
    sprites: sprites.length > 0 ? sprites : fallback.sprites,
  };
}

function normalizeStageBackground(raw, fallback) {
  const fallbackPreset = getStageBackgroundPreset(fallback && fallback.preset).id;
  const fallbackColor = normalizeHexColor(fallback && fallback.color, DEFAULT_STAGE_BACKGROUND.color);

  if (typeof raw === "string") {
    return {
      preset: "custom",
      color: normalizeHexColor(raw, fallbackColor),
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      preset: fallbackPreset,
      color: fallbackColor,
    };
  }

  return {
    preset: getStageBackgroundPreset(raw.preset).id,
    color: normalizeHexColor(raw.color, fallbackColor),
  };
}

function normalizeAssetSource(raw, fallback) {
  if (!raw || typeof raw !== "object") {
    return { ...fallback };
  }
  const candidateBranch = typeof raw.branch === "string" && raw.branch.trim() ? raw.branch.trim() : fallback.branch;
  const candidateScope = typeof raw.scope === "string" && raw.scope.trim() ? raw.scope.trim() : fallback.scope;
  return {
    provider: "GitHub -> locale",
    endpoint: SYNC_ENDPOINT,
    branch: candidateBranch,
    scope: candidateScope,
    lastSyncAt: typeof raw.lastSyncAt === "string" ? raw.lastSyncAt : fallback.lastSyncAt,
    downloaded: Math.max(0, Math.floor(readNumeric(raw.downloaded, fallback.downloaded))),
    skipped: Math.max(0, Math.floor(readNumeric(raw.skipped, fallback.skipped))),
    failed: Math.max(0, Math.floor(readNumeric(raw.failed, fallback.failed))),
  };
}

function normalizeSprite(raw, index) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const script = Array.isArray(raw.script) ? raw.script.map(normalizeBlock).filter(Boolean) : [];

  const normalizedCostumePath = normalizeCostumePath(raw.costumePath);

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : uid("sprite"),
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : `Sprite ${index + 1}`,
    x: clamp(readNumeric(raw.x, 160), 24, STAGE_WIDTH - 24),
    y: clamp(readNumeric(raw.y, 190), 24, STAGE_HEIGHT - 24),
    rotation: readNumeric(raw.rotation, 0),
    scale: clamp(readNumeric(raw.scale, 1), 0.45, 2.8),
    visible: raw.visible !== false,
    costumePath: normalizedCostumePath,
    script,
  };
}

function normalizeBlock(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.type !== "string" || !BLOCK_LIBRARY[raw.type]) {
    return null;
  }
  const def = BLOCK_LIBRARY[raw.type];
  const block = {
    id: typeof raw.id === "string" && raw.id ? raw.id : uid("block"),
    type: raw.type,
    args: {},
  };

  for (const argDef of def.argDefs) {
    if (argDef.kind === "number") {
      const value = raw.args && raw.args[argDef.key];
      block.args[argDef.key] = clamp(readNumeric(value, argDef.defaultValue), argDef.min, argDef.max);
    } else {
      const source = raw.args && typeof raw.args[argDef.key] === "string" ? raw.args[argDef.key] : argDef.defaultValue;
      block.args[argDef.key] = source.slice(0, argDef.maxLength);
    }
  }

  return block;
}

function createSprite(name, x, y) {
  return {
    id: uid("sprite"),
    name,
    x,
    y,
    rotation: 0,
    scale: 1,
    visible: true,
    costumePath: DEFAULT_SPRITE_COSTUME_PATH,
    script: [makeBlock("start"), makeBlock("moveRight"), makeBlock("moveLeft")],
  };
}

function normalizeCostumePath(input) {
  const candidate = typeof input === "string" ? input.trim() : "";
  if (!candidate) {
    return DEFAULT_SPRITE_COSTUME_PATH;
  }
  if (candidate === "assets/start/Cat.svg") {
    return DEFAULT_SPRITE_COSTUME_PATH;
  }
  return candidate;
}

function makeBlock(type) {
  const def = BLOCK_LIBRARY[type];
  const args = {};
  for (const argDef of def.argDefs) {
    args[argDef.key] = argDef.defaultValue;
  }
  return {
    id: uid("block"),
    type,
    args,
  };
}

function getSelectedSprite() {
  const sprite = state.project.sprites.find((entry) => entry.id === state.selectedSpriteId);
  if (sprite) {
    return sprite;
  }
  if (state.project.sprites.length > 0) {
    state.selectedSpriteId = state.project.sprites[0].id;
    return state.project.sprites[0];
  }
  return null;
}

function readNumberArg(block, argDef) {
  const source = block.args[argDef.key];
  return clamp(readNumeric(source, argDef.defaultValue), argDef.min, argDef.max);
}

function readTextArg(block, argDef) {
  const source = block.args[argDef.key];
  if (typeof source !== "string") {
    return argDef.defaultValue;
  }
  return source.slice(0, argDef.maxLength);
}

function normalizeHexColor(input, fallback) {
  const fallbackValue = /^#[0-9a-f]{6}$/i.test(String(fallback || "")) ? String(fallback).toLowerCase() : "#e8f4ff";
  const source = String(input || "").trim();
  const compact = source.startsWith("#") ? source.slice(1) : source;
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(compact)) {
    return fallbackValue;
  }
  const normalized =
    compact.length === 3
      ? compact
          .split("")
          .map((chunk) => `${chunk}${chunk}`)
          .join("")
      : compact;
  return `#${normalized.toLowerCase()}`;
}

function uid(prefix) {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${uidCounter.toString(36)}`;
}

function readNumeric(value, fallback) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function slugify(input) {
  const slug = String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "scratchjr-project";
}

function byId(id) {
  return document.getElementById(id);
}
