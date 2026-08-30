(() => {
  const SOURCE_URL = './design-source/colors_and_type.css';
  const PREMIUM_URL = './design-source/themes/premium-gold.css';
  const section = document.querySelector('#foundations');
  if(!section) return;

  let cachedBaseCss = '';
  let cachedPremiumCss = '';

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
    if(!value || depth > 16) return value || '';
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

  function currentTheme(){
    return document.documentElement.dataset.comTheme === 'premium-gold' ? 'premium-gold' : 'default';
  }

  function resolveTheme(baseCss, premiumCss, theme){
    const baseRoot = parseVars(extractBlock(baseCss, ':root'));
    const baseDark = parseVars(extractBlock(baseCss, '.dark'));
    const comfortable = parseVars(extractBlock(baseCss, '.density-comfortable'));
    const androidOverride = parseVars(extractBlock(baseCss, '.platform-android'));

    if(theme !== 'premium-gold'){
      return {
        root: baseRoot,
        dark: {...baseRoot, ...baseDark},
        comfortable,
        androidOverride,
        sourceLabel: 'colors_and_type.css',
        themeLabel: 'Default · Electric Indigo',
        premium: false
      };
    }

    const premiumRoot = parseVars(extractBlock(premiumCss, ':root'));
    const premiumLight = parseVars(extractBlock(premiumCss, '.theme-premium-gold'));
    const premiumDarkBase = parseVars(extractBlock(premiumCss, '.dark'));
    const premiumDark = parseVars(extractBlock(premiumCss, '.dark.theme-premium-gold'));
    const root = {...baseRoot, ...premiumRoot, ...premiumLight};
    const dark = {...root, ...baseDark, ...premiumDarkBase, ...premiumDark};
    return {
      root,
      dark,
      comfortable,
      androidOverride,
      sourceLabel: 'colors_and_type.css + themes/premium-gold.css',
      themeLabel: 'Premium Gold · 土豪金',
      premium: true
    };
  }

  function themeCompatibilityBlock(premium){
    if(premium){
      return `<div id="premium-gold" class="premium-compat">
        <div class="premium-compat-head"><div><p class="premium-compat-kicker">Active Optional Theme</p><h3>Premium Gold · 当前正在真实换肤</h3><p class="premium-compat-summary">当前页面、Foundation 数值、组件 Preview 与主题下载包都已切到 Premium Gold。橙红负责 Brand / Action，香槟金负责 Reward / Value，墨黑负责 Member Identity；Success / Warning / Danger 仍保持原语义。Primary 稀缺、Supporting Action 降权与 Core UX Pattern 不因主题切换而改变。</p></div><span class="premium-compat-badge">Active · Opt-in</span></div>
        <div class="premium-role-grid"><article class="premium-role orange"><b>橙红 = Brand / Action</b><p>品牌、主动作、Focus 与 Scoped Selection。</p></article><article class="premium-role gold"><b>香槟金 = Reward / Value</b><p>泡泡值、积分、奖励、权益与可兑换资产。</p></article><article class="premium-role ink"><b>墨黑 = Member Identity</b><p>会员等级、高价值身份和权益容器。</p></article></div>
        <div class="premium-compat-rule"><b>兼容原则：</b>主题改变视觉映射，不改变组件契约、间距、排版、状态语义、动作层级和交互判断方式。</div>
      </div>`;
    }
    return `<div id="premium-gold" class="premium-compat is-default">
      <div class="premium-compat-head"><div><p class="premium-compat-kicker">Theme Compatibility</p><h3>Default 正在生效 · Premium Gold 可选</h3><p class="premium-compat-summary">当前是 Electric Indigo 最新基线：品牌主色保持不变，但普通 Supporting Action、Info Container、边界与 Placeholder 已降低视觉重量。使用左侧 Theme 切换器可让整份 Human Guide、Foundation 与组件 Preview 一起切到 Premium Gold；Core 层级规则保持不变。</p></div><span class="premium-compat-badge">Default · current</span></div>
      <div class="premium-compat-rule"><b>切换不是 Demo：</b>Human Guide 的切换读取与工程构建相同的主题真相源；主题只改合法映射，不重写 UX Pattern。</div>
    </div>`;
  }

  function render(baseCss, premiumCss, theme = currentTheme()){
    const state = resolveTheme(baseCss, premiumCss, theme);
    const {root, dark, comfortable, androidOverride, premium} = state;

    const semanticTokens = [
      ['Text · Primary','--com-text-primary'],['Text · Secondary','--com-text-secondary'],['Text · Tertiary','--com-text-tertiary'],['Text · Placeholder','--com-text-placeholder'],['Text · Brand','--com-text-brand'],
      ['Surface · Page','--com-surface-page'],['Surface · Default','--com-surface-default'],['Surface · Subtle','--com-surface-subtle'],['Surface · Selected','--com-surface-selected'],
      ['Border · Subtle','--com-border-subtle'],['Border · Default','--com-border-default'],['Border · Strong','--com-border-strong'],['Border · Focused','--com-border-focused'],['Border · Error','--com-border-error'],
      ['Action · Primary','--com-action-primary'],['Action · Primary Pressed','--com-action-primary-pressed'],['Action · Secondary','--com-action-secondary'],['Action · Secondary Pressed','--com-action-secondary-pressed'],['Action · Destructive','--com-action-destructive'],
      ['Status · Success','--com-status-success'],['Status · Warning','--com-status-warning'],['Status · Danger','--com-status-danger'],['Status · Info','--com-status-info'],['Status · Info Background','--com-status-info-bg'],['Status · Info Text','--com-status-info-text']
    ];
    if(premium){
      semanticTokens.push(
        ['Reward · Default','--com-reward-default'],['Reward · Strong','--com-reward-strong'],['Reward · Subtle','--com-reward-subtle'],['Reward · Text','--com-reward-text'],
        ['Member · Surface','--com-member-surface'],['Member · Text','--com-member-text'],['Member · Accent','--com-member-accent']
      );
    }

    const governanceTokens = [
      '--com-action-primary',
      '--com-action-secondary',
      '--com-action-secondary-pressed',
      '--com-surface-selected',
      '--color-primary-container',
      '--com-status-info-bg',
      '--com-status-info-text',
      '--com-border-default',
      '--com-text-placeholder'
    ];
    const densityTokens = ['--density-control-height','--density-control-height-lg','--density-padding-h','--density-padding-v','--density-gap','--density-content-inset','--density-section-gap','--density-field-label-gap','--density-field-helper-gap','--density-field-gap'];
    const radiusAliases = ['--radius-control','--radius-container','--radius-overlay','--radius-pill'];
    const iconTokens = ['--com-icon-size-sm','--com-icon-size-md','--com-icon-size-lg','--com-indicator-size-inline','--com-indicator-size-regular'];
    const borderTokens = ['--com-border-control','--com-border-focus'];
    const shadowTokens = ['--com-elevation-floating','--com-elevation-modal'];

    const paletteGroups = premium
      ? [['Warm','--com-warm-','暖白环境'],['Brand','--com-brand-','Orange Red · Brand / Action'],['Premium','--com-premium-','Champagne Gold · Reward / Value'],['Ink','--com-ink-','Member Identity'],['Accent','--com-accent-','Cyan · 局部信号'],['Success','--com-success-',''],['Warning','--com-warning-',''],['Danger','--com-danger-','']]
      : [['Neutral','--com-neutral-','冷调中性色'],['Brand','--com-brand-','Electric Indigo'],['Accent','--com-accent-','Cyan · 局部信号'],['Success','--com-success-',''],['Warning','--com-warning-',''],['Danger','--com-danger-','']];
    const primitiveColorCount = paletteGroups.flatMap(([,prefix]) => collectNumericScale(root, prefix)).length;
    const rootCount = Object.keys(root).length;

    section.classList.add('foundation-live');
    section.innerHTML = `<div class="wrap">
      <div class="foundation-head"><span class="foundation-head-index">02</span><div><h2>视觉基础 Foundations</h2><p>当前主题：<b>${esc(state.themeLabel)}</b>。所有展示实时读取 <code>${esc(state.sourceLabel)}</code>；Human Docs 不维护第二份数值。</p></div><span class="foundation-source-badge">Live Theme Source</span></div>
      <div class="foundation-summary">
        <article><small>Active Theme</small><b>${premium ? 'Gold' : 'Default'}</b><span>${esc(state.themeLabel)}</span></article>
        <article><small>Source Variables</small><b>${rootCount}</b><span>当前主题可见声明</span></article>
        <article><small>Color Primitives</small><b>${primitiveColorCount}</b><span>${premium ? '主题色阶 + 状态色' : '六组基础色阶'}</span></article>
        <article><small>Touch Target</small><b>${esc(resolveValue(root['--size-touch-ios'],root) || '44px')} / ${esc(resolveValue(root['--size-touch-android'],root) || '48px')}</b><span>iOS / Android</span></article>
      </div>
      <nav class="foundation-nav"><a href="#foundation-color">Color</a><a href="#premium-gold">Theme</a><a href="#foundation-type">Typography</a><a href="#foundation-space">Spacing & Size</a><a href="#foundation-radius">Radius & Elevation</a><a href="#foundation-density">Density & Platform</a><a href="#foundation-dark">Dark Theme</a></nav>

      <section class="foundation-block" id="foundation-color">
        <div class="foundation-block-head"><h3>Color · ${premium ? 'Premium Gold' : 'Default'}</h3><p><b>Primitive</b> 提供稳定色阶，<b>Semantic</b> 决定界面角色。当前治理原则是：<b>品牌识别保持，品牌色面积克制</b>。Supporting Action 与普通 Info Container 不应因为“可点击 / 有信息”就自动获得品牌浅色填充。</p></div>
        <div class="foundation-subtitle"><h4>Primitive palettes</h4><small>当前主题真实解析值</small></div>
        <div class="foundation-palette">${paletteGroups.map(([name,prefix,note]) => paletteRow(name,prefix,root,note)).join('')}</div>
        <div class="foundation-subtitle"><h4>Semantic roles</h4><small>token → alias → resolved value</small></div>
        <div class="foundation-semantic-grid">${semanticTokens.map(([label,token]) => semanticCard(label,token,root)).join('')}</div>
        <div class="foundation-two-col" style="margin-top:12px">
          <article class="foundation-panel"><h4>Semantic usage · 当前原则</h4><p><b>Primary</b> 是当前最强动作的稀缺层级信号；<b>Secondary</b> 默认使用中性浅底；<b>Info</b> 默认中性容器 + Brand foreground；<b>Selected / Primary Container</b> 仍可保留品牌浅色，但不要在同一区域重复叠加。普通 Border 与 Placeholder 继续向低噪声收敛。</p></article>
          <article class="foundation-panel"><h4>Key mappings · 实时值</h4>${tokenTable(governanceTokens,root)}</article>
        </div>
      </section>

      ${themeCompatibilityBlock(premium)}

      <section class="foundation-block" id="foundation-type">
        <div class="foundation-block-head"><h3>Typography</h3><p>主题只改变视觉映射，不重写排版系统。下面继续读取相同 portable type aliases。</p></div>
        ${typeRows(root)}
      </section>

      <section class="foundation-block" id="foundation-space">
        <div class="foundation-block-head"><h3>Spacing & Size</h3><p>Spacing、Size 与 Touch Target 不因主题切换改变。</p></div>
        <div class="foundation-subtitle"><h4>Spacing scale</h4><small>完整 primitive scale</small></div>${spacingCards(root)}
        <div class="foundation-two-col" style="margin-top:12px"><article class="foundation-panel"><h4>Control & touch sizes</h4>${sizeCards(root)}</article><article class="foundation-panel"><h4>Icon & indicator</h4>${tokenTable(iconTokens,root)}</article></div>
      </section>

      <section class="foundation-block" id="foundation-radius">
        <div class="foundation-block-head"><h3>Radius & Elevation</h3><p>圆角负责组件层级，阴影只表达真实悬浮关系。主题不修改这一结构规则。</p></div>
        <div class="foundation-subtitle"><h4>Radius primitives</h4><small>0 / 4 / 8 / 12 / 16 / pill</small></div>${radiusCards(root)}
        <div class="foundation-two-col" style="margin-top:12px"><article class="foundation-panel"><h4>Semantic radius aliases</h4>${tokenTable(radiusAliases,root)}</article><article class="foundation-panel"><h4>Elevation & border</h4>${tokenTable([...shadowTokens,...borderTokens],root)}<div class="scale-grid" style="margin-top:12px">${shadowTokens.filter(t=>t in root).map(t=>`<article class="scale-card"><b>${esc(t.replace('--com-elevation-',''))}</b><i class="shadow-demo" style="box-shadow:${esc(resolveValue(root[t],root))}"></i></article>`).join('')}</div></article></div>
      </section>

      <section class="foundation-block" id="foundation-density">
        <div class="foundation-block-head"><h3>Density & Platform</h3><p>Com Design 默认 Compact。Theme、Density、Platform 是相互独立的轴。</p></div>
        <div class="foundation-two-col"><article class="foundation-panel"><h4>Compact · default</h4>${tokenTable(densityTokens,root)}</article><article class="foundation-panel"><h4>Comfortable · override</h4>${Object.keys(comfortable).length ? tokenTable(densityTokens,{...root,...comfortable}) : '<p>当前源文件未声明 .density-comfortable override。</p>'}</article></div>
        <div class="foundation-subtitle"><h4>Platform touch target</h4><small>视觉尺寸与命中区域分离</small></div>
        <div class="platform-cards"><article class="platform-card is-primary"><small>iOS</small><strong>${esc(resolveValue(root['--size-touch-ios'],root) || '—')}</strong><p>默认 --platform-touch-min：${esc(resolveValue(root['--platform-touch-min'],root) || '—')}</p></article><article class="platform-card"><small>Android</small><strong>${esc(resolveValue(root['--size-touch-android'],root) || '—')}</strong><p>${Object.keys(androidOverride).length ? `platform override：${esc(resolveValue(androidOverride['--platform-touch-min'] || root['--size-touch-android'],{...root,...androidOverride}))}` : '使用显式 Android touch token。'}</p></article></div>
      </section>

      <section class="foundation-block" id="foundation-dark">
        <div class="foundation-block-head"><h3>Dark Theme · ${premium ? 'Premium Gold' : 'Default'}</h3><p>Dark Mode 继续使用同一组件契约；当前预览同时展示所选主题的 Light / Dark 映射。</p></div>
        <div class="dark-preview">${themeCard(`${premium ? 'Premium Gold' : 'Default'} · Light`,root)}${themeCard(`${premium ? 'Premium Gold' : 'Default'} · Dark`,dark)}</div>
      </section>

      <div class="foundation-footnote"><b>文档契约：</b>默认主题来自 <code>design-source/colors_and_type.css</code>；Premium Gold 来自 <code>design-source/themes/premium-gold.css</code>。Human Guide 只解释并可视化真相源，不反向发明 token；动作层级与 UX Pattern 由 Core 契约约束。</div>
    </div>`;
  }

  async function init(){
    section.innerHTML = '<div class="wrap"><div class="foundation-loading">正在读取 Default + Premium Gold Foundation…</div></div>';
    try{
      const [baseResponse, premiumResponse] = await Promise.all([
        fetch(SOURCE_URL, {cache:'no-cache'}),
        fetch(PREMIUM_URL, {cache:'no-cache'})
      ]);
      if(!baseResponse.ok) throw new Error(`Default source HTTP ${baseResponse.status}`);
      if(!premiumResponse.ok) throw new Error(`Premium source HTTP ${premiumResponse.status}`);
      cachedBaseCss = await baseResponse.text();
      cachedPremiumCss = await premiumResponse.text();
      render(cachedBaseCss, cachedPremiumCss, currentTheme());
    }catch(error){
      section.innerHTML = `<div class="wrap"><div class="foundation-error">Foundation 主题真相源加载失败：${esc(error.message)}。没有使用手工 fallback，以免展示错误规范。</div></div>`;
    }
  }

  window.addEventListener('com-design-theme-change', event => {
    if(!cachedBaseCss || !cachedPremiumCss) return;
    render(cachedBaseCss, cachedPremiumCss, event.detail?.theme || currentTheme());
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();