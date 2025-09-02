const STORAGE_KEY = 'MiniNote_v1';
const SAVE_BADGE_MS = 900;
const AUTOSAVE_DEBOUNCE_MS = 500;

const $ta    = () => document.getElementById('note-text');
const $save  = () => document.getElementById('save-state');
const $copy  = () => document.getElementById('copy-btn');
const $clear = () => document.getElementById('clear-btn');
const $down  = () => document.getElementById('download-btn');

let debTimer = null;

function showBadge(msg='Saved'){
    const el = $save();
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(()=>{ el.style.opacity = '0'; }, SAVE_BADGE_MS);
}
function stamp(){
    const d = new Date(), p = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function loadNote(){
    try{
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved !== null) $ta().value = saved;
    }catch(e){ console.warn('Load failed:', e); }
}
function saveNoteNow(){
    try{
        localStorage.setItem(STORAGE_KEY, $ta().value);
        showBadge('Saved');
    }catch(e){ console.warn('Save failed:', e); }
}
function autoSaveNote(){
    if(debTimer) clearTimeout(debTimer);
    debTimer = setTimeout(saveNoteNow, AUTOSAVE_DEBOUNCE_MS);
}
async function copyNote(){
    const text = $ta().value;
    try{
        if(navigator.clipboard?.writeText){
            await navigator.clipboard.writeText(text);
        }else{
            $ta().select(); document.execCommand('copy');
            $ta().setSelectionRange($ta().value.length, $ta().value.length);
        }
        showBadge('Copied!');
    }catch(e){
        alert('Copy failed. Please copy manually.');
    }
}
function clearNote(){
    if(confirm('Are you sure you want to delete the note?')){
        $ta().value = '';
        try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
        showBadge('Cleared');
    }
}
function downloadFile(){
    const text = $ta().value;
    const blob = new Blob([text], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `notepad-${stamp()}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', ()=>{
    loadNote();                // 바로 불러오기
    $ta().focus();             // 포커스
    $ta().addEventListener('input', autoSaveNote);
    $copy().addEventListener('click', copyNote);
    $clear().addEventListener('click', clearNote);
    $down().addEventListener('click', downloadFile);
});

window.addEventListener('beforeunload', ()=>{
    if(debTimer){ clearTimeout(debTimer); saveNoteNow(); }
});

// Shortcuts: Ctrl/⌘ + S/C/D (B 제거)
document.addEventListener('keydown', (e)=>{
    if(!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if(['s','d','c'].includes(k)) e.preventDefault();
    if(k==='s') autoSaveNote();
    else if(k==='d') downloadFile();
    else if(k==='c') copyNote();
});