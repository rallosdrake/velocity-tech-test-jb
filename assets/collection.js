(() => {
    // Simple PE hook for future enhancements (e.g., load more)
    document.documentElement.classList.remove('no-js');
  
    // Attach add-to-cart handlers for product cards (delegated)
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.js-add-to-cart');
      if (!btn) return;
      const id = btn.getAttribute('data-variant-id');
      if (!id) return;
      btn.disabled = true;
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(id), quantity: 1 }] })
        });
        if (!res.ok) throw await res.json();
        document.dispatchEvent(new CustomEvent('cart:updated'));
        document.dispatchEvent(new CustomEvent('cart:open'));
      } catch (err) {
        console.error('Add to cart failed', err);
        alert((err && err.description) || 'Sorry, could not add to cart.');
      } finally {
        btn.disabled = false;
      }
    });
  })();