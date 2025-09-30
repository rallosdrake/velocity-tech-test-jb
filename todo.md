# To-Do List


## 1. Setup
- Fork & clone repo.  
- Push theme to dev store and run `shopify theme dev`.  
- Ensure `.gitignore` is correct.  
- Open Figma, note fonts, colors, spacing.  


---


## 2. Collection Page
- Create `templates/collection.json`.  
- Build `sections/main-collection.liquid`.  
- Add `snippets/product-card.liquid` and `snippets/price.liquid`.  
- Product card needs: image, title, price, add-to-cart, badge.  
- Style responsive grid (desktop 3–4 cols, mobile 2 cols).  
- Add pagination (default).  


---


## 3. Cart Drawer
- Create `sections/cart-drawer.liquid`.  
- Add `snippets/mini-line-item.liquid`.  
- Include overlay, panel, header, body, footer.  
- Show line items, qty update, remove.  
- Show subtotal + checkout button.  
- Open drawer when product added.  
- Close on Esc, overlay, or close button.  


---


## 4. Styling
- Add `assets/base.css` with layout, grid, buttons, typography.  
- Match Figma spacing, type scale, and colors.  
- Add hover/focus states.  
- Ensure accessibility: visible focus, aria labels, live regions.  


---


## 5. JavaScript
- `assets/collection.js`: handle add-to-cart.  
- `assets/cart-drawer.js`: drawer open/close, focus trap, fetch cart, update qty/remove.  
- Dispatch custom events for cart updates.  


---


## 6. Polish & QA
- Test on desktop & mobile.  
- Check keyboard navigation and screen reader labels.  
- Test empty cart, sold out product, error state.  
- Run Lighthouse for performance & accessibility.  


---


## 7. Stretch (Optional)
- “Load more” pagination. 
- Free shipping progress bar. 
- Quick add with variant picker. 