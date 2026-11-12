(() => {
  'use strict';

  const DATA = window.RADAR_DATA;
  const REPO = 'https://github.com/Elapse-Li/can-ai-do-this';
  const CACHE_PREFIX = 'radar:v4:';
  const CACHE_TTL = 10 * 60 * 1000;

  const state = {
    category: 'all',
    query: '',
    internal: [],
    github: {
      status: 'idle',
      items: [],
      error: '',
      cachedAt: 0,
      fromCache: false,
      remaining: null
    },
    request: 0
  };

  const els = {
    input: document.getElementById('radar-q'),
    form: document.getElementById('search-form'),
    chips: document.getElementById('category-chips'),
    internalBlock: document.getElementById('internal-block'),
    internalGrid: document.getElementById('internal-grid'),
    internalCount: document.getElementById('internal-count'),
    curatedGrid: document.getElementById('curated-grid'),
    curatedCount: document.getElementById('curated-count'),
    githubBlock: document.getElementById('github-block'),
    githubGrid: document.getElementById('github-grid'),
    githubCount: document.getElementById('github-count'),
    githubNote: document.getElementById('github-note'),
    elsewhereGrid: document.getElementById('elsewhere-grid'),
    queryText: document.getElementById('query-text'),
    copyQuery: document.getElementById('copy-query'),
    year: document.getElementById('year')
  };

  if (!DATA) {
    console.error('[radar] window.RADAR_DATA is missing');
    return;
  }

  // ---------- 工具 ----------

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function catById(id) {
    return DATA.categories.find((cat) => cat.id === id);
  }

  function currentCat() {
    return catById(state.category);
  }

  function effectiveLabel() {
    if (state.query) return state.query;
    const cat = currentCat();
    return cat ? cat.label : 'AI 工作流';
  }

  function hasCJK(text) {
    return /[\u4e00-\u9fff]/.test(text);
  }

  function aliasFor(query) {
    const text = query.toLowerCase();
    const alias = (DATA.queryAliases || []).find((item) =>
      item.match.some((term) => text.includes(term.toLowerCase()))
    );
    return alias ? alias.query : '';
  }

  function githubQuery() {
    const generic = /^(ai|aigc|人工智能)$/i;
    if (state.query && !generic.test(state.query.trim())) {
      if (hasCJK(state.query)) {
        return aliasFor(state.query) || (currentCat() ? currentCat().githubQuery : '');
      }
      return state.query;
    }
    const cat = currentCat();
    if (cat) return cat.githubQuery;
    return state.query;
  }

  function fmtStars(value) {
    const stars = Number(value) || 0;
    if (stars >= 10000) return `${(stars / 10000).toFixed(1).replace(/\.0$/, '')}万`;
    if (stars >= 1000) return `${(stars / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return String(stars);
  }

  function fmtDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
  }

  function timeAgo(timestamp) {
    const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    return `${Math.round(minutes / 60)} 小时前`;
  }

  function matchesText(item, query) {
    const haystack = [
      item.title,
      item.description,
      item.why,
      item.summary,
      ...(item.tags || []),
      ...(item.categories || []),
      item.type,
      item.source
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function matchesCategory(item, categoryId) {
    if (categoryId === 'all') return true;
    if (item.universal) return true;
    return (item.categories || []).includes(categoryId);
  }

  function verdictColor(score) {
    if (score >= 85) return '#3d6b4f';
    if (score >= 65) return '#a8792c';
    if (score >= 45) return '#4a5866';
    if (score >= 25) return '#6f675b';
    return '#b23b2e';
  }

  function githubSearchUrl(query) {
    return `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    fallbackCopy(text);
    return Promise.resolve();
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
      // 忽略：复制失败时用户仍可手动选中
    }
    area.remove();
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

  // ---------- 渲染：类别 ----------

  function renderChips() {
    const items = [{ id: 'all', label: '全部', hint: '不限定类别' }, ...DATA.categories];
    els.chips.innerHTML = items.map((cat) => `
      <button class="chip ${state.category === cat.id ? 'active' : ''}" type="button" data-cat="${cat.id}" title="${esc(cat.hint)}">
        ${esc(cat.label)}
      </button>
    `).join('');

    els.chips.querySelectorAll('.chip').forEach((button) => {
      button.addEventListener('click', () => {
        state.category = button.dataset.cat;
        renderChips();
        updateUrl();

        if (state.query || state.category !== 'all') {
          runSearch();
        } else {
          resetGithub();
          renderAll();
        }
      });
    });
  }

  // ---------- 渲染：本站工牌 ----------

  function scenarioCard(scenario) {
    const url = `${REPO}/blob/main/${scenario.path}`;
    const color = verdictColor(scenario.score);
    return `
      <article class="radar-card">
        <div class="card-top">
          <span class="source-badge local">本站工牌</span>
          <span class="card-meta">${esc(scenario.verdict)}</span>
        </div>
        <h3><a href="${esc(url)}" target="_blank" rel="noopener">${esc(scenario.title)}</a></h3>
        <p>${esc(scenario.summary)}</p>
        <div class="mini-score" style="color:${color}">${scenario.score}<span>/100</span></div>
        <div class="card-actions">
          <a class="text-link" href="${esc(url)}" target="_blank" rel="noopener">看工牌报告 ↗</a>
          <a class="text-link" href="index.html?task=${encodeURIComponent(scenario.title)}">做张同款 →</a>
        </div>
      </article>
    `;
  }

  function renderInternal() {
    if (!state.internal.length) {
      els.internalBlock.hidden = true;
      return;
    }

    const query = state.query.toLowerCase();
    const items = state.internal.filter((scenario) => {
      if (!matchesCategory(scenario, state.category)) return false;
      if (!query) return true;
      return matchesText({
        title: scenario.title,
        description: scenario.summary,
        tags: scenario.tags
      }, query);
    });

    els.internalBlock.hidden = items.length === 0;
    els.internalCount.textContent = items.length ? `${items.length} 张` : '';
    els.internalGrid.innerHTML = items.map(scenarioCard).join('');
  }

  // ---------- 渲染：精选清单 ----------

  function sourceCard(source) {
    const stars = source.stars ? ` · ★ ${fmtStars(source.stars)}` : '';
    const updated = source.updated
      ? (source.updated === '持续更新' ? '持续更新' : `更新 ${source.updated}`)
      : '';

    return `
      <article class="radar-card">
        <div class="card-top">
          <span class="source-badge">${esc(source.source)}</span>
          <span class="card-meta">${esc(source.type)}${stars}</span>
        </div>
        <h3><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)}</a></h3>
        <p class="desc">${esc(source.description)}</p>
        <p class="why">为什么看它：${esc(source.why)}</p>
        <p class="caveat">注意：${esc(source.caveat)}</p>
        <div class="card-actions">
          <a class="text-link" href="${esc(source.url)}" target="_blank" rel="noopener">打开 ↗</a>
          <span class="card-meta">${esc(updated)}</span>
        </div>
      </article>
    `;
  }

  function renderCurated() {
    const items = DATA.sources.filter((source) => matchesCategory(source, state.category));
    els.curatedCount.textContent = `${items.length} 个`;

    if (!items.length) {
      els.curatedGrid.innerHTML = '<div class="empty">这个类别暂时没有精选清单。试试 GitHub 搜索，或去别处搜。</div>';
      return;
    }

    els.curatedGrid.innerHTML = items.map(sourceCard).join('');
  }

  // ---------- 渲染：GitHub ----------

  function githubCard(item) {
    const topics = (item.topics || []).slice(0, 3);
    return `
      <article class="radar-card">
        <div class="card-top">
          <span class="source-badge">GitHub</span>
          <span class="card-meta">★ ${fmtStars(item.stars)} · ${esc(item.language || '未知语言')} · 更新 ${esc(fmtDate(item.updated))}</span>
        </div>
        <h3><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.fullName)}</a></h3>
        <p class="desc">${esc(item.description || '没有描述，点开自己判断。')}</p>
        ${topics.length ? `<div class="tag-row">${topics.map((topic) => `<span class="tag">${esc(topic)}</span>`).join('')}</div>` : ''}
        <div class="card-actions">
          <a class="text-link" href="${esc(item.url)}" target="_blank" rel="noopener">打开 GitHub ↗</a>
          <a class="text-link" href="index.html?task=${encodeURIComponent(item.name)}">用它做张工牌 →</a>
        </div>
      </article>
    `;
  }

  function renderGithub() {
    const github = state.github;

    if (github.status === 'idle') {
      els.githubBlock.hidden = true;
      return;
    }

    els.githubBlock.hidden = false;

    if (github.status === 'loading') {
      els.githubCount.textContent = '';
      els.githubNote.textContent = `正在 GitHub 搜“${effectiveLabel()}”…`;
      els.githubGrid.innerHTML = '<div class="loading-card"><span class="dot"></span>正在找，通常几秒。</div>';
      return;
    }

    if (github.status === 'error') {
      els.githubCount.textContent = '';
      els.githubNote.textContent = '';
      els.githubGrid.innerHTML = `
        <div class="github-error">
          ${esc(github.error)}<br>
          <a href="${githubSearchUrl(githubQuery() || effectiveLabel())}" target="_blank" rel="noopener">直接去 GitHub 搜 ↗</a>
        </div>
      `;
      return;
    }

    const actual = githubQuery();
    const label = state.query
      ? (actual && actual !== state.query ? `英文关键词：${actual}` : `关键词：${state.query}`)
      : `类别：${currentCat() ? currentCat().label : '全部'}`;
    const parts = ['最佳匹配', label, '未人工验证'];
    if (github.fromCache) parts.push(`缓存于 ${timeAgo(github.cachedAt)}`);
    if (github.remaining != null) parts.push(`本次剩余 ${github.remaining} 次`);
    els.githubNote.textContent = parts.join(' · ');
    els.githubCount.textContent = `${github.items.length} 个`;

    if (!github.items.length) {
      const cat = currentCat();
      const canRetry = cat && /[\u4e00-\u9fff]/.test(state.query);
      els.githubGrid.innerHTML = `
        <div class="empty">
          没找到。换个词，或者去别处搜。
          ${canRetry ? `<br><button class="radar-retry" type="button" id="retry-en">用英文再搜：${esc(cat.githubQuery)}</button>` : ''}
        </div>
      `;
      const retry = document.getElementById('retry-en');
      if (retry) {
        retry.addEventListener('click', () => {
          state.query = cat.githubQuery;
          els.input.value = state.query;
          updateUrl();
          runSearch();
        });
      }
      return;
    }

    els.githubGrid.innerHTML = github.items.map(githubCard).join('');
  }

  // ---------- 渲染：去别处搜 ----------

  function renderElsewhere() {
    const subject = state.query || (currentCat() ? currentCat().label : '');
    const term = subject || 'AI 工作流';

    els.elsewhereGrid.innerHTML = DATA.searchEngines.map((engine) => {
      const suffix = subject ? (engine.suffix || '') : '';
      const href = engine.template.replace('{q}', encodeURIComponent(term + suffix));
      return `
        <a class="elsewhere-link" href="${href}" target="_blank" rel="noopener">
          ${esc(engine.label)}<span class="note">${esc(engine.note)}</span>
        </a>
      `;
    }).join('');

    const lines = subject
      ? [
          `${subject} AI 场景`,
          `${subject} AI 工作流`,
          `${subject} AI agent`,
          `site:github.com ${subject} AI`
        ]
      : [
          'AI 场景',
          'AI 工作流',
          'AI agent',
          'site:github.com AI workflow'
        ];

    els.queryText.textContent = lines.join('\n');
  }

  // ---------- 搜索 ----------

  function updateUrl() {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query);
    if (state.category !== 'all') params.set('cat', state.category);
    const next = params.toString();
    window.history.replaceState(null, '', next ? `${window.location.pathname}?${next}` : window.location.pathname);
  }

  function resetGithub() {
    state.github = {
      status: 'idle',
      items: [],
      error: '',
      cachedAt: 0,
      fromCache: false,
      remaining: null
    };
    renderGithub();
  }

  function readCache(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return null;
      if (Date.now() - parsed.ts > CACHE_TTL) {
        window.localStorage.removeItem(key);
        return null;
      }
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeCache(key, items) {
    try {
      window.localStorage.setItem(key, JSON.stringify({ ts: Date.now(), items }));
    } catch (error) {
      // 隐私模式或存储已满时忽略
    }
  }

  async function fetchGithub(query, cacheKey) {
    const request = ++state.request;
    const term = /\bAI\b/i.test(query) ? query : `${query} AI`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`${term} in:name,description fork:false archived:false`)}&per_page=8`;
    const generic = /^(ai|aigc|人工智能)$/i;
    const strict = Boolean(state.query) && !generic.test(state.query.trim());
    const tokens = query
      .toLowerCase()
      .split(/[\s,，]+/)
      .filter((token) => token.length >= 2 && !['ai', 'aigc', '人工智能'].includes(token));

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/vnd.github+json' }
      });
      const remainingHeader = response.headers.get('x-ratelimit-remaining');
      const remaining = remainingHeader == null ? null : Number(remainingHeader);

      if (request !== state.request) return;

      if (!response.ok) {
        const message = response.status === 403 || response.status === 429
          ? 'GitHub 搜索额度用完了（未登录 10 次/分钟）。等 10 分钟再试，或直接去 GitHub 搜。'
          : response.status === 422
            ? '这个关键词 GitHub 搜不了，换个词试试。'
            : `GitHub 返回 ${response.status}，稍后再试。`;
        state.github = {
          status: 'error',
          items: [],
          error: message,
          cachedAt: 0,
          fromCache: false,
          remaining
        };
        renderGithub();
        return;
      }

      const data = await response.json();
      if (request !== state.request) return;

      const items = (data.items || [])
        .filter((item) => !item.fork && !item.archived)
        .filter((item) => {
          if (!tokens.length) return true;
          const text = `${item.name} ${item.full_name} ${item.description || ''} ${(item.topics || []).join(' ')}`.toLowerCase();
          return strict
            ? tokens.every((token) => text.includes(token))
            : tokens.some((token) => text.includes(token));
        })
        .map((item) => ({
          name: item.name,
          fullName: item.full_name,
          url: item.html_url,
          description: item.description,
          stars: item.stargazers_count,
          language: item.language,
          updated: item.pushed_at,
          topics: item.topics || []
        }));

      state.github = {
        status: 'ready',
        items,
        error: '',
        cachedAt: 0,
        fromCache: false,
        remaining
      };
      writeCache(cacheKey, items);
      renderGithub();
    } catch (error) {
      if (request !== state.request) return;
      state.github = {
        status: 'error',
        items: [],
        error: error.name === 'AbortError'
          ? 'GitHub 响应太慢，稍后再试。先看精选清单，或直接去 GitHub 搜。'
          : '网络请求失败。先看精选清单，或直接去 GitHub 搜。',
        cachedAt: 0,
        fromCache: false,
        remaining: null
      };
      renderGithub();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function runSearch() {
    renderInternal();
    renderCurated();
    renderElsewhere();

    const main = document.querySelector('.radar-main');
    if (main) {
      main.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }

    if (state.query && /^(ai|aigc|人工智能)$/i.test(state.query.trim()) && !currentCat()) {
      state.github = {
        status: 'error',
        items: [],
        error: '关键词太宽泛了。加一个具体任务，比如「周报 AI」；或者先选一个类别。',
        cachedAt: 0,
        fromCache: false,
        remaining: null
      };
      renderGithub();
      return;
    }

    const raw = state.query.trim();
    if (raw && hasCJK(raw) && !aliasFor(raw) && !currentCat()) {
      state.github = {
        status: 'error',
        items: [],
        error: 'GitHub 对中文关键词支持有限。选一个类别，或换成英文关键词；中文使用经验可以先去小红书/知乎搜。',
        cachedAt: 0,
        fromCache: false,
        remaining: null
      };
      renderGithub();
      return;
    }

    const query = githubQuery();
    if (!query) {
      resetGithub();
      return;
    }

    const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}`;
    const cached = readCache(cacheKey);

    if (cached) {
      state.github = {
        status: 'ready',
        items: cached.items,
        error: '',
        cachedAt: cached.ts,
        fromCache: true,
        remaining: null
      };
      renderGithub();
      return;
    }

    state.github = {
      status: 'loading',
      items: [],
      error: '',
      cachedAt: 0,
      fromCache: false,
      remaining: null
    };
    renderGithub();
    fetchGithub(query, cacheKey);
  }

  function renderAll() {
    renderInternal();
    renderCurated();
    renderGithub();
    renderElsewhere();
  }

  async function loadInternal() {
    try {
      const response = await fetch('data/scenarios.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('fetch failed');
      const data = await response.json();
      state.internal = Array.isArray(data.scenarios) ? data.scenarios : [];
    } catch (error) {
      state.internal = [];
    }
    renderInternal();
  }

  // ---------- 启动 ----------

  function init() {
    els.year.textContent = new Date().getFullYear();

    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const category = params.get('cat') || 'all';

    state.query = query;
    state.category = DATA.categories.some((cat) => cat.id === category) ? category : 'all';
    els.input.value = state.query;

    renderChips();
    renderAll();
    loadInternal();

    els.form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.query = els.input.value.trim();
      updateUrl();

      if (!state.query && state.category === 'all') {
        resetGithub();
        renderAll();
        return;
      }

      runSearch();
    });

    els.copyQuery.addEventListener('click', () => {
      copyText(els.queryText.textContent).then(() => toast('检索式已复制'));
    });

    if (state.query || state.category !== 'all') {
      runSearch();
    }
  }

  init();
})();
