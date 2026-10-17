# bit3labs — Web & Software Agency Platform

A modern, high-performance web agency landing and showcase platform for custom web applications, enterprise software architectures, and automated cloud systems.

Built with clean semantic HTML, modular Vanilla CSS design tokens, and lightweight vanilla JavaScript.

## 🚀 Key Features

- **Blueprint SaaS & Tech Pastel Design System**: Extracted from modern high-end UI patterns featuring soft pastel gradients (Ice Blue, Mint, Lavender, Cyan, Amber), blueprint circuit vector traces, and crisp slate typography.
- **Curved Off-Blue Hero Canvas**: Soft off-blue hero container with an organic SVG bottom curve transition and an interactive system telemetry dashboard mockup.
- **Signature 3-Color Gradient Banner**: Vibrant multi-stop gradient (`#1D4ED8` ➔ `#7E22CE` ➔ `#06B6D4`) with animated count-up metrics for system uptime and performance stats.
- **5-Stage Process Flow**: Asymmetric grid featuring large watermark numbers (`01` through `05`) for clear delivery transparent stages.
- **Project Showcase Page (`projects.html`)**: Interactive category filtering (`Custom Web`, `Enterprise Software`, `Automated Systems`) and case study metric cards.
- **Dedicated Architecture Contact Page (`contact.html`)**: 2-column layout with enterprise architecture guarantees, direct engineering contact channels, and project scoping intake form.
- **Zero-Dependency Architecture**: Pure HTML5, modern CSS3 (with CSS variables and `@import` reusability), and Vanilla JS.

## 📁 Project Structure

```
├── DESIGN_SYSTEM.md    # Design system tokens and specifications
├── README.md           # Project documentation
├── index.html          # Main landing page (Hero, Services, Process, Metrics, About)
├── styles.css          # Core design tokens, layout grids, components, and animations
├── main.js             # Interactive counter observer, modal controls, and telemetry simulation
├── projects.html       # Portfolio showcase with category filtering
├── projects.css        # Scoped styles for projects showcase (imports styles.css)
├── contact.html        # Dedicated architecture consultation intake page
└── contact.css         # Scoped styles for contact page (imports styles.css)
```

## 🛠️ Local Development

Serve locally using any static web server:

```bash
# Using Python
python -m http.server 3000

# Using Node / npx
npx serve -l 3000
```

Open `http://localhost:3000` in your browser.
