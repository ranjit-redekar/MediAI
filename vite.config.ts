import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * GitHub Pages serves project sites from https://<user>.github.io/<repo>/, so
 * assets need that prefix. Override with BASE_PATH when deploying elsewhere
 * (a custom domain or user site would use '/').
 */
const base = process.env.BASE_PATH ?? '/MediAI/'

/**
 * GitHub Pages has no server-side rewrite, so a deep link like /MediAI/patients
 * 404s on first load or refresh. Serving the same SPA shell as 404.html lets the
 * app boot and hand the URL to the router. `.nojekyll` stops Pages from dropping
 * Vite's `_`-prefixed asset files.
 */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
      writeFileSync(resolve(outDir, '.nojekyll'), '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // Dev server stays at the root. The build and `vite preview` both use the
  // sub-path, so preview exercises the same URLs GitHub Pages will serve.
  base: command === 'build' || isPreview ? base : '/',
  plugins: [react(), githubPagesSpaFallback()],
}))
