// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://backyardsaunapro.com',
  build: {
    assets: 'assets'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
