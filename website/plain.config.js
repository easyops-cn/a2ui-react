// @ts-check
/** @type {import("plain-blog").SiteConfig} */
export default {
  baseUrl: '/',
  site: {
    title: 'A2UI React Renderer',
    description: 'A React renderer for A2UI protocol',
    favicon: 'assets/favicon.svg',
    url: 'https://a2ui-react.js.org',
  },
  locales: ['en'],
  components: {
    Home: 'src/components/Home.jsx',
  },
  styles: ['src/global.css'],
  scripts: ['src/client/index.js'],
}
