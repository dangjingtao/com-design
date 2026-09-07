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
let compositeCatalog=[];
let patternCatalog=[];
let selected={type:'component',id:'button'};

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
function setupThemeControls(){
  document.querySelector('#theme-family').addEventListener('click',()=>{
    setTheme({family:root.dataset.themeFamily==='premium'?'default':'premium',scheme:root.dataset.colorScheme});
  });
  document.querySelector('#theme-scheme').addEventListener('click',()=>{
    setTheme({family:root.dataset.themeFamily,scheme:root.dataset.colorScheme==='dark'?'light':'dark'});
  });
  document.querySelectorAll('[data-set-family]').forEach(button=>button.addEventListener('click',()=>{
    setTheme({family:button.dataset.setFamily,scheme:root.dataset.colorScheme});
  }));
  document.querySelectorAll('[data-set-scheme]').forEach(button=>button.addEventListener('click',()=>{
    setTheme({family:root.dataset.themeFamily,scheme:button.dataset.setScheme});
  }));
}
function setupMobileMenu(){
  const button=document.querySelector('#mobile-menu-button');
  const menu=document.querySelector('#mobile-menu');
  const close=()=>{
    menu.classList.remove('is-open');
    button.setAttribute('aria-expanded','false');
  };
  button.addEventListener('click',()=>{
    const open=menu.classList.toggle('is-open');
    button.setAttribute('aria-expanded',String(open));
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.classList.contains('is-open')){
      close();
      button.focus();
    }
  });
}
function setupToc(){
  const links=[...document.querySelectorAll('.page-toc a[href^="#"]')];
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
function setupLabTabs(){
  const buttons=[...document.querySelectorAll('[data-lab-tab]')];
  const panes=[...document.querySelectorAll('[data-lab-pane]')];
  function activate(name){
    buttons.forEach(button=>button.classList.toggle('is-active',button.dataset.labTab===name));
    panes.forEach(pane=>pane.classList.toggle('is-mobile-active',pane.dataset.labPane===name));
  }
  buttons.forEach(button=>button.addEventListener('click',()=>activate(button.dataset.labTab)));
  return activate;
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
      const isSelected=selected.type==='component'&&selected.id===item.slug;
      return '<article class="component-item'+(isSelected?' is-selected':'')+'"><button class="component-select" type="button" data-library-type="component" data-library-id="'+escapeHtml(item.slug)+'">'+escapeHtml(item.name)+'</button></article>';
    }).join('')+'</div></section>';
  }).join('')||'<div class="catalog-loading">没有匹配的组件。</div>';
}
function renderSecondaryLists(){
  const compositeTarget=document.querySelector('#composite-library');
  const patternTarget=document.querySelector('#pattern-library');
  compositeTarget.innerHTML=compositeCatalog.map(item=>'<button type="button" class="'+(selected.type==='composite'&&selected.id===item.id?'is-selected':'')+'" data-library-type="composite" data-library-id="'+escapeHtml(item.id)+'">'+escapeHtml(item.name)+(item.cn?' · '+escapeHtml(item.cn):'')+'</button>').join('');
  patternTarget.innerHTML=patternCatalog.map(item=>'<button type="button" class="'+(selected.type==='pattern'&&selected.id===item.id?'is-selected':'')+'" data-library-type="pattern" data-library-id="'+escapeHtml(item.id)+'">'+escapeHtml(item.name)+(item.cn?' · '+escapeHtml(item.cn):'')+'</button>').join('');
}
function chips(values){
  return (values||[]).filter(Boolean).map(value=>'<span>'+escapeHtml(value)+'</span>').join('');
}
function specList(values){
  const entries=(values||[]).filter(Boolean);
  if(!entries.length) return '<p>—</p>';
  return '<ul>'+entries.slice(0,8).map(value=>'<li>'+escapeHtml(typeof value==='string'?value:JSON.stringify(value))+'</li>').join('')+'</ul>';
}
function variantGrid(dimensions){
  const entries=Object.entries(dimensions||{});
  if(!entries.length) return '<p>—</p>';
  return '<div class="spec-grid">'+entries.map(([key,values])=>'<strong>'+escapeHtml(key)+'</strong><div>'+chips(values)+'</div>').join('')+'</div>';
}
function updateLabLinks({title,preview,contract}){
  document.querySelector('#preview-title').textContent=title;
  document.querySelector('#preview-open').href=preview;
  document.querySelector('#component-preview-frame').src=preview;
  document.querySelector('#spec-preview-link').href=preview;
  document.querySelector('#spec-contract-link').href=contract||preview;
}
async function selectComponent(item){
  selected={type:'component',id:item.slug};
  renderComponents(document.querySelector('#component-filter').value);
  renderSecondaryLists();
  const contractUrl=sourceBase+'/'+item.contract;
  const previewUrl=sourceBase+'/'+item.preview;
  updateLabLinks({title:item.name,preview:previewUrl,contract:contractUrl});
  const specContent=document.querySelector('#spec-content');
  specContent.className='spec-content catalog-loading';
  specContent.textContent='正在读取 '+item.name+' contract…';
  try{
    const contract=await fetchJson(contractUrl);
    document.querySelector('#spec-title').textContent=contract.name||item.name;
    document.querySelector('#spec-intent').textContent=contract.intent||'Canonical component contract';
    document.querySelector('#spec-chips').innerHTML=chips([
      'Schema v'+(contract.schemaVersion||2),
      contract.confidence,
      item.category,
      ...(contract.semanticTypeCandidates||[]).slice(0,2)
    ]);
    const anatomy=contract.anatomy||[];
    const usage=contract.usageHints||contract.interactionContract||contract.structurePatterns||[];
    const avoid=contract.doNotInvent||[];
    specContent.className='spec-content';
    specContent.innerHTML=
      '<section class="spec-section"><h4><span>01</span>Anatomy · 结构</h4><div class="spec-chips">'+chips(anatomy)+'</div></section>'+
      '<section class="spec-section"><h4><span>02</span>Variants · 变体</h4>'+variantGrid(contract.variantDimensions)+'</section>'+
      '<section class="spec-section"><h4><span>03</span>Usage · 使用原则</h4>'+specList(usage)+'</section>'+
      '<section class="spec-section"><h4><span>04</span>Do not invent · 禁止事项</h4>'+specList(avoid)+'</section>';
  }catch(error){
    showError(specContent,error);
  }
}
function selectComposite(item){
  selected={type:'composite',id:item.id};
  renderComponents(document.querySelector('#component-filter').value);
  renderSecondaryLists();
  const previewUrl=sourceBase+'/preview/core-composite-components.html';
  updateLabLinks({title:item.name+(item.cn?' · '+item.cn:''),preview:previewUrl,contract:sourceBase+'/specs/core-composites.json'});
  document.querySelector('#spec-title').textContent=item.name+(item.cn?' · '+item.cn:'');
  document.querySelector('#spec-intent').textContent=item.intent||'Core Composite Component';
  document.querySelector('#spec-chips').innerHTML=chips(['Composite',...(item.components||[]).slice(0,4)]);
  const content=document.querySelector('#spec-content');
  content.className='spec-content';
  content.innerHTML=
    '<section class="spec-section"><h4><span>01</span>Anatomy · 结构</h4><div class="spec-chips">'+chips(item.anatomy||[])+'</div></section>'+
    '<section class="spec-section"><h4><span>02</span>Components · 组成</h4><div class="spec-chips">'+chips(item.components||[])+'</div></section>'+
    '<section class="spec-section"><h4><span>03</span>Rules · 规则</h4>'+specList(item.rules||[])+'</section>'+
    '<section class="spec-section"><h4><span>04</span>Avoid · 避免</h4>'+specList(item.avoid||[])+'</section>';
}
function selectPattern(item){
  selected={type:'pattern',id:item.id};
  renderComponents(document.querySelector('#component-filter').value);
  renderSecondaryLists();
  const previewUrl=sourceBase+'/preview/core-ux-patterns.html';
  updateLabLinks({title:item.name+(item.cn?' · '+item.cn:''),preview:previewUrl,contract:sourceBase+'/specs/core-patterns.json'});
  document.querySelector('#spec-title').textContent=item.name+(item.cn?' · '+item.cn:'');
  document.querySelector('#spec-intent').textContent=item.intent||'Core UX Pattern';
  document.querySelector('#spec-chips').innerHTML=chips(['UX Pattern',...(item.components||[]).slice(0,4)]);
  const content=document.querySelector('#spec-content');
  content.className='spec-content';
  content.innerHTML=
    '<section class="spec-section"><h4><span>01</span>Anatomy · 结构</h4><div class="spec-chips">'+chips(item.anatomy||[])+'</div></section>'+
    '<section class="spec-section"><h4><span>02</span>Components · 组成</h4><div class="spec-chips">'+chips(item.components||[])+'</div></section>'+
    '<section class="spec-section"><h4><span>03</span>Rules · 规则</h4>'+specList(item.rules||[])+'</section>'+
    '<section class="spec-section"><h4><span>04</span>Avoid · 避免</h4>'+specList(item.avoid||[])+'</section>';
}
function selectLibraryItem(type,id,mobileActivate){
  if(type==='component'){
    const item=componentCatalog.find(entry=>entry.slug===id);
    if(item) selectComponent(item);
  }else if(type==='composite'){
    const item=compositeCatalog.find(entry=>entry.id===id);
    if(item) selectComposite(item);
  }else if(type==='pattern'){
    const item=patternCatalog.find(entry=>entry.id===id);
    if(item) selectPattern(item);
  }
  if(matchMedia('(max-width: 840px)').matches) mobileActivate('preview');
}
function bindLibraryClicks(mobileActivate){
  document.querySelector('#component-groups').addEventListener('click',event=>{
    const button=event.target.closest('[data-library-type]');
    if(button) selectLibraryItem(button.dataset.libraryType,button.dataset.libraryId,mobileActivate);
  });
  document.querySelector('#composite-library').addEventListener('click',event=>{
    const button=event.target.closest('[data-library-type]');
    if(button) selectLibraryItem(button.dataset.libraryType,button.dataset.libraryId,mobileActivate);
  });
  document.querySelector('#pattern-library').addEventListener('click',event=>{
    const button=event.target.closest('[data-library-type]');
    if(button) selectLibraryItem(button.dataset.libraryType,button.dataset.libraryId,mobileActivate);
  });
}
async function init(){
  initialTheme();
  setupThemeControls();
  setupMobileMenu();
  setupToc();
  const mobileActivate=setupLabTabs();

  try{
    const [manifest,components,composites,patterns,current]=await Promise.all([
      fetchJson(sourceBase+'/specs/design-system-v1.json'),
      fetchJson(sourceBase+'/components/index.json'),
      fetchJson(sourceBase+'/specs/core-composites.json'),
      fetchJson(sourceBase+'/specs/core-patterns.json'),
      fetchJson(siteBase+'current.json').catch(()=>null)
    ]);

    componentCatalog=Array.isArray(components.components)?components.components:[];
    compositeCatalog=Array.isArray(composites.composites)?composites.composites:[];
    patternCatalog=Array.isArray(patterns.patterns)?patterns.patterns:[];

    document.querySelector('#component-count').textContent=String(componentCatalog.length);
    document.querySelector('#composite-count').textContent=String(compositeCatalog.length);
    document.querySelector('#pattern-count').textContent=String(patternCatalog.length);
    document.querySelector('#library-component-count').textContent=String(componentCatalog.length);
    document.querySelector('#library-composite-count').textContent=String(compositeCatalog.length);
    document.querySelector('#library-pattern-count').textContent=String(patternCatalog.length);

    const version=manifest.$metadata?.version||'unknown';
    document.querySelector('#version-chip').textContent=version;
    document.querySelector('#hero-version').textContent='v'+version;

    renderComponents();
    renderSecondaryLists();
    bindLibraryClicks(mobileActivate);
    document.querySelector('#component-filter').addEventListener('input',event=>renderComponents(event.target.value));

    const button=componentCatalog.find(item=>item.slug==='button')||componentCatalog[0];
    if(button) await selectComponent(button);

    if(current){
      document.querySelector('#source-revision').textContent='source revision: '+current.sourceRevision;
    }
  }catch(error){
    showError(document.querySelector('#component-groups'),error);
    showError(document.querySelector('#spec-content'),error);
  }
}
init();
