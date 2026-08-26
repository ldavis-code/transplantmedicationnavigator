import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://transplantmedicationnavigator.com';

/**
 * Custom hook for managing dynamic meta tags for SEO
 * @param {Object} config - Meta tag configuration
 * @param {string} config.title - Page title
 * @param {string} config.description - Meta description (150-160 chars recommended)
 * @param {string} config.canonical - Canonical URL for the page
 * @param {string} [config.ogTitle] - Open Graph title (defaults to title)
 * @param {string} [config.ogDescription] - Open Graph description (defaults to description)
 * @param {string} [config.ogImage] - Open Graph image URL
 * @param {string} [config.ogUrl] - Open Graph URL (defaults to canonical)
 * @param {string} [config.twitterTitle] - Twitter card title (defaults to title)
 * @param {string} [config.twitterDescription] - Twitter card description (defaults to description)
 * @param {string} [config.twitterImage] - Twitter card image URL
 * @param {string} [config.breadcrumbName] - Name for breadcrumb (if different from title)
 * @param {boolean} [config.noindex] - If true, add noindex meta tag to prevent search engine indexing
 * @param {boolean} [config.langAlternates] - Declare this page as having a Spanish
 *   variant at the /es/ path prefix even without config.es (pages that localize
 *   through t() directly, like MedicationDetail). Pages with config.es get this
 *   automatically. Emits hreflang alternate links and, while Spanish is active,
 *   keeps the canonical (and og:url default) on the /es/ URL — without this,
 *   hydration would revert the prerendered Spanish head to the English canonical.
 * @param {Object} [config.es] - Spanish overrides (title, description, breadcrumbName, ...).
 *   Applied when the active language is Spanish; og/twitter fields fall back to the
 *   Spanish title/description so English social tags don't leak through. This keeps
 *   document.title in the page language, which the RouteAnnouncer reads to screen readers.
 */
export function useMetaTags(config) {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').startsWith('es');

  useEffect(() => {
    const active = isSpanish && config.es
      ? {
          ...config,
          ...config.es,
          // Force og/twitter to the Spanish values (or fall back to the
          // Spanish title/description below) instead of keeping English ones.
          ogTitle: config.es.ogTitle,
          ogDescription: config.es.ogDescription,
          twitterTitle: config.es.twitterTitle,
          twitterDescription: config.es.twitterDescription,
        }
      : config;

    const {
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogImage = '/og-image.png',
      ogUrl,
      twitterTitle,
      twitterDescription,
      twitterImage = '/twitter-image.png',
      breadcrumbName,
      noindex,
    } = active;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tag
    const updateMetaTag = (selector, attribute, content) => {
      if (!content) return;

      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, content);
      } else {
        element = document.createElement('meta');
        const [attrName, attrValue] = selector.match(/\[(.+?)=['"](.+?)['"]\]/)?.slice(1, 3) || [];
        if (attrName && attrValue) {
          element.setAttribute(attrName, attrValue);
          element.setAttribute(attribute, content);
          document.head.appendChild(element);
        }
      }
    };

    // Helper function to update or create link tag
    const updateLinkTag = (rel, href) => {
      if (!href) return;

      let element = document.querySelector(`link[rel="${rel}"]`);
      if (element) {
        element.setAttribute('href', href);
      } else {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('href', href);
        document.head.appendChild(element);
      }
    };

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', 'content', description);

    // Update robots meta tag for noindex pages
    if (noindex) {
      updateMetaTag('meta[name="robots"]', 'content', 'noindex, nofollow');
    }

    // Pages with a Spanish variant: each language version is its own
    // canonical (matching the prerendered heads), and both declare the
    // hreflang alternates. Everything else keeps the plain canonical.
    // The Spanish URL is the /es/ path prefix: /medications/x -> /es/medications/x,
    // and the homepage BASE_URL/ -> BASE_URL/es/.
    const hasEsVariant = !noindex && !!(config.es || config.langAlternates);
    // Canonicals carry a trailing slash — pages are served as
    // <route>/index.html and the slash-less form 301s, so a slash-less
    // canonical would point at a redirect. Matches the prerendered heads
    // (scripts/prerender-seo.js) so hydration never rewrites them.
    const withSlash = (url) => (url && !url.endsWith('/') ? `${url}/` : url);
    const slashedCanonical = withSlash(canonical);
    const esCanonical = slashedCanonical && withSlash(slashedCanonical.replace(BASE_URL, `${BASE_URL}/es`));
    const localizedCanonical = hasEsVariant && isSpanish && slashedCanonical
      ? esCanonical
      : slashedCanonical;

    // Update canonical URL
    updateLinkTag('canonical', localizedCanonical);

    // Replace any hreflang alternates (ours or the prerendered page's) so
    // client-side navigation never leaves a stale set behind.
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    if (hasEsVariant && slashedCanonical) {
      for (const [hreflang, href] of [
        ['en', slashedCanonical],
        ['es', esCanonical],
        ['x-default', slashedCanonical],
      ]) {
        const el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', hreflang);
        el.setAttribute('href', href);
        document.head.appendChild(el);
      }
    }

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'content', ogTitle || title);
    updateMetaTag('meta[property="og:description"]', 'content', ogDescription || description);
    updateMetaTag('meta[property="og:url"]', 'content', ogUrl || localizedCanonical);
    updateMetaTag('meta[property="og:image"]', 'content', ogImage);

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', 'content', twitterTitle || title);
    updateMetaTag('meta[name="twitter:description"]', 'content', twitterDescription || description);
    updateMetaTag('meta[name="twitter:image"]', 'content', twitterImage);

    // Add BreadcrumbList structured data for non-home pages
    const existingBreadcrumb = document.querySelector('script[data-breadcrumb="true"]');
    if (existingBreadcrumb) {
      existingBreadcrumb.remove();
    }

    // Only add breadcrumb for non-home pages
    if (canonical && canonical !== `${BASE_URL}/`) {
      const pageName = breadcrumbName || title?.split(' | ')[0] || 'Page';
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${BASE_URL}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': pageName,
            'item': slashedCanonical
          }
        ]
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb', 'true');
      script.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(script);
    }

    // Cleanup function - restore default values and remove breadcrumb
    return () => {
      document.title = 'Transplant Medication Navigator™ | From Prescription to Possession';
      const breadcrumbScript = document.querySelector('script[data-breadcrumb="true"]');
      if (breadcrumbScript) {
        breadcrumbScript.remove();
      }
    };
  }, [config, isSpanish]);
}
