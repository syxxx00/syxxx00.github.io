(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('[data-menu]'), menuButton = $('[data-menu-toggle]');
  const closeMenu = () => { menuButton?.setAttribute('aria-expanded', 'false'); menu?.classList.remove('is-open'); };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open)); menu?.classList.toggle('is-open', open);
  });
  $$('a', menu || document.createElement('div')).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  $$('[data-repository]').forEach(link => {
    const address = window.PORTFOLIO_LINKS?.[link.dataset.repository]?.repository;
    if (address) { link.href = address; link.hidden = false; }
  });
  $$('[data-itch]').forEach(link => {
    const address = window.PORTFOLIO_LINKS?.[link.dataset.itch]?.itch;
    if (address) { link.href = address; link.hidden = false; }
  });
  $$('[data-download]').forEach(link => {
    const project = link.dataset.download, address = window.PORTFOLIO_LINKS?.[project]?.release;
    const local = location.protocol === 'file:' || ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
    if (address) { link.href = address; link.hidden = false; }
    else if (local && link.dataset.filename && !(project === 'speed-card-game' && window.PORTFOLIO_LINKS?.[project]?.itch)) {
      link.href = location.protocol === 'file:' ? `../release-assets/${project}/${link.dataset.filename}` : `downloads/${project}/${link.dataset.filename}`;
      link.setAttribute('download', link.dataset.filename); link.hidden = false;
    }
  });
  const viewer = $('[data-image-dialog]'); let lastImageTrigger;
  $$('[data-view-image]').forEach(button => button.addEventListener('click', () => {
    if (!viewer) return;
    lastImageTrigger = button;
    const diagram = /\.svg(?:[?#]|$)/i.test(button.dataset.viewImage);
    viewer.classList.toggle('is-diagram', diagram);
    viewer.classList.toggle('is-original', diagram);
    const fit = $('[data-diagram-fit]', viewer);
    if (fit) { fit.hidden = !diagram; fit.textContent = '适应窗口'; fit.removeAttribute('aria-pressed'); }
    const image = $('img', viewer); image.src = button.dataset.viewImage; image.alt = button.dataset.caption || '';
    $('[data-image-caption]', viewer).textContent = image.alt; viewer.showModal();
    viewer.scrollTop = 0; viewer.scrollLeft = 0;
  }));
  $('[data-diagram-fit]', viewer || document)?.addEventListener('click', event => {
    const original = viewer.classList.toggle('is-original');
    event.currentTarget.textContent = original ? '适应窗口' : '放大阅读';
    viewer.scrollTop = 0; viewer.scrollLeft = 0;
  });
  $('[data-close-image]', viewer || document)?.addEventListener('click', () => viewer.close());
  viewer?.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer?.addEventListener('close', () => lastImageTrigger?.focus({preventScroll:true}));

  const original = $('[data-original-study]');
  if (original) {
    const render = counters => {
      const active = counters >= 4;
      $$('[data-original-counter]', original).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.originalCounter) === counters)));
      $('[data-original-value]', original).textContent = counters;
      $('[data-original-dots]', original).innerHTML = '<i></i>'.repeat(counters);
      $('[data-original-status]', original).textContent = active ? '门槛达成 · 转为爆发' : '基础模式 · 继续积累';
      $('[data-original-effect]', original).textContent = active ? '结算时对对手造成 5 点伤害' : '结算时获得 1 枚生命指示物';
      $('[data-original-speed]', original).textContent = active ? '6' : '2';
      $('[data-original-outcome]', original).textContent = active ? `释放条件成立，保留 ${counters} 枚指示物` : '为后续爆发准备资源';
    };
    $$('[data-original-counter]', original).forEach(button => button.addEventListener('click', () => render(Number(button.dataset.originalCounter)))); render(3);
  }
  const extension = $('[data-card-study]');
  if (extension) {
    let counters = 2, mode = 'heal';
    const render = () => {
      if (counters < 3) mode = 'heal';
      $$('[data-counter]', extension).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.counter) === counters)));
      $$('[data-mode]', extension).forEach(button => {
        button.disabled = button.dataset.mode === 'growth' && counters < 3;
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      });
      $('[data-threshold-status]', extension).textContent = counters < 3 ? '2 枚 · 基础回复' : `${counters} 枚 · 可选择持续积累`;
      $('[data-effect-speed]', extension).textContent = mode === 'growth' ? '3' : '2';
      $('[data-effect-title]', extension).textContent = mode === 'growth' ? '之后的回复，继续积累' : '目标牌手获得 2 点生命';
      $('[data-effect-text]', extension).textContent = mode === 'growth' ? '自己获得持续能力：当你获得生命时，获得等量的生命指示物。' : '达到门槛后，也可以继续选择基础模式。';
      $('[data-effect-after]', extension).textContent = mode === 'growth' ? `生命指示物仍为 ${counters} 个；本次基础回复被持续能力替换。` : `生命指示物仍为 ${counters} 个。`;
    };
    $$('[data-counter]', extension).forEach(button => button.addEventListener('click', () => { counters = Number(button.dataset.counter); render(); }));
    $$('[data-mode]', extension).forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; render(); })); render();
  }
  const branches = $('[data-branch-study]');
  if (branches) {
    const choices = {
      hold: {label:'A / 保留回应', heading:'保留回应，让前牌被移除。', hand:'3', counter:'0', life:'10 / 7', steps:['「杀一下」先结算，移除「换张看看」。','「突然不乖」结算时仍有 3 张手牌，对对手造成 3 点伤害。','「你先请」留在手中，供下一次回应。']},
      draw: {label:'B / 保护并抽牌', heading:'救下前牌，用新抽牌补回手牌条件。', hand:'3', counter:'0', life:'10 / 7', steps:['打出「你先请」，手牌降至 2；先把「换张看看」速度提高到 6。','「换张看看」先结算，得到 1 枚指示物并支付抽牌，手牌回到 3；随后「杀一下」失去目标。','「突然不乖」读到 3 张手牌，造成 3 点伤害。回应牌已用，换来一次抽牌。']},
      save: {label:'C / 保护并留资源', heading:'留下指示物，让后牌转为回复。', hand:'2', counter:'1', life:'13 / 10', steps:['打出「你先请」，手牌降至 2；先把「换张看看」速度提高到 6。','「换张看看」先结算，保留 1 枚指示物，本次不抽牌；随后「杀一下」失去目标。','「突然不乖」读到 2 张手牌，自己获得 3 点生命。']}
    };
    $$('[data-branch]', branches).forEach(button => button.addEventListener('click', () => {
      const choice = choices[button.dataset.branch];
      $$('[data-branch]', branches).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      ['label','heading','hand','counter','life'].forEach(key => $(`[data-branch-${key}]`, branches).textContent = choice[key]);
      $('[data-branch-steps]', branches).replaceChildren(...choice.steps.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    }));
  }
  $$('[data-compare]').forEach(compare => {
    const input = $('input[type=range]', compare);
    const update = () => { compare.style.setProperty('--compare', `${input.value}%`); input.setAttribute('aria-valuetext', `源图显示 ${input.value}%，其余为后继图`); };
    input.addEventListener('input', update); update();
  });
  $$('[data-model-tabs]').forEach(group => {
    $$('[data-model-tab]', group).forEach(button => button.addEventListener('click', () => {
      $$('[data-model-tab]', group).forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
      $$('[data-model-panel]', group).forEach(panel => { panel.hidden = panel.dataset.modelPanel !== button.dataset.modelTab; });
    }));
  });
})();
