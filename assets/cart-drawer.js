(() => {
  const drawer = document.getElementById('CartDrawer');
  if (!drawer) return;

  const panel = drawer.querySelector('.CartDrawer__Panel');
  const overlay = drawer.querySelector('.CartDrawer__Overlay');
  let lastFocus = null;

  // Core functionality: open, close, and refresh the cart drawer
  function openDrawer() {
    if (drawer.dataset.open === 'true') return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    refreshCart();
  }

  function closeDrawer() {
    drawer.dataset.open = 'false';
    setTimeout(() => {
      drawer.hidden = true;
    }, 250);
    lastFocus?.focus?.();
  }

  async function refreshCart() {
    try {
      const sectionId = 'cart-drawer'; // Section handle (filename without .liquid)
      const res = await fetch(`${location.pathname}?section_id=${sectionId}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Replace the body and footer of the cart drawer
      const newBody = doc.querySelector('.CartDrawer__Body');
      const newFooter = doc.querySelector('.CartDrawer__Footer');
      newBody && drawer.querySelector('.CartDrawer__Body')?.replaceWith(newBody);
      newFooter && drawer.querySelector('.CartDrawer__Footer')?.replaceWith(newFooter);
    } catch (err) {
      console.error('Cart refresh failed', err);
    }
  }

  // Shopify API endpoints for cart operations
  async function updateLine(lineKey, quantity) {
    const res = await fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: { [lineKey]: quantity } }),
    });
    if (!res.ok) throw await res.json();
    const cart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    return cart;
  }

  async function addToCart(id, quantity) {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });
    if (!res.ok) throw new Error(await res.text());
    const cart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    return cart;
  }

  async function clearCart() {
    const res = await fetch('/cart/clear.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw await res.json();
    const cart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    return cart;
  }

  // Event delegation for click actions
  document.addEventListener('click', (e) => {
    // Toggle cart drawer open/close
    if (e.target.closest('.js-cart-toggle')) {
      e.preventDefault();
      openDrawer();
      return;
    }
    if (e.target.closest('#CartDrawer .CartDrawer__Overlay')) {
      closeDrawer();
      return;
    }

    // Handle increment, decrement, and remove actions
    const inc = e.target.closest('[data-action="increment"]');
    const dec = e.target.closest('[data-action="decrement"]');
    const remove = e.target.closest('[data-action="remove"]');

    if (inc || dec || remove) {
      const line = e.target.closest('[data-line-key]');
      if (line) {
        // Update cart line item quantity
        const key = line.getAttribute('data-line-key');
        const input = line.querySelector('.QtyInput');
        if (!input) return;

        if (inc) input.value = Number(input.value || 0) + 1;
        if (dec) input.value = Math.max(0, Number(input.value || 0) - 1);
        if (remove) {
          updateLine(key, 0).catch(console.error);
        } else {
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
      }

      // Update quantity in a generic scope (e.g., product card)
      const scope = e.target.closest('[data-qty-scope]');
      if (scope) {
        const input = scope.querySelector('.QtyInput');
        if (!input) return;
        const min = Number(input.min || 1);
        const max = input.max ? Number(input.max) : Infinity;
        const cur = Number(input.value || min);
        input.value = Math.min(max, Math.max(min, cur + (inc ? 1 : -1)));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }

    // Add product to cart
    const addBtn = e.target.closest('.js-add-to-cart');
    if (addBtn) {
      const card = addBtn.closest('.ProductCard');
      const qtyInput = card?.querySelector('.QtyInput');
      const qty = Math.max(1, Number(qtyInput?.value || 1));
      const variant = Number(addBtn.dataset.variantId);
      addToCart(variant, qty).catch((err) => {
        console.error(err);
        alert('Could not add to cart');
      });
      return;
    }

    // Clear the cart
    if (e.target.closest('.js-clear-cart')) {
      e.preventDefault();
      clearCart().catch((err) => {
        console.error(err);
        alert('Could not clear cart');
      });
      return;
    }
  });

  // Handle quantity input changes inside the cart drawer
  drawer.addEventListener('input', (e) => {
    const input = e.target.closest('.QtyInput');
    if (!input) return;
    const line = input.closest('[data-line-key]');
    if (!line) return;
    const key = line.getAttribute('data-line-key');
    const val = Math.max(0, Number(input.value || 0));
    updateLine(key, val).catch((err) => {
      console.error('Qty update failed', err);
      alert((err && err.description) || 'Could not update quantity');
    });
  });

  // Cart lifecycle hooks
  document.addEventListener('cart:updated', () => refreshCart());
  document.addEventListener('cart:open', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
})();