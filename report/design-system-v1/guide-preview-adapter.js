/* Human Guide preview compatibility layer.
   Keeps source Preview pages untouched and only adapts multi-scene evidence layouts
   when they are embedded inside the iPhone simulator. */
(function(){
  const preview = document.querySelector('#guide-component-preview');
  if(!preview) return;

  function adaptMultiDevicePreview(){
    try{
      const doc = preview.contentDocument;
      if(!doc) return;

      let hasMultiDeviceStage = false;
      doc.querySelectorAll('.stage').forEach(stage => {
        const stories = Array.from(stage.children).filter(child =>
          child.classList?.contains('story') && child.querySelector(':scope > .device')
        );
        if(stories.length < 2) return;
        stage.classList.add('human-guide-multi-device-stage');
        hasMultiDeviceStage = true;
      });

      if(!hasMultiDeviceStage) return;

      let style = doc.querySelector('#human-guide-multi-device-fix');
      if(!style){
        style = doc.createElement('style');
        style.id = 'human-guide-multi-device-fix';
        doc.head.appendChild(style);
      }

      style.textContent = `
        html.human-guide-embedded .human-guide-multi-device-stage{
          display:flex!important;
          flex-direction:column!important;
          flex-wrap:nowrap!important;
          align-items:stretch!important;
          width:100%!important;
          max-width:100%!important;
          gap:16px!important;
        }
        html.human-guide-embedded .human-guide-multi-device-stage > .story{
          box-sizing:border-box!important;
          width:100%!important;
          min-width:0!important;
          max-width:100%!important;
          flex:0 0 auto!important;
        }
        html.human-guide-embedded .human-guide-multi-device-stage > .story > .device{
          box-sizing:border-box!important;
          width:100%!important;
          min-width:0!important;
          max-width:100%!important;
          flex:none!important;
        }
      `;
    }catch(error){
      // Same-origin on Pages; leave the source Preview untouched if iframe access is blocked.
    }
  }

  preview.addEventListener('load', () => requestAnimationFrame(adaptMultiDevicePreview));
  if(preview.contentDocument?.readyState === 'complete'){
    requestAnimationFrame(adaptMultiDevicePreview);
  }
})();
