const root=document.documentElement;
const sourceBase=root.dataset.sourceBase||'../../design-source';
const siteBase=root.dataset.siteBase||'../../';
const categoryLabels={
  'actions-forms':'Actions & Forms',
  'navigation-information':'Navigation & Information',
  'feedback-overlay-progress':'Feedback / Overlay / Progress',
  'search-menu':'Search & Menu'
};
let componentCatalog=[];
let selectedComponent=null;

async function fetchJson(url){
  const response=await fetch(url,{cache:'no-cache'});
  if(!response.ok) throw new Error(url+' → HTTP '+response.status);
  return response.json();
}
function escapeHtml(value){
  return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function showError(target,error){
  const template=document.querySelector('#load-error-template');
  target.innerHTML=template?.innerHTML||'<div class="load-error">Load failed</div>';
  target.querySelector('.load-error')?.append(' ',error.message);
}
function setTheme({family,scheme},{persist=true}={}){
  const premium=family==='premium';
  const dark=scheme==='dark';
  root.classList.toggle('theme-premium-gold',premium);
  root.classList.toggle('dark',dark);
  root.dataset.themeFamily=premium?'premium':'default';
  root.dataset.colorScheme=dark?'dark':'light';
  const familyButton=document.querySelector('#theme-family');
  const schemeButton=document.querySelector('#theme-scheme');
  familyButton.textContent=premium?'Premium Gold':'Default';
  familyButton.setAttribute('aria-pressed',String(premium));
  schemeButton.textContent=dark?'Dark':'Light';
  schemeButton.setAttribute('aria-pressed',String(dark));
  if(persist){
    localStorage.setItem('com-design-human-theme-family',premium?'premium':'default');
    localStorage.setItem('com-design-human-theme-scheme',dark?'dark':'light');
  }
}
function initialTheme(){
  const params=new URLSearchParams(location.search);
  const family=params.get('theme')||localStorage.getItem('com-design-human-theme-family')||'default';
  const scheme=params.get('scheme')||localStorage.getItem('com-design-human-theme-scheme')||'light';
  setTheme({family:family==='premium'?'premium':'default',scheme:scheme==='dark'?'dark':'light'},{persist:false});
}
function renderComponents(filter=''){
  const target=document.querySelector('#component-groups');
  const normalized=filter.trim().toLowerCase();
  const filtered=componentCatalog.filter(item=>!normalized||item.name.toLowerCase().includes(normalized)||item.slug.toLowerCase().includes(normalized));
  const groups=[...new Set(componentCatalog.map(item=>item.category))];
  target.className='component-groups';
  target.innerHTML=groups.map(category=>{
    const items=filtered.filter(item=>item.category===category);
    if(!items.length) return '';
    return '<section class="component-group"><h3>'+escapeHtml(categoryLabels[category]||category)+'</h3><div class="component-list">'+items.map(item=>{
      const isSelected=selectedComponent===item.slug;
      return '<article class="component-item'+(isSelected?' is-selected':'')+'" data-slug="'+escapeHtml(item.slug)+'"><button class="component-select" type="button" data-component="'+escapeHtml(item.slug)+'">'+escapeHtml(item.name)+'</button><span class="component-actions"><a href="'+sourceBase+'/'+item.contract+'">Contract ↗</a><a href="'+sourceBase+'/'+item.preview+'">Preview ↗</a></span></article>';
    }).join('')+'</div></section>';
  }).join('')||'<div class="catalog-loading">没有匹配的组件。</div>';
  target.querySelectorAll('[data-component]').forEach(button=>button.addEventListener('click',()=>selectComponent(button.dataset.component)));
  document.querySelector('#catalog-note').textContent=filtered.length+' / '+componentCatalog.length+' components';
}
function listItems(values){
  const entries=(values||[]).filter(Boolean);
  if(!entries.length) return '<p class="inspector-intent">—</p>';
  return '<ul>'+entries.map(item=>'<li>'+escapeHtml(typeof item==='string'?item:JSON.stringify(item))+'</li>').join('')+'</ul>';
}
async function selectComponent(slug){
  const item=componentCatalog.find(entry=>entry.slug===slug);
  if(!item) return;
  selectedComponent=slug;
  renderComponents(document.querySelector('#component-filter').value);
  const inspector=document.querySelector('#component-inspector');
  inspector.innerHTML='<div class="catalog-loading">正在读取 '+escapeHtml(item.name)+' contract…</div>';
  try{
    const contract=await fetchJson(sourceBase+'/'+item.contract);
    const variants=Object.entries(contract.variantDimensions||{}).flatMap(([key,values])=>(values||[]).map(value=>key+': '+value));
    const states=contract.states||[];
    const rules=contract.usageHints||contract.interactionContract||contract.structurePatterns||[];
    const avoid=contract.doNotInvent||[];
    inspector.innerHTML='<div class="inspector-head"><p class="eyebrow">COMPONENT INSPECTOR</p><div class="inspector-head-row"><h3>'+escapeHtml(contract.name||item.name)+'</h3><span class="inspector-tag">'+escapeHtml(item.category)+'</span></div><p class="inspector-intent">'+escapeHtml(contract.intent||'Canonical component contract')+'</p></div>'+
      '<section class="inspector-section"><h4>Variants</h4>'+listItems(variants)+'</section>'+
      '<section class="inspector-section"><h4>States</h4>'+listItems(states)+'</section>'+
      '<section class="inspector-section"><h4>Usage / interaction</h4>'+listItems(rules.slice(0,6))+'</section>'+
      '<section class="inspector-section"><h4>Do not invent</h4>'+listItems(avoid.slice(0,5))+'</section>'+
      '<iframe class="preview-frame" title="'+escapeHtml(item.name)+' Preview" src="'+sourceBase+'/'+item.preview+'" loading="lazy"></iframe>'+
      '<div class="inspector-links"><a href="'+sourceBase+'/'+item.contract+'">Open Contract ↗</a><a href="'+sourceBase+'/'+item.preview+'">Open Preview ↗</a></div>';
  }catch(error){
    showError(inspector,error);
  }
}
function renderEntries(targetId,items,kind){
  const target=document.querySelector(targetId);
  target.className='catalog-list';
  target.innerHTML=items.map((item,index)=>{
    const label=kind==='pattern'?'Pattern '+String(index+1).padStart(2,'0'):'Composite';
    const meta=(item.components||[]).slice(0,6);
    return '<article class="catalog-entry" data-id="'+escapeHtml(item.id)+'"><div><p class="eyebrow">'+label+'</p><h3>'+escapeHtml(item.name)+(item.cn?'<span>'+escapeHtml(item.cn)+'</span>':'')+'</h3></div><div><p>'+escapeHtml(item.intent||'')+'</p><div class="entry-meta">'+meta.map(value=>'<span>'+escapeHtml(value)+'</span>').join('')+'</div></div></article>';
  }).join('');
}
function setupNavigation(){
  const navToggle=document.querySelector('#nav-toggle');
  const sidebar=document.querySelector('#sidebar');
  navToggle.addEventListener('click',()=>{
    const open=sidebar.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded',String(open));
  });
  function closeSidebar(){
    sidebar.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded','false');
  }
  document.querySelectorAll('.side-link').forEach(link=>link.addEventListener('click',closeSidebar));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&sidebar.classList.contains('is-open')){
      closeSidebar();
      navToggle.focus();
    }
  });
  document.addEventListener('click',event=>{
    if(!sidebar.classList.contains('is-open')) return;
    if(sidebar.contains(event.target)||navToggle.contains(event.target)) return;
    closeSidebar();
  });
  const links=[...document.querySelectorAll('.side-link[href^="#"]')];
  const map=new Map(links.map(link=>[link.getAttribute('href').slice(1),link]));
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if(!visible) return;
    links.forEach(link=>link.classList.toggle('is-active',link===map.get(visible.target.id)));
  },{rootMargin:'-20% 0% -70% 0%'});
  map.forEach((link,id)=>{
    const section=document.getElementById(id);
    if(section) observer.observe(section);
  });
}
async function init(){
  initialTheme();
  setupNavigation();
  document.querySelector('#theme-family').addEventListener('click',()=>{
    setTheme({family:root.dataset.themeFamily==='premium'?'default':'premium',scheme:root.dataset.colorScheme});
  });
  document.querySelector('#theme-scheme').addEventListener('click',()=>{
    setTheme({family:root.dataset.themeFamily,scheme:root.dataset.colorScheme==='dark'?'light':'dark'});
  });
  const componentTarget=document.querySelector('#component-groups');
  const compositeTarget=document.querySelector('#composite-list');
  const patternTarget=document.querySelector('#pattern-list');
  try{
    const [manifest,components,composites,patterns,current]=await Promise.all([
      fetchJson(sourceBase+'/specs/design-system-v1.json'),
      fetchJson(sourceBase+'/components/index.json'),
      fetchJson(sourceBase+'/specs/core-composites.json'),
      fetchJson(sourceBase+'/specs/core-patterns.json'),
      fetchJson(siteBase+'current.json').catch(()=>null)
    ]);
    componentCatalog=Array.isArray(components.components)?components.components:[];
    const compositeCatalog=Array.isArray(composites.composites)?composites.composites:[];
    const patternCatalog=Array.isArray(patterns.patterns)?patterns.patterns:[];
    document.querySelector('#component-count').textContent=String(componentCatalog.length);
    document.querySelector('#composite-count').textContent=String(compositeCatalog.length);
    document.querySelector('#pattern-count').textContent=String(patternCatalog.length);
    const version=manifest.$metadata?.version||'unknown';
    document.querySelector('#system-version').textContent=version;
    document.querySelector('#version-chip').textContent=version;
    renderComponents();
    renderEntries('#composite-list',compositeCatalog,'composite');
    renderEntries('#pattern-list',patternCatalog,'pattern');
    const resultState=componentCatalog.find(item=>item.slug==='result-state');
    if(resultState) selectComponent(resultState.slug);
    const record=document.querySelector('#current-record');
    if(current){
      record.textContent='Current path: '+current.currentPath+' · canonical: '+current.canonicalManifest+' · source revision: '+current.sourceRevision;
      document.querySelector('#source-revision').textContent='source revision: '+current.sourceRevision;
    }else{
      record.textContent='Local preview · canonical: design-source/specs/design-system-v1.json';
    }
  }catch(error){
    showError(componentTarget,error);showError(compositeTarget,error);showError(patternTarget,error);
    document.querySelector('#current-record').textContent='Canonical data load failed: '+error.message;
  }
}
document.querySelector('#component-filter')?.addEventListener('input',event=>renderComponents(event.target.value));
init();
