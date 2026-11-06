"use strict";

// Farbwirbel – fester, deterministischer Spieltest. Keine Netzwerkaufrufe.
// Die gespeicherten Einstellungen enthalten ausschließlich Spielstand und Tonwahl.
const PALETTE = {
  c: { base: '#f2b85f', name: 'gold' },
  r: { base: '#ee8a79', name: 'koralle' },
  g: { base: '#71c6a2', name: 'grün' },
  b: { base: '#87acef', name: 'blau' },
  p: { base: '#c5a0e4', name: 'lila' },
};
const SHAPES = ['circle', 'triangle', 'diamond', 'square'];
const LEVEL_DEFINITIONS = [
  { title:'Erster Wirbel', target:['cccc','rrrr','cccc'], scramble:[[[0,0],[1,0]]], kind:'sequence', sequence:['c','c','c','c'], start:0,
    text:'Ein Tausch genügt. Bringe die farbigen Felder in die Reihenfolge, die das Ziel oben zeigt.' },
  { title:'Drei Farben', target:['cccc','bbbb','rrrr','gggg'], scramble:[[[0,0],[1,0]],[[1,0],[2,0]]], kind:'sequence', sequence:['c','c','c','c'], start:0,
    text:'Jede Zeile zeigt eine Farbe. Welche zwei Kacheln müssen ihren Platz wechseln?' },
  { title:'Grüne Mitte', target:['cccc','gggg','bbbb','rrrr'], scramble:[[[0,0],[1,0]],[[2,0],[3,0]]], kind:'sequence', sequence:['g','g','g','g'], start:0,
    text:'Vier Farben, vier Reihen. Suche Dir zuerst eine Reihe, die schon fast stimmt.' },
  { title:'Korallenkette', target:['ccccc','rrrrr','ccccc','bbbbb','ggggg'], scramble:[[[0,0],[1,0]],[[1,0],[2,0]],[[2,0],[3,0]],[[3,0],[4,0]]], kind:'sequence', sequence:['r','r','r','r','r'], start:0,
    text:'Fünf Reihen warten auf Dich. Finde die beiden korallenroten Kacheln, die nach oben gehören.' },
  { title:'Formenwechsel', target:['012012','120120','201201','012012','120120'], scramble:[[[0,1],[0,2]],[[1,2],[1,3]],[[2,0],[2,1]],[[3,4],[3,5]]], kind:'sequence', sequence:['0','1','2','0','1','2'], start:0,
    text:'Jetzt zählen Formen, nicht Farben. Nicht jede Farbe gehört zu einer bestimmten Form. Folge genau dem Ziel oben.' },
  { title:'Kreis sucht Raute', target:['301230','012301','123012','230123','301230','012301'], scramble:[[[0,0],[0,1]],[[1,2],[1,3]],[[2,4],[2,5]],[[3,1],[3,2]],[[4,3],[4,4]]], kind:'sequence', sequence:['3','0','1','2','3','0'], start:0,
    text:'Vier Formen, sechs Kacheln. Der Zielstreifen zeigt jede Position der obersten Reihe.' },
  { title:'Bunte Folge', target:['cgbrcg','gbrcgb','brcgbr','rcgbrc','cgbrcg','gbrcgb'], scramble:[[[0,0],[0,1]],[[1,2],[1,3]],[[2,4],[2,5]],[[3,1],[3,2]],[[4,3],[4,4]],[[5,2],[5,3]]], kind:'sequence', sequence:['c','g','b','r','c','g'], start:0,
    text:'Die farbige Folge oben zeigt den Weg. Verschiebe Kacheln, bis alle sechs Reihen zum Muster passen.' },
  { title:'Farbspiegel', target:['cgrcbr','grcbrc','rcbrcg','cbrcgr','brcgrc'], scramble:[[[0,0],[0,1]],[[1,2],[1,3]],[[2,4],[2,5]],[[3,1],[3,2]],[[4,3],[4,4]],[[1,3],[2,3]],[[0,1],[0,2]]], kind:'sequence', sequence:['c','g','r','c','b','r'], start:0,
    text:'Die Farbfolge wechselt von Reihe zu Reihe. Vergleiche jeweils die erste Kachel mit der zweiten.' },
  { title:'Viererwirbel', target:['012301','301230','230123','123012','012301','301230'], scramble:[[[0,0],[1,0]],[[1,0],[2,0]],[[2,0],[3,0]],[[3,0],[4,0]],[[4,0],[5,0]],[[0,0],[0,1]],[[1,0],[1,1]]], kind:'sequence', sequence:['0','1','2','3','0','1'], start:0,
    text:'In der ersten Spalte stimmen die Formen, die Kacheln sind aber farbig vertauscht. Finde den Weg.' },
  { title:'Meister des Musters', target:['cgbrcg','gbrcgb','brcgbr','rcgbrc','cgbrcg','gbrcgb'], scramble:[[[0,0],[0,1]],[[1,2],[1,3]],[[2,4],[2,5]],[[3,1],[3,2]],[[4,3],[4,4]],[[5,2],[5,3]],[[0,1],[0,2]],[[4,4],[5,4]]], kind:'sequence', sequence:['c','g','b','r','c','g'], start:0,
    text:'Der letzte Wirbel hat kein Zeitlimit. Prüfe Reihe für Reihe und benutze bei Bedarf den Hinweis.' },
];
function swapOnGrid(grid, a, b) {
  const next = grid.map(row => [...row]);
  const [ar,ac] = a, [br,bc] = b;
  [next[ar][ac],next[br][bc]] = [next[br][bc],next[ar][ac]];
  return next;
}
function rowMatches(row,target) {
  if (target.length !== row.length) return false;
  const targetValues=[...new Set(target.split(''))];
  if (targetValues.length === 1) {
    return [...row].every(value => value === targetValues[0]);
  }
  return row === target;
}
function isSolved(rows, spec) {
  return rows.every((row, index) => rowMatches(row, spec.target[index]));
}
const LEVELS = LEVEL_DEFINITIONS.map(definition => {
  let grid = definition.target.map(row => row.split(''));
  for (const move of definition.scramble) grid = swapOnGrid(grid, move[0], move[1]);
  return {par:definition.scramble.length, ...definition, rows:grid.map(row => row.join('')), solution:[...definition.scramble].reverse(), hint:[[...definition.scramble.at(-1)[0]],[...definition.scramble.at(-1)[1]]]};
});

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'farbwirbel.test.v1';
let save = loadSave();
let levelIndex = Math.min(save.unlocked ?? 0, LEVELS.length - 1);
let grid = [];
let moves = 0;
let history = [];
let selected = null;
let hinted = false;
let busy = false;
let sheetType = '';
let sound = new AudioEngine();

function loadSave() {
  const base = { unlocked: 0, completed: {}, sound: true, welcomed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return base;
    return {
      unlocked: Math.max(0, Math.min(9, Number.isInteger(data.unlocked) ? data.unlocked : 0)),
      completed: data.completed || {},
      sound: data.sound !== false,
      welcomed: !!data.welcomed,
    };
  } catch (_) { return base; }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); return true; } catch (_) { return false; }
}
function initLevel(index, showDialog = false) {
  if (index < 0 || index > save.unlocked || index >= LEVELS.length) return;
  document.querySelector('#overlay').hidden=true;
  sheetType='';
  levelIndex = index;
  const spec = LEVELS[levelIndex];
  grid = spec.rows.map(row => row.split(''));
  moves = 0;
  history = [];
  selected = null;
  hinted = false;
  busy = false;
  render();
  if (showDialog) showLevelIntro();
}
function render() {
  const spec = LEVELS[levelIndex];
  $('levelKicker').textContent = `Level ${levelIndex + 1} von 10`;
  $('levelTitle').textContent = spec.title;
  $('moves').textContent = String(moves);
  $('moveLabel').textContent = moves === 1 ? 'Zug' : 'Züge';
  $('undoBtn').disabled = !history.length || busy;
  $('hintText').textContent = hinted ? spec.hint[0].map(([r,c]) => `Reihe ${r + 1}, Kachel ${c + 1}`).join(' → ') : spec.text;
  renderBoard();
  renderGoals();
  renderDots();
  renderSound();
}
function renderBoard() {
  const spec = LEVELS[levelIndex];
  const board = $('board');
  board.replaceChildren();
  grid.forEach((row, r) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'gridrow';
    rowEl.style.gridTemplateColumns = `repeat(${row.length},1fr)`;
    row.forEach((value, c) => {
      const tile = tileButton(value, r, c);
      rowEl.append(tile);
    });
    board.append(rowEl);
  });
  updateSelectionClasses();
  updateProgress();
}
function tileButton(value, r, c, preview = false) {
  const el = document.createElement(preview ? 'span' : 'button');
  el.className = 'tile';
  const isForms = /^\d$/.test(value);
  const color = isForms ? ['#e1b76c','#ed958d','#86cbb0','#96b6e9'][Number(value)] : PALETTE[value].base;
  el.style.background = color;
  el.dataset.r = String(r); el.dataset.c = String(c); el.dataset.value = value;
  el.setAttribute('aria-label', isForms ? `Form ${SHAPES[Number(value)]}, Reihe ${r + 1}, Kachel ${c + 1}` : `Feld ${PALETTE[value].name}, Reihe ${r + 1}, Kachel ${c + 1}`);
  el.setAttribute('aria-pressed', selected && selected[0] === r && selected[1] === c ? 'true' : 'false');
  if (isForms) el.append(shapeSvg(Number(value)));
  else {
    const dot = document.createElement('span');
    dot.className = 'shape-circle';
    dot.style.cssText = 'width:74%;height:74%;display:block;background:#ffffff28;box-shadow:inset 0 0 0 3px #ffffff20;border-radius:50%';
    el.append(dot);
  }
  if (!preview) el.addEventListener('click', () => choose(r,c));
  if (preview) el.classList.add('peek');
  return el;
}
function shapeSvg(shape) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox','0 0 100 100');
  svg.setAttribute('aria-hidden','true');
  const el = document.createElementNS(ns, 'path');
  const stroke = '#fff9ed';
  el.setAttribute('fill', '#ffffff15');
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width','9');
  el.setAttribute('stroke-linejoin','round');
  if (shape === 0) {
    const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx','50'); circle.setAttribute('cy','50'); circle.setAttribute('r','33'); circle.setAttribute('fill','#ffffff16'); circle.setAttribute('stroke',stroke); circle.setAttribute('stroke-width','9'); svg.append(circle); return svg;
  }
  if (shape === 1) el.setAttribute('d','M50 15 L89 84 L11 84 Z');
  if (shape === 2) el.setAttribute('d','M50 12 L88 50 L50 88 L12 50 Z');
  if (shape === 3) { el.setAttribute('d','M21 21 H79 V79 H21 Z'); el.setAttribute('rx','7'); }
  svg.append(el);
  return svg;
}
function renderGoals() {
  const spec = LEVELS[levelIndex];
  $('goalTitle').textContent = 'So sollen die Reihen aussehen';
  $('rowsDone').textContent = `${goalMatchCount()} von ${spec.target.length}`;
  const targets = $('goals');
  targets.classList.add('no-scroll');
  targets.replaceChildren();
  spec.target.forEach((row,r) => {
    const goal = document.createElement('div');
    goal.className = 'goalrow';
    goal.style.setProperty('--goal-count', row.length);
    const labels = spec.kind === 'sequence' ? [r+1] : [];
    if (labels.length) {
      const label=document.createElement('span');
      label.className='goal-label';label.textContent=String(r+1);
      goal.append(label);
    } else {
      const spacer=document.createElement('span');goal.append(spacer);
    }
    [...row].forEach((value,c) => goal.append(tileButton(value,-1,c,true)));
    targets.append(goal);
  });
}
function goalMatchCount() {
  const spec=LEVELS[levelIndex];
  return grid.reduce((count,row,r) => count + (rowMatches(row.join(''),spec.target[r]) ? 1 : 0),0);
}
function renderDots() {
  const holder = $('levelDots'); holder.replaceChildren();
  LEVELS.forEach((_, i) => {
    const button = document.createElement('button'); button.className = 'dotbutton';
    button.setAttribute('aria-label', i > save.unlocked ? `Level ${i+1} gesperrt` : `Zu Level ${i+1}`);
    if (i <= save.unlocked) button.addEventListener('click', () => initLevel(i,i!==levelIndex));
    else button.disabled = true;
    const dot = document.createElement('span'); dot.className = `dot${save.completed[i] ? ' finished' : ''}${i===levelIndex ? ' current' : ''}${i>save.unlocked ? ' locked':''}`;
    button.append(dot); holder.append(button);
  });
}
function updateProgress() {
  const good = goalMatchCount();
  const spec = LEVELS[levelIndex];
  $('rowsDone').textContent = `${good} von ${spec.rows.length}`;
  const label = $('matchLabel');
  if (selected) {
    label.textContent = 'Jetzt eine Nachbarkachel auswählen – oben, unten, links oder rechts.';
    label.className = 'matchlabel';
  } else if (good === spec.rows.length) {
    label.textContent = 'Alle Muster treffen!';
    label.className = 'matchlabel good';
  } else {
    const noun = good === 1 ? 'Zeile stimmt' : 'Zeilen stimmen';
    label.textContent = `${good} ${noun} schon mit dem Ziel überein.`;
    label.className = 'matchlabel';
  }
}
function updateSelectionClasses() {
  document.querySelectorAll('#board .tile').forEach(tile => {
    const r=+tile.dataset.r,c=+tile.dataset.c;
    const isSelected=!!selected&&selected[0]===r&&selected[1]===c;
    tile.classList.toggle('selected',isSelected);
    const matchesHint=hinted&&!selected&&LEVELS[levelIndex].hint.some(([rr,cc])=>rr===r&&cc===c);
    tile.classList.toggle('hint',matchesHint);
    tile.setAttribute('aria-pressed',String(isSelected));
    tile.style.pointerEvents='';
  });
}
function choose(r,c) {
  if (busy) return;
  if (!selected) { selected = [r,c]; sound.play('select'); updateSelectionClasses(); updateProgress(); return; }
  if (selected[0]===r && selected[1]===c) { selected=null; updateSelectionClasses(); updateProgress(); return; }
  const [sr,sc] = selected;
  if (Math.abs(sr-r) + Math.abs(sc-c) !== 1) {
    selected = [r,c]; sound.play('select'); updateSelectionClasses(); updateProgress(); return;
  }
  makeSwap([sr,sc],[r,c]);
}
function makeSwap(a,b) {
  if (busy) return;
  busy = true;
  history.push({grid:grid.map(row=>[...row]),moves});
  const [ar,ac] = a, [br,bc] = b;
  [grid[ar][ac],grid[br][bc]] = [grid[br][bc],grid[ar][ac]];
  moves++; selected = null; hinted = false;
  boardEventsGuard();
  sound.play('swap');
  render();
  setTimeout(() => {
    if (isSolved(grid.map(row=>row.join('')),LEVELS[levelIndex])) completeLevel();
    else { busy=false; $('undoBtn').disabled=!history.length; if (moves === LEVELS[levelIndex].par + 2) $('hintText').textContent='Du brauchst einen Tipp? Der Hinweis zeigt Dir eine hilfreiche Kachel.'; }
  },250);
}
function boardEventsGuard() {
  if (isSolved(grid.map(row=>row.join('')),LEVELS[levelIndex])) {
    document.querySelectorAll('#board .tile').forEach(el => { el.style.pointerEvents='none'; });
  }
}
function undo() {
  if (!history.length || busy) return;
  const prev = history.pop(); grid=prev.grid; moves=prev.moves; selected=null; hinted=false; sound.play('undo'); render();
}
function hint() {
  if (busy) return;
  hinted = true; selected = null; updateSelectionClasses();
  const [[r,c],[r2,c2]] = LEVELS[levelIndex].hint;
  $('hintText').textContent=`Hinweis: Tausche Reihe ${r+1}, Kachel ${c+1} mit dem Nachbarn bei Reihe ${r2+1}, Kachel ${c2+1}.`;
  sound.play('hint');
}
function completeLevel() {
  busy = true;
  const oldBest = save.completed[levelIndex]?.best;
  save.completed[levelIndex] = {best: oldBest === undefined ? moves : Math.min(oldBest,moves)};
  save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length - 1, levelIndex + 1));
  persist(); sound.play('win'); renderDots();
  const celebration = $('celebrate'); celebration.replaceChildren(); celebration.hidden=false;
  for(let i=0;i<12;i++){const el=document.createElement('span');el.className='confetti';el.style.background=Object.values(PALETTE)[i%5].base;celebration.append(el);}
  setTimeout(()=>{celebration.hidden=true;openSheet(levelIndex===9?'finished':'win');},650);
}
function openSheet(type) {
  sheetType=type; const root=$('overlay'); const sheet=root.querySelector('.sheet'); sheet.replaceChildren();
  const specs = {
    intro: {title:'Finde Deinen Wirbel.', body:'Zehn kleine Muster. Zehn kleine Aha-Momente. Ohne Zeitdruck und ohne Punktejagd.', button:'Los spielen'},
    win: {title:'Muster getroffen!', body:`Level ${levelIndex+1} gelöst – mit ${moves} ${moves===1?'Zug':'Zügen'}. 'Gelöste Muster können später noch einmal mit wenigen Zügen versucht werden.'`, button:'Nächstes Level'},
    finished: {title:'Alle zehn Wirbel gelöst!', body:`Stark – das letzte Muster sitzt. Du hast mit ${moves} Zügen abgeschlossen. Spiele Deine Lieblingslevel noch einmal oder verbessere Deine Züge.`, button:'Noch einmal entdecken'},
    help: {title:'So wird gespielt', body:'Kein Zeitlimit. Keine falschen Antworten. Nur ein Muster, das auf Dich wartet.', button:'Verstanden'},
    levels: {title:'Alle Level', body:'Jedes gelöste Level öffnet das nächste.', button:'Zurück zum Spiel'},
    legal: {title:'Über diese Testversion', body:'', button:'Zurück zum Spiel'},
    levelintro: {title:`Level ${levelIndex+1}`, body:LEVELS[levelIndex].text,button:'Level starten'},
  };
  const spec=specs[type]; sheet.innerHTML='';
  if(type==='win'||type==='finished'){const big=document.createElement('div');big.className='bigicon';big.append(shapeSvg(type==='finished'?2:0));sheet.append(big);}
  const h=document.createElement('h2');h.id='sheetTitle';h.textContent=spec.title;sheet.append(h);
  if(type==='help'){
    const steps=document.createElement('div');steps.className='steps';
    const instructions=['Tippe eine Kachel an.','Tippe danach oben, unten, links oder rechts daneben. Die beiden Felder wechseln den Platz.','Bringe jede Zeile in die oben gezeigte Ordnung. Bei Farben gilt: eine Farbe in jede Reihe.','„Hinweis“ zeigt einen möglichen nächsten Zug. „Rückgängig“ nimmt den letzten Zug zurück.'];
    instructions.forEach((text,i)=>{const step=document.createElement('div');step.className='step';const num=document.createElement('div');num.className='stepnum';num.textContent=i+1;const span=document.createElement('span');span.textContent=text;step.append(num,span);steps.append(step);});sheet.append(steps);
    const p=document.createElement('p');p.textContent=spec.body;sheet.append(p);
  } else if(type==='levels'){
    const list=document.createElement('div');list.className='levelpicker';
    LEVELS.forEach((_,i)=>{const b=document.createElement('button');b.className=`levelpick${i===levelIndex?' current':''}`;b.textContent=`${i+1}${save.completed[i]?' ✓':''}`;b.setAttribute('aria-label',`Level ${i+1}${i>save.unlocked?' gesperrt':''}`);b.disabled=i>save.unlocked;b.addEventListener('click',()=>initLevel(i,i!==levelIndex));list.append(b);});sheet.append(list);
    const p=document.createElement('p');p.textContent=spec.body;sheet.append(p);
  } else if(type==='legal'){
    const p=document.createElement('p');p.className='legal';
    const strong=document.createElement('strong');strong.textContent='Nur Testversion – keine Veröffentlichung als offizielles Produkt.';
    p.append(strong,document.createElement('br'),document.createTextNode('„Farbwirbel“ ist ein Arbeitstitel für einen geschlossenen Spieltest.'));
    const p2=document.createElement('p');p2.className='legal';
    p2.innerHTML='<strong>Impressum (Platzhalter Testversion):</strong> Angaben zum verantwortlichen Anbieter werden erst nach Entscheidung über eine Veröffentlichung ergänzt. Diese Testversion bewirbt oder verkauft keine Leistungen.';
    const p3=document.createElement('p');p3.className='legal';
    p3.innerHTML='<strong>Datenschutz (Platzhalter Testversion):</strong> Diese Anwendung fragt keine persönlichen Daten ab, sendet keine Spiel- oder Nutzungsdaten an Server und verwendet kein Analysetool. Levelstand, Tonwahl und die Information, ob die Begrüßung gesehen wurde, liegen ausschließlich im lokalen Speicher dieses Browsers. Beim Löschen der Website-Daten gehen diese Angaben verloren. Ein externer Hosting-Anbieter kann technisch notwendige Verbindungsdaten wie eine IP-Adresse beim Abruf verarbeiten; vor einer öffentlichen Verteilung sind dessen Angaben, Auftragsverarbeitung und Datenschutzerklärung zu prüfen.';
    const p4=document.createElement('p');p4.className='legal';p4.innerHTML='<strong>Offline & Installation:</strong> Nach vollständigem Laden funktioniert das Spiel auch ohne Internet. Über „Zum Home-Bildschirm“ kannst Du es auf vielen Geräten wie eine App ablegen. Es gibt keine Käufe, keine Konten und keine Chatfunktion.';
    sheet.append(p,p2,p3,p4);
  } else {const p=document.createElement('p');p.textContent=spec.body;sheet.append(p);}
  const button=document.createElement('button');button.className='maincta';button.textContent=spec.button;
  button.addEventListener('click',()=>{
    if(type==='intro'){save.welcomed=true;persist();closeSheet();}
    else if(type==='win'){initLevel(levelIndex+1,true);}
    else if(type==='finished'){initLevel(0);}
    else closeSheet();
  });
  sheet.append(button);
  if(type==='legal'){const reset=document.createElement('button');reset.className='outline';reset.textContent='Teststand auf diesem Gerät löschen';reset.addEventListener('click',()=>{if(confirm('Alle lokal gespeicherten Fortschritte dieser Testversion löschen?')){try{localStorage.removeItem(STORAGE_KEY);}catch(_){} save={unlocked:0,completed:{},sound:sound.enabled,welcomed:true}; closeSheet();initLevel(0);}});sheet.append(reset);}
  if(type==='intro'){const p=document.createElement('p');p.style.fontSize='12px';p.textContent='Kostenlos testen · Keine Werbung · Keine Anmeldung';sheet.append(p);}
  root.hidden=false;
  sheet.focus();
  requestAnimationFrame(() => button.focus({preventScroll:true}));
}
function closeSheet(restoreFocus=true){$('overlay').hidden=true;sheetType='';if(restoreFocus)$('hintBtn').focus();}
function showLevelIntro(){openSheet('levelintro');}
function resetConfirm(){if(moves===0||confirm('Dieses Level neu starten?')) initLevel(levelIndex);}
function toggleSound(){sound.setEnabled(!sound.enabled);save.sound=sound.enabled;persist();renderSound();if(sound.enabled)sound.play('select');}
function renderSound(){$('soundBtn').textContent=sound.enabled?'♪':'∅';$('soundBtn').setAttribute('aria-label',sound.enabled?'Ton ausschalten':'Ton einschalten');$('soundBtn').setAttribute('aria-pressed',String(sound.enabled));}
function AudioEngine(){this.enabled=save.sound!==false;this.ctx=null;this.setEnabled=function(v){this.enabled=v;};this.play=function(type){if(!this.enabled)return;try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;this.ctx=this.ctx||new Context();const ctx=this.ctx;if(ctx.state==='suspended')ctx.resume();const now=ctx.currentTime;const notes=type==='win'?[523.25,659.25,783.99,1046.5]:type==='swap'?[260,340]:type==='hint'?[520,640]:type==='undo'?[330,260]:[420];notes.forEach((freq,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=freq;const start=now+i*.055;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.07,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.15);osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.16);});}catch(_){}};}
$('helpBtn').addEventListener('click',()=>openSheet('help'));
$('legalBtn').addEventListener('click',()=>openSheet('legal'));
$('levelsBtn').addEventListener('click',()=>openSheet('levels'));
$('soundBtn').addEventListener('click',toggleSound);
$('undoBtn').addEventListener('click',undo);
$('hintBtn').addEventListener('click',hint);
$('resetBtn').addEventListener('click',resetConfirm);
$('overlay').addEventListener('keydown',e=>{if(e.key==='Escape'&&sheetType!=='intro')closeSheet();});
document.addEventListener('keydown',e=>{if(e.key==='z'&&(e.ctrlKey||e.metaKey)&&$('overlay').hidden){e.preventDefault();undo();}if(e.key==='Escape'&&$('overlay').hidden){selected=null;updateSelectionClasses();updateProgress();}});
// Initialrender: Nur lokale Ablage, kein Zugriff nach außen.
initLevel(levelIndex);
if(!save.welcomed)openSheet('intro');
