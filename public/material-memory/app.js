(() => {
  'use strict';
  const data = window.DENIM_DEMO;
  if (!data) throw new Error('DENIM demo data not loaded');

  const $ = id => document.getElementById(id);
  const state = { trajectory: 6, step: 120, playing: false, pairToggle: 0, visible: { truth: true, denim: true, gru: false } };
  const colors = { truth: '#f2f0ea', denim: '#d38a51', gru: '#6d91e8', cyan: '#72d6d1' };
  let timer = null;

  function trajectory() { return data.trajectories[state.trajectory]; }
  function extent(values) {
    let min = Math.min(...values), max = Math.max(...values);
    if (Math.abs(max - min) < 1e-9) { min -= 1; max += 1; }
    const pad = (max - min) * .1;
    return [min - pad, max + pad];
  }
  const map = (value, a, b, c, d) => c + (value - a) * (d - c) / (b - a);
  const pathString = points => points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const svgElement = (name, attrs = {}) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    return element;
  };
  function append(parent, name, attrs = {}, text = '') {
    const element = svgElement(name, attrs);
    if (text) element.textContent = text;
    parent.append(element);
    return element;
  }

  function buildPathList() {
    const list = $('pathList');
    list.innerHTML = '';
    data.trajectories.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `path-button${index === state.trajectory ? ' active' : ''}`;
      button.innerHTML = `<span class="path-index">${String(index + 1).padStart(2, '0')}</span><span class="path-copy"><strong>${item.label}</strong><small>${item.scope}</small></span><span class="split ${item.split}">${item.split === 'validation' ? 'VAL' : item.split.toUpperCase()}</span>`;
      button.onclick = () => {
        // Keep the user's transport state; the existing timer reads the current trajectory.
        if (state.trajectory === index) return;
        state.trajectory = index;
        state.step = 0;
        state.pairToggle = 0;
        $('timeline').value = 0;
        buildPathList();
        render();
      };
      list.append(button);
    });
  }

  function chartFrame(svg, xValues, yValues, labels) {
    const width = Math.max(280, svg.clientWidth || 700);
    const height = Math.max(160, svg.clientHeight || 430);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = '';
    const margin = { left: 58, right: 20, top: 18, bottom: 43 };
    const [xmin, xmax] = extent(xValues), [ymin, ymax] = extent(yValues);
    const sx = value => map(value, xmin, xmax, margin.left, width - margin.right);
    const sy = value => map(value, ymin, ymax, height - margin.bottom, margin.top);
    for (let i = 0; i <= 5; i++) {
      const x = map(i, 0, 5, margin.left, width - margin.right);
      const y = map(i, 0, 5, margin.top, height - margin.bottom);
      append(svg, 'line', { x1: x, x2: x, y1: margin.top, y2: height - margin.bottom, class: 'grid' });
      append(svg, 'line', { x1: margin.left, x2: width - margin.right, y1: y, y2: y, class: 'grid' });
      append(svg, 'text', { x, y: height - 21, 'text-anchor': 'middle' }, (xmin + i * (xmax - xmin) / 5).toFixed(2));
      append(svg, 'text', { x: margin.left - 9, y: y + 3, 'text-anchor': 'end' }, (ymax - i * (ymax - ymin) / 5).toFixed(Math.max(Math.abs(ymin), Math.abs(ymax)) < 2 ? 2 : 0));
    }
    append(svg, 'line', { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, class: 'axis' });
    append(svg, 'line', { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, class: 'axis' });
    append(svg, 'text', { x: (margin.left + width - margin.right) / 2, y: height - 4, 'text-anchor': 'middle' }, labels.x);
    append(svg, 'text', { x: 13, y: (margin.top + height - margin.bottom) / 2, transform: `rotate(-90 13 ${(margin.top + height - margin.bottom) / 2})`, 'text-anchor': 'middle' }, labels.y);
    return { sx, sy, width, height, margin };
  }

  function drawHysteresis() {
    const item = trajectory(), svg = $('hysteresisChart');
    const allStress = [...item.truth_mpa, ...item.denim_mpa, ...item.gru_mpa];
    const frame = chartFrame(svg, item.strain_pct, allStress, { x: `应变 ${item.primary} / %`, y: `应力 ${item.primary} / MPa` });
    const definitions = [
      ['truth', item.truth_mpa], ['denim', item.denim_mpa], ['gru', item.gru_mpa]
    ];
    for (const [name, values] of definitions) {
      if (!state.visible[name]) continue;
      const points = item.strain_pct.map((x, i) => [frame.sx(x), frame.sy(values[i])]);
      append(svg, 'path', { d: pathString(points), class: `series ${name}-path future` });
      append(svg, 'path', { d: pathString(points.slice(0, state.step + 1)), class: `series ${name}-path` });
      append(svg, 'circle', { cx: points[state.step][0], cy: points[state.step][1], r: name === 'denim' ? 4.5 : 3.5, class: 'marker', stroke: colors[name] });
    }
    const pair = item.memory_pair;
    pair.forEach((index, n) => {
      const x = frame.sx(item.strain_pct[index]);
      const y = frame.sy(item.truth_mpa[index]);
      append(svg, 'circle', { cx: x, cy: y, r: 7, fill: 'none', stroke: n ? colors.denim : colors.cyan, 'stroke-width': 1.2, opacity: .7 });
    });
  }

  function drawPathPlane() {
    const item = trajectory(), svg = $('pathChart');
    const frame = chartFrame(svg, item.path_x_pct, item.path_y_pct, { x: `${item.primary} / %`, y: `${item.secondary} / %` });
    const points = item.path_x_pct.map((x, i) => [frame.sx(x), frame.sy(item.path_y_pct[i])]);
    append(svg, 'path', { d: pathString(points), class: 'series path-plane future' });
    append(svg, 'path', { d: pathString(points.slice(0, state.step + 1)), class: 'series path-plane' });
    append(svg, 'circle', { cx: points[state.step][0], cy: points[state.step][1], r: 4.5, class: 'marker', stroke: colors.cyan });
  }

  function updateState() {
    const item = trajectory(), i = state.step;
    $('stepLabel').textContent = `${i + 1} / ${item.strain_pct.length}`;
    $('timeline').max = item.strain_pct.length - 1;
    $('timeline').value = i;
    $('pathName').textContent = item.label;
    $('pathScope').textContent = item.scope;
    $('component').textContent = `${item.primary.toUpperCase()} / ${item.secondary.toUpperCase()}`;
    $('currentError').textContent = `${item.step_error_mpa[i].toFixed(3)} MPa`;
    $('yieldResidual').textContent = `${item.yield_residual_pa[i].toFixed(1)} Pa`;
    $('stressNow').textContent = item.denim_mpa[i].toFixed(1);
    $('memoryOne').textContent = `${item.memory_1_mpa[i].toFixed(1)} MPa`;
    $('memoryTwo').textContent = `${item.memory_2_mpa[i].toFixed(1)} MPa`;
    $('isotropicNow').textContent = `${item.isotropic_mpa[i].toFixed(1)} MPa`;
    $('peeqNow').textContent = item.peeq[i].toFixed(5);
    $('pathAxes').textContent = `${item.primary.toUpperCase()}—${item.secondary.toUpperCase()} 应变平面`;
    const plastic = i > 0 && item.peeq[i] - item.peeq[i - 1] > 1e-10;
    $('stateMode').textContent = plastic ? '塑性演化' : '弹性响应';
    document.querySelector('.state-dot i').style.background = plastic ? 'var(--copper)' : 'var(--green)';
    const maxA = Math.max(...item.memory_1_mpa, 1), maxB = Math.max(...item.memory_2_mpa, 1);
    $('memoryA').style.transform = `rotate(${360 * item.memory_1_mpa[i] / maxA - 25}deg)`;
    $('memoryB').style.transform = `rotate(${-320 * item.memory_2_mpa[i] / maxB + 45}deg)`;
    const pair = item.memory_pair;
    const closeToPair = Math.abs(i - pair[0]) < 2 || Math.abs(i - pair[1]) < 2;
    $('historyBadge').textContent = closeToPair ? '同应变 · 异历史' : (plastic ? '塑性状态演化' : '历史状态保持');
  }

  function render() { updateState(); drawHysteresis(); drawPathPlane(); }

  function stopPlayback() {
    state.playing = false;
    clearInterval(timer);
    $('play').textContent = '播放路径';
    $('play').setAttribute('aria-pressed', 'false');
  }

  function togglePlayback() {
    state.playing = !state.playing;
    $('play').textContent = state.playing ? '暂停播放' : '播放路径';
    $('play').setAttribute('aria-pressed', String(state.playing));
    clearInterval(timer);
    if (state.playing) timer = setInterval(() => {
      const count = trajectory().strain_pct.length;
      state.step = (state.step + 2) % count;
      render();
    }, 55);
  }

  function buildLadder() {
    const full = data.summary.full_physics_path_ood;
    const closure = data.summary.test;
    const rows = [
      ['Pointwise MLP', 'full', full.pointwise_mlp.rmse_mpa, 'blackbox'],
      ['GRU', 'full', full.gru.rmse_mpa, 'blackbox'],
      ['LSTM', 'full', full.lstm.rmse_mpa, 'blackbox'],
      ['Causal TCN', 'full', full.causal_tcn.rmse_mpa, 'blackbox'],
      ['Physics-state GRU', 'full', full.physics_state_gru.rmse_mpa, 'blackbox'],
      ['Physics-integrator NN', 'full', full.physics_integrator_nn.rmse_mpa, 'physics'],
      ['Incomplete J2', 'closure', closure.incomplete_j2.rmse_mpa, 'closure'],
      ['GRU', 'closure', closure.gru.rmse_mpa, 'closure'],
      ['DENIM', 'closure', closure.denrm.rmse_mpa, 'denim'],
    ].sort((a, b) => (a[1] === b[1] ? a[2]-b[2] : a[1]==='closure' ? -1 : 1));
    const ladder = $('ladder');
    ladder.innerHTML = '';
    const maxValue = Math.max(...rows.map(row => row[2])) * 1.04;
    const denimValue = closure.denrm.rmse_mpa;
    let groupIndex = 0;
    rows.forEach((row, index) => {
      if (index === 0 || rows[index - 1][1] !== row[1]) groupIndex = 0;
      groupIndex++;
      if(index===0||rows[index-1][1]!==row[1]){const heading=document.createElement('h3');heading.className='protocol-heading';heading.textContent=row[1]==='closure'?'B · 未知硬化演化':'A · 多材料基准';ladder.append(heading);}
      const [name, protocol, value, kind] = row;
      const line = document.createElement('div');
      line.className = `ladder-group${name === 'DENIM' ? ' featured' : ''}`;
      const width = 100 * value / maxValue;
      let protocolName = protocol === 'full' ? '协议 A · 多材料 Path-OOD' : '协议 B · 不完备物理 Path-OOD';
      if (name === 'Physics-integrator NN') protocolName = '协议 A · 正确方程已知';
      const ratio = value / denimValue;
      const comparison = protocol === 'full' ? '独立测试协议' : name === 'DENIM' ? 'DENIM 基准' : (ratio >= 1 ? `误差比 DENIM 高 ${ratio.toFixed(ratio >= 10 ? 0 : 1)}×` : `误差比 DENIM 低 ${(1 / ratio).toFixed(0)}×`);
      line.innerHTML = `<div class="ladder-rank">${String(groupIndex).padStart(2, '0')}</div><div class="ladder-model">${name}</div><div class="ladder-protocol"><span class="protocol-pill ${protocol === 'closure' ? 'closure' : ''}">${protocolName}</span></div><div class="bar-track"><div class="bar-fill ${kind}" style="width:${width.toFixed(2)}%"></div></div><div class="ladder-value">${value < .1 ? value.toFixed(4) : value.toFixed(3)} MPa<small>${comparison}</small></div>`;
      ladder.append(line);
    });
  }

  const modelAtlas = [
    {
      name: 'Pointwise MLP', short: '单点映射', family: '数据驱动 · 无记忆', badge: '当前量 → 当前量',
      tagline: '只看当前应变，不读取加载历史。',
      nodes: [['输入', '当前应变 εₜ', '单个时刻'], ['神经映射', 'MLP', '黑箱回归', 'learned'], ['输出', '当前应力 σₜ', '无内部状态']],
      summary: '结构最简单、推理很快，但同一应变在不同加载历史下可能对应不同应力，单点映射无法区分。',
      traits: ['无', '无', '预测全部应力', '弱']
    },
    {
      name: 'GRU', short: '时序黑箱', family: '数据驱动 · 隐式记忆', badge: '历史序列 → 应力',
      tagline: '从应变序列中压缩出隐藏历史状态。',
      nodes: [['输入', '应变历史 ε₀:ₜ', '完整序列'], ['序列编码', 'GRU', '隐状态记忆', 'learned'], ['输出', '应力序列 σ₀:ₜ', '端到端预测']],
      summary: '能够识别滞回和反向加载，但记忆完全藏在网络隐状态中；路径分布变化时，外推稳定性受训练数据覆盖范围影响。',
      traits: ['隐状态', '无', '学习全部演化', '中—弱']
    },
    {
      name: 'Physics-state GRU', short: '弱物理时序', family: '物理增强 · 隐状态', badge: '物理特征 + 时序网络',
      tagline: '把物理状态作为特征交给循环网络。',
      nodes: [['输入', '应变 + 物理特征', '状态提示', 'physics'], ['状态更新', 'Physics-state GRU', '学习时序演化', 'learned'], ['输出', '应力 + 隐状态', '弱物理约束']],
      summary: '物理特征改善了网络的输入表达，但积分更新仍主要由黑箱时序网络承担，守恒与一致性通常需要额外约束。',
      traits: ['隐状态', '物理特征', '学习状态更新', '中']
    },
    {
      name: 'Physics-integrator NN', short: '白盒积分器', family: '完整物理 · 神经参数化', badge: '正确方程已知',
      tagline: '已知正确演化形式，网络只识别少量未知关系。',
      nodes: [['输入', 'Δε + zₙ', '增量与状态'], ['完整方程', 'J2 / Chaboche', '已知演化结构', 'physics'], ['积分求解', '返回映射', '一致切线', 'physics'], ['输出', 'σₙ₊₁ + zₙ₊₁', '高精度']],
      summary: '在正确演化方程与内部变量结构已知的条件下，提供高精度的白盒参照。',
      traits: ['显式内部变量', '完整', '识别未知关系', '强']
    },
    {
      name: 'Incomplete J2', short: '不完备基线', family: '不完备物理 · 无神经闭合', badge: '骨架正确 · 演化缺失',
      tagline: '保留基本塑性框架，但硬化演化表达不足。',
      nodes: [['输入', 'Δε + zₙ', '增量与状态'], ['力学骨架', '弹性 + J2 屈服', '基本约束', 'physics'], ['缺失环节', '不完备硬化', '系统偏差'], ['输出', 'σₙ₊₁', '误差累积']],
      summary: '物理骨架提供基本合理性，但缺少真实材料的复杂记忆与硬化通道，循环和非比例路径下会产生持续误差。',
      traits: ['有限', '基础骨架', '无', '中—弱']
    },
    {
      name: 'DENIM', short: '离散能量神经内部变量模型', family: '不完备物理 · 神经闭合', badge: '力学骨架 + 可学习演化',
      tagline: '保留可验证力学积分，以神经内部变量补全未知演化。',
      nodes: [['输入', 'Δε + zₙ', '增量与历史状态'], ['力学骨架', '弹性 · J2 · 流动法则', '显式约束', 'physics'], ['神经闭合', '快—慢记忆通道', '未知硬化演化', 'learned memory'], ['隐式积分', '返回映射', '一致性求解', 'physics'], ['输出', 'σₙ₊₁ + zₙ₊₁', '可追踪状态']],
      summary: '网络不替代整套本构方程，只学习物理骨架未描述的演化项；因此同时保留路径记忆、求解约束和内部状态可解释性。',
      traits: ['显式神经内部变量', '核心骨架', '闭合未知演化', '强']
    },
    {
      name: 'Causal TCN', short: '因果时序卷积', family: '数据驱动 · 有限历史窗口', badge: '只读当前与过去',
      tagline: '通过多层因果卷积，提取不同时间尺度的加载历史。',
      summary: '膨胀卷积扩大历史感受野，不读取未来输入；记忆由有限历史窗口提供，而非循环隐状态。',
      traits: ['历史感受野', '无', '预测全部应力', '依赖训练覆盖']
    }
  ];

  function buildModelSelector() {
    const selector = $('modelSelector');
    selector.innerHTML = '';
    [0, 1, 6, 2, 3, 4, 5].forEach(index => {
      const model = modelAtlas[index];
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.modelIndex = index;
      button.className = `model-select${index === 5 ? ' active' : ''}`;
      button.setAttribute('aria-pressed', String(index === 5));
      button.innerHTML = `<strong>${model.name}</strong><small>${model.short}</small>`;
      button.onclick = () => renderArchitecture(index);
      selector.append(button);
    });
  }

  function renderArchitecture(index) {
    const model = modelAtlas[index];
    document.querySelectorAll('.model-select').forEach((button, buttonIndex) => {
      const active = Number(button.dataset.modelIndex) === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('architectureFamily').textContent = model.family;
    $('architectureName').textContent = model.name;
    $('architectureTagline').textContent = model.tagline;
    $('architectureBadge').textContent = model.badge;
    $('architectureSummary').textContent = model.summary;
    ['traitMemory', 'traitPhysics', 'traitLearning', 'traitOod'].forEach((id, traitIndex) => { $(id).textContent = model.traits[traitIndex]; });
    window.DenimArchitecture.render(index);
  }

  document.querySelectorAll('[data-series]').forEach(input => {
    input.addEventListener('change', () => { state.visible[input.dataset.series] = input.checked; drawHysteresis(); });
  });
  $('timeline').addEventListener('input', event => { state.step = Number(event.target.value); render(); });
  $('play').onclick = togglePlayback;
  $('memoryPair').onclick = () => {
    const pair = trajectory().memory_pair;
    state.step = pair[state.pairToggle++ % 2];
    render();
  };
  $('reset').onclick = () => { stopPlayback(); state.step = 0; state.pairToggle = 0; render(); };
  document.addEventListener('keydown', event => {
    if ($('labView').hidden) return;
    if (event.target.matches('input, button, a')) return;
    if (event.code === 'Space') { event.preventDefault(); togglePlayback(); }
    if (event.key === 'ArrowRight') { stopPlayback(); state.step = Math.min(state.step + 1, trajectory().strain_pct.length - 1); render(); }
    if (event.key === 'ArrowLeft') { stopPlayback(); state.step = Math.max(state.step - 1, 0); render(); }
    if (event.key.toLowerCase() === 'm') { $('memoryPair').click(); }
  });
  document.querySelectorAll('[data-view]').forEach(button => {
    button.onclick = () => {
      const target = button.dataset.view;
      const evidence = target === 'evidence';
      const models = target === 'models';
      $('labView').hidden = evidence || models;
      $('evidenceView').hidden = !evidence;
      $('modelsView').hidden = !models;
      document.querySelectorAll('[data-view]').forEach(value => {
        value.classList.toggle('active', value === button);
        value.setAttribute('aria-selected', String(value === button));
      });
      if (target !== 'lab') stopPlayback();
      if (target === 'lab') requestAnimationFrame(render);
    };
  });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 90); });
  buildPathList();
  buildLadder();
  buildModelSelector();
  renderArchitecture(5);
  render();
})();
