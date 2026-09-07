// Sticky header: add a subtle border/shadow once the page has scrolled
const header = document.getElementById('site-header');

function updateHeaderState() {
  if (window.scrollY > 4) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
}

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close the mobile menu once a link is tapped
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Story section + Pre-Orders elements: reveal as they scroll into view
const revealEls = document.querySelectorAll('.beat, .policy-card, .reveal-up');

if (revealEls.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -80px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }
}

// ============================================
// Place Order form
// ============================================

// IMPORTANT — replace these two placeholders before going live:
// 1. WHATSAPP_NUMBER: full international format, digits only, no + or spaces
//    (e.g. Pakistan mobile 03XX-XXXXXXX becomes "92XXXXXXXXXX")
// 2. FORMSPREE_ENDPOINT: create a free form at https://formspree.io and
//    paste its endpoint URL here (looks like https://formspree.io/f/xxxxxxxx)
const WHATSAPP_NUMBER = "923001334417"; // Butter Cloud WhatsApp Business number
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvkokaga";


// ============================================
// Menu data & pricing
// Real pricing (20% profit margin), rounded to the nearest whole rupee
// from the source PDF's exact decimals. Ask Nash if a different rounding
// (e.g. nearest 10) is preferred.
// ============================================
const MENU_DATA = {
  cakes: {
    label: "Cakes",
    type: "cake", // has size options — pricing now lives per-item, not per-category
    items: [
      {
        name: "Lotus Three Milk Cake",
        images: ["photos/lotus-three-milk-cake-hero.webp", "photos/lotus-three-milk-cake-slice.webp"],
        sizePricing: { "Bento": 659, "1 lb": 1249, "2 lb": 2409, "3.5 lb": 4379 }
      },
      {
        name: "Chocolate Three Milk Cake",
        images: [], // NEW item — no photos yet, shows "coming soon" placeholder
        sizePricing: { "Bento": 579, "1 lb": 1089, "2 lb": 2089, "3.5 lb": 3819 }
      },
      {
        name: "Pineapple Cake",
        images: ["photos/pineapple-cake-hero.webp", "photos/pineapple-cake-slice.webp"],
        sizePricing: { "Bento": 499, "1 lb": 909, "2 lb": 1729, "3.5 lb": 3189 }
      },
      {
        name: "Chocolate Chip Cake",
        images: ["photos/chocolate-chip-cake-hero.webp", "photos/chocolate-chip-cake-slice.webp"],
        sizePricing: { "Bento": 469, "1 lb": 869, "2 lb": 1639, "3.5 lb": 3039 }
      },
      {
        name: "Fudge Cake",
        images: ["photos/fudge-cake-hero.webp", "photos/fudge-cake-slice.webp"],
        sizePricing: { "Bento": 839, "1 lb": 1599, "2 lb": 3109, "3.5 lb": 5599 }
      }
    ]
  },
  brownies: {
    label: "Brownies",
    type: "unit", // simple quantity, no size
    unitPrice: 189, // per single brownie (3x3 in each)
    minQty: 6,
    note: "3×3 inches each · min. order 6",
    items: [
      { name: "Chocolate Brownies", images: ["photos/chocolate-brownies-hero.webp"] }
    ]
  },
  cookies: {
    label: "Cookies",
    type: "unit",
    // Lotus and Chocolate Chip cookies are priced differently — see per-item unitPrice below
    minQty: 4,
    note: "min. order 4",
    items: [
      { name: "Lotus Cookies", unitPrice: 249, images: ["photos/lotus-cookies-hero.webp"] },
      { name: "Chocolate Chip Cookies", unitPrice: 169, images: ["photos/chocolate-cookies-hero.webp"] }
    ]
  },
  biscuits: {
    label: "Butter Biscuits",
    type: "unit",
    unitPrice: 39, // per single biscuit
    minQty: 15,
    note: "min. order 15",
    items: [
      { name: "Butter Biscuits", images: ["photos/butter-biscuits-hero.webp"] }
    ]
  }
};

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

// ============================================
// Cart state (persisted to localStorage so it survives navigation)
// ============================================
const CART_STORAGE_KEY = 'butttercloud_cart';
let cart = [];

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    cart = raw ? JSON.parse(raw) : [];
  } catch (err) {
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    // localStorage unavailable — cart just won't persist across reloads
  }
}

function cartLineTotal(line) {
  return line.unitPrice * line.qty;
}

function cartTotal() {
  return cart.reduce((sum, line) => sum + cartLineTotal(line), 0);
}

function addToCart(line) {
  // Merge with an existing identical line (same name + size) by bumping qty
  const existing = cart.find(l => l.name === line.name && l.size === line.size);
  if (existing) {
    existing.qty += line.qty;
  } else {
    cart.push(line);
  }
  saveCart();
  renderCart();
  triggerCartWiggle();
}

function triggerCartWiggle() {
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  fab.classList.remove('is-wiggling');
  // Force reflow so the animation can restart even if triggered rapidly
  void fab.offsetWidth;
  fab.classList.add('is-wiggling');
  fab.addEventListener('animationend', () => {
    fab.classList.remove('is-wiggling');
  }, { once: true });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// ============================================
// Render: Menu section
// ============================================
function renderMenu() {
  Object.entries(MENU_DATA).forEach(([key, category]) => {
    const container = document.getElementById(`menu-${key}`);
    if (!container) return;

    container.innerHTML = '';

    category.items.forEach(item => {
      const itemName = item.name;
      const card = document.createElement('div');
      card.className = 'menu-item-card';

      const images = item.images || [];
      const photoHtml = images.length
        ? `<div class="menu-item-photo-wrap">${images
            .map((src, i) => `<img src="${src}" alt="${itemName}" class="menu-item-photo${i === 0 ? ' is-active' : ''}" loading="lazy">`)
            .join('')}</div>`
        : `<div class="menu-item-photo-wrap menu-item-photo-wrap--placeholder">
             <span class="menu-item-placeholder-icon" aria-hidden="true">🍰</span>
             <span class="menu-item-placeholder-text">Photo coming soon</span>
           </div>`;

      if (category.type === 'cake') {
        const sizes = Object.keys(item.sizePricing);
        let selectedSize = sizes[0];
        let qty = 1;

        card.innerHTML = `
          ${photoHtml}
          <span class="menu-item-name">${itemName}</span>
          <div class="menu-size-select" role="group" aria-label="${itemName} size"></div>
          <span class="menu-item-price" data-price-display></span>
          <div class="menu-item-controls">
            <div class="qty-stepper">
              <button type="button" data-qty-minus aria-label="Decrease quantity">−</button>
              <span data-qty-display>1</span>
              <button type="button" data-qty-plus aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="menu-add-btn" data-add-btn>Add to Cart</button>
          </div>
        `;

        const sizeGroup = card.querySelector('.menu-size-select');
        sizes.forEach(size => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = size;
          if (size === selectedSize) btn.classList.add('is-selected');
          btn.addEventListener('click', () => {
            selectedSize = size;
            sizeGroup.querySelectorAll('button').forEach(b => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            updatePriceDisplay();
          });
          sizeGroup.appendChild(btn);
        });

        const priceDisplay = card.querySelector('[data-price-display]');
        const qtyDisplay = card.querySelector('[data-qty-display]');

        function updatePriceDisplay() {
          const unitPrice = item.sizePricing[selectedSize];
          priceDisplay.textContent = `${formatPrice(unitPrice)} each`;
        }
        updatePriceDisplay();

        card.querySelector('[data-qty-minus]').addEventListener('click', () => {
          qty = Math.max(1, qty - 1);
          qtyDisplay.textContent = qty;
        });
        card.querySelector('[data-qty-plus]').addEventListener('click', () => {
          qty += 1;
          qtyDisplay.textContent = qty;
        });

        card.querySelector('[data-add-btn]').addEventListener('click', () => {
          addToCart({
            name: itemName,
            size: selectedSize,
            qty: qty,
            unitPrice: item.sizePricing[selectedSize],
            category: category.label
          });
          qty = 1;
          qtyDisplay.textContent = qty;
        });

      } else {
        // Simple unit-priced item (brownies, cookies, biscuits)
        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : category.unitPrice;
        let qty = category.minQty;

        card.innerHTML = `
          ${photoHtml}
          <span class="menu-item-name">${itemName}</span>
          ${category.note ? `<span class="menu-item-note">${category.note}</span>` : ''}
          <span class="menu-item-price">${formatPrice(unitPrice)} each</span>
          <div class="menu-item-controls">
            <div class="qty-stepper">
              <button type="button" data-qty-minus aria-label="Decrease quantity">−</button>
              <span data-qty-display>${qty}</span>
              <button type="button" data-qty-plus aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="menu-add-btn" data-add-btn>Add to Cart</button>
          </div>
        `;

        const qtyDisplay = card.querySelector('[data-qty-display]');

        card.querySelector('[data-qty-minus]').addEventListener('click', () => {
          qty = Math.max(category.minQty, qty - 1);
          qtyDisplay.textContent = qty;
        });
        card.querySelector('[data-qty-plus]').addEventListener('click', () => {
          qty += 1;
          qtyDisplay.textContent = qty;
        });

        card.querySelector('[data-add-btn]').addEventListener('click', () => {
          addToCart({
            name: itemName,
            size: null,
            qty: qty,
            unitPrice: unitPrice,
            category: category.label
          });
          qty = category.minQty;
          qtyDisplay.textContent = qty;
        });
      }

      container.appendChild(card);
      setupPhotoCrossfade(card);
    });
  });
}

// ============================================
// Menu item photo crossfade (hover-to-cycle through angles)
// ============================================
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function setupPhotoCrossfade(card) {
  const wrap = card.querySelector('.menu-item-photo-wrap');
  if (!wrap) return;

  const photos = wrap.querySelectorAll('.menu-item-photo');
  if (photos.length < 2) return; // nothing to cycle — hero image just sits static

  let activeIndex = 0;
  let cycleTimer = null;

  function showIndex(index) {
    photos.forEach((img, i) => img.classList.toggle('is-active', i === index));
  }

  function startCycle() {
    if (prefersReducedMotionQuery.matches) return; // static hero image only
    if (cycleTimer) return;
    cycleTimer = setInterval(() => {
      activeIndex = (activeIndex + 1) % photos.length;
      showIndex(activeIndex);
    }, 800);
  }

  function stopCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
    activeIndex = 0;
    showIndex(0);
  }

  card.addEventListener('mouseenter', startCycle);
  card.addEventListener('mouseleave', stopCycle);
  card.addEventListener('focusin', startCycle);
  card.addEventListener('focusout', stopCycle);
}

// ============================================
// Render: Cart panel + FAB + checkout summary
// ============================================
function renderCartLines(container, { showRemove }) {
  container.innerHTML = '';

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cart-empty';
    empty.innerHTML = 'Your cart is empty — <a href="#menu">head up to the menu</a> to add something first.';
    container.appendChild(empty);
    return;
  }

  cart.forEach((line, index) => {
    const row = document.createElement('div');
    row.className = 'cart-line';
    row.innerHTML = `
      <div class="cart-line-info">
        <span class="cart-line-name">${line.name}${line.size ? ` — ${line.size}` : ''}</span>
        <span class="cart-line-meta">Qty ${line.qty} × ${formatPrice(line.unitPrice)}</span>
      </div>
      <div class="cart-line-right">
        <span class="cart-line-price">${formatPrice(cartLineTotal(line))}</span>
        ${showRemove ? '<button type="button" class="cart-line-remove">Remove</button>' : ''}
      </div>
    `;
    if (showRemove) {
      row.querySelector('.cart-line-remove').addEventListener('click', () => removeFromCart(index));
    }
    container.appendChild(row);
  });
}

function renderCart() {
  const fabCount = document.getElementById('cart-fab-count');
  const totalCount = cart.reduce((sum, l) => sum + l.qty, 0);
  fabCount.textContent = totalCount;
  fabCount.hidden = totalCount === 0;

  renderCartLines(document.getElementById('cart-panel-body'), { showRemove: true });
  document.getElementById('cart-total').textContent = formatPrice(cartTotal());

  // Checkout summary (Place Order section)
  const summaryBody = document.getElementById('checkout-summary-body');
  const summaryTotal = document.getElementById('checkout-summary-total');
  if (summaryBody) {
    renderCartLines(summaryBody, { showRemove: false });
    if (cart.length > 0) {
      summaryTotal.hidden = false;
      document.getElementById('checkout-total-amount').textContent = formatPrice(cartTotal());
    } else {
      summaryTotal.hidden = true;
    }
  }
}

// ============================================
// Cart panel open/close
// ============================================
const cartFab = document.getElementById('cart-fab');
const cartPanel = document.getElementById('cart-panel');
const cartOverlay = document.getElementById('cart-overlay');
const cartCloseBtn = document.getElementById('cart-close-btn');

function openCart() {
  cartPanel.hidden = false;
  cartOverlay.hidden = false;
}
function closeCart() {
  cartPanel.hidden = true;
  cartOverlay.hidden = true;
}

if (cartFab) cartFab.addEventListener('click', openCart);
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener('click', closeCart);
}

loadCart();
renderMenu();
renderCart();
observeMenuCards();
setupMenuCardTilt();

function setupMenuCardTilt() {
  const cards = document.querySelectorAll('.menu-item-card');
  if (!cards.length) return;

  const supportsFineHoverMenu = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotionMenu = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supportsFineHoverMenu || prefersReducedMotionMenu) return;

  const MAX_TILT_DEG_MENU = 6; // gentle — the card already has its own photo pop-out motion

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * MAX_TILT_DEG_MENU * 2;
      const rotateX = (0.5 - py) * MAX_TILT_DEG_MENU * 2;

      card.classList.add('is-tilting');
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-tilting');
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

function observeMenuCards() {
  const cards = document.querySelectorAll('.menu-item-card');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    cards.forEach(c => c.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -60px 0px' });

  cards.forEach(card => observer.observe(card));
}

// ============================================
// Place Order form (checkout)
// ============================================
const orderForm = document.getElementById('order-form');

if (orderForm) {
  // Toggle delivery address field based on pickup/delivery choice
  const fulfillmentRadios = orderForm.querySelectorAll('input[name="fulfillment"]');
  const addressRow = document.getElementById('address-row');
  const addressField = document.getElementById('of-address');

  function updateAddressVisibility() {
    const selected = orderForm.querySelector('input[name="fulfillment"]:checked');
    const isDelivery = selected && selected.value === 'Delivery';
    addressRow.hidden = !isDelivery;
    if (isDelivery) {
      addressField.setAttribute('required', 'required');
    } else {
      addressField.removeAttribute('required');
    }
  }

  fulfillmentRadios.forEach(radio => {
    radio.addEventListener('change', updateAddressVisibility);
  });
  updateAddressVisibility();

  // Build the WhatsApp message text from cart + form values
  function buildWhatsAppMessage(form) {
    const get = (name) => (form.elements[name] ? form.elements[name].value : '').trim();
    const fulfillment = form.querySelector('input[name="fulfillment"]:checked');
    const hasPhoto = form.elements['reference_photo'] && form.elements['reference_photo'].files.length > 0;

    const lines = [
      "Hi! I'd like to place an order with Butttercloud 🍰",
      "",
      `Name: ${get('name')}`,
      `Phone: ${get('phone')}`,
      `Date needed: ${get('date_needed')}`,
      "",
      "Order:",
      ...cart.map(line => `- ${line.name}${line.size ? ` (${line.size})` : ''} x${line.qty} — ${formatPrice(cartLineTotal(line))}`),
      `Total: ${formatPrice(cartTotal())}`,
      "",
      `${fulfillment ? fulfillment.value : ''}${fulfillment && fulfillment.value === 'Delivery' ? ` — ${get('address')}` : ''}`,
    ];

    const message = get('message');
    if (message) {
      lines.push(`Notes: ${message}`);
    }
    if (hasPhoto) {
      lines.push("(I'll send the reference photo in this chat separately)");
    }

    return lines.join('\n');
  }

  orderForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const statusEl = document.getElementById('order-status');
    statusEl.textContent = '';
    statusEl.classList.remove('is-error');

    try {
      if (cart.length === 0) {
        statusEl.textContent = 'Your cart is empty — add something from the menu first!';
        statusEl.classList.add('is-error');
        return;
      }

      if (!orderForm.reportValidity()) {
        return;
      }

      const whatsappReady = WHATSAPP_NUMBER && !WHATSAPP_NUMBER.includes('XXXX');
      const message = buildWhatsAppMessage(orderForm);

      document.getElementById('cart-items-field').value = JSON.stringify(cart);

      if (whatsappReady) {
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        // Open WhatsApp immediately (must happen synchronously on the click
        // to avoid popup blockers)
        window.open(waUrl, '_blank');
        statusEl.textContent = 'Opening WhatsApp — send the message to confirm your order!';
      } else {
        // WhatsApp number not set up yet — form submission still works,
        // just skips the WhatsApp step until WHATSAPP_NUMBER is filled in above.
        statusEl.textContent = "Order sent! We'll reach out to confirm shortly.";
      }

      const formData = new FormData(orderForm);
      // Formspree's free plan doesn't support file uploads — submissions
      // with a file attached get rejected outright. Strip it here so the
      // rest of the order still goes through; the customer is asked (via
      // the WhatsApp message + form hint) to send the photo in the chat.
      formData.delete('reference_photo');
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Formspree responded with an error');
          }
        })
        .catch(err => {
          console.error('Order form submission failed:', err);
          statusEl.textContent = "Hmm, something went wrong sending that — please try again or message us directly.";
          statusEl.classList.add('is-error');
        });

      orderForm.reset();
      updateAddressVisibility();
      cart = [];
      saveCart();
      renderCart();
    } catch (err) {
      console.error('Unexpected error submitting order form:', err);
      statusEl.textContent = "Something went wrong — please try again or message us directly.";
      statusEl.classList.add('is-error');
    }
  });
}

// ============================================
// Footer: auto year + WhatsApp link
// ============================================
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

const footerWhatsappLink = document.getElementById('footer-whatsapp-link');
if (footerWhatsappLink) {
  const whatsappReady = WHATSAPP_NUMBER && !WHATSAPP_NUMBER.includes('XXXX');
  if (whatsappReady) {
    footerWhatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  } else {
    // No real number yet — point to the order form instead of a dead link
    footerWhatsappLink.href = '#place-order';
    footerWhatsappLink.removeAttribute('target');
  }
}

// ============================================
// Gallery: 3D tilt hover
// ============================================
const galleryTiltItems = document.querySelectorAll('.gallery-item:not(.gallery-item--placeholder)');
const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotionGallery = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (galleryTiltItems.length && supportsFineHover && !prefersReducedMotionGallery) {
  const MAX_TILT_DEG = 9;

  galleryTiltItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * MAX_TILT_DEG * 2;
      const rotateX = (0.5 - py) * MAX_TILT_DEG * 2;

      item.classList.add('is-tilting');
      item.style.setProperty('--mx', `${px * 100}%`);
      item.style.setProperty('--my', `${py * 100}%`);
      item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-tilting');
      item.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

// ============================================
// Gallery lightbox
// ============================================
const galleryGrid = document.getElementById('gallery-grid');

if (galleryGrid) {
  galleryGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item || item.classList.contains('gallery-item--placeholder')) return;

    const img = item.querySelector('img');
    if (!img) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
      <button type="button" class="gallery-lightbox-close" aria-label="Close">&times;</button>
      <img src="${img.src}" alt="${img.alt}">
    `;
    document.body.appendChild(lightbox);

    // Double rAF so the browser registers the initial (closed) state
    // before flipping to .is-open, guaranteeing the transition plays.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lightbox.classList.add('is-open');
      });
    });

    function closeLightbox() {
      if (prefersReducedMotionGallery) {
        lightbox.remove();
        return;
      }
      lightbox.classList.remove('is-open');
      lightbox.addEventListener('transitionend', () => lightbox.remove(), { once: true });
    }
    lightbox.addEventListener('click', (evt) => {
      if (evt.target === lightbox || evt.target.classList.contains('gallery-lightbox-close')) {
        closeLightbox();
      }
    });
    document.addEventListener('keydown', function escHandler(evt) {
      if (evt.key === 'Escape') {
        closeLightbox();
        document.removeEventListener('keydown', escHandler);
      }
    });
  });
}

// ============================================
// Reviews: scroll-triggered reveal + 3D tilt hover
// ============================================
const reviewCards = document.querySelectorAll('.review-card');

if (reviewCards.length) {
  if (prefersReducedMotionGallery) {
    reviewCards.forEach(card => card.classList.add('is-visible'));
  } else {
    // Stagger the entrance per card, then clear the delay so later
    // hover interactions respond instantly instead of lagging.
    reviewCards.forEach((card, idx) => {
      card.style.transitionDelay = `${idx * 80}ms`;
    });

    const reviewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.classList.add('is-visible');
          card.addEventListener('transitionend', function clearDelay(evt) {
            if (evt.propertyName === 'transform') {
              card.style.transitionDelay = '';
              card.removeEventListener('transitionend', clearDelay);
            }
          });
          reviewObserver.unobserve(card);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

    reviewCards.forEach(card => reviewObserver.observe(card));

    if (supportsFineHover) {
      const REVIEW_MAX_TILT_DEG = 10;

      reviewCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;

          const rotateY = (px - 0.5) * REVIEW_MAX_TILT_DEG * 2;
          const rotateX = (0.5 - py) * REVIEW_MAX_TILT_DEG * 2;

          card.classList.add('is-tilting');
          card.style.transform = `translateY(0) rotate(var(--base-rot)) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.06)`;
        });

        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-tilting');
          card.style.transform = 'translateY(0) rotate(var(--base-rot)) scale(1)';
        });
      });
    }
  }
}

// ============================================
// Mascot companion — idle blink cycle + wave on hover/tap
// ============================================
const mascotBtn = document.getElementById('mascot-companion');
const mascotImg = document.getElementById('mascot-companion-img');

if (mascotBtn && mascotImg) {
  const IDLE_SRC = 'mascot/companion-idle.webp';
  const BLINK_SRC = 'mascot/companion-blink.webp';
  const WAVE_SRC = 'mascot/companion-wave.webp';

  let idleTimer = null;
  let isWaving = false;

  function scheduleBlink() {
    const delay = 3000 + Math.random() * 4000; // blink every ~3-7s
    idleTimer = setTimeout(() => {
      if (!isWaving) {
        mascotImg.src = BLINK_SRC;
        setTimeout(() => {
          if (!isWaving) mascotImg.src = IDLE_SRC;
        }, 180);
      }
      scheduleBlink();
    }, delay);
  }

  function playWave() {
    isWaving = true;
    mascotImg.src = WAVE_SRC;
    setTimeout(() => {
      isWaving = false;
      mascotImg.src = IDLE_SRC;
    }, 900);
  }

  mascotBtn.addEventListener('mouseenter', playWave);
  mascotBtn.addEventListener('click', playWave);
  mascotBtn.addEventListener('focus', playWave);

  scheduleBlink();
}


// ============================================
// Hero: floating 3D cupcake — mouse tilt + scroll parallax
// ============================================
const heroSection = document.getElementById('hero');
const heroStage = document.querySelector('.hero-3d-stage');
const heroCupcakeTilt = document.querySelector('.hero-cupcake-tilt');

if (heroSection && heroStage && heroCupcakeTilt) {
  const supportsFineHoverHero = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotionHero = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (supportsFineHoverHero && !prefersReducedMotionHero) {
    const MAX_TILT_DEG_HERO = 14;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * MAX_TILT_DEG_HERO * 2;
      const rotateX = (0.5 - py) * MAX_TILT_DEG_HERO * 2;
      heroCupcakeTilt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      heroCupcakeTilt.style.transform = '';
    });
  }

  if (!prefersReducedMotionHero) {
    let heroParallaxTicking = false;

    function updateHeroParallax() {
      const rect = heroSection.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      heroStage.style.transform = `translateY(calc(-50% + ${progress * 60}px))`;
      heroParallaxTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!heroParallaxTicking) {
        window.requestAnimationFrame(updateHeroParallax);
        heroParallaxTicking = true;
      }
    }, { passive: true });

    updateHeroParallax();
  }
}
