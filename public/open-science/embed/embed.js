const $=id=>document.getElementById(id);
const entries={
 memory:{path:'material-memory/',en:'Material memory · DENIM',zh:'材料记忆 · DENIM',note:['Explore loading histories and recorded model responses. This is not a material qualification test.','改变加载过程，查看已有模型结果。不用于材料性能鉴定。']},
 bracket:{path:'structural-design/',en:'Structural design · GINO',zh:'结构设计 · GINO',note:['The demo selects the nearest precomputed design; it does not run a neural operator or a new finite-element solve.','演示会匹配最接近的预计算方案，不在网页中运行神经算子或重新进行有限元计算。']},
 pipe:{path:'open-science/pipe-lab/',en:'Pipe vibration and dampers',zh:'管道振动与阻尼器',note:['Explore idealized linear component models. These results do not replace plant piping assessment.','体验理想化线性组件模型中的振动与减振，不替代电厂管道工程评估。']},
 rod:{path:'morph/',en:'Soft-rod shape design · Morph',zh:'软杆形状设计 · Morph',note:['Planar, quasistatic rod mechanics without contact. Loading playback is not physical motion time.','平面、准静态、无接触软杆模型；加载动画不代表实际运动时间。']}
};
let zh=new URLSearchParams(location.search).get('lang')==='zh';
const text={heading:['Bring mechanics into your course.','把力学演示放进课堂。'],intro:['Choose a demo, copy the HTML, and paste it into a page that accepts embedded content. Your students can explore it without installing simulation software.','选择演示，复制 HTML，粘贴到支持嵌入内容的课程或文章页面。学生无需安装仿真软件即可体验。'],show:['Preview','预览'],copy:['Copy HTML','复制 HTML'],direct:['Open demo ↗','单独打开 ↗'],handout:['Classroom exercises ↗','配套课堂练习 ↗'],'code-label':['HTML embed','嵌入代码'],help:['Some learning platforms block iframes. If yours does, share the direct link instead. The demo needs an internet connection; viewing it does not require a Lab account.','部分教学平台不允许嵌入网页，遇到这种情况，直接分享演示链接即可。演示需要联网，无需登录实验室账号。'],footer:['The embed includes a visible credit and a direct link. Code and dataset reuse follow each repository’s license.','嵌入内容附有来源和直达链接。代码、数据的其他使用方式请遵循对应仓库的许可。']};
function render(){
 document.documentElement.lang=zh?'zh-CN':'en';
 for(const [id,values] of Object.entries(text))$(id).textContent=values[Number(zh)];
 $('language').textContent=zh?'EN':'中文';
 $('demo').setAttribute('aria-label',zh?'选择演示':'Choose a demo');
 for(const option of $('demo').options)option.textContent=entries[option.value][zh?'zh':'en'];
 const entry=entries[$('demo').value];
 const url='https://lab.haoming-luo.com/'+entry.path;
 const title=entry[zh?'zh':'en'];
 $('scope').textContent=entry.note[Number(zh)];
 $('direct').href=url;
 $('handout').href='../../learn/'+(zh?'':'en.html');
 $('code').value=`<iframe src="${url}" title="AgentFEM — ${title}" loading="lazy" style="width:100%;height:820px;border:0" allow="fullscreen"></iframe>\n<p><a href="${url}" target="_blank" rel="noopener">AgentFEM — ${title} ↗</a></p>`;
 $('preview').replaceChildren();$('preview').hidden=true;$('status').textContent='';
}
$('language').onclick=()=>{zh=!zh;render()};
$('demo').onchange=render;
$('show').onclick=()=>{const frame=document.createElement('iframe');frame.src=$('direct').href;frame.title=entries[$('demo').value][zh?'zh':'en'];frame.allowFullscreen=true;$('preview').replaceChildren(frame);$('preview').hidden=false;};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('code').value);$('status').textContent=zh?'已复制。':'Copied.';}catch{$('code').focus();$('code').select();$('status').textContent=zh?'代码已选中，请按 ⌘C 或 Ctrl+C。':'Code selected. Press ⌘C or Ctrl+C.';}};
render();
