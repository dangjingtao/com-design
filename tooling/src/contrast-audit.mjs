const DEFAULT_TEXT_THRESHOLD=4.5;

const TEXT_PAIRS=Object.freeze([
  {id:'text-primary-on-surface',foreground:'color-text-primary',background:'color-surface',min:4.5},
  {id:'text-secondary-on-surface',foreground:'color-text-secondary',background:'color-surface',min:4.5},
  {id:'text-placeholder-on-surface',foreground:'color-text-placeholder',background:'color-surface',min:4.5},
  {id:'brand-text-on-surface',foreground:'color-text-brand',background:'color-surface',min:4.5},
  {id:'on-primary-on-primary',foreground:'color-on-primary',background:'color-primary',min:4.5},
  {id:'inverse-text-on-inverse-surface',foreground:'color-text-inverse',background:'color-surface-inverse',min:4.5},
  {id:'success-text-on-success-bg',foreground:'color-success-text',background:'color-success-bg',min:4.5},
  {id:'warning-text-on-warning-bg',foreground:'color-warning-text',background:'color-warning-bg',min:4.5},
  {id:'danger-text-on-danger-bg',foreground:'color-danger-text',background:'color-danger-bg',min:4.5},
  {id:'info-text-on-info-bg',foreground:'color-info-text',background:'color-info-bg',min:4.5},
  {id:'destructive-text-on-surface',foreground:'color-danger-text',background:'color-surface',min:4.5},
]);

function parseHex(value){
  const raw=String(value??'').trim();
  const short=raw.match(/^#([0-9a-f]{3})$/i);
  if(short){
    return short[1].split('').map((char)=>parseInt(char+char,16));
  }
  const full=raw.match(/^#([0-9a-f]{6})$/i);
  if(!full) return null;
  return [0,2,4].map((offset)=>parseInt(full[1].slice(offset,offset+2),16));
}

function channelLuminance(value){
  const c=value/255;
  return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
}

export function relativeLuminance(value){
  const rgb=parseHex(value);
  if(!rgb) return null;
  const [r,g,b]=rgb.map(channelLuminance);
  return 0.2126*r+0.7152*g+0.0722*b;
}

export function contrastRatio(foreground,background){
  const a=relativeLuminance(foreground);
  const b=relativeLuminance(background);
  if(a===null || b===null) return null;
  const lighter=Math.max(a,b);
  const darker=Math.min(a,b);
  return (lighter+0.05)/(darker+0.05);
}

function defaultScope(model,mode){
  return Object.fromEntries(
    (model.consumer??[]).map((token)=>[token.name,token[mode]])
  );
}

function auditScope(scopeId,values,pairs){
  const results=[];
  const errors=[];
  for(const pair of pairs){
    const foreground=values?.[pair.foreground];
    const background=values?.[pair.background];
    const ratio=contrastRatio(foreground,background);
    if(ratio===null){
      errors.push(
        scopeId+' '+pair.id+' requires resolved hex colors for '
        +pair.foreground+' / '+pair.background+'.'
      );
      continue;
    }
    const rounded=Math.round(ratio*100)/100;
    const status=ratio+Number.EPSILON>=pair.min?'pass':'fail';
    results.push({
      id:pair.id,
      foregroundToken:pair.foreground,
      backgroundToken:pair.background,
      foreground,
      background,
      ratio:rounded,
      required:pair.min,
      status,
    });
    if(status==='fail'){
      errors.push(
        scopeId+' '+pair.id+' contrast '+rounded+':1 is below '+pair.min+':1.'
      );
    }
  }
  return {scopeId,results,errors};
}

export function auditContrast(model,{pairs=TEXT_PAIRS}={}){
  const scopes=[
    {id:'default.light',values:defaultScope(model,'light')},
    {id:'default.dark',values:defaultScope(model,'dark')},
  ];
  for(const [themeKey,theme] of Object.entries(model.themes??{})){
    scopes.push({id:themeKey+'.light',values:theme.light});
    scopes.push({id:themeKey+'.dark',values:theme.dark});
  }

  const audited=scopes.map((scope)=>auditScope(scope.id,scope.values,pairs));
  const results=audited.flatMap((entry)=>entry.results.map((result)=>({
    scope:entry.scopeId,
    ...result,
  })));
  const errors=audited.flatMap((entry)=>entry.errors);
  const ratios=results.map((entry)=>entry.ratio);
  return {
    errors,
    evidence:{
      threshold:DEFAULT_TEXT_THRESHOLD,
      scopeCount:scopes.length,
      pairCount:pairs.length,
      checks:results.length,
      minimumRatio:ratios.length?Math.min(...ratios):null,
      failures:results.filter((entry)=>entry.status==='fail'),
      results,
    }
  };
}

export { TEXT_PAIRS };
