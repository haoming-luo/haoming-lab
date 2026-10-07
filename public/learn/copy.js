document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const target=document.getElementById(button.dataset.copy);
  const status=document.getElementById('copy-status');
  try{
    await navigator.clipboard.writeText(target.textContent);
    button.textContent='已复制';status.textContent='已复制，可以粘贴到 AI 助手';
    setTimeout(()=>button.textContent='复制提示词',1800);
  }catch{
    const range=document.createRange();range.selectNodeContents(target);
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    status.textContent='已选中文字，请手动复制';
  }
  status.classList.add('show');setTimeout(()=>status.classList.remove('show'),2200);
}));
