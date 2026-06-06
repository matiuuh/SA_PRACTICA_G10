import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "HomeFinder Pro", 
  description = "Encuentra tu hogar ideal con nuestra plataforma inmobiliaria",
  keywords = "bienes raíces, propiedades, casas, departamentos, inmobiliaria",
  author = "HomeFinder Pro"
}) => {
  const fullTitle = title === "HomeFinder Pro" ? title : `${title} | HomeFinder Pro`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

export default SEO
