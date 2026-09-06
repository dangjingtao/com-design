import { CI_GATE_IDS } from './ci-evidence.mjs';

function buildGovernanceEvidenceIds(releaseGovernance){
  const ids=new Set();
  const pipeline=new Set(releaseGovernance?.pipeline ?? []);

  if(
    pipeline.has('deterministic-hard-gates')
    && releaseGovernance?.deterministicHardGate?.requiredEvidenceId==='com-design:ci-evidence:v1'
    && releaseGovernance?.deterministicHardGate?.requiredResult==='pass'
    && releaseGovernance?.deterministicHardGate?.canBeOverridden===false
  ){
    ids.add('deterministic-hard-gates');
  }

  if(
    pipeline.has('conditional-ai-review')
    && releaseGovernance?.aiReviewGate?.vendorNeutral===true
  ){
    ids.add('conditional-ai-review');
  }

  if(
    pipeline.has('mira-judgment')
    && releaseGovernance?.miraJudgment?.role==='Mira'
    && releaseGovernance?.miraJudgment?.requiredForRelease===true
    && releaseGovernance?.miraJudgment?.finalVeto===true
    && ['approve','revise','reject'].every((decision)=>
      releaseGovernance?.miraJudgment?.decisions?.includes(decision)
    )
  ){
    ids.add('mira-judgment');
  }

  if(pipeline.has('release-eligibility')){
    ids.add('release-eligibility');
  }

  if(
    pipeline.has('consumer-explicit-upgrade')
    && releaseGovernance?.consumerVersionPolicy?.autoUpgrade===false
    && releaseGovernance?.consumerVersionPolicy?.explicitUpgradeRequired===true
  ){
    ids.add('consumer-explicit-upgrade');
  }

  return ids;
}

export function validateReleaseGateTrace(
  manifest,
  {validationIds=[],releaseGovernance=null}={},
){
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
    governance:buildGovernanceEvidenceIds(releaseGovernance),
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
      if(!registry){
        errors.push(
          'release requirement '+requirement+' uses unsupported evidence kind: '
          +(entry?.kind??'<missing>')+'.'
        );
        requirementValid=false;
        continue;
      }
      if(!Array.isArray(entry?.ids) || entry.ids.length===0){
        errors.push('release requirement '+requirement+' has an empty evidence id list.');
        requirementValid=false;
        continue;
      }
      for(const id of entry.ids){
        links+=1;
        if(!registry.has(id)){
          errors.push(
            'release requirement '+requirement+' references unknown or unbacked '
            +entry.kind+' evidence id: '+id+'.'
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
      miraJudgmentBacked:registries.governance.has('mira-judgment'),
    }
  };
}
