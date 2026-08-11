const components = [
  {slug:'button',name:'Button',zh:'按钮',category:'actions-forms',desc:'主操作与动作层级。40/48px，扁平无阴影。'},
  {slug:'icon-button',name:'Icon Button',zh:'图标按钮',category:'actions-forms',desc:'紧凑图标动作，视觉尺寸与点击区域分离。'},
  {slug:'input',name:'Input / Text Field',zh:'输入框',category:'actions-forms',desc:'文本输入与字段级校验，区分 readonly 与 disabled。'},
  {slug:'textarea',name:'Textarea',zh:'多行输入',category:'actions-forms',desc:'多行文本输入，继承 Input 状态并支持计数。'},
  {slug:'select',name:'Select / Picker Trigger',zh:'选择器',category:'actions-forms',desc:'选择触发器；弹出层行为由平台策略决定。'},
  {slug:'checkbox',name:'Checkbox',zh:'复选框',category:'actions-forms',desc:'多选与独立布尔选择，包含 indeterminate 状态。'},
  {slug:'radio',name:'Radio',zh:'单选框',category:'actions-forms',desc:'组内互斥单选，强调清晰的选中反馈。'},
  {slug:'switch',name:'Switch',zh:'开关',category:'actions-forms',desc:'即时生效的二元设置，不替代确认型动作。'},

  {slug:'list-item',name:'List Item',zh:'列表项',category:'navigation-information',desc:'高频信息行，稳定的 leading / content / trailing 结构。'},
  {slug:'tabs',name:'Tabs',zh:'标签页',category:'navigation-information',desc:'同层内容视图切换，不承担顶级目的地导航。'},
  {slug:'segmented-control',name:'Segmented Control',zh:'分段控制',category:'navigation-information',desc:'局部模式切换，适合少量、短文本互斥选项。'},
  {slug:'top-app-bar',name:'Top App Bar',zh:'顶部应用栏',category:'navigation-information',desc:'页级导航与关键动作，尾部操作保持克制。'},
  {slug:'bottom-navigation',name:'Bottom Navigation',zh:'底部导航',category:'navigation-information',desc:'3–5 个顶级目的地，Brand Indigo 表示当前项。'},
  {slug:'section',name:'Section',zh:'内容分组',category:'navigation-information',desc:'默认的信息组织单元；优先于为了分组而套 Card。'},
  {slug:'divider',name:'Divider',zh:'分割线',category:'navigation-information',desc:'轻量层级分隔，不替代真正的空间节奏。'},
  {slug:'card',name:'Card',zh:'卡片',category:'navigation-information',desc:'独立实体容器；Flat-first，不默认加阴影。'},
  {slug:'tag',name:'Tag',zh:'标签',category:'navigation-information',desc:'短文本分类与语义标记，不承担唯一状态信号。'},
  {slug:'badge',name:'Badge',zh:'徽标',category:'navigation-information',desc:'数量、提醒或轻量状态提示，依附于主体信息。'},
  {slug:'avatar',name:'Avatar',zh:'头像',category:'navigation-information',desc:'人物或实体识别，提供图片、文字等降级策略。'},

  {slug:'toast',name:'Toast',zh:'轻提示',category:'feedback-overlay-progress',desc:'短暂、非阻塞反馈，不承载需要操作的复杂信息。'},
  {slug:'snackbar',name:'Snackbar',zh:'操作反馈条',category:'feedback-overlay-progress',desc:'短暂反馈并可携带一个低成本恢复动作。'},
  {slug:'alert',name:'Alert / Inline Banner',zh:'行内提醒',category:'feedback-overlay-progress',desc:'保留在上下文中的持续反馈，优先于弹窗打断。'},
  {slug:'dialog',name:'Dialog',zh:'对话框',category:'feedback-overlay-progress',desc:'需要明确决策的阻塞层；同一时刻只允许一个。'},
  {slug:'bottom-sheet',name:'Bottom Sheet',zh:'底部抽屉',category:'feedback-overlay-progress',desc:'移动端补充操作或内容层，保持单层阻塞关系。'},
  {slug:'loading-indicator',name:'Loading Indicator',zh:'加载指示器',category:'feedback-overlay-progress',desc:'结构未知时表达等待，不替代已知结构的 Skeleton。'},
  {slug:'skeleton',name:'Skeleton',zh:'骨架屏',category:'feedback-overlay-progress',desc:'内容结构已知时的加载占位，减少布局跳动。'},
  {slug:'empty-state',name:'Empty State',zh:'空状态',category:'feedback-overlay-progress',desc:'无内容时解释现状，并在必要时提供下一步动作。'},
  {slug:'progress-indicator',name:'Progress Indicator',zh:'进度指示',category:'feedback-overlay-progress',desc:'表示可计算任务进度，不与流程步骤或历史混用。'},
  {slug:'stepper',name:'Stepper',zh:'步骤条',category:'feedback-overlay-progress',desc:'有限步骤的待完成流程，强调当前位置与后续。'},
  {slug:'timeline',name:'Timeline',zh:'时间线',category:'feedback-overlay-progress',desc:'已经发生的事件历史，不表达待完成流程。'},

  {slug:'search-field',name:'Search Field',zh:'搜索框',category:'search-menu',desc:'搜索专用输入，保留 Query、Clear 与结果上下文。'},
  {slug:'menu',name:'Menu',zh:'菜单',category:'search-menu',desc:'承接上下文动作，不承担页面信息架构。'},
  {slug:'menu-item',name:'Menu Item',zh:'菜单项',category:'search-menu',desc:'菜单内部的单个动作或选择项，保持可扫描层级。'}
];

const categoryLabels = {
  'actions-forms':'Actions & Forms',
  'navigation-information':'Navigation & Information',
  'feedback-overlay-progress':'Feedback / Overlay / Progress',
  'search-menu':'Search & Menu'
};

const grid = document.querySelector('#component-grid');
const search = document.querySelector('#component-search');
const filters = [...document.querySelectorAll('.filter')];
const empty = document.querySelector('#empty-result');
const viewer = document.querySelector('#viewer');
const title = document.querySelector('#viewer-title');
const category = document.querySelector('#viewer-category');
const description = document.querySelector('#viewer-description');
const preview = document.querySelector('#component-preview');
const previewLink = document.querySelector('#preview-link');
const contractLink = document.querySelector('#contract-link');
const sourcePath = document.querySelector('#source-path');
const toolbarTitle = document.querySelector('#preview-toolbar-title');

let activeCategory = 'all';
let selectedSlug = getInitialSlug();

function getInitialSlug(){
  const hash = decodeURIComponent(location.hash.replace(/^#/,''));
  return components.some(item => item.slug === hash) ? hash : 'button';
}

function matches(item){
  const q = search.value.trim().toLowerCase();
  const categoryOk = activeCategory === 'all' || item.category === activeCategory;
  const haystack = `${item.name} ${item.zh} ${item.slug} ${item.desc}`.toLowerCase();
  return categoryOk && (!q || haystack.includes(q));
}

function renderGrid(){
  const visible = components.filter(matches);
  grid.innerHTML = visible.map(item => {
    const index = String(components.indexOf(item) + 1).padStart(2,'0');
    const active = item.slug === selectedSlug;
    return `
      <button class="component-card${active ? ' is-active' : ''}" type="button"
        data-slug="${item.slug}" data-category="${item.category}" aria-pressed="${active}">
        <span class="card-index"><span>${index} · ${categoryLabels[item.category]}</span><i></i></span>
        <h3>${item.name}</h3>
        <p>${item.zh} · ${item.desc}</p>
        <span class="card-slug">${item.slug}</span>
      </button>`;
  }).join('');
  empty.hidden = visible.length !== 0;
  grid.querySelectorAll('.component-card').forEach(card => {
    card.addEventListener('click', () => selectComponent(card.dataset.slug, true));
  });
}

function selectComponent(slug, scrollToViewer = false){
  const item = components.find(entry => entry.slug === slug);
  if(!item) return;
  selectedSlug = slug;
  const previewPath = `./design-source/preview/component-${item.slug}.html`;
  const contractPath = `./design-source/components/${item.slug}.json`;

  title.textContent = item.name;
  category.textContent = categoryLabels[item.category].toUpperCase();
  description.textContent = `${item.zh} · ${item.desc}`;
  preview.src = previewPath;
  preview.title = `${item.name} 组件真实预览`;
  previewLink.href = previewPath;
  contractLink.href = contractPath;
  sourcePath.textContent = `design-source/preview/component-${item.slug}.html`;
  toolbarTitle.textContent = `${item.name} · Com Design`;

  if(location.hash !== `#${slug}`){
    history.replaceState(null,'',`#${slug}`);
  }
  renderGrid();
  if(scrollToViewer){
    viewer.scrollIntoView({behavior:'smooth',block:'start'});
  }
}

filters.forEach(button => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    filters.forEach(item => item.classList.toggle('is-active', item === button));
    renderGrid();
  });
});

search.addEventListener('input', renderGrid);
window.addEventListener('hashchange', () => {
  const slug = getInitialSlug();
  if(slug !== selectedSlug) selectComponent(slug, false);
});

renderGrid();
selectComponent(selectedSlug, false);
