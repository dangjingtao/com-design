const componentCategoryConfig = [
  {key:'actions-forms', label:'Actions & Forms', short:'表单与动作'},
  {key:'navigation-information', label:'Navigation & Information', short:'导航与信息'},
  {key:'feedback-overlay-progress', label:'Feedback / Overlay / Progress', short:'反馈与进度'},
  {key:'search-menu', label:'Search & Menu', short:'搜索与菜单'}
];

const componentUi = {
  railGroups: document.querySelector('#rail-component-groups'),
  section: document.querySelector('#catalogue'),
  title: document.querySelector('#inspector-title'),
  description: document.querySelector('#inspector-description'),
  preview: document.querySelector('#guide-component-preview'),
  previewLink: document.querySelector('#studio-preview-link'),
  contractLink: document.querySelector('#studio-contract-link'),
  meta: document.querySelector('#inspector-meta'),
  anatomy: document.querySelector('#inspector-anatomy'),
  variants: document.querySelector('#inspector-variants'),
  usage: document.querySelector('#inspector-usage'),
  dont: document.querySelector('#inspector-dont'),
  traits: document.querySelector('#inspector-traits'),
  stage: document.querySelector('#component-canvas-stage'),
  holder: document.querySelector('#phone-holder'),
  artboard: document.querySelector('#phone-artboard'),
  canvasLabel: document.querySelector('.canvas-label'),
  actions: document.querySelector('.inspector-actions'),
  qrToggle: null,
  qrPopover: null,
  qrImage: null,
  qrTarget: null
};

const IPHONE_VIEWPORT_WIDTH = 393;
const IPHONE_VIEWPORT_HEIGHT = 852;
const IPHONE_SAFE_TOP = 59;
const IPHONE_SAFE_BOTTOM = 34;
const IPHONE_CONTENT_HEIGHT = IPHONE_VIEWPORT_HEIGHT - IPHONE_SAFE_TOP - IPHONE_SAFE_BOTTOM;
const IPHONE_FRAME_WIDTH = 407;
const IPHONE_FRAME_HEIGHT = 866;

let guideComponents = [];
let selectedComponentSlug = 'button';
let contractRequestId = 0;
const collapsedGroups = new Set();

function escapeGuideHtml(value){
  return String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function valueText(value){
  if(Array.isArray(value)) return value.join(' · ');
  if(value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '—');
}

function slugFromHash(){
  const raw = decodeURIComponent(location.hash.replace(/^#/,''));
  if(raw.startsWith('component-')) return raw.slice('component-'.length);
  return null;
}

function ensureSimulatorChrome(){
  if(!componentUi.artboard || componentUi.artboard.querySelector('.iphone-status-bar')) return;

  const statusBar = document.createElement('div');
  statusBar.className = 'iphone-status-bar';
  statusBar.setAttribute('aria-hidden','true');
  statusBar.innerHTML = `
    <span class="iphone-time">9:41</span>
    <span class="dynamic-island"></span>
    <span class="iphone-system-icons">
      <svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="6" width="3" height="6" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>
      <svg viewBox="0 0 18 13" aria-hidden="true"><path d="M1 4.3C5.7.3 12.3.3 17 4.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 7.2c3-2.5 7-2.5 10 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 10.1c1.2-1 2.8-1 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="12" r="1" fill="currentColor"/></svg>
      <svg class="battery" viewBox="0 0 28 13" aria-hidden="true"><rect x="1" y="1" width="23" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="3" width="18" height="7" rx="1.6" fill="currentColor"/><path d="M25.5 4.3v4.4c1.1-.3 1.5-1 1.5-2.2s-.4-1.9-1.5-2.2Z" fill="currentColor"/></svg>
    </span>`;

  const homeArea = document.createElement('div');
  homeArea.className = 'iphone-home-area';
  homeArea.setAttribute('aria-hidden','true');
  homeArea.innerHTML = '<span class="iphone-home-indicator"></span>';

  componentUi.artboard.appendChild(statusBar);
  componentUi.artboard.appendChild(homeArea);
}

function ensureQrControl(){
  if(!componentUi.actions || componentUi.actions.querySelector('#preview-qr-toggle')) return;

  const wrap = document.createElement('div');
  wrap.className = 'qr-action-wrap';
  wrap.innerHTML = `
    <button id="preview-qr-toggle" type="button" aria-expanded="false" aria-controls="preview-qr-popover">QR</button>
    <div class="preview-qr-popover" id="preview-qr-popover" hidden>
      <img id="preview-qr-image" alt="当前组件 Preview 二维码" width="170" height="170" referrerpolicy="no-referrer">
      <small>手机扫码打开当前组件 Preview</small>
      <a id="preview-qr-target" href="#" target="_blank" rel="noopener">Preview URL</a>
    </div>`;

  componentUi.actions.insertBefore(wrap, componentUi.contractLink);
  componentUi.qrToggle = wrap.querySelector('#preview-qr-toggle');
  componentUi.qrPopover = wrap.querySelector('#preview-qr-popover');
  componentUi.qrImage = wrap.querySelector('#preview-qr-image');
  componentUi.qrTarget = wrap.querySelector('#preview-qr-target');

  componentUi.qrToggle.addEventListener('click', event => {
    event.stopPropagation();
    const willOpen = componentUi.qrPopover.hidden;
    componentUi.qrPopover.hidden = !willOpen;
    componentUi.qrToggle.setAttribute('aria-expanded', String(willOpen));
  });

  componentUi.qrPopover.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', () => closeQrPopover());
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape') closeQrPopover();
  });
}

function closeQrPopover(){
  if(!componentUi.qrPopover || componentUi.qrPopover.hidden) return;
  componentUi.qrPopover.hidden = true;
  componentUi.qrToggle?.setAttribute('aria-expanded','false');
}

function updatePreviewQr(previewPath){
  if(!componentUi.qrImage || !componentUi.qrTarget) return;
  const absoluteUrl = new URL(previewPath, window.location.href).href;
  componentUi.qrTarget.href = absoluteUrl;
  componentUi.qrTarget.textContent = new URL(absoluteUrl).pathname;
  componentUi.qrTarget.title = absoluteUrl;
  componentUi.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&margin=0&data=${encodeURIComponent(absoluteUrl)}`;
  closeQrPopover();
}

async function initComponentWorkspace(){
  if(!componentUi.railGroups || !componentUi.preview) return;
  try{
    const response = await fetch('./design-source/components/index.json', {cache:'no-cache'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    guideComponents = Array.isArray(manifest.components) ? manifest.components : [];

    const hashSlug = slugFromHash();
    if(hashSlug && guideComponents.some(item => item.slug === hashSlug)){
      selectedComponentSlug = hashSlug;
    }else if(!guideComponents.some(item => item.slug === selectedComponentSlug) && guideComponents.length){
      selectedComponentSlug = guideComponents[0].slug;
    }

    renderComponentRail();
    selectGuideComponent(selectedComponentSlug, Boolean(hashSlug), false);
  }catch(error){
    componentUi.railGroups.innerHTML = `<p class="inspector-empty">组件清单加载失败：${escapeGuideHtml(error.message)}</p>`;
    componentUi.description.textContent = '组件清单加载失败，请检查 design-source/components/index.json。';
  }
}

function renderComponentRail(){
  componentUi.railGroups.innerHTML = componentCategoryConfig.map(group => {
    const items = guideComponents.filter(item => item.category === group.key);
    const collapsed = collapsedGroups.has(group.key);
    return `
      <div class="rail-component-group${collapsed ? ' is-collapsed' : ''}" data-category="${group.key}">
        <button class="rail-group-title" type="button" data-group="${group.key}" aria-expanded="${!collapsed}">
          <span>${group.label}</span><small>${items.length}</small><i aria-hidden="true">⌄</i>
        </button>
        <div class="rail-group-items">
          ${items.map(item => `<button class="rail-component${item.slug === selectedComponentSlug ? ' is-active' : ''}" type="button" data-slug="${item.slug}">${escapeGuideHtml(item.name)}</button>`).join('')}
        </div>
      </div>`;
  }).join('');

  componentUi.railGroups.querySelectorAll('.rail-group-title').forEach(button => {
    button.addEventListener('click', () => toggleComponentGroup(button.dataset.group));
  });
  componentUi.railGroups.querySelectorAll('.rail-component').forEach(button => {
    button.addEventListener('click', () => selectGuideComponent(button.dataset.slug, true, true));
  });
}

function toggleComponentGroup(groupKey){
  const selected = guideComponents.find(item => item.slug === selectedComponentSlug);
  if(selected?.category === groupKey && !collapsedGroups.has(groupKey)) return;
  if(collapsedGroups.has(groupKey)) collapsedGroups.delete(groupKey);
  else collapsedGroups.add(groupKey);
  renderComponentRail();
}

function ensureSelectedGroupExpanded(item){
  if(collapsedGroups.delete(item.category)) renderComponentRail();
}

function setInspectorLoading(item){
  componentUi.title.textContent = item.name;
  componentUi.description.textContent = '正在读取结构化设计规范…';
  componentUi.meta.innerHTML = '<span>Loading contract…</span>';
  componentUi.anatomy.innerHTML = '<span class="inspector-empty">加载中…</span>';
  componentUi.variants.innerHTML = '<span class="inspector-empty">加载中…</span>';
  componentUi.usage.innerHTML = '<li>加载中…</li>';
  componentUi.dont.innerHTML = '<li>加载中…</li>';
  componentUi.traits.innerHTML = '<span class="inspector-empty">加载中…</span>';
}

async function selectGuideComponent(slug, updateHash = true, shouldScroll = true){
  const item = guideComponents.find(component => component.slug === slug);
  if(!item) return;
  selectedComponentSlug = slug;
  ensureSelectedGroupExpanded(item);

  componentUi.railGroups.querySelectorAll('.rail-component').forEach(button => {
    button.classList.toggle('is-active', button.dataset.slug === slug);
  });

  setInspectorLoading(item);
  const previewPath = `./design-source/preview/component-${slug}.html`;
  const contractPath = `./design-source/components/${slug}.json`;
  componentUi.preview.src = previewPath;
  componentUi.preview.title = `${item.name} · iPhone 393 × 852 仿真画布`;
  componentUi.previewLink.href = previewPath;
  componentUi.contractLink.href = contractPath;
  updatePreviewQr(previewPath);

  if(updateHash){
    history.replaceState(null,'',`#component-${slug}`);
  }
  if(shouldScroll){
    componentUi.section.scrollIntoView({behavior:'smooth', block:'start'});
  }
  await loadGuideContract(item, contractPath);
}

async function loadGuideContract(item, contractPath){
  const requestId = ++contractRequestId;
  try{
    const response = await fetch(contractPath, {cache:'no-cache'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const contract = await response.json();
    if(requestId !== contractRequestId) return;
    renderGuideContract(item, contract);
  }catch(error){
    if(requestId !== contractRequestId) return;
    componentUi.description.textContent = `Contract 加载失败：${error.message}`;
    [componentUi.anatomy,componentUi.variants,componentUi.traits].forEach(node => node.innerHTML = '<span class="inspector-empty">Contract unavailable</span>');
    [componentUi.usage,componentUi.dont].forEach(node => node.innerHTML = '<li>Contract unavailable</li>');
  }
}

function renderGuideContract(item, contract){
  const usageHints = Array.isArray(contract.usageHints) ? contract.usageHints : [];
  const patterns = Array.isArray(contract.structurePatterns) ? contract.structurePatterns : [];
  const description = usageHints[0] || patterns[0] || 'Com Design Core Component';
  componentUi.title.textContent = contract.name || item.name;
  componentUi.description.textContent = description;

  const semantic = Array.isArray(contract.semanticTypeCandidates) ? contract.semanticTypeCandidates : [];
  componentUi.meta.innerHTML = [
    `<span>Schema v${escapeGuideHtml(contract.schemaVersion ?? '—')}</span>`,
    `<span>${escapeGuideHtml(contract.confidence ?? '—')}</span>`,
    ...semantic.slice(0,2).map(value => `<span>${escapeGuideHtml(value)}</span>`)
  ].join('');

  const anatomy = Array.isArray(contract.anatomy) ? contract.anatomy : [];
  componentUi.anatomy.innerHTML = anatomy.length
    ? anatomy.map(value => `<span>${escapeGuideHtml(value)}</span>`).join('')
    : '<span class="inspector-empty">当前 Contract 未声明 anatomy。</span>';

  const dimensions = contract.variantDimensions && typeof contract.variantDimensions === 'object'
    ? Object.entries(contract.variantDimensions)
    : [];
  componentUi.variants.innerHTML = dimensions.length
    ? dimensions.map(([dimension,values]) => {
        const list = Array.isArray(values) ? values : [values];
        return `<div class="variant-line"><b>${escapeGuideHtml(dimension)}</b><div>${list.map(value => `<span>${escapeGuideHtml(valueText(value))}</span>`).join('')}</div></div>`;
      }).join('')
    : '<span class="inspector-empty">无独立 variant dimension。</span>';

  renderInspectorList(componentUi.usage, usageHints, '当前 Contract 未声明额外使用原则。');
  renderInspectorList(componentUi.dont, contract.doNotInvent, '当前 Contract 未声明额外禁止项。');

  const traits = contract.traits && typeof contract.traits === 'object' ? Object.entries(contract.traits) : [];
  componentUi.traits.innerHTML = traits.length
    ? traits.map(([key,value]) => `<div class="trait-line"><b>${escapeGuideHtml(key)}</b><code>${escapeGuideHtml(valueText(value))}</code></div>`).join('')
    : '<span class="inspector-empty">当前 Contract 未声明 traits。</span>';
}

function renderInspectorList(node, items, fallback){
  const list = Array.isArray(items) ? items : [];
  node.innerHTML = list.length
    ? list.map(value => `<li>${escapeGuideHtml(value)}</li>`).join('')
    : `<li>${escapeGuideHtml(fallback)}</li>`;
}

function normalizePreviewCanvas(){
  try{
    const doc = componentUi.preview.contentDocument;
    if(!doc || doc.querySelector('#human-guide-canvas-normalize')) return;

    doc.documentElement.classList.add('human-guide-embedded');
    doc.body?.classList.add('human-guide-embedded-body');

    const rootPhone = doc.body?.querySelector(':scope > .phone');
    if(rootPhone) doc.body?.classList.add('human-guide-has-phone');

    const style = doc.createElement('style');
    style.id = 'human-guide-canvas-normalize';
    style.textContent = `
      :root{
        --human-guide-safe-top:${IPHONE_SAFE_TOP}px;
        --human-guide-safe-bottom:${IPHONE_SAFE_BOTTOM}px;
        --human-guide-content-height:${IPHONE_CONTENT_HEIGHT}px;
      }
      html,body{
        width:${IPHONE_VIEWPORT_WIDTH}px!important;
        min-width:${IPHONE_VIEWPORT_WIDTH}px!important;
        max-width:${IPHONE_VIEWPORT_WIDTH}px!important;
        height:${IPHONE_VIEWPORT_HEIGHT}px!important;
        min-height:${IPHONE_VIEWPORT_HEIGHT}px!important;
        box-sizing:border-box!important;
      }
      html{background:var(--color-background,#fff)!important;}
      body{
        margin:0!important;
        padding:${IPHONE_SAFE_TOP}px 0 ${IPHONE_SAFE_BOTTOM}px!important;
        display:block!important;
        justify-content:initial!important;
        align-items:initial!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        background:var(--color-background,#fff)!important;
      }
      .specimen{
        box-sizing:border-box!important;
        width:${IPHONE_VIEWPORT_WIDTH}px!important;
        max-width:none!important;
        min-height:${IPHONE_CONTENT_HEIGHT}px!important;
        margin:0!important;
        padding:16px 24px 20px!important;
      }
      body.human-guide-has-phone .specimen{
        min-height:${IPHONE_CONTENT_HEIGHT}px!important;
        padding:0!important;
      }
      .phone{
        box-sizing:border-box!important;
        width:${IPHONE_VIEWPORT_WIDTH}px!important;
        max-width:${IPHONE_VIEWPORT_WIDTH}px!important;
        height:${IPHONE_CONTENT_HEIGHT}px!important;
        min-height:${IPHONE_CONTENT_HEIGHT}px!important;
        margin:0!important;
        border:0!important;
        border-radius:0!important;
        box-shadow:none!important;
      }
      body>.phone{
        position:relative!important;
        left:auto!important;
        right:auto!important;
        top:auto!important;
        bottom:auto!important;
      }
      .device{
        box-sizing:border-box!important;
        width:100%!important;
        max-width:100%!important;
        margin-left:0!important;
        margin-right:0!important;
        border:0!important;
        border-radius:0!important;
        box-shadow:none!important;
      }
      .story{max-width:100%!important;}
      img,svg{max-width:100%;}
    `;
    doc.head.appendChild(style);

    doc.body.style.width = `${IPHONE_VIEWPORT_WIDTH}px`;
    doc.body.style.height = `${IPHONE_VIEWPORT_HEIGHT}px`;
  }catch(error){
    // Pages serves previews same-origin. If a local browser blocks iframe access, source Preview still works untouched.
  }
}

function resizePhoneArtboard(){
  if(!componentUi.stage || !componentUi.holder || !componentUi.artboard) return;
  const available = Math.max(280, componentUi.stage.clientWidth - 40);
  const scale = Math.min(1, available / IPHONE_FRAME_WIDTH);
  componentUi.artboard.style.transform = `scale(${scale})`;
  componentUi.holder.style.width = `${IPHONE_FRAME_WIDTH * scale}px`;
  componentUi.holder.style.height = `${IPHONE_FRAME_HEIGHT * scale}px`;
  componentUi.stage.style.minHeight = `${IPHONE_FRAME_HEIGHT * scale + 116}px`;
}

componentUi.preview?.addEventListener('load', normalizePreviewCanvas);
window.addEventListener('resize', resizePhoneArtboard);
window.addEventListener('hashchange', () => {
  const slug = slugFromHash();
  if(slug && slug !== selectedComponentSlug && guideComponents.some(item => item.slug === slug)){
    selectGuideComponent(slug, false, true);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  ensureSimulatorChrome();
  ensureQrControl();
  if(componentUi.canvasLabel) componentUi.canvasLabel.textContent = 'iPhone 15 · 393 × 852';
  resizePhoneArtboard();
  await initComponentWorkspace();
  resizePhoneArtboard();
});
