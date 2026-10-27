const button = document.querySelector('#language');
const elements = [...document.querySelectorAll('[data-i18n]')];
const english = new Map(elements.map(el => [el, el.innerHTML]));
const chinese = {
  examplesJump:'Python 数据示例 ↓',examplesTitle:'先用数据画一张图',examplesText:'下载脚本，按说明安装依赖，即可用已发布的数据复现结果图。不需要重新仿真或训练模型。',
  exampleMemory:'材料记忆 · 同样的应变，不同的应力 ↗',exampleHeat:'传热 · 比较三种加热方式 ↗',exampleRod:'软杆 · 比较不同平衡形状 ↗',examplePipe:'管道 · 比较不同阻尼系数 ↗',
  embedTitle:'把演示放进课堂',embedText:'课程页面或文章中也能使用这些交互演示。选好案例，复制嵌入代码即可。',embedLink:'选择演示 →',
  pipeEntry:'管道搭建实验室 · 体验振动与减振 →',pipeTitle:'搭一条管路，<br>把振动降下来。',pipeText:'拼接直管和弯头，调整支撑，加装阻尼器。比较加装前后的振幅，看看不同频率下的减振效果。',pipeDetail:'组件降阶模型 · 浏览器实时计算 · 热位移与振动',
  learnTitle:'第一次用 AI 做有限元',learnText:'从悬臂梁到压杆失稳、负泊松比结构，六个练习配有提示词、参考结果和可下载讲义，支持中文、英文和法文。',learnLink:'开始入门练习 →',noteLink:'阅读 DENIM 手记 →',
  morphTitle:'画一条曲线，<br>让软杆去贴合。',morphText:'拖动目标点，或画出想要的形状。调整驱动分区和底座转角，看看软杆能接近到什么程度。',morphDetail:'平面软杆 · 准静态力学计算 · 形状预测与逆设计数据',
  collectionsTitle:'按研究问题找数据',collectionMemory:'材料记忆 ↗',collectionElasticity:'弹性力学 ↗',collectionHeat:'传热 ↗',collectionDynamics:'结构动力学与虚拟传感 ↗',collectionPipe:'管道搭建 ↗',collectionRod:'软杆设计 ↗',
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
  document.querySelectorAll('a[href^="./pipe-lab/"]').forEach(a=>a.href='./pipe-lab/?lang='+language);
  document.querySelector('#learn-entry').href = zh ? '../learn/' : '../learn/en.html';
}
button.addEventListener('click', () => { language = language === 'en' ? 'zh' : 'en'; render(); });
render();
