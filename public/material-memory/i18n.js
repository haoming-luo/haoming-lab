(() => {
 const dictionary={
  "材料记忆与神经本构实验室": "Material Memory & Neural Constitutive Lab",
  "路径响应": "Loading paths",
  "模型谱系": "Model performance",
  "模型图谱": "Model architecture",
  "研究视图": "Research views",
  "加载工况": "Loading paths",
  "响应对照": "Compare responses",
  "AgentFEM 参考": "AgentFEM reference",
  "增量进程": "Loading progress",
  "播放路径": "Play path",
  "暂停播放": "Pause",
  "对照记忆": "Compare memory",
  "回到起点": "Reset",
  "空格 播放/暂停 · ← → 单步 · M 对照记忆": "Space: play / pause · ← →: step · M: memory",
  "物理约束神经本构模型": "Physics-structured neural constitutive model",
  "DENIM · 918 参数": "DENIM · 918 parameters",
  "保留弹性、J2 屈服与返回映射，以神经内部变量闭合未知硬化演化。": "Explicit elasticity and J2 return mapping. Learned internal variables close unknown hardening.",
  "显式约束": "Explicit physics",
  "力学骨架": "Mechanical skeleton",
  "神经闭合": "Neural closure",
  "演化规律": "Evolution law",
  "主分量": "Components",
  "响应误差": "Stress error",
  "一致性残差": "Yield residual",
  "路径相关本构响应": "Path-dependent response",
  "滞回 · 卸载 · 反向加载": "Hysteresis · unloading · reversal",
  "历史状态保持": "Memory retained",
  "同应变 · 异历史": "Same strain · different history",
  "塑性状态演化": "Plastic state evolving",
  "材料记忆状态": "Material memory",
  "快—慢通道与硬化演化": "Fast / slow channels & hardening",
  "弹性": "Elastic",
  "塑性演化": "Plastic evolution",
  "弹性响应": "Elastic response",
  "快记忆": "Fast memory",
  "慢记忆": "Slow memory",
  "各向同性半径": "Isotropic hardening",
  "等效塑性应变": "Equivalent plastic strain",
  "多轴应变路径": "Multiaxial strain path",
  "应变分量平面": "Strain-component plane",
  "应变平面": "strain plane",
  "应力应变滞回曲线": "Stress–strain hysteresis",
  "32 条完整留出轨迹": "32 held-out trajectories",
  "结构级相对误差": "Structural relative error",
  "有限元反力响应": "FE reaction response",
  "离散稳健性 RMSE": "Step-size RMSE",
  "121 / 481 增量": "121 / 481 increments",
  "物理—数据融合本构建模": "PHYSICS × LEARNED EVOLUTION",
  "从拟合响应，到学习演化": "Beyond fitting. Learn the evolution.",
  "让已知力学负责约束，让神经网络学习未知硬化。": "Keep the mechanics. Learn the missing hardening.",
  "01 · 数据驱动": "01 · DATA-DRIVEN",
  "02 · 白盒积分": "02 · KNOWN PHYSICS",
  "03 · DENIM 闭合": "03 · DENIM CLOSURE",
  "路径外推受限": "The extrapolation challenge",
  "黑箱与弱物理时序模型的 Path-OOD RMSE 为 60–106 MPa。": "Black-box and weak-physics sequence models: 60–106 MPa Path-OOD RMSE.",
  "已知方程的精度参照": "Known-equation reference",
  "完整 J2/Chaboche 演化形式下，Path-OOD RMSE 为 0.0237 MPa。": "With the full J2/Chaboche evolution law: 0.0237 MPa Path-OOD RMSE.",
  "不完备物理 · 高精度": "Missing physics. Precise response.",
  "神经内部变量补全未知演化，完整留出路径 RMSE 为 1.136 MPa。": "Neural internal variables close unknown evolution: 1.136 MPa on held-out paths.",
  "路径外推表现": "Generalization to unseen paths",
  "同组比较 · 更短的条形代表更小误差": "Compare within each protocol · shorter is better",
  "研究结论": "THE RESULT",
  "在同一测试协议中，DENIM 的误差约为 Incomplete J2 的 1/52、GRU 的 1/68。": "In the same protocol, DENIM reduces error by 52× vs Incomplete J2 and 68× vs GRU.",
  "数据规模": "DATA",
  "8 类多轴路径，按路径族严格划分。": "8 multiaxial path families; family-level splits.",
  "物理核验": "PHYSICS CHECKS",
  "4 项": "4 checks",
  "屈服、不可压缩、PEEQ 单调与能量平衡。": "Yield consistency, incompressibility, monotone PEEQ and energy balance.",
  "结构验证": "STRUCTURAL TEST",
  "缺口杆有限元": "Notched-bar FEM",
  "覆盖单调、循环及强循环工况。": "Monotonic, cyclic and severe cyclic loading.",
  "开放数据集 ↗": "Dataset ↗",
  "开放模型 ↗": "Model ↗",
  "模型结构与信息流": "INSIDE THE MODELS",
  "让网络，记住材料。": "Give the network a memory.",
  "从瞬时映射到内部变量，探索六种建模思路。": "Six approaches. From pointwise maps to internal variables.",
  "选择模型": "Choose a model",
  "模型信息流": "Model information flow",
  "历史记忆": "Memory",
  "显式物理": "Explicit physics",
  "神经网络职责": "What is learned",
  "路径外推": "Path generalization",
  "DENIM 的位置": "DENIM",
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
  "时序黑箱": "Sequence model",
  "数据驱动 · 隐式记忆": "DATA-DRIVEN / LATENT MEMORY",
  "历史序列 → 应力": "History → stress",
  "从应变序列中压缩出隐藏历史状态。": "Loading history is encoded in a hidden state.",
  "能够识别滞回和反向加载，但记忆完全藏在网络隐状态中；路径分布变化时，外推稳定性受训练数据覆盖范围影响。": "Recurrent memory captures loading history; generalization depends on the paths seen during training.",
  "隐状态": "Hidden state",
  "学习全部演化": "Full evolution",
  "中—弱": "Moderate–limited",
  "弱物理时序": "Physics-feature sequence model",
  "物理增强 · 隐状态": "PHYSICS FEATURES / LATENT MEMORY",
  "物理特征 + 时序网络": "Physics features + recurrence",
  "把物理状态作为特征交给循环网络。": "A recurrent network receives explicit physical-state features.",
  "物理特征改善了网络的输入表达，但积分更新仍主要由黑箱时序网络承担，守恒与一致性通常需要额外约束。": "Physical features enrich the input; the network still learns the state update.",
  "物理特征": "Physical features",
  "学习状态更新": "State update",
  "白盒积分器": "Known-equation integrator",
  "完整物理 · 神经参数化": "FULL PHYSICS / NEURAL PARAMETERS",
  "正确方程已知": "Known governing equations",
  "已知正确演化形式，网络只识别少量未知关系。": "The governing structure is known; neural parameters complete it.",
  "在正确演化方程与内部变量结构已知的条件下，提供高精度的白盒参照。": "A high-accuracy reference with the correct governing law and internal-state structure supplied.",
  "显式内部变量": "Explicit state variables",
  "完整": "Full equations",
  "识别未知关系": "Unknown relationships",
  "因果时序卷积": "Causal temporal convolution",
  "数据驱动 · 有限历史窗口": "DATA-DRIVEN / FINITE HISTORY",
  "只读当前与过去": "Past and present only",
  "通过多层因果卷积，提取不同时间尺度的加载历史。": "Causal convolutions extract loading history across time scales.",
  "膨胀卷积扩大历史感受野，不读取未来输入；记忆由有限历史窗口提供，而非循环隐状态。": "Dilated convolutions expand the receptive field without future inputs. Memory comes from a finite history window, not a recurrent hidden state.",
  "历史感受野": "Temporal receptive field",
  "依赖训练覆盖": "Training-dependent",
  "不完备基线": "Incomplete baseline",
  "不完备物理 · 无神经闭合": "INCOMPLETE PHYSICS / NO CLOSURE",
  "骨架正确 · 演化缺失": "Skeleton without full evolution",
  "保留基本塑性框架，但硬化演化表达不足。": "The plasticity skeleton is retained, but hardening is incomplete.",
  "物理骨架提供基本合理性，但缺少真实材料的复杂记忆与硬化通道，循环和非比例路径下会产生持续误差。": "Missing hardening and memory channels leave errors under cyclic and non-proportional loading.",
  "有限": "Limited",
  "基础骨架": "Basic skeleton",
  "离散能量神经内部变量模型": "Discrete-Energy Neural Internal-variable Model",
  "不完备物理 · 神经闭合": "PHYSICS SKELETON / LEARNED CLOSURE",
  "力学骨架 + 可学习演化": "Mechanics + learned evolution",
  "保留可验证力学积分，以神经内部变量补全未知演化。": "Keep the mechanical integrator. Learn the missing evolution.",
  "网络不替代整套本构方程，只学习物理骨架未描述的演化项；因此同时保留路径记忆、求解约束和内部状态可解释性。": "DENIM learns the missing hardening while preserving explicit mechanics and stateful integration.",
  "显式神经内部变量": "Neural internal variables",
  "核心骨架": "Core skeleton",
  "闭合未知演化": "Missing evolution",
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
  "B · 未知硬化演化": "B · UNKNOWN HARDENING",
  "A · 多材料基准": "A · MULTI-MATERIAL BENCHMARK",
  "协议 A · 多材料 Path-OOD": "A · Multi-material Path-OOD",
  "协议 B · 不完备物理 Path-OOD": "B · Incomplete-physics Path-OOD",
  "协议 A · 正确方程已知": "A · Known governing equations",
  "DENIM 基准": "DENIM reference",
  "独立测试协议": "Separate protocol",
  "应变": "Strain",
  "应力": "Stress",
  "加载进度": "Loading progress"
};
 const records=new WeakMap();
 const keys=Object.keys(dictionary).filter(k=>k.length>2).sort((a,b)=>b.length-a.length);
 function english(s){
   const trim=s.trim(); if(dictionary[trim])return s.replace(trim,dictionary[trim]);
   if(/^误差比 DENIM 高 /.test(trim))return trim.replace('误差比 DENIM 高 ','Error vs DENIM: ');
   if(/^误差比 DENIM 低 /.test(trim))return trim.replace('误差比 DENIM 低 ','Lower error than DENIM: ');
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
