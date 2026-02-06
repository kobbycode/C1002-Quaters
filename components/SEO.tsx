
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
  type?: 'website' | 'hotel' | 'profile';
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, type = 'website', schema }) => {
  const { pathname } = useLocation();
  const siteName = "C1002 Quarters";
  const fullTitle = `${title} | ${siteName}`;
  const siteUrl = window.location.origin;
  const currentUrl = `${siteUrl}${pathname}`;
  const defaultImage = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200";

  useEffect(() => {
    // Update Document Title
    document.title = fullTitle;

    // Update Meta Tags
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', description);
    
    // Open Graph
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:url', currentUrl, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:image', image || defaultImage, 'property');
    updateMeta('og:site_name', siteName, 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image || defaultImage);

    // Canonical
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', currentUrl);

    // Schema.org JSON-LD
    const scriptId = 'json-ld-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }
  }, [fullTitle, description, image, currentUrl, type, schema]);

  return null;
};

export default SEO;
