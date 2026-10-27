# Design System & Implementation Specification
> **Aesthetic Archetype**: Modern Blueprint SaaS / Tech Pastel Minimalism  
> **Source**: Extracted from UI screenshot references with adaptive, responsive scaling (avoiding rigid pixel dimensions).

---

## 📐 1. Responsive Layout & Dimensional Rules

Because source images are perspective mockups and screenshots, **never hardcode fixed width/height values** (e.g., fixed `height: 600px` or rigid image dimensions). All components must follow a fluid, responsive container system:

### Container System
* **Max Page Width**: `max-w-7xl` (`1280px`) or `max-w-6xl` (`1152px`) for centered landing layouts.
* **Content / Reading Width**: `max-w-2xl` (`672px`) to `max-w-3xl` (`768px`) for hero paragraphs and section intros.
* **Horizontal Page Padding**:
  * Mobile: `px-4` (`16px`)
  * Tablet: `px-8` (`32px`)
  * Desktop: `px-12` to `px-16` (`48px - 64px`)
* **Vertical Section Rhythm**:
  * Mobile: `py-16` (`64px`)
  * Desktop: `py-24` to `py-32` (`96px - 128px`)

---

## 🎨 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  /* Brand Primaries */
  --color-primary: #2563eb;          /* Electric Royal Blue (Buttons, active states, key words) */
  --color-primary-hover: #1d4ed8;    /* Deep Blue Hover */
  --color-primary-light: #eff6ff;    /* Soft Tint Background */
  --color-navy: #0f172a;             /* Main Headline Text (Slate 900) */
  --color-text-body: #475569;        /* Body Paragraphs (Slate 600) */
  --color-text-muted: #94a3b8;       /* Labels and hints (Slate 400) */

  /* Vibrant Accent Gradient (Stats Banner) */
  --gradient-stats-banner: linear-gradient(135deg, #1d4ed8 0%, #7e22ce 52%, #06b6d4 100%);

  /* Pastel Surface Gradients (Cards & Process Steps) */
  --surface-ice-blue: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
  --border-ice-blue: #dbeafe;

  --surface-mint: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%);
  --border-mint: #a7f3d0;

  --surface-lavender: linear-gradient(180deg, #ffffff 0%, #faf5ff 100%);
  --border-lavender: #e9d5ff;

  --surface-amber: linear-gradient(180deg, #ffffff 0%, #fefce8 100%);
  --border-amber: #fef08a;

  --surface-cyan: linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%);
  --border-cyan: #99f6e4;

  /* Blueprint / Circuit Lines */
  --line-blueprint: rgba(59, 130, 246, 0.35);
  --line-blueprint-active: #3b82f6;
}
```

### 2.2 Typography Scale (Fluid & Rem-based)

* **Display & Heading Font**: `'Syne', var(--font-sans)` (Weights: 500, 600, 700, 800)
* **Primary Body Font**: `'Plus Jakarta Sans', -apple-system, sans-serif` (Weights: 400, 500, 600, 700)
* **Main Hero Title**: `text-4xl md:text-5xl lg:text-6xl` (`2.5rem - 3.75rem`), `font-extrabold`, `leading-[1.15]`, letter-spacing `-0.03em`.
* **Section Headings (`H2`)**: `text-3xl md:text-4xl` (`1.875rem - 2.25rem`), `font-bold`, `leading-tight`, letter-spacing `-0.02em`.
* **Card Titles (`H3`)**: `text-lg md:text-xl` (`1.125rem - 1.25rem`), `font-bold`, color `#0F172A`.
* **Body Text**: `text-base` (`1rem`) or `text-sm` (`0.875rem`), `leading-relaxed`, color `#475569`.
* **Watermark Numbers**: `text-6xl md:text-8xl` (`4rem - 6rem`), `font-black`, right-bottom anchored, non-selectable.

### 2.3 Radii & Elevation (Rounded Modernism)
* **Pill Elements (Nav, Badge, CTAs)**: `rounded-full` (`9999px`) or `rounded-xl` (`12px`)
* **Standard Cards (Process, Stats, Modules)**: `rounded-2xl` (`16px - 20px`)
* **Hero Cards & Feature Stacks**: `rounded-3xl` (`24px - 32px`)
* **Shadows**:
  * Subtle card elevation: `0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)`
  * Floating preview: `0 20px 40px -15px rgba(37, 99, 235, 0.08), 0 0 1px 1px rgba(226, 232, 240, 0.8)`

---

## 🧩 3. Key Component Blueprints

### 3.1 Blueprint / Circuit Line Accents
The technical feel comes from schematic lines connecting cards:
* **Style**: `1.5px` border width, alternating between `solid` and `dashed` (`stroke-dasharray: 6 6`).
* **Corners**: Curved 90° joints (`rx="16"` or `border-radius: 16px`).
* **Terminators**: Solid `6px` circular terminal dots (`circle fill="#3B82F6"`).
* **Implementation tip**: Use vector SVG overlays with `preserveAspectRatio="none"` or relative wrapper pseudo-elements so lines scale smoothly without pixel distortion.

```tsx
// Reusable Blueprint Line SVG Background Component
export function BlueprintLineAccent({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={`pointer-events-none absolute inset-0 h-full w-full stroke-blue-500/30 ${className}`} 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M 20 40 H 120 Q 140 40 140 60 V 180" 
        strokeWidth="1.5" 
        strokeDasharray="6 6" 
      />
      <circle cx="140" cy="180" r="3" fill="#3B82F6" />
    </svg>
  );
}
```

---

### 3.2 Full-Width Stats Gradient Banner (Image 1 & 3)
* **Container**: `w-full max-w-5xl mx-auto rounded-3xl p-8 md:p-10 text-white shadow-xl`
* **Background**: `bg-gradient-to-r from-blue-700 via-purple-600 to-cyan-500`
* **Grid Layout**: Responsive `grid grid-cols-2 md:grid-cols-4 gap-6 text-center`
* **Metric Items**:
  * `+20K` Daily visitors
  * `+3,200` Resources
  * `+100K` Email subscribers
  * `+10` Daily resources

```tsx
export function MetricBanner() {
  const metrics = [
    { value: "+20K", label: "Daily visitors" },
    { value: "+3,200", label: "Resources" },
    { value: "+100K", label: "Email subscribers" },
    { value: "+10", label: "Daily resources" },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#1d4ed8] via-[#7e22ce] to-[#06b6d4] p-8 md:p-10 text-white shadow-xl shadow-blue-500/10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 text-center">
          {metrics.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
                {item.value}
              </span>
              <span className="mt-1 text-xs md:text-sm font-medium text-white/80">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 3.3 "Our Process" Step Grid with Number Watermarks (Image 5)
* **Layout**:
  * Row 1: `grid grid-cols-1 md:grid-cols-2 gap-6` (Cards `01`, `02`)
  * Row 2: `grid grid-cols-1 md:grid-cols-3 gap-6 mt-6` (Cards `03`, `04`, `05`)
* **Watermark Styling**:
  * Positioned `absolute -bottom-4 right-4 pointer-events-none select-none`
  * Font size `text-7xl md:text-8xl font-black`
  * Opacity: `opacity-20` to `opacity-30` tinted with the card's accent color.
  * Z-index: Behind text (`z-0`) with card content set to `relative z-10`.

```tsx
interface StepCardProps {
  step: "01" | "02" | "03" | "04" | "05";
  title: string;
  description: string;
  variant: "blue" | "teal" | "purple" | "mint" | "amber";
}

const STEP_VARIANTS = {
  blue: {
    card: "bg-gradient-to-b from-white to-blue-50/70 border-blue-100",
    watermark: "text-blue-500/20",
  },
  teal: {
    card: "bg-gradient-to-b from-white to-teal-50/70 border-teal-100",
    watermark: "text-teal-500/20",
  },
  purple: {
    card: "bg-gradient-to-b from-white to-purple-50/70 border-purple-100",
    watermark: "text-purple-500/20",
  },
  mint: {
    card: "bg-gradient-to-b from-white to-emerald-50/70 border-emerald-100",
    watermark: "text-emerald-500/20",
  },
  amber: {
    card: "bg-gradient-to-b from-white to-amber-50/70 border-amber-100",
    watermark: "text-amber-500/20",
  },
};

export function ProcessStepCard({ step, title, description, variant }: StepCardProps) {
  const { card, watermark } = STEP_VARIANTS[variant];

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card}`}>
      <div className="relative z-10 max-w-[85%]">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      {/* Giant Watermark Number */}
      <span className={`absolute -bottom-3 right-3 text-7xl md:text-8xl font-black select-none pointer-events-none ${watermark}`}>
        {step}
      </span>
    </div>
  );
}
```

---

### 3.4 Feature Story Stack (Image 4)
* **Structure**: Vertical stack of cards with generous interior padding (`p-8 md:p-12`).
* **Columns**:
  * Left side (`w-full md:w-3/5`): Clean bold title, descriptive paragraphs.
  * Right side (`w-full md:w-2/5`): Minimalist line-art illustration + dashed blueprint guides.
* **Alternating Tints**:
  * Card 1: Soft Ice Blue (`to-blue-50/80`)
  * Card 2: Soft Mint Green (`to-emerald-50/80`)
  * Card 3: Soft Lavender (`to-purple-50/80`)

---

### 3.5 Partner Logo Cloud / Social Proof Marquee (Image 2)
* **Presentation**: Clean horizontal row.
* **Colors**: Monochrome slate gray (`#64748b` or `#94a3b8`) with smooth hover effect to full contrast.
* **Spacing**: `gap-8 md:gap-14`, centered alignment.

---

## 🛠️ 4. Quick Implementation Checklist for Developers

1. **Avoid Rigid Sizes**: Use flexbox (`flex-1`, `flex-wrap`) and CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with auto-flowing content.
2. **Text Legibility**: Always ensure cards with watermark numbers have `z-10` on content wrappers so numbers never interfere with text selection or reading.
3. **Responsive Padding**: Standardize on `p-6` for mobile and `p-8 md:p-10` for desktop cards.
4. **Subtle Outlines**: Maintain `1px` subtle borders (`border-slate-200/80` or color-matched tints) for crisp separation on light backgrounds.
5. **CTA Consistency**: Keep primary actions in solid Electric Blue (`#2563EB`) with 8px-12px rounded corners and white text.
