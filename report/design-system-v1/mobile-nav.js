(() => {
  const BREAKPOINT = 1050;
  const docSections = [
    ['overview','概览'],['principles','设计原则'],['foundations','视觉基础'],['patterns','设计模式'],
    ['catalogue','组件'],['adoption','采用验证'],['system','系统边界'],['next','下一步']
  ];
  const groups = [
    ['actions-forms','Actions & Forms'],['navigation-information','Navigation & Information'],
    ['feedback-overlay-progress','Feedback / Overlay / Progress'],['search-menu','Search & Menu']
  ];
  let components = [];
  let currentSection = 'overview';

  const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const slugFromHash = () => {
    const raw = decodeURIComponent(location.hash.replace(/^#/,''));
    return raw.startsWith('component-') ? raw.slice(10) : null;
  };

  const root = document.createElement('div');
  root.className = 'mobile-nav';
  root.innerHTML = `
    <div class="mobile-nav-bar">
      <div class="mobile-nav-context"><span class="mobile-nav-brand">Com Design Mobile</span><strong class="mobile-nav-title">Human Guide</strong></div>
      <button class="mobile-nav-toggle" type="button" aria-label="打开导航" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
    <div class="mobile-nav-backdrop" aria-hidden="true"></div>
    <aside class="mobile-nav-drawer" aria-label="Human Guide 导航" aria-hidden="true">
      <div class="mobile-nav-drawer-head"><div><strong>Com Design Mobile</strong><small>Human Guide · 1.0.0-rc.2</small></div><button class="mobile-nav-close" type="button" aria-label="关闭导航"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="mobile-nav-scroll">
        <section class="mobile-nav-section"><span class="mobile-nav-section-title">Guide</span><nav class="mobile-nav-links" data-mobile-docs></nav></section>
        <section class="mobile-nav-section"><span class="mobile-nav-section-title">Core Components · 33</span><div data-mobile-components><span style="padding:8px;color:#8590A3;font-size:12px">正在读取组件目录…</span></div></section>
      </div>
    </aside>`;
  document.body.appendChild(root);

  const toggle = root.querySelector('.mobile-nav-toggle');
  const closeBtn = root.querySelector('.mobile-nav-close');
  const backdrop = root.querySelector('.mobile-nav-backdrop');
  const drawer = root.querySelector('.mobile-nav-drawer');
  const title = root.querySelector('.mobile-nav-title');
  const docsNode = root.querySelector('[data-mobile-docs]');
  const componentsNode = root.querySelector('[data-mobile-components]');

  function openNav(){
    document.body.classList.add('mobile-nav-open');
    toggle.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false');
  }
  function closeNav(){
    document.body.classList.remove('mobile-nav-open');
    toggle.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
  }
  toggle.addEventListener('click', openNav); closeBtn.addEventListener('click', closeNav); backdrop.addEventListener('click', closeNav);
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeNav(); });

  function renderDocs(){
    docsNode.innerHTML = docSections.map(([id,label]) => `<a href="#${id}" data-doc="${id}" class="${currentSection===id?'is-current':''}"><span>${label}</span>${id==='catalogue'?'<span>33</span>':''}</a>`).join('');
    docsNode.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); closeNav(); document.body.classList.remove('component-mode');
      const id = link.dataset.doc; currentSection = id; history.replaceState(null,'',`#${id}`); updateTitle(); renderDocs(); renderComponents();
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}));
    }));
  }

  function renderComponents(){
    const selected = slugFromHash();
    componentsNode.innerHTML = groups.map(([key,label]) => {
      const items = components.filter(item => item.category === key);
      const open = items.some(item => item.slug === selected);
      return `<details class="mobile-component-group" data-category="${key}" ${open?'open':''}><summary>${label}<span style="margin-left:4px;color:#8590A3;font-size:10px;font-weight:600">${items.length}</span></summary><div class="mobile-component-items">${items.map(item => `<a href="#component-${item.slug}" data-slug="${item.slug}" class="${item.slug===selected?'is-current':''}">${esc(item.name)}</a>`).join('')}</div></details>`;
    }).join('');
    componentsNode.querySelectorAll('[data-slug]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); closeNav();
      const slug = link.dataset.slug; const original = document.querySelector(`.rail-component[data-slug="${CSS.escape(slug)}"]`);
      if(original) original.click(); else location.hash = `component-${slug}`;
      requestAnimationFrame(updateTitle);
    }));
  }

  function updateTitle(){
    const slug = slugFromHash();
    if(document.body.classList.contains('component-mode') && slug){
      const item = components.find(component => component.slug === slug);
      title.textContent = item?.name || document.querySelector('#inspector-title')?.textContent || '组件';
      return;
    }
    title.textContent = docSections.find(([id]) => id === currentSection)?.[1] || 'Human Guide';
  }

  async function loadComponents(){
    try{
      const response = await fetch('./design-source/components/index.json',{cache:'no-cache'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = await response.json(); components = Array.isArray(manifest.components) ? manifest.components : [];
      renderComponents(); updateTitle();
    }catch(error){ componentsNode.innerHTML = `<span style="padding:8px;color:#A92939;font-size:12px">组件目录加载失败：${esc(error.message)}</span>`; }
  }

  const sectionObserver = new IntersectionObserver(entries => {
    if(innerWidth > BREAKPOINT || document.body.classList.contains('component-mode')) return;
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return; currentSection = visible.target.id; updateTitle(); renderDocs();
  },{rootMargin:'-20% 0px -65% 0px',threshold:[0,.1,.5]});
  docSections.forEach(([id]) => { const node=document.getElementById(id); if(node) sectionObserver.observe(node); });

  const inspectorTitle = document.querySelector('#inspector-title');
  if(inspectorTitle) new MutationObserver(() => { if(document.body.classList.contains('component-mode')) updateTitle(); }).observe(inspectorTitle,{childList:true,subtree:true,characterData:true});
  new MutationObserver(() => { updateTitle(); renderDocs(); renderComponents(); }).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('hashchange', () => { updateTitle(); renderComponents(); });
  window.addEventListener('resize', () => { if(innerWidth > BREAKPOINT) closeNav(); });

  renderDocs(); loadComponents(); updateTitle();
})();
