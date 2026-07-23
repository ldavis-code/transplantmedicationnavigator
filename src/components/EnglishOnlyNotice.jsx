import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

/**
 * Interim notice for pages whose content has not been localized yet.
 * Rendered only when the interface language is Spanish, so Spanish-speaking
 * users are told up front that the page is English-only instead of being
 * silently dropped into English content. Remove from a page once that page
 * is fully translated.
 */
const EnglishOnlyNotice = () => {
    const { i18n } = useTranslation();
    if (i18n.language !== 'es') return null;
    return (
        <div
            lang="es"
            role="note"
            className="flex items-start gap-3 text-left bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-6"
        >
            <Info size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm leading-relaxed">
                <strong>Esta página todavía está disponible solo en inglés.</strong>{' '}
                Estamos trabajando en la versión en español. Mientras tanto, puede
                usar el{' '}
                <Link to="/wizard" className="underline font-semibold text-amber-900 hover:text-amber-700">
                    Cuestionario Mi Camino
                </Link>{' '}
                y las demás secciones del sitio en español.
            </p>
        </div>
    );
};

export default EnglishOnlyNotice;
