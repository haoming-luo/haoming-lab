const button = document.querySelector('#language');
const elements = [...document.querySelectorAll('[data-i18n]')];
const english = new Map(elements.map(el => [el, el.innerHTML]));
const chinese = {
  learnTitle:'第一次用 AI 做有限元',learnText:'复制提示词，算一个小问题，再看看结果该怎么读。四个入门案例，以及一篇讲清 DENIM 思路的研究手记。',learnLink:'开始入门练习 →',noteLink:'阅读 DENIM 手记 →',
  skip:'跳至案例与数据',back:'← Lab',title:'数据与模型',
  intro:'我们用 AgentFEM 做仿真，也用这些数据训练模型。<br>这里的案例可以在线体验，数据和模型可以下载使用。',code:'AgentFEM 源码 ↗',hub:'Hugging Face 合集 ↗',
  questions:'案例与数据',label:'在线体验 · 数据下载 · 模型代码',
  memoryTitle:'金属也有<br>“记忆”？',memoryText:'变形相同，之前的受力过程不同，应力也可能不同。在这里改变加载过程，看看 DENIM 如何预测这种差别。',memoryDetail:'DENIM · 弹塑性仿真数据 · 神经本构模型',
  demo:'体验案例 →',data:'数据集 ↗',model:'模型 ↗',
  structureTitle:'支架还能<br>减轻多少？',structureText:'承受相同载荷，少用一些材料，支架会多变形多少？调整结构试一试，也可以用配套数据训练自己的预测模型。',structureDetail:'GINO 系列模型 · 三维支架 · 网页展示预计算结果',
  heatTitle:'换种加热方式，<br>温度怎么变？',heatText:'初始温度分布相同，分别采用继续加热、降低功率和关闭热源三种操作。这组数据记录了三种操作之后的温度变化，可用于训练温度预测模型。',heatDetail:'64 个工况 · 192 组温度变化记录 · 含控制记录和测点读数',heatCta:'查看数据集 ↗',
  buildTitle:'想算自己的问题？',buildText:'AgentFEM 基于 FEniCSx 开发，代码开源。你可以用 Python 或命令行建立和运行有限元模型，也可以通过 MCP 接入 AI 助手。',docs:'使用文档 ↗',agent:'接入 AI 助手 ↗',community:'讨论与反馈 ↗',foot:'代码、数据和模型，欢迎使用与交流。'
};
let language = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
function render() {
  const zh = language === 'zh';
  document.documentElement.lang = zh ? 'zh-CN' : 'en';
  for (const el of elements) el.innerHTML = zh ? chinese[el.dataset.i18n] : english.get(el);
  button.textContent = zh ? 'EN' : '中文';
  button.setAttribute('aria-label', zh ? 'Switch to English' : '切换为中文');
}
button.addEventListener('click', () => { language = language === 'en' ? 'zh' : 'en'; render(); });
render();
