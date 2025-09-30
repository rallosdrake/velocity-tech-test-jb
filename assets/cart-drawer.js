(() => {
  const drawer = document.getElementById('CartDrawer');
    if (!drawer) return;
    const panel = drawer.querySelector('.CartDrawer__Panel');
    const overlay = drawer.querySelector('.CartDrawer__Overlay');
    let lastFocus = null;
  
    const focusableSelectors = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
  
    function trapFocus(e){
      const fEls = panel.querySelectorAll(focusableSelectors);
      if (!fEls.length) return;
      const first = fEls[0];
      const last = fEls[fEls.length - 1];
      if (e.key === 'Tab'){
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }
  
    function openDrawer(){
      if (drawer.dataset.open === 'true') return;
      lastFocus = document.activeElement;
      drawer.hidden = false;
      requestAnimationFrame(() => {
        drawer.dataset.open = 'true';
        panel.focus();
        document.addEventListener('keydown', onKeydown);
        panel.addEventListener('keydown', trapFocus);
      });
      refreshCart();
    }
  
    function closeDrawer(){
      drawer.dataset.open = 'false';
      document.removeEventListener('keydown', onKeydown);
      panel.removeEventListener('keydown', trapFocus);
      setTimeout(() => { drawer.hidden = true; }, 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  
    function onKeydown(e){
      if (e.key === 'Escape') closeDrawer();
    }
  
    async function refreshCart(){
      try{
        const res = await fetch('/cart.js');
        const cart = await res.json();
        renderCart(cart);
      }catch(err){
        console.error('Failed to load cart', err);
      }
    }
  
    function money(cents){
      try{ return new Intl.NumberFormat(document.documentElement.lang || 'en', { style:'currency', currency: Shopify.currency.active }).format(cents/100); }
      catch{ return (cents/100).toFixed(2); }
    }
  
    function renderCart(cart){
      const body = drawer.querySelector('.CartDrawer__Body');
      const subtotalEl = drawer.querySelector('.js-cart-subtotal');
      if (!cart.items.length){
        body.innerHTML = '<p class="CartDrawer__Empty">Your cart is empty.</p>';
        subtotalEl.textContent = money(0);
        return;
      }
      const items = cart.items.map(item => `
        <li class="MiniItem" data-line-key="${item.key}">
          <a class="MiniItem__Media" href="${item.url}" aria-hidden="true" tabindex="-1">
            ${item.image ? `<img src="${item.image.replace(/\.(jpg|png|webp).*/, '_160x.$1')}" alt="">` : ''}
          </a>
          <div class="MiniItem__Content">
            <a class="MiniItem__Title" href="${item.url}">${item.product_title}</a>
            ${item.variant_title && item.variant_title !== 'Default Title' ? `<div class="MiniItem__Meta">${item.variant_title}</div>` : ''}
            <div class="MiniItem__Row">
              <div class="MiniItem__Qty">
                <button class="QtyBtn" data-action="decrement" aria-label="Decrease quantity">−</button>
                <input class="QtyInput" type="number" min="0" value="${item.quantity}" aria-label="Quantity">
                <button class="QtyBtn" data-action="increment" aria-label="Increase quantity">+</button>
              </div>
              <div class="MiniItem__Price">${money(item.final_line_price)}</div>
              <button class="IconButton" data-action="remove" aria-label="Remove ${item.product_title}">&times;</button>
            </div>
          </div>
        </li>
      `).join('');
      body.innerHTML = `<ul class="CartDrawer__Items">${items}</ul>`;
      subtotalEl.textContent = money(cart.total_price);
    }
  
    async function updateLine(lineKey, quantity){
      const res = await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: { [lineKey]: quantity } })
      });
      if (!res.ok) throw await res.json();
      const cart = await res.json();
      renderCart(cart);
    }
  
    // Delegated events
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="close"]')) closeDrawer();
    });
  
    drawer.addEventListener('input', (e) => {
      const qty = e.target.closest('.QtyInput');
      if (!qty) return;
      const li = e.target.closest('[data-line-key]');
      const key = li && li.getAttribute('data-line-key');
      const val = Math.max(0, Number(e.target.value || 0));
      if (!key) return;
      updateLine(key, val).catch(err => {
        console.error('Update failed', err);
        alert((err && err.description) || 'Could not update quantity');
      });
    });
  
    drawer.addEventListener('click', (e) => {
      const inc = e.target.closest('[data-action="increment"]');
      const dec = e.target.closest('[data-action="decrement"]');
      const remove = e.target.closest('[data-action="remove"]');
      const li = e.target.closest('[data-line-key]');
      if (!li) return;
      const key = li.getAttribute('data-line-key');
      const input = li.querySelector('.QtyInput');
  
      if (inc){ input.value = Number(input.value) + 1; input.dispatchEvent(new Event('input', { bubbles:true })); }
      if (dec){ input.value = Math.max(0, Number(input.value) - 1); input.dispatchEvent(new Event('input', { bubbles:true })); }
      if (remove){ updateLine(key, 0).catch(err => { console.error(err); alert('Could not remove item'); }); }
    });
  
    // Global events
    document.addEventListener('cart:open', openDrawer);
    overlay.addEventListener('click', closeDrawer);
  
    // When cart changes, refresh its contents
    document.addEventListener('cart:updated', refreshCart);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-cart-toggle');
      if (!btn) return;
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('cart:open'));
    });
  
  })();