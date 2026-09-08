# Butttercloud — Official Brand Guidelines (Part 1)

> **Version:** 2.0  
> **Brand Name:** butttercloud (always spelled with three 't's in lowercase for branding)  
> **Tagline:** Homemade. Handmade. Worth the wait.  
> **Target Audience:** Aesthetic-driven dessert lovers, Gen Z, young professionals, families, and event hosts in Multan, Pakistan.  
> **Maintained By:** Butttercloud Design & Development Team

---

## 1. Brand Essence & Story

### Core Vision
butttercloud is a cozy, whimsical, and artisan home bakery built on radical transparency, warmth, and uncompromised quality. We don't pre-bake sponges or shortcut curing processes; every order is baked fresh from scratch by a dedicated COTHM pastry student.

### Brand Personality
* **Cozy & Whimsical:** Warm, inviting, playful, and charmingly human.
* **Artisan & Honest:** Unapologetic about the time and science required to make great pastries ("the tea, spilled").
* **Energetic & Modern:** Gen Z-friendly, stylish, aesthetic, and visually delightful.

### The Mascot
Our mascot is a playful butter-cloud character that acts as the narrator of our story section ("the tea, spilled") and an interactive float on the site. The mascot embodies the effort, stress, perfectionism, and joy that goes into home baking.

---

## 2. Copywriting & Tone Matrix

### Tone Matrix

| Dimension | We Are... | We Are NOT... |
| :--- | :--- | :--- |
| **Voice** | Friendly, conversational, Gen Z-relatable | Formal, corporate, or stuffy |
| **Honesty** | Direct about pricing, prep time, & effort | Vague, transactional, or over-promising |
| **Vibe** | Warm, whimsical, cozy | Cold, industrial, or factory-made |

### Copy Rules
1. **Lowercase Casualness:** Use lowercase headline styling where appropriate (e.g., *"the tea, spilled"*, *"the menu"*, *"sweet things people said"*, *"the pre-order lowdown"*).
2. **Authentic Slang:** Use light, natural slang (*"the tea"*, *"sweet spot"*, *"the math"*, *"heads up"*) without sounding forced.
3. **Punctuation:** Warm, expressive, and conversational. Use emojis sparingly but intentionally (👋, 🎓, 👇, 🍰).

---

## 3. Color Palette Tokens

The color system uses exact Pantone-derived shades reflecting butter, warm sponge cake, and chocolate plum depth.

```css
:root {
  /* Core Brand Tokens */
  --color-text:           #3D2D2E; /* Chocolate Plum (Pantone) — Headings, body text, primary dark surfaces */
  --color-text-soft:      #948C8C; /* Soft Chocolate Plum — Secondary text, captions, subtitles, hints */
  --color-bg:             #FEF8E8; /* Lightened Popcorn — Page background surface */
  --color-surface-card:   #FFFDF8; /* Warm White — Card surfaces, modal containers, popovers */
  
  /* Accent Tokens */
  --color-primary:        #9BB7D4; /* Cerulean (Pantone) — Buttons, tags, blue accents */
  --color-primary-deep:   #74899F; /* Deep Cerulean — Hover states, active links, dark accents */
  --color-accent:         #F8DE8D; /* Popcorn (Pantone) — Highlights, tape stickers, callouts */
  
  /* Functional States */
  --color-error:          #B3554A; /* Strawberry Red — Error messages, removal actions */
  --color-success:        #5A9E75; /* Sage Green — Order confirmation, success badges */
}

```

## 4. Typography System

We use three distinct typefaces to create an editorial, cinematic balance:

1. **Fraunces (Serif Heading Font):** 
   * **Role:** Warm, classic, and expressive. 
   * **Usage:** Section titles, card headings, accordion summaries (`summary`), and featured numbers/stats.
2. **Pacifico (Charming Accent Font):** 
   * **Role:** Whimsical, handcrafted cursive script.
   * **Usage:** Branding accents, hero title (`.hero-name`), and lowercase creative headings (`.section-heading--script`).
3. **Work Sans (Body & UI Font):** 
   * **Role:** Clean, highly legible, professional.
   * **Usage:** UI controls, navigation links, buttons, body copy, forms, and shopping cart details.

---

## 5. Logo & Asset Specifications

* **Primary Logo Asset (`logo.png`):**
  * **Location:** Root directory.
  * **Type:** Circular icon mark featuring the custom butter cloud artwork.
  * **Clear Space:** Always maintain at least a `12px` clear margins/padding around the logo in headers and footers.
* **Mascot Asset Folder (`/mascot/`):**
  * Contains the handcrafted illustrations representing our companion's journey.
  * **Story Frames:** `beat1.webp` through `beat6.webp` (Story section mini-comic scenes).
  * **Page Poses:** `pose1.webp`, `pose2.webp`, `pose3.webp` (Used in Pre-Orders policy cards and the footer order CTA).
  * **Companion States:** `companion-idle.webp`, `companion-blink.webp`, `companion-wave.webp` (For the active floating screen widget on bottom-left).

---

## 6. Menu & Media Inventory

Every item on the menu matches a precise set of high-resolution photographic angles, allowing users to inspect the artisan details.

### Product Portfolio & Media Mapping

#### 1. Cakes
* **Lotus Three Milk Cake:**
  * Requires 4 precise angles: `hero`, `3/4 top-down`, `close-up`, `slice`.
* **Chocolate Three Milk Cake:**
  * *Status:* Launching without photography. Shows standard `"Photo coming soon"` placeholder asset with cupcake icon.
* **Pineapple Cake:**
  * Requires 4 precise angles: `hero`, `3/4 top-down`, `close-up`, `slice`.
* **Chocolate Chip Cake:**
  * Requires 4 precise angles: `hero`, `3/4 top-down`, `close-up`, `slice`.
* **Fudge Cake:**
  * Requires 4 precise angles: `hero`, `3/4 top-down`, `close-up`, `slice`.

#### 2. Cookies
* **Lotus Cookies:**
  * Requires 4 precise angles: `hero`, `3/4 top-down`, `close-up`, `bite`.
* **Chocolate Chip Cookies:**
  * Requires 3 precise angles: `3/4 top-down`, `hero`, `bite`.

#### 3. Brownies
* **Chocolate Brownies:**
  * Requires 3 precise angles: `hero`, `3/4 top-down`, `bite`.

#### 4. Butter Biscuits
* **Butter Biscuits:**
  * Requires 3 precise angles: `hero`, `close-up`, `3/4 top-down`.