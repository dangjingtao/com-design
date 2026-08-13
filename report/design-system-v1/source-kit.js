(() => {
  function mountTraeSourceKit(){
    const grid = document.querySelector('.delivery-grid');
    if(!grid || document.querySelector('#trae-source-kit')) return;

    const kit = document.createElement('article');
    kit.id = 'trae-source-kit';
    kit.className = 'delivery-source-kit';
    kit.innerHTML = `
      <div class="delivery-source-copy">
        <small>Trae Design · Source</small>
        <div>
          <h3>Trae Design Source Kit</h3>
          <p>直接交付 Com Design 真相源与同版本机器产物，供 Trae Design / AI Agent 读取和转换；不绑定私有工程文件格式。</p>
        </div>
      </div>
      <div class="delivery-source-actions">
        <a class="delivery-file" href="./downloads/com-design-trae-source.zip" download>下载 Trae Source Kit ↓</a>
        <span>Default + Premium Gold · Source of Truth</span>
      </div>`;

    grid.insertAdjacentElement('afterend', kit);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mountTraeSourceKit, {once:true});
  }else{
    mountTraeSourceKit();
  }
})();
