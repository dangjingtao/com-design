const componentCategoryConfig = [
  {key:'actions-forms', label:'Actions & Forms', short:'表单与动作'},
  {key:'navigation-information', label:'Navigation & Information', short:'导航与信息'},
  {key:'feedback-overlay-progress', label:'Feedback / Overlay / Progress', short:'反馈与进度'},
  {key:'search-menu', label:'Search & Menu', short:'搜索与菜单'}
];

const componentUi = {
  railGroups: document.querySelector('#rail-component-groups'),
  section: document.querySelector('#catalogue'),
  category: document.querySelector('#studio-category'),
  title: document.querySelector('#studio-title'),
  description: document.querySelector('#studio-description'),
  preview: document.querySelector('#guide-component-preview'),
  previewLink: document.querySelector('#studio-preview-link'),
  contractLink: document.querySelector('#studio-contract-link'),
  inspectorTitle: document.querySelector('#inspector-title'),
  inspectorDescription: document.querySelector('#inspector-description'),
  meta: document.querySelector('#inspector-meta'),
  anatomy: document.querySelector('#inspector-anatomy'),
  variants: document.querySelector('#inspector-variants'),
  usage: document.querySelector('#inspector-usage'),
  dont: document.querySelector('#inspector-dont'),
  traits: document.querySelector('#inspector-traits'),
  stage: document.querySelector('#component-canvas-stage'),
  holder: document.querySelector('#phone-holder'),
  artboard: document.querySelector('#phone-artboard')
};

let guideComponents = [];
let selectedComponentSlug = 'button';
let contractRequestId = 0;

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

async function initComponentWorkspace(){
  if(!componentUi.railGroups || !componentUi.preview) return;
  try{
    const response = await fetch('./design-source/components/index.json', {cache:'no-cache'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    guideComponents = Array.isArray(manifest.components) ? manifest.components : [];
    renderComponentRail();

    const hashSlug = slugFromHash();
    if(hashSlug && guideComponents.some(item => item.slug === hashSlug)){
      selectedComponentSlug = hashSlug;
    }else if(!guideComponents.some(item => item.slug === selectedComponentSlug) && guideComponents.length){
      selectedComponentSlug = guideComponents[0].slug;
    }
    selectGuideComponent(selectedComponentSlug, Boolean(hashSlug), false);
  }catch(error){
    componentUi.railGroups.innerHTML = `<p class="inspector-empty">组件清单加载失败：${escapeGuideHtml(error.message)}</p>`;
    componentUi.description.textContent = '组件清单加载失败，请检查 design-source/components/index.json。';
  }
}

function renderComponentRail(){
  componentUi.railGroups.innerHTML = componentCategoryConfig.map(group => {
    const items = guideComponents.filter(item => item.category === group.key);
    return `
      <div class="rail-component-group" data-category="${group.key}">
        <div class="rail-group-title"><span>${group.label}</span><small>${items.length}</small></div>
        <div class="rail-group-items">
          ${items.map(item => `<button class="rail-component" type="button" data-slug="${item.slug}">${escapeGuideHtml(item.name)}</button>`).join('')}
        </div>
      </div>`;
  }).join('');

  componentUi.railGroups.querySelectorAll('.rail-component').forEach(button => {
    button.addEventListener('click', () => selectGuideComponent(button.dataset.slug, true, true));
  });
}

function groupLabel(category){
  return componentCategoryConfig.find(group => group.key === category)?.label || category;
}

function setInspectorLoading(item){
  componentUi.category.textContent = groupLabel(item.category);
  componentUi.title.textContent = item.name;
  componentUi.description.textContent = '正在读取组件 Contract…';
  componentUi.inspectorTitle.textContent = item.name;
  componentUi.inspectorDescription.textContent = '正在读取结构化设计规范…';
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

  componentUi.railGroups.querySelectorAll('.rail-component').forEach(button => {
    button.classList.toggle('is-active', button.dataset.slug === slug);
  });

  setInspectorLoading(item);
  const previewPath = `./design-source/preview/component-${slug}.html`;
  const contractPath = `./design-source/components/${slug}.json`;
  componentUi.preview.src = previewPath;
  componentUi.preview.title = `${item.name} · 390 × 844 标准移动端画布`;
  componentUi.previewLink.href = previewPath;
  componentUi.contractLink.href = contractPath;

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
    componentUi.description.textContent = 'Contract 暂时不可读取。';
    componentUi.inspectorDescription.textContent = `Contract 加载失败：${error.message}`;
    [componentUi.anatomy,componentUi.variants,componentUi.traits].forEach(node => node.innerHTML = '<span class="inspector-empty">Contract unavailable</span>');
    [componentUi.usage,componentUi.dont].forEach(node => node.innerHTML = '<li>Contract unavailable</li>');
  }
}

function renderGuideContract(item, contract){
  const usageHints = Array.isArray(contract.usageHints) ? contract.usageHints : [];
  const patterns = Array.isArray(contract.structurePatterns) ? contract.structurePatterns : [];
  const description = usageHints[0] || patterns[0] || 'Com Design Core Component';
  componentUi.description.textContent = description;
  componentUi.inspectorTitle.textContent = contract.name || item.name;
  componentUi.inspectorDescription.textContent = description;

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
    const style = doc.createElement('style');
    style.id = 'human-guide-canvas-normalize';
    style.textContent = `
      html,body{width:100%!important;min-height:100%!important;box-sizing:border-box!important;}
      body{margin:0!important;padding:0!important;display:block!important;justify-content:initial!important;overflow:auto!important;background:var(--color-background,#fff)!important;}
      .specimen{box-sizing:border-box!important;width:100%!important;max-width:none!important;min-height:100%!important;margin:0!important;padding:24px!important;}
      .phone{box-sizing:border-box!important;width:100%!important;height:844px!important;min-height:844px!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;}
      .device{box-sizing:border-box!important;max-width:100%!important;}
    `;
    doc.head.appendChild(style);
  }catch(error){
    // Same-origin on Pages. If a local preview blocks access, leave the source preview untouched.
  }
}

function resizePhoneArtboard(){
  if(!componentUi.stage || !componentUi.holder || !componentUi.artboard) return;
  const available = Math.max(260, componentUi.stage.clientWidth - 40);
  const scale = Math.min(1, available / 390);
  componentUi.artboard.style.transform = `scale(${scale})`;
  componentUi.holder.style.width = `${390 * scale}px`;
  componentUi.holder.style.height = `${844 * scale}px`;
  componentUi.stage.style.minHeight = `${844 * scale + 96}px`;
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
  resizePhoneArtboard();
  await initComponentWorkspace();
  resizePhoneArtboard();
});
