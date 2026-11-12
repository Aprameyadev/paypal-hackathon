/**
 * postcss.config.cjs
 *
 * Runs Tailwind CSS v4 and Mantine's PostCSS preset side-by-side.
 *
 * HOW THEY COEXIST:
 * ─────────────────
 * • Tailwind v4 uses its own CSS-native engine (`@import "tailwindcss"` in
 *   globals.css) and, during dev, is handled by the `@tailwindcss/turbopack`
 *   loader registered in next.config.ts.  For production builds it also
 *   registers itself as a PostCSS plugin via `@tailwindcss/postcss`.
 *
 * • postcss-preset-mantine only transforms Mantine-specific syntax:
 *     – `light-dark(light, dark)` color function
 *     – `rem()` / `em()` unit helpers
 *     – Mantine CSS variables scoping
 *   It does NOT output Tailwind-style utility classes, so there is zero
 *   overlap or collision.
 *
 * PLUGIN ORDER:
 * ─────────────
 * 1. @tailwindcss/postcss  — Tailwind v4's official PostCSS integration.
 *    Must run FIRST so that `@import "tailwindcss"` is expanded before
 *    any downstream plugin sees the resolved CSS.
 *
 * 2. postcss-preset-mantine — Processes Mantine's custom CSS functions
 *    (light-dark, rem, em) on the already-resolved stylesheet.
 *
 * 3. autoprefixer — Adds vendor prefixes last, after all transforms.
 */

module.exports = {
  plugins: {
    // 1️⃣  Tailwind CSS v4 (PostCSS integration)
    '@tailwindcss/postcss': {},

    // 2️⃣  Mantine preset – transforms light-dark(), rem(), em()
    'postcss-preset-mantine': {
      // Converts px → rem using Mantine's 1rem = 16px scale.
      // Set to false if you want to handle units yourself.
      autoRemMediaQueries: true,
    },

    // 3️⃣  Autoprefixer – vendor prefixes (runs last)
    autoprefixer: {},
  },
};

