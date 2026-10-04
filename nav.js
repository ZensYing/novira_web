/**
 * NOVIRA CO., LTD. — Shared Navigation & Interaction Handler
 * Premium B2B Medical Aesthetics Distributor
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
    document.body.classList.toggle('menu-open', open);
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
    document.body.classList.toggle('search-open', open);
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
    if (!window.location.pathname.endsWith('products.html')) {
      window.location.href = `products.html?q=${encodeURIComponent(query)}`;
    } else {
      const catalogInput = $('#live-catalog-search');
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

  // 8. Contact Form Handler (B2B Enquiry)
  const enquiryForm = $('#enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const content = [
        'NOVIRA CO., LTD. — B2B PARTNERSHIP ENQUIRY',
        'Advancing Skin Innovation · Medical Aesthetics Distributor',
        '',
        `Clinic / Organization: ${data.get('name')?.trim() || ''}`,
        `Contact Person: ${data.get('contact')?.trim() || ''}`,
        `Email: ${data.get('email')?.trim() || ''}`,
        `Phone: ${data.get('phone')?.trim() || 'Not provided'}`,
        `Area of Interest: ${data.get('interest') || 'General Enquiry'}`,
        '',
        'Message:',
        data.get('message')?.trim() || '',
        '',
        `Submitted: ${new Date().toISOString()}`
      ].join('\n');
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'NOVIRA-Partnership-Enquiry.txt';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const status = $('#form-status');
      if (status) {
        status.textContent = 'Thank you. Your partnership enquiry has been downloaded. Please share it with your NOVIRA representative.';
        status.style.color = 'var(--novira-purple)';
      }
      form.reset();
    });
  }

  // 9. Modern Scroll Reveal Observer
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal-on-scroll').forEach(el => revealObserver.observe(el));
  } else {
    $$('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
  }

  // 10. Subtle Interactive Card Micro-Tilt for Value Cards
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(min-width: 769px)').matches) {
    $$('.value-card, .partner-card, .stat-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 11. Update Copyright Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 12. Sticky header scroll behavior
  const header = $('.site-header');
  let lastScrollY = window.scrollY;
  if (header) {
    const isOverlayHeader = header.classList.contains('overlay-header');
    const updateHeaderState = () => {
      const currentScrollY = window.scrollY;
      if (!isOverlayHeader) {
        if (currentScrollY > 100 && currentScrollY > lastScrollY) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
      }
      const isScrolled = currentScrollY > 20;
      header.classList.toggle('header-scrolled', isScrolled);
      if (isOverlayHeader) {
        const singleLogo = header.querySelector('.nav-logo-img:not(.logo-main):not(.logo-white)');
        if (singleLogo) {
          singleLogo.src = isScrolled
            ? 'NOVIRA_LOGO_FINAL_FILES/png/novira-logo-main.png'
            : 'NOVIRA_LOGO_FINAL_FILES/png/novira-logo-white.png';
        }
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    updateHeaderState();
  }

  // 13. B2B Partnership Request buttons — smooth CTA behavior
  $$('[data-action="request-info"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const productName = btn.dataset.product || '';
      const url = `contact.html?inquiry=ProductInfo&product=${encodeURIComponent(productName)}`;
      window.location.href = url;
    });
  });
});
