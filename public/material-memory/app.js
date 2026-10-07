(() => {
  'use strict';
  const data = window.DENIM_DEMO;
  if (!data) throw new Error('DENIM demo data not loaded');

  const $ = id => document.getElementById(id);
  const state = { trajectory: 6, step: 120, playing: false, pairToggle: 0, visible: { truth: true, denim: true, gru: false } };
  const colors = { truth: '#f2f0ea', denim: '#d38a51', gru: '#6d91e8', cyan: '#72d6d1' };
  let timer = null;

  function trajectory() { return data.trajectories[state.trajectory]; }
  const displayScope = scope => scope.replace('训练内', '训练集').replace('验证集 · 未参与拟合', '验证集 · 未用于训练').replace('测试集 · 完全留出路径族', '测试集 · 新加载类型');
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
      button.innerHTML = `<span class="path-index">${String(index + 1).padStart(2, '0')}</span><span class="path-copy"><strong>${item.label}</strong><small>${displayScope(item.scope)}</small></span><span class="split ${item.split}">${item.split === 'validation' ? 'VAL' : item.split.toUpperCase()}</span>`;
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
    $('pathScope').textContent = displayScope(item.scope);
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
    $('historyBadge').textContent = closeToPair ? '相近应变，不同应力' : (plastic ? '塑性状态演化' : '保留加载历史');
  }

  function render() { updateState(); drawHysteresis(); drawPathPlane(); }

  function stopPlayback() {
    state.playing = false;
    clearInterval(timer);
    $('play').textContent = '播放加载过程';
    $('play').setAttribute('aria-pressed', 'false');
  }

  function togglePlayback() {
    state.playing = !state.playing;
    $('play').textContent = state.playing ? '暂停播放' : '播放加载过程';
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
      if (index === 0 || rows[index - 1][1] !== row[1]) {
        const heading = document.createElement('div');
        heading.className = 'protocol-heading';
        heading.innerHTML = row[1] === 'closure'
          ? '<strong>B · 未知硬化预测</strong><span>不提供三通道 Chaboche 硬化规律；DENIM、Incomplete J2 和 GRU 采用相同的测试条件。</span>'
          : '<strong>A · 已知方程基准</strong><span>已知完整的 J2 / Chaboche 方程和参数，比较模型对新加载路径的预测。</span>';
        ladder.append(heading);
      }
      const [name, protocol, value, kind] = row;
      const line = document.createElement('div');
      line.className = `ladder-group${name === 'DENIM' ? ' featured' : ''}`;
      const width = 100 * value / maxValue;
      let protocolName = protocol === 'full' ? '协议 A · 已知方程 · 新路径' : '协议 B · 未知硬化 · 新路径';
      if (name === 'Physics-integrator NN') protocolName = '协议 A · 完整方程积分';
      const ratio = value / denimValue;
      const comparison = protocol === 'full' ? '仅在协议 A 内比较' : name === 'DENIM' ? '协议 B 基准' : (ratio >= 1 ? `误差是 DENIM 的 ${ratio.toFixed(ratio >= 10 ? 0 : 1)} 倍` : `误差仅为 DENIM 的 1/${(1 / ratio).toFixed(0)}`);
      line.innerHTML = `<div class="ladder-rank">${String(groupIndex).padStart(2, '0')}</div><div class="ladder-model">${name}</div><div class="ladder-protocol"><span class="protocol-pill ${protocol === 'closure' ? 'closure' : ''}">${protocolName}</span></div><div class="bar-track"><div class="bar-fill ${kind}" style="width:${width.toFixed(2)}%"></div></div><div class="ladder-value">${value < .1 ? value.toFixed(4) : value.toFixed(3)} MPa<small>${comparison}</small></div>`;
      ladder.append(line);
    });
  }

  const modelAtlas = [
    {
      name: 'Pointwise MLP', short: '瞬时映射', family: '数据驱动 · 无记忆', badge: '当前应变 → 当前应力',
      tagline: '只看当前应变，不读取加载历史。',
      nodes: [['输入', '当前应变 εₜ', '单个时刻'], ['神经映射', 'MLP', '黑箱回归', 'learned'], ['输出', '当前应力 σₜ', '无内部状态']],
      summary: '结构最简单、推理很快，但同一应变在不同加载历史下可能对应不同应力，瞬时映射无法区分。',
      traits: ['无', '无', '预测全部应力', '弱']
    },
    {
      name: 'GRU', short: '时序网络', family: '数据驱动 · 隐式记忆', badge: '历史序列 → 应力',
      tagline: '用隐状态记录此前的加载过程。',
      nodes: [['输入', '应变历史 ε₀:ₜ', '完整序列'], ['序列编码', 'GRU', '隐状态记忆', 'learned'], ['输出', '应力序列 σ₀:ₜ', '端到端预测']],
      summary: 'GRU 用隐状态记录加载历史，再预测应力。遇到训练中没有见过的加载方式时，预测效果取决于训练数据的覆盖范围。',
      traits: ['隐状态', '无', '学习应力随加载的变化', '中—弱']
    },
    {
      name: 'Physics-state GRU', short: '带物理特征的时序网络', family: '物理特征 · 隐状态', badge: '物理特征 + 时序网络',
      tagline: '把物理状态作为特征交给循环网络。',
      nodes: [['输入', '应变 + 物理特征', '状态提示', 'physics'], ['状态更新', 'Physics-state GRU', '学习时序演化', 'learned'], ['输出', '应力 + 隐状态', '弱物理约束']],
      summary: '加入塑性应变等物理特征，帮助网络判断当前状态；下一步如何更新，仍由网络学习。',
      traits: ['隐状态', '物理特征', '学习状态更新', '中']
    },
    {
      name: 'Physics-integrator NN', short: '神经辅助积分器', family: '已知方程 · 神经辅助积分', badge: '完整本构方程已知',
      tagline: '网络修正塑性增量初值，完整方程完成一致性校正。',
      nodes: [['输入', 'Δε + zₙ', '增量与状态'], ['力学初值', 'Δλ seed', '解析近似', 'physics'], ['神经修正', 'NN correction', '改善初值', 'learned'], ['方程校正', '返回映射', '屈服一致性', 'physics'], ['输出', 'σₙ₊₁ + zₙ₊₁', '高精度']],
      summary: '这里已知完整的 J2 / Chaboche 方程和材料参数。网络提供更好的求解初值，最终结果仍由方程校正，因此它是已知方程条件下的精度参照。',
      traits: ['显式内部变量', '完整方程', '修正塑性增量初值', '强']
    },
    {
      name: 'Incomplete J2', short: '简化本构模型', family: '硬化规律不完整', badge: '部分硬化规律缺失',
      tagline: '保留基本塑性方程，但硬化规律不完整。',
      nodes: [['输入', 'Δε + zₙ', '增量与状态'], ['力学方程', '弹性 + J2 屈服', '基本约束', 'physics'], ['缺失环节', '不完备硬化', '系统偏差'], ['输出', 'σₙ₊₁', '误差累积']],
      summary: '保留弹性和 J2 塑性，但缺少部分硬化规律。因此在循环加载和非比例加载中，难以准确描述应力变化。',
      traits: ['有限', '基本弹塑性方程', '无', '中—弱']
    },
    {
      name: 'DENIM', short: '离散能量神经内部变量模型', family: '已知力学 + 硬化学习', badge: '力学方程 + 硬化学习',
      tagline: '保留弹塑性计算过程，用网络学习缺失的硬化规律。',
      nodes: [['输入', 'Δε + zₙ', '增量与历史状态'], ['力学方程', '弹性 · J2 · 流动法则', '显式约束', 'physics'], ['网络补充', '快—慢记忆通道', '未知硬化演化', 'learned memory'], ['隐式积分', '返回映射', '一致性求解', 'physics'], ['输出', 'σₙ₊₁ + zₙ₊₁', '可追踪状态']],
      summary: 'DENIM 按力学方程计算弹塑性响应，用网络更新未知的硬化项。内部变量随加载过程保留，供下一步计算使用。',
      traits: ['显式神经内部变量', '弹塑性方程', '学习未知硬化', '强']
    },
    {
      name: 'Causal TCN', short: '因果时序卷积', family: '数据驱动 · 有限历史窗口', badge: '只读当前与过去',
      tagline: '通过多层因果卷积，提取不同时间尺度的加载历史。',
      summary: 'TCN 读取当前时刻和此前一段加载记录。多层卷积让它能回看更早的历史，但不会读取未来数据，也不使用循环隐状态。',
      traits: ['可回看的历史范围', '无', '预测全部应力', '依赖训练覆盖']
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
