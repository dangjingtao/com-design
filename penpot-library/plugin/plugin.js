/* Com Design Mobile V1 RC — PenPot native reusable library builder
 *
 * Scope intentionally stops at the priority VISUAL GATE. Do not broaden to the
 * remaining catalog until these assets have been inspected in PenPot.
 *
 * Requirements:
 *   1. Import ../dist/com-design-mobile.tokens.json first.
 *   2. Run in a fresh PenPot file (safe fail if generated assets already exist).
 */

(async () => {
  'use strict';

  const VERSION = '1.0.0-rc.1';
  const PAGE_NAME = '90 Reusable Component Library';
  const GENERATED_KEY = 'com-design-generated';
  const CANONICAL_KEY = 'com-design-canonical-id';
  const CONTRACT_KEY = 'com-design-contract';

  const REQUIRED_SETS = [
    'Foundation/Core',
    'Semantic/Light',
    'Semantic/Dark',
    'Density/Compact',
    'Density/Comfortable',
    'Platform/Canonical',
    'Platform/iOS',
    'Platform/Android'
  ];

  const library = penpot.library.local;
  if (!library || !penpot.currentFile) throw new Error('No active PenPot file/library.');

  const existingGenerated = library.components.filter((component) => {
    try { return component.getPluginData(GENERATED_KEY) === VERSION; }
    catch { return false; }
  });
  if (existingGenerated.length) {
    throw new Error(`Com Design ${VERSION} generated assets already exist. Use a fresh file for deterministic validation instead of stacking duplicates.`);
  }

  const sets = library.tokens.sets;
  const setNames = new Set(sets.map((set) => set.name));
  const missingSets = REQUIRED_SETS.filter((name) => !setNames.has(name));
  if (missingSets.length) {
    throw new Error(`Import penpot-library/dist/com-design-mobile.tokens.json first. Missing token sets: ${missingSets.join(', ')}`);
  }

  const tokensByName = new Map();
  for (const set of sets) {
    for (const token of set.tokens) {
      if (!tokensByName.has(token.name)) tokensByName.set(token.name, token);
    }
  }

  const REQUIRED_TOKENS = [
    'color.text.primary','color.text.secondary','color.text.tertiary','color.text.placeholder','color.text.disabled','color.text.inverse','color.text.brand',
    'color.surface.page','color.surface.default','color.surface.subtle','color.surface.selected','color.surface.pressed',
    'color.border.subtle','color.border.default','color.border.focused','color.border.error',
    'color.action.primary','color.action.primaryPressed','color.action.secondary','color.action.secondaryPressed','color.action.destructive','color.action.destructivePressed','color.action.disabled',
    'color.status.success','color.status.successBg','color.status.successText','color.status.warning','color.status.warningBg','color.status.warningText','color.status.danger','color.status.dangerBg','color.status.dangerText','color.status.info','color.status.infoBg','color.status.infoText',
    'typography.caption','typography.labelSmall','typography.bodySmall','typography.label','typography.body','typography.headingSmall','typography.heading',
    'radius.control','radius.container','radius.overlay','radius.pill','border.control','border.focus','elevation.floating','elevation.modal',
    'density.controlHeight','density.controlHeightLarge','density.paddingHorizontal','density.paddingVertical','density.internalGap','density.contentInset','density.sectionGap','density.fieldLabelGap','density.fieldHelperGap'
  ];
  const missingTokens = REQUIRED_TOKENS.filter((name) => !tokensByName.has(name));
  if (missingTokens.length) throw new Error(`Token adapter is incomplete. Missing: ${missingTokens.join(', ')}`);

  const token = (name) => {
    const value = tokensByName.get(name);
    if (!value) throw new Error(`Missing token: ${name}`);
    return value;
  };

  const bind = (shape, name, properties) => {
    token(name).applyToShapes([shape], properties);
    return shape;
  };

  const bindRadius = (shape, name) => bind(shape, name, [
    'borderRadiusTopLeft','borderRadiusTopRight','borderRadiusBottomRight','borderRadiusBottomLeft'
  ]);

  const baseFill = (shape, color = '#FFFFFF', opacity = 1) => {
    shape.fills = [{fillColor: color, fillOpacity: opacity}];
    return shape;
  };

  const transparent = (shape) => baseFill(shape, '#FFFFFF', 0);

  const fill = (shape, tokenName) => {
    baseFill(shape);
    return bind(shape, tokenName, ['fill']);
  };

  const stroke = (shape, colorToken = 'color.border.default', widthToken = 'border.control') => {
    shape.strokes = [{strokeColor:'#687288', strokeStyle:'solid', strokeWidth:1, strokeAlignment:'inner'}];
    bind(shape, colorToken, ['strokeColor']);
    bind(shape, widthToken, ['strokeWidth']);
    return shape;
  };

  const txt = (name, content, typography = 'typography.body', color = 'color.text.primary') => {
    const shape = penpot.createText(content);
    if (!shape) throw new Error(`Unable to create text: ${content}`);
    shape.name = name;
    baseFill(shape, '#252B3D');
    bind(shape, typography, ['typography']);
    bind(shape, color, ['fill']);
    return shape;
  };

  const tinyIcon = (name, symbol = '•', color = 'color.text.secondary') => {
    const shape = txt(name, symbol, 'typography.label', color);
    shape.setPluginData?.('slot', 'icon');
    return shape;
  };

  const frame = (name, {width = 320, height = 40, dir = 'row', surface = 'color.surface.default', radius, padding = true, gap = true} = {}) => {
    const board = penpot.createBoard();
    board.name = name;
    board.resize(width, height);
    board.clipContent = false;
    board.showInViewMode = false;
    if (surface === 'transparent') transparent(board); else fill(board, surface);
    if (radius) bindRadius(board, radius);
    const flex = board.addFlexLayout();
    flex.dir = dir;
    flex.wrap = 'nowrap';
    flex.alignItems = dir === 'row' ? 'center' : 'stretch';
    flex.justifyContent = 'start';
    flex.horizontalSizing = width === 'auto' ? 'auto' : 'fix';
    flex.verticalSizing = height === 'auto' ? 'auto' : 'fix';
    if (padding) {
      bind(board, 'density.paddingHorizontal', ['paddingLeft','paddingRight']);
      bind(board, 'density.paddingVertical', ['paddingTop','paddingBottom']);
    }
    if (gap) bind(board, 'density.internalGap', [dir === 'row' ? 'columnGap' : 'rowGap']);
    return board;
  };

  const append = (parent, ...children) => {
    for (const child of children.flat().filter(Boolean)) parent.appendChild(child);
    return parent;
  };

  const formula = (props) => Object.entries(props).map(([key, value]) => `${key}=${value}`).join(', ');

  let cursorY = 240;
  const built = [];

  function stamp(component, canonicalId, contract) {
    component.setPluginData(GENERATED_KEY, VERSION);
    component.setPluginData(CANONICAL_KEY, canonicalId);
    component.setPluginData(CONTRACT_KEY, contract);
  }

  function stampShape(shape, canonicalId, contract) {
    shape.setPluginData(GENERATED_KEY, VERSION);
    shape.setPluginData(CANONICAL_KEY, canonicalId);
    shape.setPluginData(CONTRACT_KEY, contract);
  }

  function makeVariantSet({family, name, id, contract, variants, render}) {
    const components = [];
    const mains = [];
    variants.forEach((props, index) => {
      const board = render(props);
      board.name = formula(props);
      board.x = 80 + (index % 6) * 380;
      board.y = cursorY + Math.floor(index / 6) * 220;
      stampShape(board, id, contract);
      const component = library.createComponent([board]);
      component.name = board.name;
      component.path = `${family}/${name}`;
      stamp(component, id, contract);
      components.push(component);
      mains.push(board);
    });

    const container = penpot.createVariantFromComponents(mains);
    container.name = `${name} · Variants`;
    container.x = 80;
    container.y = cursorY;
    stampShape(container, id, contract);

    for (const component of components) {
      if (!component.isVariant()) throw new Error(`${family}/${name}: PenPot did not convert component to a real Variant.`);
      if (component.variantError) throw new Error(`${family}/${name}: invalid variant formula: ${component.variantError}`);
    }

    const height = Math.max(container.height || 300, 300);
    cursorY += height + 180;
    built.push({id, path:`${family}/${name}`, variants:variants.length});
  }

  const ensurePage = async () => {
    let page = penpot.currentFile.pages.find((item) => item.name === PAGE_NAME);
    if (!page) {
      page = penpot.createPage();
      page.name = PAGE_NAME;
    }
    await penpot.openPage(page);
    return page;
  };

  await ensurePage();

  // Header is informational only; it is not a Spec Board and is never a library asset.
  const title = txt('page-title', `Com Design Mobile ${VERSION} · Reusable Component Visual Gate`, 'typography.heading', 'color.text.primary');
  title.x = 80; title.y = 72;
  const subtitle = txt('page-subtitle', 'Native PenPot Components + Variants. Review this batch before enabling the remaining 33-component catalog.', 'typography.bodySmall', 'color.text.secondary');
  subtitle.x = 80; subtitle.y = 112;

  // ---------------------------------------------------------------------------
  // Actions & Forms / Button
  // ---------------------------------------------------------------------------
  const buttonVariants = [];
  for (const Type of ['Primary','Secondary','Outline','Ghost','Destructive']) {
    for (const State of ['Default','Pressed','Disabled','Loading']) {
      for (const Size of ['Regular','Large']) buttonVariants.push({Type,State,Size});
    }
  }

  const buttonStyle = (Type, State) => {
    const disabled = State === 'Disabled';
    const loading = State === 'Loading';
    const visualState = loading ? 'Default' : State;
    const table = {
      Primary: {
        Default:{bg:'color.action.primary', text:'color.text.inverse'},
        Pressed:{bg:'color.action.primaryPressed', text:'color.text.inverse'},
        Disabled:{bg:'color.action.disabled', text:'color.text.disabled'}
      },
      Secondary: {
        Default:{bg:'color.action.secondary', text:'color.text.brand'},
        Pressed:{bg:'color.action.secondaryPressed', text:'color.text.brand'},
        Disabled:{bg:'color.action.disabled', text:'color.text.disabled'}
      },
      Outline: {
        Default:{bg:'color.surface.default', text:'color.text.brand', border:'color.border.default'},
        Pressed:{bg:'color.surface.selected', text:'color.text.brand', border:'color.border.default'},
        Disabled:{bg:'color.surface.default', text:'color.text.disabled', border:'color.border.subtle'}
      },
      Ghost: {
        Default:{bg:'transparent', text:'color.text.brand'},
        Pressed:{bg:'color.surface.selected', text:'color.text.brand'},
        Disabled:{bg:'transparent', text:'color.text.disabled'}
      },
      Destructive: {
        Default:{bg:'color.action.destructive', text:'color.text.inverse'},
        Pressed:{bg:'color.action.destructivePressed', text:'color.text.inverse'},
        Disabled:{bg:'color.action.disabled', text:'color.text.disabled'}
      }
    };
    return {...table[Type][disabled ? 'Disabled' : visualState], loading};
  };

  makeVariantSet({
    family:'Actions & Forms', name:'Button', id:'button', contract:'contracts/actions-forms.json', variants:buttonVariants,
    render:({Type,State,Size}) => {
      const style = buttonStyle(Type, State);
      const board = frame('button', {width:144,height:Size === 'Large' ? 48 : 40,dir:'row',surface:style.bg,radius:'radius.control'});
      bind(board, Size === 'Large' ? 'density.controlHeightLarge' : 'density.controlHeight', ['height']);
      if (style.border) stroke(board, style.border, 'border.control');
      const spinner = tinyIcon('spinner', '◌', style.text);
      const label = txt('label', 'Button', 'typography.label', style.text);
      spinner.visible = State === 'Loading';
      append(board, spinner, label);
      return board;
    }
  });

  // ---------------------------------------------------------------------------
  // Actions & Forms / Input
  // ---------------------------------------------------------------------------
  const inputVariants = ['Empty','Value','Focused','Error','Disabled','Read Only'].map((State) => ({State}));
  makeVariantSet({
    family:'Actions & Forms', name:'Input', id:'input', contract:'contracts/actions-forms.json', variants:inputVariants,
    render:({State}) => {
      const root = frame('field', {width:328,height:88,dir:'column',surface:'transparent',padding:false,gap:false});
      root.horizontalSizing = 'fix'; root.verticalSizing = 'auto';
      const rootFlex = root.flex; rootFlex.verticalSizing = 'auto'; rootFlex.rowGap = 6;
      bind(root, 'density.fieldLabelGap', ['rowGap']);
      const label = txt('label','Label','typography.labelSmall', State === 'Disabled' ? 'color.text.disabled' : 'color.text.secondary');
      const control = frame('container',{width:328,height:40,dir:'row',surface:State === 'Disabled' ? 'color.surface.subtle' : 'color.surface.default',radius:'radius.control'});
      bind(control,'density.controlHeight',['height']);
      let border = 'color.border.default';
      let width = 'border.control';
      if (State === 'Focused') { border = 'color.border.focused'; width = 'border.focus'; }
      if (State === 'Error') border = 'color.border.error';
      if (State === 'Disabled' || State === 'Read Only') border = 'color.border.subtle';
      stroke(control,border,width);
      const content = State === 'Empty' ? 'Placeholder' : State === 'Value' ? 'Entered value' : State === 'Read Only' ? 'Read-only value' : 'Input value';
      const textColor = State === 'Empty' ? 'color.text.placeholder' : State === 'Disabled' ? 'color.text.disabled' : 'color.text.primary';
      const value = txt('valueOrPlaceholder',content,'typography.body',textColor);
      append(control,value);
      const helper = txt('helper',State === 'Error' ? 'Explain what needs attention' : 'Helper text','typography.caption',State === 'Error' ? 'color.status.dangerText' : 'color.text.tertiary');
      append(root,label,control,helper);
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Search & Menu / Search Field
  // ---------------------------------------------------------------------------
  const searchVariants = ['Idle','Focused','Query','Loading','Disabled'].map((State) => ({State}));
  makeVariantSet({
    family:'Search & Menu', name:'Search Field', id:'searchField', contract:'contracts/search-menu.json', variants:searchVariants,
    render:({State}) => {
      const board = frame('searchField',{width:328,height:40,dir:'row',surface:State === 'Disabled' ? 'color.surface.subtle' : 'color.surface.default',radius:'radius.control'});
      bind(board,'density.controlHeight',['height']);
      stroke(board, State === 'Focused' ? 'color.border.focused' : 'color.border.subtle', State === 'Focused' ? 'border.focus' : 'border.control');
      const icon = tinyIcon('leadingIcon','⌕',State === 'Disabled' ? 'color.text.disabled' : 'color.text.secondary');
      const query = txt('query',State === 'Query' || State === 'Loading' ? 'Design system' : 'Search','typography.body',State === 'Idle' || State === 'Focused' ? 'color.text.placeholder' : State === 'Disabled' ? 'color.text.disabled' : 'color.text.primary');
      const trailing = tinyIcon('trailingAction',State === 'Loading' ? '◌' : '×',State === 'Disabled' ? 'color.text.disabled' : 'color.text.tertiary');
      trailing.visible = ['Query','Loading'].includes(State);
      append(board,icon,query,trailing);
      return board;
    }
  });

  // ---------------------------------------------------------------------------
  // Navigation & Information / List Item
  // ---------------------------------------------------------------------------
  const listVariants = [];
  for (const Content of ['Single line','Two line']) {
    listVariants.push({Type:'Static',State:'Default',Content});
    for (const State of ['Default','Pressed','Disabled']) listVariants.push({Type:'Actionable',State,Content});
    for (const State of ['Default','Pressed','Selected','Disabled']) listVariants.push({Type:'Selectable',State,Content});
    listVariants.push({Type:'Status-bearing',State:'Default',Content});
  }
  makeVariantSet({
    family:'Navigation & Information', name:'List Item', id:'listItem', contract:'contracts/navigation-information.json', variants:listVariants,
    render:({Type,State,Content}) => {
      const surface = State === 'Pressed' ? 'color.surface.pressed' : State === 'Selected' ? 'color.surface.selected' : 'color.surface.default';
      const board = frame('listItem',{width:344,height:Content === 'Two line' ? 64 : 48,dir:'row',surface,radius:null});
      bind(board,'density.contentInset',['paddingLeft','paddingRight']);
      const lead = tinyIcon('leading','●',State === 'Disabled' ? 'color.text.disabled' : Type === 'Status-bearing' ? 'color.status.info' : 'color.text.tertiary');
      const content = frame('content',{width:230,height:Content === 'Two line' ? 44 : 24,dir:'column',surface:'transparent',padding:false,gap:false});
      content.flex.rowGap = 2;
      const primary = txt('primary','List item','typography.body',State === 'Disabled' ? 'color.text.disabled' : 'color.text.primary');
      const secondary = txt('secondary','Supporting information','typography.bodySmall',State === 'Disabled' ? 'color.text.disabled' : 'color.text.secondary');
      secondary.visible = Content === 'Two line';
      append(content,primary,secondary);
      const trail = tinyIcon('trailing',Type === 'Selectable' && State === 'Selected' ? '✓' : Type === 'Status-bearing' ? 'Info' : '›',State === 'Disabled' ? 'color.text.disabled' : Type === 'Selectable' && State === 'Selected' ? 'color.text.brand' : 'color.text.tertiary');
      append(board,lead,content,trail);
      return board;
    }
  });

  // ---------------------------------------------------------------------------
  // Navigation & Information / Tabs
  // ---------------------------------------------------------------------------
  const tabsVariants = [];
  for (const Layout of ['Fixed','Scrollable']) for (const Active of ['1','2','3']) tabsVariants.push({Layout,Active});
  makeVariantSet({
    family:'Navigation & Information', name:'Tabs', id:'tabs', contract:'contracts/navigation-information.json', variants:tabsVariants,
    render:({Layout,Active}) => {
      const root = frame('tabs',{width:344,height:48,dir:'row',surface:'color.surface.default',padding:false,gap:false});
      root.flex.justifyContent = Layout === 'Fixed' ? 'space-between' : 'start';
      root.flex.columnGap = Layout === 'Scrollable' ? 24 : 0;
      ['1','2','3'].forEach((index) => {
        const item = frame(`tab-${index}`,{width:Layout === 'Fixed' ? 110 : 88,height:48,dir:'column',surface:'transparent',padding:false,gap:false});
        item.flex.alignItems = 'center'; item.flex.justifyContent = 'center'; item.flex.rowGap = 8;
        const active = Active === index;
        const label = txt('label',`Tab ${index}`,'typography.label',active ? 'color.text.brand' : 'color.text.secondary');
        const indicator = penpot.createRectangle();
        indicator.name = 'indicator'; indicator.resize(Layout === 'Fixed' ? 76 : 56,2);
        if (active) fill(indicator,'color.action.primary'); else transparent(indicator);
        append(item,label,indicator); append(root,item);
      });
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Navigation & Information / Bottom Navigation
  // ---------------------------------------------------------------------------
  const navVariants = [];
  for (const Destinations of ['3','4','5']) for (const Selected of ['1','2']) navVariants.push({Destinations,Selected});
  makeVariantSet({
    family:'Navigation & Information', name:'Bottom Navigation', id:'bottomNavigation', contract:'contracts/navigation-information.json', variants:navVariants,
    render:({Destinations,Selected}) => {
      const count = Number(Destinations);
      const root = frame('bottomNavigation',{width:360,height:64,dir:'row',surface:'color.surface.default',padding:false,gap:false});
      stroke(root,'color.border.subtle','border.control');
      root.flex.justifyContent = 'space-around'; root.flex.alignItems = 'center';
      for (let i = 1; i <= count; i += 1) {
        const active = Selected === String(i);
        const item = frame(`destination-${i}`,{width:64,height:56,dir:'column',surface:'transparent',padding:false,gap:false});
        item.flex.alignItems='center'; item.flex.justifyContent='center'; item.flex.rowGap=4;
        const icon = tinyIcon('icon',active ? '●' : '○',active ? 'color.text.brand' : 'color.text.tertiary');
        const label = txt('label',`Item ${i}`,'typography.labelSmall',active ? 'color.text.brand' : 'color.text.tertiary');
        append(item,icon,label); append(root,item);
      }
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Navigation & Information / Section
  // ---------------------------------------------------------------------------
  const sectionVariants = ['None','Title','Title + action'].map((Header) => ({Header}));
  makeVariantSet({
    family:'Navigation & Information', name:'Section', id:'section', contract:'contracts/navigation-information.json', variants:sectionVariants,
    render:({Header}) => {
      const root = frame('section',{width:344,height:144,dir:'column',surface:'transparent',padding:false,gap:false});
      bind(root,'density.sectionGap',['rowGap']);
      const header = frame('header',{width:344,height:28,dir:'row',surface:'transparent',padding:false,gap:false});
      header.flex.justifyContent='space-between';
      const titleText = txt('title','Section title','typography.headingSmall','color.text.primary');
      const action = txt('action','View all','typography.labelSmall','color.text.brand');
      titleText.visible = Header !== 'None'; action.visible = Header === 'Title + action';
      append(header,titleText,action);
      const content = frame('content',{width:344,height:96,dir:'column',surface:'transparent',padding:false,gap:false});
      content.flex.rowGap=8;
      append(content,txt('content-line-1','Grouped content belongs here','typography.body','color.text.primary'),txt('content-line-2','Section provides hierarchy without forcing a card.','typography.bodySmall','color.text.secondary'));
      append(root,header,content);
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Navigation & Information / Card
  // ---------------------------------------------------------------------------
  const cardVariants = [];
  for (const State of ['Default','Pressed']) for (const Border of ['Off','On']) cardVariants.push({State,Border});
  makeVariantSet({
    family:'Navigation & Information', name:'Card', id:'card', contract:'contracts/navigation-information.json', variants:cardVariants,
    render:({State,Border}) => {
      const root = frame('card',{width:328,height:132,dir:'column',surface:State === 'Pressed' ? 'color.surface.pressed' : 'color.surface.default',radius:'radius.container'});
      root.flex.rowGap=8;
      if (Border === 'On') stroke(root,'color.border.subtle','border.control');
      append(root,txt('title','Card title','typography.headingSmall','color.text.primary'),txt('body','Use a card only when the content needs a bounded container.','typography.bodySmall','color.text.secondary'));
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Feedback, Overlay & Progress / Dialog
  // ---------------------------------------------------------------------------
  const dialogVariants = [];
  for (const Actions of ['One','Two','Stacked']) for (const Intent of ['Default','Destructive']) dialogVariants.push({Actions,Intent});
  makeVariantSet({
    family:'Feedback, Overlay & Progress', name:'Dialog', id:'dialog', contract:'contracts/feedback-overlay-progress.json', variants:dialogVariants,
    render:({Actions,Intent}) => {
      const root = frame('dialog',{width:328,height:Actions === 'Stacked' ? 236 : 208,dir:'column',surface:'color.surface.default',radius:'radius.overlay'});
      bind(root,'elevation.modal',['shadow']);
      root.flex.rowGap=16;
      append(root,txt('title',Intent === 'Destructive' ? 'Delete item?' : 'Confirm action','typography.heading','color.text.primary'),txt('body',Intent === 'Destructive' ? 'This action cannot be undone.' : 'Review the information before continuing.','typography.body','color.text.secondary'));
      const actions = frame('actions',{width:296,height:Actions === 'Stacked' ? 96 : 44,dir:Actions === 'Stacked' ? 'column' : 'row',surface:'transparent',padding:false,gap:false});
      actions.flex.justifyContent='end'; actions.flex.columnGap=8; actions.flex.rowGap=8;
      const cancel = frame('secondaryAction',{width:96,height:40,dir:'row',surface:'color.action.secondary',radius:'radius.control'}); cancel.flex.justifyContent='center'; append(cancel,txt('label','Cancel','typography.label','color.text.brand'));
      const confirm = frame('primaryAction',{width:112,height:40,dir:'row',surface:Intent === 'Destructive' ? 'color.action.destructive' : 'color.action.primary',radius:'radius.control'}); confirm.flex.justifyContent='center'; append(confirm,txt('label',Intent === 'Destructive' ? 'Delete' : 'Continue','typography.label','color.text.inverse'));
      if (Actions === 'One') cancel.visible=false;
      append(actions,cancel,confirm); append(root,actions);
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Feedback, Overlay & Progress / Bottom Sheet
  // ---------------------------------------------------------------------------
  const sheetVariants = [];
  for (const Header of ['Title','Title + handle']) for (const Actions of ['None','Sticky']) sheetVariants.push({Header,Actions});
  makeVariantSet({
    family:'Feedback, Overlay & Progress', name:'Bottom Sheet', id:'bottomSheet', contract:'contracts/feedback-overlay-progress.json', variants:sheetVariants,
    render:({Header,Actions}) => {
      const root = frame('bottomSheet',{width:360,height:Actions === 'Sticky' ? 268 : 212,dir:'column',surface:'color.surface.default',radius:'radius.overlay'});
      bind(root,'elevation.modal',['shadow']); root.flex.rowGap=12;
      const handle = penpot.createRectangle(); handle.name='handle'; handle.resize(36,4); fill(handle,'color.border.default'); handle.borderRadius=2; handle.visible=Header === 'Title + handle';
      const titleText=txt('title','Sheet title','typography.heading','color.text.primary');
      const body=txt('body','A bottom sheet holds contextual mobile actions or focused content.','typography.body','color.text.secondary');
      const sticky=frame('stickyAction',{width:328,height:44,dir:'row',surface:'color.action.primary',radius:'radius.control'}); sticky.flex.justifyContent='center'; append(sticky,txt('label','Primary action','typography.label','color.text.inverse')); sticky.visible=Actions === 'Sticky';
      append(root,handle,titleText,body,sticky); return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Search & Menu / Menu Item
  // ---------------------------------------------------------------------------
  const menuItemVariants = ['Default','Pressed','Disabled','Selected','Destructive'].map((State) => ({State}));
  makeVariantSet({
    family:'Search & Menu', name:'Menu Item', id:'menuItem', contract:'contracts/search-menu.json', variants:menuItemVariants,
    render:({State}) => {
      const root=frame('menuItem',{width:240,height:48,dir:'row',surface:State==='Pressed' ? 'color.surface.pressed' : State==='Selected' ? 'color.surface.selected' : 'color.surface.default',radius:null});
      bind(root,'density.controlHeightLarge',['height']);
      const disabled=State==='Disabled'; const destructive=State==='Destructive';
      const icon=tinyIcon('leadingIcon',destructive?'!':'•',disabled?'color.text.disabled':destructive?'color.status.dangerText':'color.text.tertiary');
      const label=txt('label',destructive?'Delete':'Menu item','typography.body',disabled?'color.text.disabled':destructive?'color.status.dangerText':'color.text.primary');
      const check=tinyIcon('selection','✓','color.text.brand'); check.visible=State==='Selected';
      append(root,icon,label,check); return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Search & Menu / Menu
  // ---------------------------------------------------------------------------
  const menuVariants=[];
  for (const Type of ['Action','Overflow','Context']) for (const Rows of ['3','5']) menuVariants.push({Type,Rows});
  makeVariantSet({
    family:'Search & Menu', name:'Menu', id:'menu', contract:'contracts/search-menu.json', variants:menuVariants,
    render:({Type,Rows}) => {
      const count=Number(Rows);
      const root=frame('menu',{width:256,height:count*44+16,dir:'column',surface:'color.surface.default',radius:'radius.overlay',padding:false,gap:false});
      bind(root,'elevation.floating',['shadow']); root.flex.topPadding=8; root.flex.bottomPadding=8;
      for(let i=1;i<=count;i+=1){
        const row=frame(`row-${i}`,{width:256,height:44,dir:'row',surface:'transparent',padding:true,gap:true});
        const lead=tinyIcon('leadingIcon',Type==='Overflow'?'⋯':Type==='Context'?'↗':'•','color.text.tertiary');
        append(row,lead,txt('label',i===count && Type==='Context'?'Context action':`Action ${i}`,'typography.body','color.text.primary'));
        append(root,row);
      }
      return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Navigation & Information / Tag — status visual family
  // ---------------------------------------------------------------------------
  const tagVariants=['Neutral','Brand','Success','Warning','Danger','Info'].map((Tone)=>({Tone}));
  const statusTone = {
    Neutral:{bg:'color.surface.subtle',text:'color.text.secondary'},
    Brand:{bg:'color.surface.selected',text:'color.text.brand'},
    Success:{bg:'color.status.successBg',text:'color.status.successText'},
    Warning:{bg:'color.status.warningBg',text:'color.status.warningText'},
    Danger:{bg:'color.status.dangerBg',text:'color.status.dangerText'},
    Info:{bg:'color.status.infoBg',text:'color.status.infoText'}
  };
  makeVariantSet({
    family:'Navigation & Information', name:'Tag', id:'tag', contract:'contracts/navigation-information.json', variants:tagVariants,
    render:({Tone}) => {
      const style=statusTone[Tone]; const root=frame('tag',{width:92,height:28,dir:'row',surface:style.bg,radius:'radius.pill'}); root.flex.justifyContent='center'; append(root,txt('label',Tone,'typography.labelSmall',style.text)); return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Feedback, Overlay & Progress / Alert — status visual family
  // ---------------------------------------------------------------------------
  const alertVariants=[];
  for(const Type of ['Inline','Banner']) for(const Tone of ['Info','Success','Warning','Danger']) alertVariants.push({Type,Tone});
  makeVariantSet({
    family:'Feedback, Overlay & Progress', name:'Alert', id:'alert', contract:'contracts/feedback-overlay-progress.json', variants:alertVariants,
    render:({Type,Tone}) => {
      const style=statusTone[Tone]; const root=frame('alert',{width:Type==='Banner'?360:328,height:Type==='Banner'?72:88,dir:'row',surface:style.bg,radius:Type==='Banner'?null:'radius.container'});
      const icon=tinyIcon('statusIcon',Tone==='Success'?'✓':Tone==='Warning'?'!':Tone==='Danger'?'!':'i',style.text);
      const content=frame('content',{width:260,height:56,dir:'column',surface:'transparent',padding:false,gap:false}); content.flex.rowGap=4;
      append(content,txt('title',`${Tone} message`,'typography.label',style.text),txt('description','A concise message with a clear next step.','typography.bodySmall',style.text));
      append(root,icon,content); return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Feedback, Overlay & Progress / Progress Indicator
  // ---------------------------------------------------------------------------
  const progressVariants=[];
  for(const Type of ['Linear','Circular']) for(const Value of ['25','60','100']) progressVariants.push({Type,Value});
  makeVariantSet({
    family:'Feedback, Overlay & Progress', name:'Progress Indicator', id:'progressIndicator', contract:'contracts/feedback-overlay-progress.json', variants:progressVariants,
    render:({Type,Value}) => {
      if(Type==='Linear'){
        const root=frame('progressIndicator',{width:280,height:28,dir:'column',surface:'transparent',padding:false,gap:false}); root.flex.rowGap=6;
        const track=frame('track',{width:280,height:6,dir:'row',surface:'color.surface.subtle',radius:'radius.pill',padding:false,gap:false});
        const bar=penpot.createRectangle(); bar.name='value'; bar.resize(Math.max(8,280*Number(Value)/100),6); fill(bar,'color.action.primary'); bindRadius(bar,'radius.pill'); append(track,bar);
        append(root,track,txt('label',`${Value}%`,'typography.caption','color.text.secondary')); return root;
      }
      const root=frame('progressIndicator',{width:72,height:72,dir:'column',surface:'transparent',padding:false,gap:false}); root.flex.alignItems='center'; root.flex.justifyContent='center';
      const ring=penpot.createEllipse(); ring.name='ring'; ring.resize(56,56); transparent(ring); ring.strokes=[{strokeColor:'#5B5EF7',strokeStyle:'solid',strokeWidth:6,strokeAlignment:'inner'}]; bind(ring,'color.action.primary',['strokeColor']);
      const value=txt('value',`${Value}%`,'typography.labelSmall','color.text.primary'); append(root,ring,value); return root;
    }
  });

  // ---------------------------------------------------------------------------
  // Feedback, Overlay & Progress / Stepper
  // ---------------------------------------------------------------------------
  const stepperVariants=[];
  for(const Layout of ['Horizontal','Vertical']) for(const Current of ['1','2','3']) stepperVariants.push({Layout,Current});
  makeVariantSet({
    family:'Feedback, Overlay & Progress', name:'Stepper', id:'stepper', contract:'contracts/feedback-overlay-progress.json', variants:stepperVariants,
    render:({Layout,Current}) => {
      const horizontal=Layout==='Horizontal'; const root=frame('stepper',{width:horizontal?336:220,height:horizontal?72:188,dir:horizontal?'row':'column',surface:'transparent',padding:false,gap:false}); root.flex.justifyContent='space-between';
      for(let i=1;i<=3;i+=1){
        const completed=i<Number(Current); const active=i===Number(Current);
        const item=frame(`step-${i}`,{width:horizontal?96:220,height:horizontal?64:52,dir:horizontal?'column':'row',surface:'transparent',padding:false,gap:false}); item.flex.alignItems='center'; item.flex.columnGap=10; item.flex.rowGap=4;
        const dot=penpot.createEllipse(); dot.name='indicator'; dot.resize(24,24); fill(dot,completed||active?'color.action.primary':'color.surface.subtle'); if(!completed&&!active) stroke(dot,'color.border.default','border.control');
        const label=txt('label',completed?`Step ${i} · done`:active?`Step ${i} · current`:`Step ${i}`,'typography.labelSmall',active?'color.text.brand':completed?'color.text.primary':'color.text.secondary'); append(item,dot,label); append(root,item);
      }
      return root;
    }
  });

  // Build evidence is stored in the file, not just console output.
  penpot.currentFile.setPluginData('com-design-version', VERSION);
  penpot.currentFile.setPluginData('com-design-library-gate', 'VISUAL_GATE_READY');
  penpot.currentFile.setPluginData('com-design-library-built', JSON.stringify(built));
  penpot.currentFile.setPluginData('com-design-library-note', 'Priority visual gate only. Do not claim full 33-component catalog or round-trip PASS yet.');

  const validation = penpot.currentFile.validate();
  if (validation.length) {
    console.warn('PenPot file validation returned issues:', validation);
    penpot.currentFile.setPluginData('com-design-file-validation', JSON.stringify(validation));
  } else {
    penpot.currentFile.setPluginData('com-design-file-validation', '[]');
  }

  try {
    await penpot.currentFile.saveVersion(`Com Design ${VERSION} · visual gate generated`);
  } catch (error) {
    // Version pinning is useful evidence but must not make component creation lie.
    console.warn('Unable to save PenPot version marker:', error);
  }

  console.log(JSON.stringify({
    status:'VISUAL_GATE_READY',
    designSystemVersion:VERSION,
    page:PAGE_NAME,
    componentSets:built.length,
    built,
    nextGate:'Open and inspect priority assets in PenPot. Only then expand to the remaining canonical 33-component catalog.'
  }, null, 2));

  penpot.closePlugin();
})().catch((error) => {
  console.error('Com Design Library Builder failed:', error);
  try {
    if (penpot.currentFile) {
      penpot.currentFile.setPluginData('com-design-library-gate','BLOCKED');
      penpot.currentFile.setPluginData('com-design-library-error',String(error?.stack || error));
    }
  } catch {}
  penpot.closePlugin();
});
