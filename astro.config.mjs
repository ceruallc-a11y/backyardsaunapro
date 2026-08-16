// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://backyardsaunapro.com',
  trailingSlash: 'always',
  redirects: {
    '/guides/sauna-for-couples': '/guides/best-2-person-sauna',
    '/guides/gym-sauna-etiquette': '/guides/sauna-etiquette'
  },
  build: {
    assets: 'assets'
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
