/**
 * NOVIRA CO., LTD. — Shared Navigation & Interaction Handler
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // 1. Mobile Menu Toggle
  const menuToggle = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');

  function setMenu(open) {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = mobileNav && mobileNav.hidden;
      setSearch(false);
      setMenu(open);
    });
  }

  if (mobileNav) {
    mobileNav.addEventListener('click', event => {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  // 2. Responsive breakpoint monitor
  if (window.matchMedia) {
    window.matchMedia('(min-width: 881px)').addEventListener('change', event => {
      if (event.matches) setMenu(false);
    });
  }

  // 3. Mobile Accordion Toggles
  $$('.mobile-accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const content = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (content) content.hidden = isExpanded;
    });
  });

  // 4. Desktop Dropdown Toggle & Click-outside handling
  $$('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', event => {
      const parent = btn.closest('.has-dropdown');
      if (!parent) return;
      const wasOpen = parent.classList.contains('is-open');
      $$('.has-dropdown').forEach(d => {
        d.classList.remove('is-open');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        parent.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.has-dropdown')) {
      $$('.has-dropdown').forEach(d => {
        d.classList.remove('is-open');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // 5. Search Panel Toggle & Search Actions
  const searchToggle = $('#search-toggle');
  const searchPanel = $('#search-panel');
  const searchClose = $('#search-close');
  const headerSearch = $('#header-search');

  function setSearch(open) {
    if (!searchPanel || !searchToggle) return;
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      setMenu(false);
      headerSearch?.focus();
    }
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      setSearch(searchPanel && searchPanel.hidden);
    });
  }

  if (searchClose) {
    searchClose.addEventListener('click', () => {
      setSearch(false);
      searchToggle?.focus();
    });
  }

  function handleSearchSubmit() {
    if (!headerSearch) return;
    const query = headerSearch.value.trim();
    if (!query) return;
    setSearch(false);
    // If not on products page, redirect with query parameter
    if (!window.location.pathname.endsWith('products.html')) {
      window.location.href = `products.html?q=${encodeURIComponent(query)}`;
    } else {
      const catalogInput = $('#catalog-search');
      if (catalogInput) {
        catalogInput.value = query;
        catalogInput.dispatchEvent(new Event('input', { bubbles: true }));
        catalogInput.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  if (headerSearch) {
    headerSearch.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearchSubmit();
      }
    });
  }

  // 6. Escape Key Listener
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (searchPanel && !searchPanel.hidden) {
        setSearch(false);
        searchToggle?.focus();
      }
      if (mobileNav && !mobileNav.hidden) {
        setMenu(false);
        menuToggle?.focus();
      }
      $$('.has-dropdown').forEach(d => {
        d.classList.remove('is-open');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // 7. Active Navigation State Detection
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  $$('.nav-link, .dropdown-subitem, .mobile-nav-link, .mobile-sublink').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === currentPath || (currentPath === '' && href === 'index.html') || (currentPath === 'NOVIRA-Preview.html' && (href === 'index.html' || href === '#'))) {
      link.classList.add('active');
      const dropdownParent = link.closest('.nav-item.has-dropdown');
      if (dropdownParent) dropdownParent.classList.add('active');
    }
  });

  // 8. Contact Form Export (if present on page)
  const enquiryForm = $('#enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const content = [
        'NOVIRA CO., LTD. — ENQUIRY DRAFT',
        'Prepared locally. Ready to submit to your NOVIRA representative.',
        '',
        `Name: ${data.get('name')?.trim() || ''}`,
        `Email: ${data.get('email')?.trim() || ''}`,
        `Phone: ${data.get('phone')?.trim() || 'Not provided'}`,
        `Interest: ${data.get('interest') || 'General enquiry'}`,
        '',
        'Message:',
        data.get('message')?.trim() || '',
        '',
        `Prepared: ${new Date().toISOString()}`
      ].join('\n');
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'NOVIRA-Enquiry.txt';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const status = $('#form-status');
      if (status) {
        status.textContent = 'Your enquiry draft file has been downloaded. Share it with your NOVIRA contact.';
      }
    });
  }

  
  // 10. Modern Scroll Reveal Observer
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    $$('.reveal-on-scroll').forEach(el => revealObserver.observe(el));
  } else {
    $$('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
  }

  // 11. Subtle Interactive Card Micro-Tilt for Value Cards
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(min-width: 769px)').matches) {
    $$('.value-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 12. Update Copyright Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});


// ========================================================
// NOVIRA CLINIC CART & ENQUIRY BASKET ENGINE
// Persists in localStorage across all pages
// ========================================================
(function() {
  const STORAGE_KEY = 'novira_clinic_cart';
  let cart = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    cart = [];
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
    updateBadge();
    renderDrawerItems();
  }

  function getTotalCount() {
    return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  function updateBadge() {
    const count = getTotalCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('has-items', count > 0);
    });
  }

  // Inject Cart Toggle into Header if not already present
  function ensureHeaderCart() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions || document.getElementById('cart-toggle')) return;

    const cartBtn = document.createElement('button');
    cartBtn.className = 'icon-button cart-toggle';
    cartBtn.id = 'cart-toggle';
    cartBtn.setAttribute('aria-label', 'View Clinic Cart');
    cartBtn.setAttribute('aria-haspopup', 'dialog');
    cartBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <span class="cart-badge ${getTotalCount() > 0 ? 'has-items' : ''}" id="cart-badge">${getTotalCount()}</span>
    `;

    // Insert before the menu-toggle or at end
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      headerActions.insertBefore(cartBtn, menuToggle);
    } else {
      headerActions.appendChild(cartBtn);
    }

    cartBtn.addEventListener('click', openDrawer);
  }

  // Inject Drawer HTML into Body
  function ensureDrawerHtml() {
    if (document.getElementById('cart-drawer-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cart-drawer-overlay';
    overlay.className = 'cart-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="cart-drawer-backdrop" id="cart-backdrop"></div>
      <div class="cart-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title-wrap">
            <h3 class="cart-drawer-title" id="cart-drawer-title">Clinic Order Cart</h3>
            <span class="cart-pill-badge">Wholesale</span>
          </div>
          <button class="cart-close-btn" id="cart-close-btn" aria-label="Close cart drawer">✕</button>
        </div>

        <div class="cart-drawer-body" id="cart-drawer-body">
          <!-- Rendered dynamically -->
        </div>

        <div class="cart-drawer-footer" id="cart-drawer-footer">
          <div class="cart-summary-row">
            <span class="cart-summary-label">Total Selected Products</span>
            <span class="cart-summary-count" id="cart-total-count">0 items</span>
          </div>
          <a href="checkout.html" class="cart-checkout-btn" id="cart-checkout-btn">
            <span>Proceed to Order Quotation</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button class="cart-clear-btn" id="cart-clear-btn">Clear Cart</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('cart-backdrop').addEventListener('click', closeDrawer);
    document.getElementById('cart-close-btn').addEventListener('click', closeDrawer);
    document.getElementById('cart-clear-btn').addEventListener('click', clearCart);
  }

  // Toast notification
  function showToast(productName) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span><strong>Added:</strong> ${productName}</span>
      <button class="cart-toast-btn" id="toast-view-btn">View Cart</button>
    `;

    document.getElementById('toast-view-btn').onclick = () => {
      toast.classList.remove('is-active');
      openDrawer();
    };

    toast.classList.add('is-active');
    setTimeout(() => {
      toast.classList.remove('is-active');
    }, 3800);
  }

  function renderDrawerItems() {
    const body = document.getElementById('cart-drawer-body');
    const footer = document.getElementById('cart-drawer-footer');
    const totalCountEl = document.getElementById('cart-total-count');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h4 class="cart-empty-title">Your Cart is Empty</h4>
          <p class="cart-empty-desc">Explore our clinical injectables, biostimulators, and medical energy platforms to prepare an order inquiry.</p>
          <a href="products.html" class="luxury-detail-btn" onclick="window.NoviraCart.closeDrawer()">Explore Portfolio ↗</a>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = '';
    const totalCount = getTotalCount();
    if (totalCountEl) totalCountEl.textContent = totalCount + (totalCount === 1 ? ' item' : ' items');

    // Build URL query for checkout
    const orderItemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    if (checkoutBtn) {
      checkoutBtn.href = 'checkout.html';
    }

    let itemsHtml = '<ul class="cart-items-list">';
    cart.forEach(item => {
      itemsHtml += `
        <li class="cart-item-row" data-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${item.image || 'images/juvelook.png'}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-kicker">${item.category || 'Clinical Product'}</div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-format">${item.format || 'Wholesale Package'}</div>
            <div class="cart-item-actions">
              <div class="cart-qty-stepper">
                <button class="cart-qty-btn" onclick="window.NoviraCart.updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                <span class="cart-qty-val">${item.qty}</span>
                <button class="cart-qty-btn" onclick="window.NoviraCart.updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <button class="cart-item-remove" onclick="window.NoviraCart.removeItem('${item.id}')">Remove</button>
            </div>
          </div>
        </li>
      `;
    });
    itemsHtml += '</ul>';
    body.innerHTML = itemsHtml;
  }

  function openDrawer() {
    ensureDrawerHtml();
    renderDrawerItems();
    updateBadge();
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function addItem(item) {
    if (!item || !item.id) return;
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + (item.qty || 1);
    } else {
      cart.push({
        id: item.id,
        name: item.name || 'Medical Product',
        category: item.category || 'Clinical Portfolio',
        format: item.format || 'Standard Unit',
        image: item.image || 'images/juvelook.png',
        qty: item.qty || 1
      });
    }
    saveCart();
    showToast(item.name);
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
      removeItem(id);
    } else {
      saveCart();
    }
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  // Global Cart API
  window.NoviraCart = {
    addItem,
    removeItem,
    updateQty,
    clearCart,
    openDrawer,
    closeDrawer,
    getCart: () => [...cart]
  };

  document.addEventListener('DOMContentLoaded', () => {
    ensureHeaderCart();
    ensureDrawerHtml();
    updateBadge();
  });

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
})();
