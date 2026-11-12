(() => {
  'use strict';

  const REPO_URL = 'https://github.com/Elapse-Li/can-ai-do-this';

  const DIMS = [
    {
      key: 'repeat',
      name: '重复度',
      max: 20,
      q: '这活你多久做一次？',
      hint: '越重复，越值得交给 AI 做成固定流程。',
      options: [
        { v: 20, label: '每天都做，甚至一天几次', short: '每天重复' },
        { v: 15, label: '每周都要做', short: '每周重复' },
        { v: 8, label: '每月偶尔做', short: '每月偶发' },
        { v: 0, label: '基本只做这一次', short: '一次性任务' }
      ]
    },
    {
      key: 'verify',
      name: '可验收性',
      max: 25,
      q: '它做出来的东西，你能验证吗？',
      hint: '能核对，才敢让它独立干；只能凭感觉，就还得你盯着。',
      options: [
        { v: 25, label: '有原始材料，能逐条核对', short: '可逐项核对' },
        { v: 16, label: '能抽查，但没法全查', short: '只能抽查' },
        { v: 8, label: '只能凭经验感觉对不对', short: '凭经验判断' },
        { v: 0, label: '根本没法验证，只能信', short: '无法验证' }
      ]
    },
    {
      key: 'risk',
      name: '出错代价',
      max: 20,
      q: '如果它做错了，后果有多严重？',
      hint: '错了能改是小事，影响客户或合规就是大事。',
      options: [
        { v: 20, label: '错了改一下就行，不影响别人', short: '错了能改' },
        { v: 14, label: '会返工，但不会外溢', short: '返工可控' },
        { v: 6, label: '会影响客户、钱或合规', short: '影响对外' },
        { v: 0, label: '不可逆，出事就是事故', short: '不可逆' }
      ]
    },
    {
      key: 'privacy',
      name: '数据敏感度',
      max: 15,
      q: '你要给它看的数据，有多敏感？',
      hint: '先想清楚哪些能贴、哪些必须脱敏，再决定用不用。',
      options: [
        { v: 15, label: '全是公开信息', short: '来源版权' },
        { v: 9, label: '内部一般资料，泄露了有点尴尬', short: '内部资料泄露' },
        { v: 3, label: '客户信息、个人信息、合同', short: '客户信息泄露' },
        { v: 0, label: '密钥、密码、核心机密', short: '核心机密泄露' }
      ]
    },
    {
      key: 'spec',
      name: '标准明确度',
      max: 20,
      q: '什么样算“做好了”，说得清吗？',
      hint: '有模板和样例，AI 才有着力点；“看着办”最难办。',
      options: [
        { v: 20, label: '有模板、样例、明确规范', short: '模板清晰' },
        { v: 13, label: '有大致要求，细节靠发挥', short: '要求模糊' },
        { v: 5, label: '领导一句“看着办”', short: '全凭感觉' },
        { v: 0, label: '要靠审美、人情、临场判断', short: '靠人情判断' }
      ]
    }
  ];

  const VERDICTS = [
    { min: 85, label: '直接转正', line: 'AI 主办，你签字。', color: '#3d6b4f' },
    { min: 65, label: '试用期', line: 'AI 出活，你挑刺。', color: '#a8792c' },
    { min: 45, label: '实习生', line: '只能打杂，别给 Key。', color: '#4a5866' },
    { min: 25, label: '外聘顾问', line: '只准动嘴，不准动手。', color: '#6f675b' },
    { min: 0, label: '永不录用', line: '这活它碰了要出事。', color: '#b23b2e' }
  ];

  const state = {
    step: 0,
    task: '',
    answers: {},
    result: null
  };

  const quizEl = document.getElementById('quiz');
  const resultEl = document.getElementById('result');
  const heroEl = document.getElementById('hero');

  // ---------- 小工具 ----------

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return {
      short: `${d.getFullYear()}.${pad(d.getMonth() + 1)}`,
      full: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    };
  }

  function serialFor(task, score) {
    let hash = 7;
    for (const char of `${task}${score}`) {
      hash = (hash * 31 + char.codePointAt(0)) % 900;
    }
    return String(hash + 100);
  }

  // ---------- 问卷 ----------

  function renderQuiz() {
    if (state.step === 0) {
      quizEl.innerHTML = `
        <div class="quiz-head">
          <span>任务登记</span>
          <span class="quiz-step">第 1 / 6 步</span>
        </div>
        <h2 class="quiz-q">你要评估的活是什么？</h2>
        <p class="quiz-hint">一句话就行，比如「写周报」「整理会议纪要」「分析销售表」。</p>
        <label class="sr-only" for="task-input">任务名称</label>
        <input id="task-input" class="task-input" maxlength="24" placeholder="例如：写周报" autocomplete="off">
        <div class="quiz-actions">
          <button class="btn btn-primary" id="start-btn" type="button">开始评估 <span>→</span></button>
        </div>
        <p class="quiz-foot">5 个问题 · 约 30 秒 · 不上传任何数据</p>
      `;

      const input = document.getElementById('task-input');
      input.value = state.task;
      input.focus({ preventScroll: true });

      const start = () => {
        const value = input.value.trim();
        if (!value) {
          input.classList.add('shake');
          input.focus();
          window.setTimeout(() => input.classList.remove('shake'), 420);
          return;
        }
        state.task = value.slice(0, 24);
        state.step = 1;
        renderQuiz();
      };

      document.getElementById('start-btn').addEventListener('click', start);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') start();
      });
      return;
    }

    const dim = DIMS[state.step - 1];
    const selected = state.answers[dim.key];
    let locked = false;

    quizEl.innerHTML = `
      <div class="quiz-head">
        <span>任务登记 · ${esc(state.task)}</span>
        <span class="quiz-step">第 ${state.step + 1} / 6 步</span>
      </div>
      <div class="progress" aria-hidden="true">
        ${DIMS.map((_, index) => `<span class="seg ${index < state.step ? 'on' : ''}"></span>`).join('')}
      </div>
      <p class="quiz-dim">${dim.name} · ${dim.max} 分</p>
      <h2 class="quiz-q">${dim.q}</h2>
      <p class="quiz-hint">${dim.hint}</p>
      <div class="options" role="group" aria-label="${dim.q}">
        ${dim.options.map((option, index) => `
          <button class="opt ${selected && selected.i === index ? 'sel' : ''}" type="button" data-i="${index}">
            <span class="mark">${String.fromCharCode(65 + index)}</span>
            <span class="opt-label">${option.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-actions">
        <button class="btn btn-ghost" id="back-btn" type="button">← ${state.step === 1 ? '改岗位' : '上一题'}</button>
      </div>
    `;

    quizEl.querySelectorAll('.opt').forEach((button) => {
      button.addEventListener('click', () => {
        if (locked) return;
        locked = true;

        const index = Number(button.dataset.i);
        state.answers[dim.key] = { ...dim.options[index], i: index };
        quizEl.querySelectorAll('.opt').forEach((item) => item.classList.remove('sel'));
        button.classList.add('sel');

        window.setTimeout(() => {
          if (state.step < DIMS.length) {
            state.step += 1;
            renderQuiz();
          } else {
            finish();
          }
        }, 190);
      });
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      state.step -= 1;
      renderQuiz();
    });
  }

  // ---------- 计算 ----------

  function buildChecks(dims) {
    const byKey = Object.fromEntries(dims.map((dim) => [dim.key, dim]));
    const checks = ['数字、人名、时间必须回原始材料核对'];

    if (byKey.privacy.pct <= 0.6) checks.push('敏感数据先脱敏再上传');
    if (byKey.verify.pct <= 0.64) checks.push('结论逐条回原文核对');
    if (byKey.risk.pct <= 0.7) checks.push('对外发布前人工终审');
    if (byKey.spec.pct <= 0.65) checks.push('先给模板和样例，再让它动手');
    if (byKey.repeat.pct <= 0.4) checks.push('先确认这事值不值得做成固定流程');

    return [...new Set(checks)].slice(0, 3);
  }

  function buildComment(verdict, risks) {
    const weakSpot = risks[0] ? risks[0].short : '';

    if (verdict.label === '直接转正') {
      return weakSpot
        ? `这活可以放心交，盯住「${weakSpot}」就行。`
        : '这活可以放心交，记得偶尔去看看它。';
    }
    if (verdict.label === '试用期') {
      return weakSpot
        ? `能用，但「${weakSpot}」这条你得盯紧。`
        : '能用，但关键结论你得自己核。';
    }
    if (verdict.label === '实习生') {
      return weakSpot
        ? `只配打杂，「${weakSpot}」别让它碰。`
        : '只配打杂，关键判断你自己来。';
    }
    if (verdict.label === '外聘顾问') {
      return '让它出出主意就行，动手就算了。';
    }
    return '这活它碰了要出事，人类亲自上。';
  }

  function redlineFor(privacyScore) {
    if (privacyScore >= 15) {
      return '公开信息也要检查版权和来源，别把「网上找的」直接当事实。';
    }
    if (privacyScore >= 9) {
      return '内部资料先去掉客户名、价格、未公开计划，再交给 AI。';
    }
    if (privacyScore >= 3) {
      return '客户信息、个人信息、合同条款必须脱敏；只给完成任务所需的最小片段。';
    }
    return '密钥、密码、核心机密不要上传。涉及这类数据的任务，建议直接按「永不录用」处理。';
  }

  function promotionFor(score) {
    if (score >= 85) return '连续 2 周输出无需大改，把步骤固化成模板或工作流。';
    if (score >= 65) return '连续 3 次验收通过，返工时间低于 10 分钟，再扩大使用范围。';
    if (score >= 45) return '先只用于草稿和素材整理，关键交付仍由人完成。';
    if (score >= 25) return '只用于提问、列提纲、找反例，不接正式交付。';
    return '不建议使用；最多做头脑风暴，且不要输入敏感信息。';
  }

  function finish() {
    const dims = DIMS.map((dim) => {
      const answer = state.answers[dim.key];
      return {
        key: dim.key,
        name: dim.name,
        max: dim.max,
        v: answer.v,
        label: answer.label,
        short: answer.short,
        pct: answer.v / dim.max
      };
    });

    const score = dims.reduce((sum, dim) => sum + dim.v, 0);
    const verdict = VERDICTS.find((item) => score >= item.min);
    const sorted = [...dims].sort((a, b) => b.pct - a.pct);
    const strengths = sorted.filter((dim) => dim.pct >= 0.75).slice(0, 2);
    const risks = [...dims]
      .sort((a, b) => a.pct - b.pct)
      .filter((dim) => dim.pct <= 0.7)
      .slice(0, 2);

    const date = today();
    const result = {
      task: state.task,
      score,
      verdict,
      dims,
      strengths,
      risks,
      strengthText: strengths.length
        ? strengths.map((dim) => dim.short).join(' · ')
        : '暂无明显强项',
      riskText: risks.length
        ? risks.map((dim) => dim.short).join(' · ')
        : '暂无明显短板',
      checks: buildChecks(dims),
      comment: buildComment(verdict, risks),
      redline: redlineFor(dims.find((dim) => dim.key === 'privacy').v),
      promotion: promotionFor(score),
      serial: serialFor(state.task, score),
      dateShort: date.short,
      dateFull: date.full
    };

    state.result = result;
    renderResult(result);
  }

  // ---------- 结果页 ----------

  function seriousReport(result) {
    return `
      <div class="report">
        <div class="report-meta">
          <span>评估报告 / ASSESSMENT</span>
          <span>${result.dateFull}</span>
        </div>
        <h3>${esc(result.task)}</h3>
        <p class="report-summary">适配分 <strong>${result.score}/100</strong> · ${result.verdict.label}。${result.verdict.line}</p>

        <table class="score-table">
          <thead>
            <tr><th>维度</th><th>得分</th><th>依据</th></tr>
          </thead>
          <tbody>
            ${result.dims.map((dim) => `
              <tr>
                <th>${dim.name}<small>${dim.max} 分</small></th>
                <td>
                  <span class="bar"><i style="width:${Math.round(dim.pct * 100)}%;background:${result.verdict.color}"></i></span>
                  <b>${dim.v}</b>
                </td>
                <td>${esc(dim.label)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>上岗前必检</h4>
        <ul class="checklist">
          ${result.checks.map((check) => `<li>${esc(check)}</li>`).join('')}
        </ul>

        <h4>数据红线</h4>
        <p>${esc(result.redline)}</p>

        <h4>什么时候可以转正</h4>
        <p>${esc(result.promotion)}</p>

        <p class="report-foot">评分日期 ${result.dateFull} · 只评任务，不评人 · 玩笑不参与分数</p>
      </div>
    `;
  }

  function summaryText(result) {
    return [
      `【AI 用工评估】${result.task}`,
      `结论：${result.verdict.label}（${result.score}/100）`,
      `强项：${result.strengthText}`,
      `风险：${result.riskText}`,
      `必检：${result.checks.join('；')}`,
      `评语：${result.comment}`,
      '',
      `—— 这活能交给 AI 吗？${REPO_URL}`
    ].join('\n');
  }

  function renderResult(result) {
    heroEl.hidden = true;
    resultEl.hidden = false;

    resultEl.innerHTML = `
      <div class="wrap">
        <div class="result-head">
          <div>
            <p class="eyebrow">评估完成 · ${result.dateFull}</p>
            <h2 class="result-verdict" style="color:${result.verdict.color}">${result.verdict.label}</h2>
            <p class="result-line">${result.verdict.line} 适配分 <strong>${result.score}</strong>/100。</p>
          </div>
          <div class="score-big" aria-label="适配分 ${result.score} 分">${result.score}<span>/100</span></div>
        </div>

        <div class="result-grid">
          <div class="badge-col">
            <canvas id="badge" width="1080" height="1440" aria-label="AI 工牌：${esc(result.task)}，${result.verdict.label}，${result.score} 分"></canvas>
            <div class="badge-actions">
              <button class="btn btn-primary" id="download-btn" type="button">下载工牌 PNG</button>
              <button class="btn btn-ghost" id="copy-btn" type="button">复制结论</button>
            </div>
          </div>

          <div class="report-col">
            <div class="tabs" role="tablist" aria-label="查看方式">
              <button class="tab active" type="button" role="tab" aria-selected="true" data-tab="fun">工牌文案</button>
              <button class="tab" type="button" role="tab" aria-selected="false" data-tab="serious">严肃报告</button>
            </div>

            <div class="tab-panel" id="tab-fun">
              <p class="big-quote">“${esc(result.comment)}”</p>
              <dl class="facts-list">
                <div><dt>岗位</dt><dd>${esc(result.task)}</dd></div>
                <div><dt>结论</dt><dd style="color:${result.verdict.color};font-weight:700">${result.verdict.label}</dd></div>
                <div><dt>强项</dt><dd>${esc(result.strengthText)}</dd></div>
                <div><dt>风险</dt><dd>${esc(result.riskText)}</dd></div>
                <div><dt>必检</dt><dd>${result.checks.map((check) => esc(check)).join('；')}</dd></div>
              </dl>
              <p class="panel-note">这一段是玩笑。隔壁「严肃报告」里的分，是按规则算出来的。</p>
            </div>

            <div class="tab-panel" id="tab-serious" hidden>
              ${seriousReport(result)}
            </div>

            <div class="result-actions">
              <button class="btn btn-ghost" id="restart-btn" type="button">重新评估</button>
              <a class="btn btn-ghost" href="#jobs">看看别人家的活</a>
            </div>
          </div>
        </div>
      </div>
    `;

    resultEl.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        resultEl.querySelectorAll('.tab').forEach((item) => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        resultEl.querySelectorAll('.tab-panel').forEach((panel) => {
          panel.hidden = panel.id !== `tab-${tab.dataset.tab}`;
        });
      });
    });

    document.getElementById('download-btn').addEventListener('click', downloadBadge);
    document.getElementById('copy-btn').addEventListener('click', () => {
      copyText(summaryText(result)).then(() => toast('结论已复制'));
    });
    document.getElementById('restart-btn').addEventListener('click', restart);

    const canvas = document.getElementById('badge');
    window.requestAnimationFrame(() => drawBadge(canvas, result));
    window.scrollTo(0, 0);
  }

  function restart() {
    state.step = 0;
    state.task = '';
    state.answers = {};
    state.result = null;

    resultEl.hidden = true;
    heroEl.hidden = false;
    renderQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- 工牌绘制 ----------

  const CANVAS_FONT = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif';

  function setFont(ctx, size, weight = '400') {
    ctx.font = `${weight} ${size}px ${CANVAS_FONT}`;
  }

  function wrapLines(ctx, text, maxWidth) {
    const lines = [];
    let line = '';

    for (const char of Array.from(String(text))) {
      if (char === '\n') {
        lines.push(line);
        line = '';
        continue;
      }
      const next = line + char;
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }

    if (line) lines.push(line);
    return lines;
  }

  function drawField(ctx, label, value, x, y, width, maxLines = 2) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6f675b';
    setFont(ctx, 18, '600');
    ctx.fillText(label, x, y);

    ctx.fillStyle = '#231f1a';
    setFont(ctx, 30, '500');
    wrapLines(ctx, value, width).slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, x, y + 46 + index * 40);
    });
  }

  function drawStamp(ctx, cx, cy, radius, label, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.14);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    setFont(ctx, 50, '700');
    ctx.fillText(label, 0, -6);
    setFont(ctx, 16, '600');
    ctx.fillText('A I   A S S E S S E D', 0, 52);

    ctx.restore();
  }

  function drawBarcode(ctx, x, y, width, height, seed) {
    let value = Number(seed) || 7;
    let cursor = x;

    while (cursor < x + width) {
      value = (value * 9301 + 49297) % 233280;
      const barWidth = 1 + (value % 5);
      if ((value >> 3) % 2 === 0) {
        ctx.fillStyle = '#231f1a';
        ctx.fillRect(cursor, y, barWidth, height);
      }
      cursor += barWidth + 1 + (value % 3);
    }
  }

  function drawBadge(canvas, result) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const ink = '#231f1a';
    const muted = '#6f675b';
    const paper = '#f7f2e7';
    const color = result.verdict.color;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(35, 31, 26, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 40; y < H; y += 46) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, W - 68, H - 68);

    ctx.setLineDash([9, 7]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, W - 104, H - 104);
    ctx.setLineDash([]);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = ink;
    setFont(ctx, 34, '700');
    ctx.fillText('AI 用工评估所', 78, 126);

    ctx.fillStyle = muted;
    setFont(ctx, 18, '500');
    ctx.fillText('AI LABOR ASSESSMENT OFFICE', 78, 158);

    ctx.textAlign = 'right';
    ctx.fillStyle = ink;
    setFont(ctx, 22, '600');
    ctx.fillText(`No. AI-${result.serial}`, W - 78, 126);

    ctx.fillStyle = muted;
    setFont(ctx, 18, '500');
    ctx.fillText(result.dateShort, W - 78, 158);
    ctx.textAlign = 'left';

    ctx.strokeStyle = 'rgba(35, 31, 26, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, 196);
    ctx.lineTo(W - 78, 196);
    ctx.stroke();

    ctx.fillStyle = muted;
    setFont(ctx, 18, '600');
    ctx.fillText('岗  位 / POSITION', 78, 250);

    let taskSize = 78;
    let taskLines = [];
    for (; taskSize >= 44; taskSize -= 4) {
      setFont(ctx, taskSize, '700');
      taskLines = wrapLines(ctx, result.task, 560);
      if (taskLines.length <= 2) break;
    }

    ctx.fillStyle = ink;
    taskLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 78, 330 + index * (taskSize + 10));
    });

    drawStamp(ctx, W - 240, 410, 140, result.verdict.label, color);

    const scoreY = 640;
    ctx.fillStyle = ink;
    setFont(ctx, 176, '700');
    const scoreText = String(result.score);
    ctx.fillText(scoreText, 78, scoreY);

    const scoreWidth = ctx.measureText(scoreText).width;
    ctx.fillStyle = muted;
    setFont(ctx, 34, '500');
    ctx.fillText('/ 100', 78 + scoreWidth + 16, scoreY - 10);

    ctx.fillStyle = color;
    setFont(ctx, 40, '700');
    ctx.fillText(result.verdict.label, 78, scoreY + 78);

    ctx.fillStyle = muted;
    setFont(ctx, 20, '500');
    ctx.fillText('适配分 / AI FITNESS SCORE', 78, scoreY + 116);

    ctx.strokeStyle = 'rgba(35, 31, 26, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, 800);
    ctx.lineTo(W - 78, 800);
    ctx.stroke();

    drawField(ctx, '强项 / STRENGTHS', result.strengthText, 78, 860, 420);
    drawField(ctx, '风险 / RISKS', result.riskText, 560, 860, 420);
    drawField(ctx, '上岗前必检 / MUST CHECK', result.checks.join('；'), 78, 1010, 924);

    ctx.fillStyle = ink;
    setFont(ctx, 32, '500');
    wrapLines(ctx, `“${result.comment}”`, 910).slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 78, 1180 + index * 48);
    });

    ctx.strokeStyle = 'rgba(35, 31, 26, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, 1300);
    ctx.lineTo(W - 78, 1300);
    ctx.stroke();

    ctx.fillStyle = muted;
    setFont(ctx, 18, '500');
    ctx.fillText('5 维评分 · 玩笑不参与打分 · 不构成裁员建议', 78, 1345);

    drawBarcode(ctx, W - 330, 1318, 250, 46, result.serial);
  }

  // ---------- 下载 / 复制 ----------

  function downloadBadge() {
    const canvas = document.getElementById('badge');
    if (!canvas || !state.result) return;

    const safeTask = state.result.task.replace(/[\\/:*?"<>|\s]+/g, '-');
    const filename = `AI工牌-${safeTask}-${state.result.score}分.png`;

    canvas.toBlob((blob) => {
      if (!blob) {
        toast('导出失败，请换个浏览器试试');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
    } catch (error) {
      // 忽略：下面会提示复制失败
    }
    area.remove();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    fallbackCopy(text);
    return Promise.resolve();
  }

  let toastTimer;

  function toast(message) {
    let element = document.querySelector('.toast');
    if (!element) {
      element = document.createElement('div');
      element.className = 'toast';
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove('show'), 1800);
  }

  // ---------- 启动 ----------

  function init() {
    document.getElementById('year').textContent = new Date().getFullYear();

    if (REPO_URL.includes('yourname')) {
      console.warn('[can-ai-do-this] REPO_URL 还是占位符，发布前请在 assets/app.js 里改成你的仓库地址。');
    } else {
      const repo = REPO_URL.replace(/\/$/, '');
      const repoLink = document.getElementById('repo-link');
      if (repoLink) repoLink.href = repo;

      document.querySelectorAll('[data-repo-path]').forEach((link) => {
        link.href = `${repo}/blob/main/${link.dataset.repoPath}`;
        link.target = '_blank';
        link.rel = 'noopener';
      });
    }

    const taskParam = new URLSearchParams(window.location.search).get('task');
    if (taskParam) {
      state.task = taskParam.trim().slice(0, 24);
    }

    renderQuiz();
  }

  init();
})();
