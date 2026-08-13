(() => {
  const THEME_KEY = 'com-design-human-theme';
  const DEFAULT_THEME = 'default';
  const PREMIUM_THEME = 'premium-gold';
  const themes = {
    [DEFAULT_THEME]: {
      label: 'Default',
      short: 'Electric Indigo',
      bundle: './downloads/com-design-default-theme.zip',
      bundleLabel: '下载 Default Theme Kit ↓',
      source: './design-source/colors_and_type.css',
      sourceLabel: 'Default Tokens'
    },
    [PREMIUM_THEME]: {
      label: 'Premium Gold',
      short: '土豪金',
      bundle: './downloads/com-design-premium-gold-theme.zip',
      bundleLabel: '下载 Premium Gold Theme Kit ↓',
      source: './design-source/themes/premium-gold.css',
      sourceLabel: 'Premium Gold CSS'
    }
  };

  const normalizeTheme = value => value === PREMIUM_THEME ? PREMIUM_THEME : DEFAULT_THEME;

  function themeFromLocation(){
    const query = new URLSearchParams(location.search).get('theme');
    if(query === PREMIUM_THEME || query === DEFAULT_THEME) return query;
    try { return normalizeTheme(localStorage.getItem(THEME_KEY)); }
    catch { return DEFAULT_THEME; }
  }

  function setStoredTheme(theme){
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }

  function ensureSwitcher(){
    const railBrand = document.querySelector('.rail-brand');
    if(!railBrand || document.querySelector('#human-theme-switcher')) return;
    const wrap = document.createElement('div');
    wrap.id = 'human-theme-switcher';
    wrap.className = 'human-theme-switcher';
    wrap.setAttribute('aria-label', 'Human Guide 主题');
    wrap.innerHTML = `
      <label class="human-theme-label" for="human-theme-select">Theme</label>
      <div class="human-theme-select-wrap" data-theme="default">
        <i class="human-theme-swatch" aria-hidden="true"></i>
        <select id="human-theme-select" aria-label="切换 Com Design 主题">
          <option value="default">Default · Electric Indigo</option>
          <option value="premium-gold">Premium Gold · 土豪金</option>
        </select>
        <span class="human-theme-chevron" aria-hidden="true">⌄</span>
      </div>`;
    railBrand.insertAdjacentElement('afterend', wrap);
    const select = wrap.querySelector('#human-theme-select');
    select?.addEventListener('change', event => applyTheme(event.target.value, true));
  }

  function syncSwitcher(theme){
    const select = document.querySelector('#human-theme-select');
    if(select) select.value = theme;
    const selectWrap = document.querySelector('.human-theme-select-wrap');
    if(selectWrap) selectWrap.dataset.theme = theme;
  }

  function ensureThemeSourceLink(){
    const links = document.querySelector('.delivery-card.primary .delivery-links');
    if(!links) return null;
    let source = links.querySelector('#selected-theme-source');
    if(!source){
      source = document.createElement('a');
      source.id = 'selected-theme-source';
      source.download = '';
      links.prepend(source);
    }
    let universal = links.querySelector('#universal-engineering-kit');
    if(!universal){
      universal = document.createElement('a');
      universal.id = 'universal-engineering-kit';
      universal.href = './downloads/com-design-engineering.zip';
      universal.download = '';
      universal.textContent = '全部主题 Engineering Kit';
      links.append(universal);
    }
    return source;
  }

  function syncDownloads(theme){
    const config = themes[theme];
    const card = document.querySelector('.delivery-card.primary');
    const mainDownload = card?.querySelector('.delivery-file');
    if(mainDownload){
      mainDownload.href = config.bundle;
      mainDownload.textContent = config.bundleLabel;
    }
    const source = ensureThemeSourceLink();
    if(source){
      source.href = config.source;
      source.textContent = config.sourceLabel;
    }
    const copy = card?.querySelector('p');
    if(copy){
      copy.innerHTML = theme === PREMIUM_THEME
        ? '当前预览为 <b>Premium Gold</b>。主题包包含默认 Foundation、Premium Gold scope、Tailwind / NativeWind、React Native 与 Penpot 对应产物。'
        : '当前预览为 <b>Default / Electric Indigo</b>。主题包保持原有默认色系，并包含同版本工程适配产物。';
    }

    const penpotCard = document.querySelector('.delivery-card:nth-child(2) p');
    if(penpotCard){
      penpotCard.innerHTML = theme === PREMIUM_THEME
        ? 'Manifest 保留 Default Light / Dark，并包含 <b>Premium Gold Light / Dark</b> 可选主题。'
        : 'Manifest 默认使用 <b>Default Light / Dark</b>；Premium Gold 作为可选主题同时保留。';
    }

    const foot = document.querySelector('.delivery-foot span');
    if(foot){
      foot.innerHTML = `当前 Human Guide：<b>${config.label}</b>。主下载按钮已同步为当前主题包；“全部主题 Engineering Kit”始终保留完整兼容能力。`;
    }
  }

  function syncPreviewFrame(){
    const frame = document.querySelector('#guide-component-preview');
    if(!frame) return;
    const theme = normalizeTheme(document.documentElement.dataset.comTheme);
    try{
      const doc = frame.contentDocument;
      if(!doc?.documentElement) return;
      const premium = theme === PREMIUM_THEME;
      doc.documentElement.classList.toggle('theme-premium-gold', premium);
      doc.body?.classList.toggle('theme-premium-gold', premium);
      let link = doc.querySelector('#human-guide-premium-theme');
      if(premium){
        if(!link){
          link = doc.createElement('link');
          link.id = 'human-guide-premium-theme';
          link.rel = 'stylesheet';
          link.href = new URL('../themes/premium-gold.css', frame.contentWindow.location.href).href;
          doc.head.appendChild(link);
        }
      }else if(link){
        link.remove();
      }
    }catch{
      // Published previews are same-origin. Keep standalone preview untouched if local restrictions block access.
    }
  }

  function applyTheme(value, persist = false){
    const theme = normalizeTheme(value);
    document.documentElement.dataset.comTheme = theme;
    if(document.body){
      document.body.classList.toggle('theme-premium-gold', theme === PREMIUM_THEME);
    }
    if(persist) setStoredTheme(theme);
    syncSwitcher(theme);
    syncDownloads(theme);
    syncPreviewFrame();
    window.dispatchEvent(new CustomEvent('com-design-theme-change', {detail:{theme}}));
  }

  const initialTheme = themeFromLocation();
  document.documentElement.dataset.comTheme = initialTheme;

  document.addEventListener('DOMContentLoaded', () => {
    ensureSwitcher();
    const frame = document.querySelector('#guide-component-preview');
    frame?.addEventListener('load', syncPreviewFrame);
    applyTheme(initialTheme, false);
  }, {once:true});

  window.comDesignHumanTheme = {
    get: () => normalizeTheme(document.documentElement.dataset.comTheme),
    set: theme => applyTheme(theme, true),
    syncPreview: syncPreviewFrame
  };
})();