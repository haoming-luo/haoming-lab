const button = document.querySelector('#language');
const elements = [...document.querySelectorAll('[data-i18n]')];
const english = new Map(elements.map(el => [el, el.innerHTML]));
const chinese = {
  skip:'跳至开放资源',back:'← Lab',title:'从数值仿真，<br>走向物理 AI。',
  intro:'从一个问题出发，探索背后的物理。<br>带走数据，创造下一种可能。',code:'探索 AgentFEM ↗',hub:'查看资源合集 ↗',
  questions:'三个问题，三个开放的起点。',label:'探索 / 下载 / 创造',
  memoryTitle:'相同应变，<br>不同经历。',memoryText:'金属记得它曾经如何受力。先看懂滞回，再用完整加载历史训练模型，运行神经本构。',memoryDetail:'DENIM · 合成弹塑性加载历史 · 可学习硬化',
  demo:'体验案例 →',data:'数据集 ↗',model:'模型 ↗',
  structureTitle:'同样载荷，<br>更少材料？',structureText:'探索重量与变形之间的取舍。利用几何到物理场的数据，训练和比较结构代理模型。',structureDetail:'GINO 系列模型 · 三维支架弹性 · 预计算结果演示',
  heatTitle:'同一状态，<br>三种未来。',heatText:'继续加热、降低功率，还是关闭热源？学习相同温度场在不同操作下如何演化。',heatDetail:'64 个工况 · 192 条轨迹 · 全场、控制与传感器',heatCta:'探索数据集 ↗',
  buildTitle:'下一个实验，<br>从 AgentFEM 开始。',buildText:'基于 FEniCSx 的开源有限元工作流。通过 Python、命令行或 AI 代理接口，建立、运行、检查和验证仿真。',docs:'阅读文档 ↗',agent:'连接 AI 代理 ↗',community:'参与交流 ↗',foot:'开放的问题，共享的工具，可复用的科学。'
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
