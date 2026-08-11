(() => {
  const SOURCE_URL = './design-source/colors_and_type.css';
  const section = document.querySelector('#foundations');
  if(!section) return;

  const esc = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function extractBlock(css, selector){
    const start = css.indexOf(selector);
    if(start < 0) return '';
    const open = css.indexOf('{', start + selector.length);
    if(open < 0) return '';
    let depth = 0;
    for(let i = open; i < css.length; i += 1){
      if(css[i] === '{') depth += 1;
      if(css[i] === '}'){
        depth -= 1;
        if(depth === 0) return css.slice(open + 1, i);
      }
    }
    return '';
  }

  function parseVars(block){
    const vars = {};
    const clean = block.replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
    let match;
    while((match = re.exec(clean))) vars[match[1]] = match[2].trim();
    return vars;
  }

  function resolveValue(value, vars, depth = 0){
    if(!value || depth > 12) return value || '';
    return String(value).replace(/var\((--[a-zA-Z0-9-_]+)(?:\s*,\s*([^\)]+))?\)/g, (_, token, fallback) => {
      const next = vars[token] ?? fallback ?? `var(${token})`;
      return resolveValue(next, vars, depth + 1);
    });
  }

  const numericSuffix = token => {
    const match = token.match(/-(\d+)$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };

  function collectNumericScale(vars, prefix){
    return Object.keys(vars)
      .filter(key => key.startsWith(prefix) && /-\d+$/.test(key))
      .sort((a,b) => numericSuffix(a) - numericSuffix(b));
  }

  function luminance(hex){
    const match = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if(!match) return .2;
    const rgb = [0,2,4].map(i => parseInt(match[1].slice(i,i+2),16)/255)
      .map(v => v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4));
    return .2126*rgb[0] + .7152*rgb[1] + .0722*rgb[2];
  }

  function swatch(token, vars){
    const value = resolveValue(vars[token], vars);
    const suffix = token.split('-').pop();
    const light = luminance(value) > .58 ? ' is-light' : '';
    return `<div class="foundation-swatch${light}" style="--swatch:${esc(value)}"><div class="foundation-swatch-meta"><b>${esc(suffix)}</b><code>${esc(value)}</code></div></div>`;
  }

  function paletteRow(name, prefix, vars, note = ''){
    const tokens = collectNumericScale(vars, prefix);
    if(!tokens.length) return '';
    return `<div class="foundation-palette-row"><div class="foundation-palette-label"><b>${esc(name)}</b><span>${esc(note || `${tokens.length} primitives`)}</span></div><div class="foundation-swatches">${tokens.map(token => swatch(token, vars)).join('')}</div></div>`;
  }

  function semanticCard(label, token, vars){
    if(!(token in vars)) return '';
    const raw = vars[token];
    const resolved = resolveValue(raw, vars);
    return `<article class="semantic-card"><i class="semantic-chip" style="--semantic-color:${esc(resolved)}"></i><div class="semantic-copy"><b>${esc(label)}</b><code>${esc(token)}</code><small>${esc(raw)} → ${esc(resolved)}</small></div></article>`;
  }

  function tokenTable(tokens, vars){
    return `<div class="token-table">${tokens.filter(token => token in vars).map(token => `<div class="token-line"><b>${esc(token)}</b><code>${esc(resolveValue(vars[token],vars))}</code></div>`).join('')}</div>`;
  }

  function spacingCards(vars){
    const tokens = collectNumericScale(vars, '--com-space-');
    return `<div class="scale-grid">${tokens.map(token => {
      const value = resolveValue(vars[token], vars);
      const px = parseFloat(value) || 0;
      return `<article class="scale-card"><div><b>${esc(token.replace('--com-space-','space.'))}</b><code>${esc(value)}</code></div><i class="space-demo" style="width:${Math.max(2,Math.min(px*2.4,68))}px"></i></article>`;
    }).join('')}</div>`;
  }

  function radiusCards(vars){
    const tokens = collectNumericScale(vars, '--com-radius-');
    if(vars['--com-radius-pill']) tokens.push('--com-radius-pill');
    return `<div class="scale-grid">${tokens.map(token => {
      const value = resolveValue(vars[token], vars);
      const displayRadius = token.endsWith('pill') ? '999px' : value;
      return `<article class="scale-card"><div><b>${esc(token.replace('--com-radius-','radius.'))}</b><code>${esc(value)}</code></div><i class="radius-demo" style="border-radius:${esc(displayRadius)}"></i></article>`;
    }).join('')}</div>`;
  }

  function sizeCards(vars){
    const tokens = collectNumericScale(vars, '--com-size-');
    return `<div class="scale-grid">${tokens.map(token => `<article class="scale-card"><b>${esc(token.replace('--com-size-','size.'))}</b><code>${esc(resolveValue(vars[token],vars))}</code></article>`).join('')}</div>`;
  }

  function typeRows(vars){
    const types = [
      ['Caption','--type-caption','Aa · 注释信息'],
      ['Label Small','--type-label-small','Aa · 紧凑标签'],
      ['Body Small','--type-body-small','移动端辅助正文'],
      ['Label','--type-label','操作与控件标签'],
      ['Body','--type-body','正文用于持续阅读与信息描述'],
      ['Heading Small','--type-heading-small','局部标题'],
      ['Heading','--type-heading','章节与区块标题'],
      ['Title','--type-title','页面标题 Title'],
      ['Display','--type-display','关键标题 Display']
    ];
    return `<div class="type-list">${types.filter(([,token]) => token in vars).map(([name,token,sample]) => {
      const resolved = resolveValue(vars[token], vars);
      return `<div class="type-row"><div class="type-token"><b>${esc(name)}</b><code>${esc(token)}</code></div><div class="type-sample" style="font:${esc(resolved)}">${esc(sample)}</div><div class="type-value">${esc(resolved)}</div></div>`;
    }).join('')}</div>`;
  }

  function themeCard(label, vars){
    const get = token => resolveValue(vars[token], vars);
    const bg = get('--com-surface-page') || '#F7F8FC';
    const surface = get('--com-surface-default') || '#FFFFFF';
    const text = get('--com-text-primary') || '#252B3D';
    const muted = get('--com-text-secondary') || '#535D72';
    const border = get('--com-border-subtle') || '#E2E6F0';
    const primary = get('--com-action-primary') || '#5B5EF7';
    const strip = ['--com-surface-page','--com-surface-default','--com-text-primary','--com-action-primary'];
    return `<article class="theme-card"><div class="theme-canvas" style="--theme-bg:${esc(bg)};--theme-surface:${esc(surface)};--theme-text:${esc(text)};--theme-muted:${esc(muted)};--theme-border:${esc(border)};--theme-primary:${esc(primary)}"><div class="theme-canvas-head"><b>${esc(label)}</b><span>Semantic mapping</span></div><div class="theme-surface"><b>审批详情</b><p>表面、文字、边界与主动作都来自当前主题语义层。</p><span class="theme-action">确认提交</span><div class="theme-token-strip">${strip.map(token => `<i style="--c:${esc(get(token))}"></i>`).join('')}</div></div></div></article>`;
  }

  function render(css){
    const root = parseVars(extractBlock(css, ':root'));
    const darkOverride = parseVars(extractBlock(css, '.dark'));
    const comfortable = parseVars(extractBlock(css, '.density-comfortable'));
    const androidOverride = parseVars(extractBlock(css, '.platform-android'));
    const dark = {...root, ...darkOverride};

    const semanticTokens = [
      ['Text · Primary','--com-text-primary'],['Text · Secondary','--com-text-secondary'],['Text · Tertiary','--com-text-tertiary'],['Text · Brand','--com-text-brand'],
      ['Surface · Page','--com-surface-page'],['Surface · Default','--com-surface-default'],['Surface · Subtle','--com-surface-subtle'],['Surface · Selected','--com-surface-selected'],
      ['Border · Subtle','--com-border-subtle'],['Border · Default','--com-border-default'],['Border · Focused','--com-border-focused'],['Border · Error','--com-border-error'],
      ['Action · Primary','--com-action-primary'],['Action · Primary Pressed','--com-action-primary-pressed'],['Action · Secondary','--com-action-secondary'],['Action · Destructive','--com-action-destructive'],
      ['Status · Success','--com-status-success'],['Status · Warning','--com-status-warning'],['Status · Danger','--com-status-danger'],['Status · Info','--com-status-info']
    ];

    const densityTokens = ['--density-control-height','--density-control-height-lg','--density-padding-h','--density-padding-v','--density-gap','--density-content-inset','--density-section-gap','--density-field-label-gap','--density-field-helper-gap','--density-field-gap'];
    const radiusAliases = ['--radius-control','--radius-container','--radius-overlay','--radius-pill'];
    const iconTokens = ['--com-icon-size-sm','--com-icon-size-md','--com-icon-size-lg','--com-indicator-size-inline','--com-indicator-size-regular'];
    const borderTokens = ['--com-border-control','--com-border-focus'];
    const shadowTokens = ['--com-elevation-floating','--com-elevation-modal'];

    const primitiveColorCount = ['neutral','brand','accent','success','warning','danger']
      .flatMap(name => collectNumericScale(root, `--com-${name}-`)).length;
    const rootCount = Object.keys(root).length;

    section.classList.add('foundation-live');
    section.innerHTML = `<div class="wrap">
      <div class="foundation-head"><span class="foundation-head-index">02</span><div><h2>视觉基础 Foundations</h2><p>这里不维护第二份数值。所有展示均实时读取 <code>design-source/colors_and_type.css</code>，Human Docs 只负责把机器真相翻译成设计师、产品和研发可读的视觉规范。</p></div><span class="foundation-source-badge">Live Source</span></div>
      <div class="foundation-summary">
        <article><small>Source Variables</small><b>${rootCount}</b><span>:root 当前声明</span></article>
        <article><small>Color Primitives</small><b>${primitiveColorCount}</b><span>六组基础色阶</span></article>
        <article><small>Default Density</small><b>${esc(resolveValue(root['--density-control-height'],root) || '40px')}</b><span>Compact control</span></article>
        <article><small>Touch Target</small><b>${esc(resolveValue(root['--size-touch-ios'],root) || '44px')} / ${esc(resolveValue(root['--size-touch-android'],root) || '48px')}</b><span>iOS / Android</span></article>
      </div>
      <nav class="foundation-nav"><a href="#foundation-color">Color</a><a href="#foundation-type">Typography</a><a href="#foundation-space">Spacing & Size</a><a href="#foundation-radius">Radius & Elevation</a><a href="#foundation-density">Density & Platform</a><a href="#foundation-dark">Dark Theme</a></nav>

      <section class="foundation-block" id="foundation-color">
        <div class="foundation-block-head"><h3>Color</h3><p><b>Primitive</b> 提供稳定色阶，<b>Semantic</b> 决定界面角色。业务应该消费语义色，而不是直接拿某个色阶猜用途。</p></div>
        <div class="foundation-subtitle"><h4>Primitive palettes</h4><small>直接读取 --com-*-N</small></div>
        <div class="foundation-palette">
          ${paletteRow('Neutral','--com-neutral-',root,'冷调中性色')}
          ${paletteRow('Brand','--com-brand-',root,'Electric Indigo')}
          ${paletteRow('Accent','--com-accent-',root,'Cyan · 局部信号')}
          ${paletteRow('Success','--com-success-',root)}
          ${paletteRow('Warning','--com-warning-',root)}
          ${paletteRow('Danger','--com-danger-',root)}
        </div>
        <div class="foundation-subtitle"><h4>Semantic roles</h4><small>token → alias → resolved value</small></div>
        <div class="foundation-semantic-grid">${semanticTokens.map(([label,token]) => semanticCard(label,token,root)).join('')}</div>
      </section>

      <section class="foundation-block" id="foundation-type">
        <div class="foundation-block-head"><h3>Typography</h3><p>移动端排版使用系统 Sans。下面不是“推荐字号”，而是当前真相源里的 portable type aliases；样例也用解析后的真实 font shorthand 渲染。</p></div>
        ${typeRows(root)}
      </section>

      <section class="foundation-block" id="foundation-space">
        <div class="foundation-block-head"><h3>Spacing & Size</h3><p>Spacing 不是只列常用值：这里展示当前完整 scale。Size 单独承载控件高度、Touch Target 与结构尺寸，避免把“视觉大小”和“可点击面积”混成一件事。</p></div>
        <div class="foundation-subtitle"><h4>Spacing scale</h4><small>完整 primitive scale</small></div>${spacingCards(root)}
        <div class="foundation-two-col" style="margin-top:12px"><article class="foundation-panel"><h4>Control & touch sizes</h4>${sizeCards(root)}</article><article class="foundation-panel"><h4>Icon & indicator</h4>${tokenTable(iconTokens,root)}</article></div>
      </section>

      <section class="foundation-block" id="foundation-radius">
        <div class="foundation-block-head"><h3>Radius & Elevation</h3><p>圆角负责组件层级，阴影只表达真实悬浮关系。普通 Card / Button resting 态仍遵循 Flat-first。</p></div>
        <div class="foundation-subtitle"><h4>Radius primitives</h4><small>0 / 4 / 8 / 12 / 16 / pill</small></div>${radiusCards(root)}
        <div class="foundation-two-col" style="margin-top:12px"><article class="foundation-panel"><h4>Semantic radius aliases</h4>${tokenTable(radiusAliases,root)}</article><article class="foundation-panel"><h4>Elevation & border</h4>${tokenTable([...shadowTokens,...borderTokens],root)}<div class="scale-grid" style="margin-top:12px">${shadowTokens.filter(t=>t in root).map(t=>`<article class="scale-card"><b>${esc(t.replace('--com-elevation-',''))}</b><i class="shadow-demo" style="box-shadow:${esc(resolveValue(root[t],root))}"></i></article>`).join('')}</div></article></div>
      </section>

      <section class="foundation-block" id="foundation-density">
        <div class="foundation-block-head"><h3>Density & Platform</h3><p>Com Design 默认 Compact。密度只改变 portable density tokens，不允许业务组件自行发明高度。Touch Target 则明确区分 iOS 与 Android。</p></div>
        <div class="foundation-two-col"><article class="foundation-panel"><h4>Compact · default</h4>${tokenTable(densityTokens,root)}</article><article class="foundation-panel"><h4>Comfortable · override</h4>${Object.keys(comfortable).length ? tokenTable(densityTokens,{...root,...comfortable}) : '<p>当前源文件未声明 .density-comfortable override；Human Docs 不补造数值。</p>'}</article></div>
        <div class="foundation-subtitle"><h4>Platform touch target</h4><small>视觉尺寸与命中区域分离</small></div>
        <div class="platform-cards"><article class="platform-card is-primary"><small>iOS</small><strong>${esc(resolveValue(root['--size-touch-ios'],root) || '—')}</strong><p>默认 --platform-touch-min：${esc(resolveValue(root['--platform-touch-min'],root) || '—')}</p></article><article class="platform-card"><small>Android</small><strong>${esc(resolveValue(root['--size-touch-android'],root) || '—')}</strong><p>${Object.keys(androidOverride).length ? `platform override：${esc(resolveValue(androidOverride['--platform-touch-min'] || root['--size-touch-android'],{...root,...androidOverride}))}` : '使用显式 Android touch token；未发现额外 selector override。'}</p></article></div>
      </section>

      <section class="foundation-block" id="foundation-dark">
        <div class="foundation-block-head"><h3>Dark Theme</h3><p>Dark Mode 不是另一套组件。它通过 <code>.dark</code> 重映射 primitive / semantic token，同一组件契约继续消费相同语义角色。</p></div>
        ${Object.keys(darkOverride).length ? `<div class="dark-preview">${themeCard('Light · :root',root)}${themeCard('Dark · .dark',dark)}</div>` : '<div class="foundation-error">当前真相源未解析到 .dark token block。</div>'}
      </section>

      <div class="foundation-footnote"><b>文档契约：</b>这里展示的数值不手工维护。新增、删除或调整 Foundation token，应先修改 <code>design-source/colors_and_type.css</code>；Human Docs 下一次加载会自动反映变化。</div>
    </div>`;
  }

  async function init(){
    section.innerHTML = '<div class="wrap"><div class="foundation-loading">正在从 design-source/colors_and_type.css 读取 Foundation…</div></div>';
    try{
      const response = await fetch(SOURCE_URL, {cache:'no-cache'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      render(await response.text());
    }catch(error){
      section.innerHTML = `<div class="wrap"><div class="foundation-error">Foundation 真相源加载失败：${esc(error.message)}。没有使用手工 fallback，以免展示错误规范。</div></div>`;
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();