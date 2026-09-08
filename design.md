# Butttercloud — Design System & CSS Specification (Complete Guide)

> **Version:** 2.0
> **Target Framework:** Plain HTML5, CSS3, Vanilla JavaScript (ES6)
> **Animation Engine:** Lenis (Smooth Scroll)
> **Maintained By:** Butttercloud Engineering

---

## 1. Cinematic Design Principles

To elevate butttercloud from a simple static webpage to a high-end, tactile, and cinematic digital storefront, all frontend development must adhere to these four core design principles:

1. **Tactile Delight (Physicality):** Surfaces should feel real. Cards, review papers, and pictures must utilize paper shadows, simulated depth, realistic 3D perspective, and dynamic hover-tilting.
2. **Fluid Transitioning:** No state changes or section entries should occur instantly. Standard CSS jumps must be replaced with physics-based springs and ease-out curves.
3. **Typography as Art:** Headings are not just text labels; they are key graphic layout elements. Kinetic type reveals, letter-spacing scaling, and responsive size clamping should keep layout hierarchy breathtaking.
4. **Energetic Snappiness:** While smooth, the site should never feel lazy. Hover states should respond under `150ms`, page scrolling must feel immediate yet friction-rich (via Lenis), and clicks should trigger spring-loaded wiggles.

---

## 2. Global CSS Custom Properties & Variables

These design tokens are declared under `:root` inside `styles.css`. No hardcoded hex values are permitted in individual layout components.

```css
:root {
  --bg:                 #FEF8E8;
  --surface-card:       #FFFDF8;
  --text:               #3D2D2E;
  --text-soft:          #948C8C;
  --primary:            #9BB7D4;
  --primary-deep:       #74899F;
  --accent:             #F8DE8D;
  --error:              #B3554A;
  --success:            #5A9E75;

  --font-display:       "Fraunces", serif;
  --font-script:        "Pacifico", cursive;
  --font-body:          "Work Sans", sans-serif;

  --header-height:      68px;
  --border-radius-sm:   6px;
  --border-radius-md:   12px;
  --border-radius-lg:   18px;
  --border-radius-full: 999px;

  --transition-spring:  transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-smooth:  background 0.25s ease, border-color 0.25s ease, color 0.25s ease;

  --shadow-flat:        0 2px 0 var(--accent);
  --shadow-tactile:     0 6px 18px rgba(61, 45, 46, 0.08);
  --shadow-hover:       0 22px 32px rgba(61, 45, 46, 0.18);
  --shadow-sticker:     0 6px 16px rgba(61, 45, 46, 0.08);
}
```

---

## 3. Typography Specs & Scale

Text hierarchy is highly responsive, adapting gracefully from small mobile screens up to desktop monitors.

| Tag / Class | Font Family | Weight | Size Range (Mobile → Desktop) | Line Height | Case / Styling |
|---|---|---|---|---|---|
| `.hero-name` | `var(--font-script)` | 400 | `clamp(2.75rem, 8vw, 4.75rem)` | 1.15 | Lowercase, casual |
| `.section-heading--script` | `var(--font-script)` | 400 | `clamp(1.7rem, 3.6vw, 2.3rem)` | 1.2 | Lowercase, casual |
| Section Headings | `var(--font-display)` | 500–600 | `clamp(1.9rem, 4vw, 2.6rem)` | 1.3 | Titlecase |
| Card Headings | `var(--font-display)` | 600 | 1.15rem to 1.3rem | 1.4 | Titlecase |
| Body text (`p`) | `var(--font-body)` | 400 | `clamp(0.95rem, 1.6vw, 1.05rem)` | 1.55 | Standard sentence case |
| Secondary Labels | `var(--font-body)` | 500 | 0.78rem to 0.85rem | 1.4 | Capitalized |
| Buttons & CTAs | `var(--font-body)` | 600 | 0.88rem to 1.0rem | 1.0 | Capitalized |

---

## 4. Tactile Grid & Layout Spacing

All element margins, paddings, and alignment rules utilize an 8px structural increment to keep spacing proportional and visually cohesive.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro padding (spacing inside button text, borders) |
| `space-2` | 8px | Interactive margins (line text to input borders, icon labels) |
| `space-3` | 12px | Group spacing (inner gap of a form row, button margins) |
| `space-4` | 16px | Card standard margin (padding inside `.gallery-item` or `.menu-items`) |
| `space-6` | 24px | Card inner structural buffer (padding inside `.review-card`, `.policy-card`) |
| `space-8` | 32px | Row gaps & standard segment gaps |
| `space-12` | 48px | Major section headings buffer |
| `space-24` | 96px | Top/Bottom section content boundaries (`.story`, `.menu`, `.pre-orders`) |

---

## 5. Structural Refactoring for Lenis Smooth Scrolling & Viewport Stability

To achieve buttery-smooth, whimsical motion for butttercloud, we integrate Lenis while preserving standard document flow for fixed-position elements.

### 5.1 HTML Document Topology (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Butter Cloud</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <header class="site-header" id="site-header">...</header>
      <aside class="cart-panel" id="cart-panel" hidden>...</aside>
      <div class="cart-overlay" id="cart-overlay" hidden></div>
      <button type="button" class="cart-fab" id="cart-fab" aria-label="View cart">...</button>
      <button type="button" class="mascot-companion" id="mascot-companion" aria-label="Mascot">...</button>

      <div class="custom-cursor" aria-hidden="true">
        <div class="cursor-dot"></div>
        <div class="cursor-follower"><span class="cursor-text"></span></div>
      </div>

      <main id="top">
        <section class="hero" id="hero">...</section>
        <section class="story" id="story">...</section>
        <section class="menu" id="menu">...</section>
        <section class="gallery" id="gallery">...</section>
        <section class="pre-orders" id="pre-orders">...</section>
        <section class="reviews" id="reviews">...</section>
        <section class="faq" id="faq">...</section>
        <section class="place-order" id="place-order">...</section>
      </main>

      <footer class="site-footer">...</footer>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

### 5.2 CSS Viewport and Scroll Architecture (`styles.css`)

```css
html, body {
  margin: 0; padding: 0; width: 100%;
  background: var(--bg); color: var(--text);
  font-family: var(--font-body); overflow-x: hidden;
}
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
#smooth-wrapper { overflow: hidden; position: relative; width: 100%; top: 0; left: 0; }
#smooth-content { position: relative; width: 100%; }

.site-header, .cart-fab, .cart-panel, .cart-overlay, .mascot-companion, .custom-cursor {
  position: fixed !important; transform: translateZ(0);
}
```

### 5.3 JavaScript Initialization (`script.js`)

```javascript
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  mouseMultiplier: 0.9,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

---

## 6. Tactile Hover States & Interactive Physics

- **Primary Spring Curve:** `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Smooth Butter Glide:** `cubic-bezier(0.25, 1, 0.5, 1)`

```css
.btn-primary, .menu-add-btn, .nav-cta {
  background: var(--text); color: var(--bg);
  border: 2px solid var(--text); border-radius: var(--border-radius-full);
  padding: 0.75rem 1.75rem; box-shadow: 0px 4px 0px var(--text);
  transition: var(--transition-spring);
}
.btn-primary:hover, .menu-add-btn:hover, .nav-cta:hover {
  background: var(--primary-deep); transform: translateY(-3px) scale(1.02);
  box-shadow: 0px 7px 0px var(--text);
}
```

---

## 7. Cinematic Custom Cursor System

```css
@media (hover: hover) and (pointer: fine) {
  body, a, button, input, textarea, .menu-item-card, .gallery-item, .mascot-companion {
    cursor: none !important;
  }
}
.custom-cursor { pointer-events: none; position: fixed; top: 0; left: 0; z-index: 99999; }
.cursor-dot { position: absolute; top: -4px; left: -4px; width: 8px; height: 8px; background: var(--text); border-radius: 50%; }
.cursor-follower {
  position: absolute; top: -20px; left: -20px; width: 40px; height: 40px;
  background: rgba(175, 201, 217, 0.4); border: 1.5px solid var(--text); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 8. Cart State Management & WhatsApp Integration

```javascript
const CART_STORAGE_KEY = 'butttercloud_cart';
let cart = [];

function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []; } catch { cart = []; }
}
function saveCart() {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch {}
}
```
