(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menu = $('[data-menu]');
  const menuButton = $('[data-menu-toggle]');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menu?.classList.toggle('is-open', open);
  });
  $$('a', menu || document.createElement('div')).forEach(link => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('is-open');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menuButton?.setAttribute('aria-expanded', 'false');
      menu?.classList.remove('is-open');
    }
  });

  $$('[data-repository]').forEach(link => {
    const address = window.PORTFOLIO_LINKS?.[link.dataset.repository]?.repository;
    if (address) {
      link.href = address;
      link.hidden = false;
    }
  });
  $$('[data-download]').forEach(link => {
    const project = link.dataset.download;
    const address = window.PORTFOLIO_LINKS?.[project]?.release;
    const local = location.protocol === 'file:' || ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
    if (address) {
      link.href = address;
      link.hidden = false;
    } else if (local) {
      link.href = location.protocol === 'file:'
        ? `../release-assets/${project}/${link.dataset.filename}`
        : `downloads/${project}/${link.dataset.filename}`;
      link.setAttribute('download', link.dataset.filename);
      link.hidden = false;
    }
  });

  const viewer = $('[data-image-dialog]');
  $$('[data-view-image]').forEach(button => button.addEventListener('click', () => {
    const image = $('img', viewer);
    image.src = button.dataset.viewImage;
    image.alt = button.dataset.caption || button.getAttribute('aria-label') || '';
    $('[data-image-caption]', viewer).textContent = image.alt;
    viewer.showModal();
  }));
  $('[data-close-image]', viewer || document)?.addEventListener('click', () => viewer.close());
  viewer?.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });

  const cardStudy = $('[data-card-study]');
  if (cardStudy) {
    let counters = 2;
    let mode = 'heal';
    const render = () => {
      if (counters < 3) mode = 'heal';
      $$('[data-counter]', cardStudy).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.counter) === counters)));
      $$('[data-mode]', cardStudy).forEach(button => {
        button.disabled = button.dataset.mode === 'growth' && counters < 3;
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      });
      $('[data-counter-value]', cardStudy).textContent = counters;
      $('[data-counter-dots]', cardStudy).innerHTML = Array.from({ length: counters }, () => '<i aria-hidden="true"></i>').join('');
      $('[data-threshold-status]', cardStudy).textContent = counters < 3 ? '当前采用基础回复' : '门槛达成，开放另一种用法';
      $('[data-effect-speed]', cardStudy).textContent = mode === 'growth' ? '3' : '2';
      $('[data-effect-title]', cardStudy).textContent = mode === 'growth' ? '让之后的回复继续积累' : '目标牌手获得 2 点生命';
      $('[data-effect-text]', cardStudy).textContent = mode === 'growth'
        ? '自己获得持续能力：当你获得生命时，获得等量的生命指示物。'
        : '按基础模式结算本次回复。满足门槛后，也可以继续选择这一模式。';
      $('[data-effect-after]', cardStudy).textContent = mode === 'growth'
        ? `生命指示物仍为 ${counters} 个；本次基础回复被持续能力替换。`
        : `生命指示物仍为 ${counters} 个。`;
      cardStudy.dataset.currentMode = mode;
    };
    $$('[data-counter]', cardStudy).forEach(button => button.addEventListener('click', () => { counters = Number(button.dataset.counter); render(); }));
    $$('[data-mode]', cardStudy).forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; render(); }));
    render();
  }

  $$('[data-compare]').forEach(compare => {
    const input = $('input[type="range"]', compare);
    const update = () => {
      compare.style.setProperty('--compare', `${input.value}%`);
      input.setAttribute('aria-valuetext', `源图显示 ${input.value}%，其余为后继图`);
    };
    input.addEventListener('input', update);
    update();
  });

  const research = $('[data-research-example]');
  if (research) {
    const stages = [
      { title: '先记下研究从哪里出发', focus: '不同 TCG 如何组织资源与出牌选择？', material: '从规则文本与具体牌例开始', open: '资源取得、出牌限制与后继选择怎样相接？', next: '选择一条关系，展开局部阅读。' },
      { title: '新材料更新当前理解', focus: '资源可以承担门槛、支付与后续机会', material: '把读到的规则与采用理由留在记录里', open: '当前解释对其他对象是否仍成立？', next: '保留线索与缺口，继续比较。' },
      { title: '回到整体，重选下一段投入', focus: '当前深入怎样回答最初的问题？', material: '同时回看已有认识、来源与实际投入', open: '还有哪些重要关系值得展开？', next: '比较继续深入与转向新对象的收益。' }
    ];
    $$('[data-research-stage]', research).forEach(button => button.addEventListener('click', () => {
      const selected = Number(button.dataset.researchStage);
      const stage = stages[selected];
      $$('[data-research-stage]', research).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      Object.entries(stage).forEach(([key, value]) => {
        const element = $(`[data-research-${key}]`, research);
        if (element) element.textContent = value;
      });
    }));
  }

  const concept = $('[data-concept-model]');
  if (concept) {
    const views = {
      rules: { heading: '由规则关系，推到可行选择', detail: '「越养越香」开放后继积累，「我忍够了」改变速度与伤害，「我也肉疼」兑现现有资源。理解这些联系，才有比较当前收益与未来机会的依据。' },
      framework: { heading: '共同支撑，承接不同内容', detail: '同一牌体在组牌、手牌、速度条与详情中继续保持身份；共同框架承接阅读与交互，具体图像、背纹和内容仍可发展。' }
    };
    $$('[data-concept-view]', concept).forEach(button => button.addEventListener('click', () => {
      const view = button.dataset.conceptView;
      $$('[data-concept-view]', concept).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $$('[data-model-panel]', concept).forEach(panel => panel.hidden = panel.dataset.modelPanel !== view);
      $('[data-model-heading]', concept).textContent = views[view].heading;
      $('[data-model-detail]', concept).textContent = views[view].detail;
    }));
  }
})();
