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
      const contract=sourceBase+'/'+item.contract;
      const preview=sourceBase+'/'+item.preview;
      return '<article class="component-item" data-slug="'+escapeHtml(item.slug)+'"><strong>'+escapeHtml(item.name)+'</strong><span class="component-actions"><a href="'+contract+'">Contract ↗</a><a href="'+preview+'">Preview ↗</a></span></article>';
    }).join('')+'</div></section>';
  }).join('')||'<div class="catalog-loading">没有匹配的组件。</div>';
}
function renderCards(targetId,items,kind){
  const target=document.querySelector(targetId);
  target.className='card-grid';
  target.innerHTML=items.map((item,index)=>{
    const title=escapeHtml(item.name||item.id);
    const cn=item.cn?' <span>'+escapeHtml(item.cn)+'</span>':'';
    const intent=escapeHtml(item.intent||'');
    const meta=kind==='pattern'
      ? 'Pattern '+String(index+1).padStart(2,'0')+' · '+escapeHtml((item.components||[]).join(' · '))
      : 'Composite · '+escapeHtml((item.components||[]).join(' · '));
    return '<article class="catalog-card" data-id="'+escapeHtml(item.id)+'"><h3>'+title+cn+'</h3><p>'+intent+'</p><div class="meta">'+meta+'</div></article>';
  }).join('');
}
async function init(){
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
    document.querySelector('#system-version').textContent=manifest.$metadata?.version||'unknown';
    renderComponents();
    renderCards('#composite-list',compositeCatalog,'composite');
    renderCards('#pattern-list',patternCatalog,'pattern');
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
