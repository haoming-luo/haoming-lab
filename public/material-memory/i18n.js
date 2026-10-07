(() => {
 const dictionary={
  "材料记忆与神经本构实验室": "Material Memory & Neural Constitutive Lab",
  "路径响应": "Loading paths",
  "模型对比": "Model performance",
  "模型结构": "Model architecture",
  "研究视图": "Research views",
  "加载工况": "Loading paths",
  "响应对照": "Compare responses",
  "AgentFEM 参考": "AgentFEM reference",
  "加载进度": "Loading progress",
  "播放加载过程": "Play loading",
  "暂停播放": "Pause",
  "比较两个时刻": "Compare two moments",
  "回到起点": "Reset",
  "空格 播放/暂停 · ← → 单步 · M 比较两个时刻": "Space: play / pause · ← →: step · M: memory",
  "物理约束神经本构模型": "Physics-structured neural constitutive model",
  "DENIM · 918 参数": "DENIM · 918 parameters",
  "弹性和塑性按力学方程计算，未知的硬化规律由神经网络学习。": "Explicit elasticity and J2 return mapping. Learned internal variables close unknown hardening.",
  "显式约束": "Explicit physics",
  "力学方程": "Mechanical equations",
  "网络补充": "Neural closure",
  "演化规律": "Evolution law",
  "主分量": "Components",
  "响应误差": "Stress error",
  "一致性残差": "Yield residual",
  "应力如何随加载变化": "Stress during loading",
  "滞回 · 卸载 · 反向加载": "Hysteresis · unloading · reversal",
  "保留加载历史": "Memory retained",
  "相近应变，不同应力": "Similar strain, different stress",
  "塑性状态演化": "Plastic state evolving",
  "材料记忆状态": "Material memory",
  "两条记忆通道的变化": "Fast and slow memory channels",
  "弹性": "Elastic",
  "塑性演化": "Plastic evolution",
  "弹性响应": "Elastic response",
  "快记忆": "Fast memory",
  "慢记忆": "Slow memory",
  "各向同性硬化": "Isotropic hardening",
  "等效塑性应变": "Equivalent plastic strain",
  "多轴应变路径": "Multiaxial strain path",
  "应变分量平面": "Strain-component plane",
  "应变平面": "strain plane",
  "应力应变滞回曲线": "Stress–strain hysteresis",
  "32 条完整留出轨迹": "32 held-out trajectories",
  "结构级相对误差": "Structural relative error",
  "有限元反力响应": "FE reaction response",
  "不同步长下的 RMSE": "Step-size RMSE",
  "121 / 481 增量": "121 / 481 increments",
  "物理—数据融合本构建模": "PHYSICS × LEARNED EVOLUTION",
  "换一种加载方式，还能预测准吗？": "Can the model predict a new loading path?",
  "DENIM 保留已知力学方程，用网络学习未知的硬化规律。": "DENIM retains the known mechanics and learns the missing hardening law.",
  "01 · 数据驱动": "01 · DATA-DRIVEN",
  "02 · 白盒积分": "02 · KNOWN PHYSICS",
  "03 · DENIM": "03 · DENIM",
  "新加载路径上的误差": "Error on unseen loading paths",
  "黑箱与带物理特征的时序网络模型的 Path-OOD RMSE 为 60–106 MPa。": "Black-box and weak-physics sequence models: 60–106 MPa Path-OOD RMSE.",
  "已知方程的精度参照": "Known-equation reference",
  "完整 J2/Chaboche 方程与参数均已知，神经网络辅助积分；新路径 RMSE 为 0.0237 MPa。": "Full J2/Chaboche equations and parameters are supplied; the neural network assists integration. RMSE on unseen paths: 0.0237 MPa.",
  "学习未知的硬化规律": "Learning the missing hardening law",
  "隐藏三通道 Chaboche 硬化，由神经内部变量学习缺失演化；新路径 RMSE 为 1.136 MPa。": "The three-channel Chaboche hardening law is hidden; neural internal variables learn the missing evolution. RMSE on unseen paths: 1.136 MPa.",
  "新加载路径上的预测误差": "Generalization to unseen paths",
  "A、B 两组任务分别比较；条形越短，误差越小": "Compare within each group; A and B are different tasks · shorter bars mean lower error",
  "研究结论": "THE RESULT",
  "在 B 组测试中，DENIM 的误差约为 Incomplete J2 的 1/52、GRU 的 1/68。": "In protocol B, DENIM has about 1/52 the error of Incomplete J2 and 1/68 the error of GRU.",
  "数据规模": "DATA",
  "8 类多轴加载路径，按路径类型划分训练与测试数据。": "8 multiaxial path families; family-level splits.",
  "物理核验": "PHYSICS CHECKS",
  "4 项": "4 checks",
  "检查屈服条件、塑性不可压缩性、累积塑性应变和能量平衡。": "Yield consistency, incompressibility, monotone PEEQ and energy balance.",
  "结构验证": "STRUCTURAL TEST",
  "缺口杆有限元": "Notched-bar FEM",
  "覆盖单调、循环及强循环工况。": "Monotonic, cyclic and severe cyclic loading.",
  "开放数据集 ↗": "Dataset ↗",
  "开放模型 ↗": "Model ↗",
  "模型结构与信息流": "INSIDE THE MODELS",
  "这些模型怎样处理加载历史？": "How do these models use loading history?",
  "选择一个模型，查看输入、计算过程，以及历史信息如何保留。": "Select a model to see its inputs, computations, and treatment of history.",
  "选择模型": "Choose a model",
  "模型信息流": "Model information flow",
  "如何保留历史": "Memory",
  "已知力学关系": "Explicit physics",
  "网络学习什么": "What is learned",
  "新路径预测": "Path generalization",
  "DENIM 模型": "DENIM",
  "918 个参数 · 两条记忆通道 · 学习未知硬化演化": "918 parameters · Two memory channels · Learned hardening",
  "预计算结果交互展示": "Interactive precomputed results",
  "力学算子": "Physics operator",
  "可学习模块": "Learned module",
  "单点映射": "Pointwise mapping",
  "数据驱动 · 无记忆": "DATA-DRIVEN / STATELESS",
  "当前量 → 当前量": "Instantaneous mapping",
  "只看当前应变，不读取加载历史。": "Current strain in. Current stress out.",
  "结构最简单、推理很快，但同一应变在不同加载历史下可能对应不同应力，单点映射无法区分。": "A pointwise map cannot distinguish equal strains reached through different loading histories.",
  "预测全部应力": "Full stress mapping",
  "时序网络": "Sequence model",
  "数据驱动 · 隐式记忆": "DATA-DRIVEN / LATENT MEMORY",
  "历史序列 → 应力": "History → stress",
  "用隐状态记录此前的加载过程。": "Loading history is encoded in a hidden state.",
  "GRU 用隐状态记录加载历史，再预测应力。遇到训练中没有见过的加载方式时，预测效果取决于训练数据的覆盖范围。": "Recurrent memory captures loading history; generalization depends on the paths seen during training.",
  "隐状态": "Hidden state",
  "学习全部演化": "Full evolution",
  "中—弱": "Moderate–limited",
  "带物理特征的时序网络": "Physics-feature sequence model",
  "物理增强 · 隐状态": "PHYSICS FEATURES / LATENT MEMORY",
  "物理特征 + 时序网络": "Physics features + recurrence",
  "把物理状态作为特征交给循环网络。": "A recurrent network receives explicit physical-state features.",
  "加入塑性应变等物理特征，帮助网络判断当前状态；下一步如何更新，仍由网络学习。": "Physical features enrich the input; the network still learns the state update.",
  "物理特征": "Physical features",
  "学习状态更新": "State update",
  "神经辅助积分器": "Neural-assisted integrator",
  "已知方程 · 神经辅助积分": "KNOWN EQUATIONS / NEURAL-ASSISTED INTEGRATION",
  "完整本构方程已知": "Full constitutive equations supplied",
  "网络修正塑性增量初值，完整方程完成一致性校正。": "The network improves the plastic-increment seed; the full equations enforce consistency.",
  "这里已知完整的 J2 / Chaboche 方程和材料参数。网络提供更好的求解初值，最终结果仍由方程校正，因此它是已知方程条件下的精度参照。": "No new material law is learned. The J2/Chaboche equations, parameters and state variables are supplied; the network only assists the plastic-increment solve before equation-based correction.",
  "显式内部变量": "Explicit state variables",
  "完整方程": "Full equations",
  "修正塑性增量初值": "Plastic-increment seed correction",
  "因果时序卷积": "Causal temporal convolution",
  "数据驱动 · 有限历史窗口": "DATA-DRIVEN / FINITE HISTORY",
  "只读当前与过去": "Past and present only",
  "通过多层因果卷积，提取不同时间尺度的加载历史。": "Causal convolutions extract loading history across time scales.",
  "TCN 读取当前时刻和此前一段加载记录。多层卷积让它能回看更早的历史，但不会读取未来数据，也不使用循环隐状态。": "TCN reads the current input and a window of past loading. Stacked convolutions extend that window; no future inputs or recurrent state are used.",
  "可回看的历史范围": "History window",
  "依赖训练覆盖": "Training-dependent",
  "不完备基线": "Incomplete baseline",
  "硬化规律不完整": "INCOMPLETE PHYSICS / NO CLOSURE",
  "部分硬化规律缺失": "Skeleton without full evolution",
  "保留基本塑性框架，但硬化演化表达不足。": "The plasticity skeleton is retained, but hardening is incomplete.",
  "保留弹性和 J2 塑性，但缺少部分硬化规律。因此在循环加载和非比例加载中，难以准确描述应力变化。": "Missing hardening and memory channels leave errors under cyclic and non-proportional loading.",
  "有限": "Limited",
  "基本弹塑性方程": "Basic elastoplastic equations",
  "离散能量神经内部变量模型": "Discrete-Energy Neural Internal-variable Model",
  "已知力学 + 硬化学习": "KNOWN MECHANICS / LEARNED HARDENING",
  "力学方程 + 可学习演化": "Mechanics + learned evolution",
  "保留弹塑性计算过程，用网络学习缺失的硬化规律。": "DENIM retains the elastoplastic update and learns missing hardening behavior.",
  "DENIM 按力学方程计算弹塑性响应，用网络更新未知的硬化项。内部变量随加载过程保留，供下一步计算使用。": "DENIM learns the missing hardening while preserving explicit mechanics and stateful integration.",
  "显式神经内部变量": "Neural internal variables",
  "弹塑性方程": "Elastoplastic equations",
  "学习未知硬化": "Missing evolution",
  "无": "None",
  "弱": "Limited",
  "中": "Moderate",
  "强": "Strong",
  "轴向循环": "Axial cycles",
  "剪切循环": "Shear cycles",
  "先拉后剪": "Tension then shear",
  "正交交叉": "Orthogonal cross",
  "非比例方形": "Non-proportional square",
  "主方向旋转": "Rotating principal axes",
  "异相李萨如": "Out-of-phase Lissajous",
  "随机方向块": "Random directional blocks",
  "训练内 · 比例加载": "Training · proportional",
  "训练内 · 顺序加载": "Training · sequential",
  "训练内 · 方向突变": "Training · direction changes",
  "训练内 · 转角路径": "Training · turning paths",
  "验证集 · 未参与拟合": "Validation · not fitted",
  "测试集 · 完全留出路径族": "Test · unseen path family",
  "B · 未知硬化预测": "B · UNKNOWN-HARDENING CLOSURE",
  "隐藏三通道 Chaboche 硬化；DENIM、Incomplete J2 与 GRU 按同一协议比较。": "The three-channel Chaboche hardening law is hidden; DENIM, Incomplete J2 and GRU share one protocol.",
  "A · 已知方程基准": "A · KNOWN-EQUATION BENCHMARK",
  "完整 J2 / Chaboche 方程与参数已知；比较模型对未见加载路径的预测。": "Full J2/Chaboche equations and parameters are supplied; models are tested on unseen loading paths.",
  "协议 A · 已知方程 · 新路径": "A · Known equations · unseen paths",
  "协议 B · 未知硬化 · 新路径": "B · Unknown hardening · unseen paths",
  "协议 A · 完整方程积分": "A · Full-equation integration",
  "协议 B 基准": "Protocol B reference",
  "仅在协议 A 内比较": "Compare within protocol A only",
  "应变": "Strain",
  "应力": "Stress",
  "加载进度": "Loading progress"
};
 const records=new WeakMap();
 const keys=Object.keys(dictionary).filter(k=>k.length>2).sort((a,b)=>b.length-a.length);
 function english(s){
   const trim=s.trim(); if(dictionary[trim])return s.replace(trim,dictionary[trim]);
   if(trim.startsWith('误差是 DENIM 的 '))return trim.replace('误差是 DENIM 的 ','Error relative to DENIM: ').replace(' 倍','×');
   if(trim.startsWith('误差仅为 DENIM 的 1/'))return trim.replace('误差仅为 DENIM 的 ','Error relative to DENIM: ');
   if(trim.includes('应变平面'))return trim.replace('应变平面','strain plane');
   if(/^应变 /.test(trim))return trim.replace('应变 ','Strain ');
   if(/^应力 /.test(trim))return trim.replace('应力 ','Stress ');
   return s;
 }
 let lang=new URLSearchParams(location.search).get('lang');
 if(!['en','zh'].includes(lang)){try{lang=localStorage.getItem('denim-language');}catch{}}
 if(!['en','zh'].includes(lang))lang=location.hostname.endsWith('.hf.space')?'en':'zh';
 function visit(root){
   if(root.nodeType===3){
     if(root.parentElement?.closest('script,style,.network-diagram'))return;
     let record=records.get(root);
     if(!record||root.nodeValue!==record.rendered)record={source:root.nodeValue};
     const value=lang==='en'?english(record.source):record.source;
     record.rendered=value; records.set(root,record); if(root.nodeValue!==value)root.nodeValue=value;
   }else if(root.nodeType===1 && !root.matches('script,style'))Array.from(root.childNodes).forEach(visit);
 }
 function apply(){
   document.documentElement.lang=lang==='en'?'en':'zh-CN';
   const labels={'timeline':['加载进度','Loading progress'],'hysteresisChart':['应力应变滞回曲线','Stress–strain response'],'pathChart':['多轴应变路径','Multiaxial strain path'],'modelSelector':['选择模型','Choose a model'],'architectureFlow':['模型信息流','Model information flow']};
   Object.entries(labels).forEach(([id,words])=>document.getElementById(id)?.setAttribute('aria-label',words[lang==='en'?1:0]));
   document.querySelector('[role="tablist"]').setAttribute('aria-label',lang==='en'?'Research views':'研究视图');
   visit(document.body);
   document.getElementById('languageToggle').textContent=lang==='en'?'中文':'EN';
   document.title=lang==='en'?'AgentFEM × DENIM · Material Memory Lab':'AgentFEM × DENIM · 材料记忆实验室';
 }
 document.getElementById('languageToggle').onclick=()=>{
   lang=lang==='en'?'zh':'en';try{localStorage.setItem('denim-language',lang);}catch{}
   apply();document.dispatchEvent(new Event('denim-language'));
 };
 apply();
 const observer=new MutationObserver(items=>{for(const item of items){if(item.type==='characterData')visit(item.target);else item.addedNodes.forEach(visit);}});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 window.DenimI18n={apply,english};
})();
