import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
  image?: string;
}

const SITE_URL = 'https://tohnee.ai';
const DEFAULT_IMAGE = 'https://tohnee.ai/og-image.png';

const SEO = ({
  title,
  description,
  path = '/',
  type = 'website',
  image = DEFAULT_IMAGE,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} — Tohnee.ai`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: title,
          description,
          url,
          publisher: {
            '@type': 'Organization',
            name: 'Tohnee.ai',
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
