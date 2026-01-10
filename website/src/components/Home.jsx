import { useSiteContext } from 'plain-blog/SiteContext'
import Header from './Header.jsx'
import Page from './Page.jsx'
import Footer from './Footer.jsx'
import HomeMain from './HomeMain.mdx'

/**
 * @param {import("plain-blog").HomeProps} props
 * @returns {import("react").JSX.Element}
 */
export default function Home({ articles }) {
  const { site, meta } = useSiteContext()

  return (
    <Page title={site.title} meta={meta}>
      <Header type="home" />
      <main className="home">
        <HomeMain />
      </main>
      <Footer type="home" />
    </Page>
  )
}
