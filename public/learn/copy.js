function initLearningCopy(){
const lang=document.documentElement?.lang?.slice(0,2)||'zh';
const labels={zh:['已复制','已复制，可以粘贴到 AI 助手','复制提示词','已选中提示词，请按 Ctrl+C（Mac：⌘C），或长按复制'],en:['Copied','Copied. Paste into your AI assistant.','Copy prompt','Prompt selected. Press Ctrl+C (Mac: ⌘C), or touch and hold to copy.'],fr:['Copié','Copié. Collez dans votre assistant IA.','Copier la consigne','Consigne sélectionnée. Appuyez sur Ctrl+C (Mac : ⌘C), ou faites un appui long pour copier.']}[lang];
function legacyCopy(text){
  const field=document.createElement('textarea');
  field.value=text;field.readOnly=true;
  field.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
  const active=document.activeElement;
  document.body.appendChild(field);
  let copied=false;
  try{field.focus({preventScroll:true});field.select();field.setSelectionRange(0,text.length);copied=document.execCommand('copy');}catch{}
  finally{field.remove();active?.focus({preventScroll:true});}
  return copied;
}
const downloadMenu=document.querySelector('.download-menu');
if(downloadMenu){
  document._learningMenuCleanup?.();
  const closeOutside=event=>{
    if(!downloadMenu.contains(event.target)||event.target.closest('.download-options a'))downloadMenu.open=false;
  };
  const closeEscape=event=>{
    if(event.key==='Escape'&&downloadMenu.open){downloadMenu.open=false;downloadMenu.querySelector('summary').focus();}
  };
  document.addEventListener('click',closeOutside);
  document.addEventListener('keydown',closeEscape);
  document._learningMenuCleanup=()=>{document.removeEventListener('click',closeOutside);document.removeEventListener('keydown',closeEscape);};
}
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const target=document.getElementById(button.dataset.copy);
  const status=document.getElementById('copy-status');
  if(!target||!status)return;
  let copied=false;
  if(navigator.clipboard?.writeText){
    try{await navigator.clipboard.writeText(target.textContent);copied=true;}catch{}
  }
  if(!copied)copied=legacyCopy(target.textContent);
  if(copied){
    button.textContent=labels[0];status.textContent=labels[1];
    setTimeout(()=>button.textContent=labels[2],1800);
  }else{
    const range=document.createRange();range.selectNodeContents(target);
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    status.textContent=labels[3];
  }
  status.classList.add('show');setTimeout(()=>status.classList.remove('show'),copied?2200:6000);
}));
}
initLearningCopy();
