import { CI_EVIDENCE_CHECK_IDS } from './ci-evidence.mjs';

export function validateReleaseGateEvidenceResolution({
  manifest,
  validationCheckIds,
  releaseGovernance,
}){
  const errors=[];
  const trace=manifest?.releaseGates?.evidenceTrace ?? {};
  const validationIds=new Set(validationCheckIds ?? []);
  const ciIds=new Set(CI_EVIDENCE_CHECK_IDS);
  let refs=0;

  for(const [requirement,entries] of Object.entries(trace)){
    for(const entry of entries ?? []){
      for(const id of entry.ids ?? []){
        refs+=1;
        if(entry.kind==='validation'){
          if(!validationIds.has(id)){
            errors.push('release requirement '+requirement+' references unknown validation evidence id: '+id+'.');
          }
        }else if(entry.kind==='ci'){
          if(!ciIds.has(id)){
            errors.push('release requirement '+requirement+' references unknown CI evidence id: '+id+'.');
          }
        }else if(entry.kind==='governance'){
          if(id==='mira-judgment'){
            if(
              releaseGovernance?.miraJudgment?.role!=='Mira'
              || releaseGovernance?.miraJudgment?.requiredForRelease!==true
              || !releaseGovernance?.miraJudgment?.decisions?.includes('approve')
            ){
              errors.push('mira-judgment evidence id is not backed by the canonical release-governance contract.');
            }
          }else if(id==='conditional-ai-review'){
            if(releaseGovernance?.aiReviewGate?.vendorNeutral!==true){
              errors.push('conditional-ai-review evidence id is not backed by the canonical release-governance contract.');
            }
          }else{
            errors.push('release requirement '+requirement+' references unknown governance evidence id: '+id+'.');
          }
        }else if(entry.kind==='review'){
          if(id!=='mira-judgment'){
            errors.push('release requirement '+requirement+' references unknown review evidence id: '+id+'.');
          }
        }
      }
    }
  }

  return {
    errors,
    evidence:{
      requirementCount:manifest?.releaseGates?.requirements?.length ?? 0,
      evidenceReferenceCount:refs,
      validationEvidenceIds:[...validationIds].sort(),
      ciEvidenceIdCount:ciIds.size,
      governance:{
        miraJudgmentRequired:releaseGovernance?.miraJudgment?.requiredForRelease===true,
        conditionalAiReviewVendorNeutral:releaseGovernance?.aiReviewGate?.vendorNeutral===true,
      },
    },
  };
}
