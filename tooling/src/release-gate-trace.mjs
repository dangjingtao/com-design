import { CI_GATE_IDS } from './ci-evidence.mjs';

const GOVERNANCE_EVIDENCE_IDS=Object.freeze([
  'deterministic-hard-gates',
  'conditional-ai-review',
  'mira-judgment',
  'release-eligibility',
  'consumer-explicit-upgrade',
]);

const REVIEW_EVIDENCE_IDS=Object.freeze([
  'independent-review',
]);

export function validateReleaseGateTrace(manifest,{validationIds=[]}={}){
  const errors=[];
  const releaseGates=manifest?.releaseGates;
  const requirements=releaseGates?.requirements;
  const trace=releaseGates?.evidenceTrace;
  if(!Array.isArray(requirements) || !trace || typeof trace!=='object' || Array.isArray(trace)){
    return {
      errors:['release gate evidence trace is unavailable.'],
      evidence:{requirements:0,traced:0,evidenceLinks:0}
    };
  }

  const registries={
    validation:new Set(validationIds),
    ci:new Set(CI_GATE_IDS),
    governance:new Set(GOVERNANCE_EVIDENCE_IDS),
    review:new Set(REVIEW_EVIDENCE_IDS),
  };
  let links=0;
  let traced=0;

  for(const requirement of requirements){
    const entries=trace[requirement];
    if(!Array.isArray(entries) || entries.length===0){
      errors.push('release requirement has no evidence trace: '+requirement+'.');
      continue;
    }
    let requirementValid=true;
    for(const entry of entries){
      const registry=registries[entry?.kind];
      for(const id of entry?.ids??[]){
        links+=1;
        if(!registry || !registry.has(id)){
          errors.push(
            'release requirement '+requirement+' references unknown '
            +(entry?.kind??'<missing>')+' evidence id: '+id+'.'
          );
          requirementValid=false;
        }
      }
    }
    if(requirementValid) traced+=1;
  }

  return {
    errors,
    evidence:{
      requirements:requirements.length,
      traced,
      evidenceLinks:links,
      validationEvidenceIds:[...registries.validation].sort(),
      ciEvidenceIds:[...registries.ci].sort(),
      governanceEvidenceIds:[...registries.governance].sort(),
    }
  };
}
