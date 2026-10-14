/**
 * Per-medication facts — the one model behind the prerendered facts block
 * (scripts/prerender-seo.js), its JSON-LD (also injected by
 * src/pages/MedicationDetail.jsx), the sitemap's index/noindex decision
 * (scripts/generate-sitemap.js), and the data report
 * (scripts/report-medication-data.js). One builder, so the static page, the
 * hydrated page's structured data, and the sitemap cannot disagree.
 *
 * Rules this file enforces:
 *   - One page = one product. A page only shows programs linked to ITS
 *     record and only its own price. Brand and generic pages link to each
 *     other in the "check your bottle" section and nowhere else.
 *   - Copay cards and Patient Assistance Programs are separate categories,
 *     never merged. Copay cards appear only under commercial insurance.
 *   - Routing by insurance goes through src/utils/programEligibility.js — the
 *     same rule the medication card and the quiz use.
 *   - Never a placeholder. A record whose linked copay/PAP data is missing or
 *     unverified is still rendered, but marked noindex (and left out of the
 *     sitemap) and listed in the report.
 *   - "Last verified" is the OLDEST verification date among the programs
 *     the page shows: a page is only as fresh as its stalest fact.
 *
 * Pure: no React, no i18n, no JSON imports. The caller passes the data files
 * and a translate function, so build scripts and the browser share it.
 */

import { isGenericRecord, medPageName, medNameWithGeneric, stripGenericTag } from './medIdentity.js';
import { PATHWAYS, STATUS, programStatus, normalizeEligibility, unknownPathways, NOT_ASSISTANCE_PROGRAM_IDS } from './programEligibility.js';
import { formatVerifiedDate } from '../data/constants.js';

export const BASE_URL = 'https://transplantmedicationnavigator.com';

// Foundations that only serve specific organs. Shared with the quiz
// (src/components/WizardProgramMatches.jsx).
export const FOUNDATION_ORGANS = {
    'american-kidney-fund': ['Kidney'],
};

// Issue kinds that make a page noindex: the linked copay/PAP data is missing
// or unverified, so publishing it to search would publish a gap.
export const NOINDEX_ISSUES = new Set([
    'copay-program-missing',
    'pap-program-missing',
    'pap-url-only',
    'program-not-verified',
    'program-no-eligibility',
    'withdrawn',
]);

export const MEDICAID_DEFAULT = {
    en: 'Medicaid usually covers this medication. If it is denied, ask your transplant team about prior authorization or an appeal.',
    es: 'Medicaid normalmente cubre este medicamento. Si se lo niegan, pregunte a su equipo de trasplante sobre una autorización previa o una apelación.',
};

const COPY = {
    en: {
        heading: (n) => `How to Afford ${n}`,
        lastVerified: (d) => `Last verified: ${d}.`,
        lastVerifiedTail: 'Programs, links, and phone numbers re-checked.',
        brandIs: (n, cat, mfr) => `${n} is a brand-name ${cat} medication${mfr ? ` made by ${mfr}` : ''}, and this page covers ${n} only.`,
        genericIs: (n, cat) => `${n} is a generic ${cat} medication, and this page covers the generic only.`,
        routeCopay: 'If you have commercial (job) insurance, start with the manufacturer copay card.',
        routePap: (who, pap) => `If you have ${who}, the ${pap} may provide this medication free if you qualify.`,
        routePapCheck: (pap) => `The ${pap} may provide this medication free if you qualify. Check eligibility with the program.`,
        routeGeneric: 'Generics do not have manufacturer copay cards or free-medication programs. Compare cash prices and check foundation grants.',
        routeNone: (n) => `We do not know of a manufacturer copay card or free-medication program for ${n}. Foundation grants and cash-price comparison can help.`,
        copayNotMedicare: 'Copay cards cannot be used with Medicare.',
        pathwayTitle: {
            commercial: 'Commercial insurance (job or Marketplace plan)',
            medicare: 'Medicare',
            medicaid: 'Medicaid',
            uninsured: 'No insurance',
        },
        whoList: { commercial: 'commercial insurance', medicare: 'Medicare', medicaid: 'Medicaid', uninsured: 'no insurance' },
        whoNoun: { commercial: 'commercial insurance', medicare: 'Medicare', medicaid: 'Medicaid', uninsured: 'uninsured patients' },
        or: 'or',
        and: 'and',
        copayTitle: 'Copay card',
        papTitle: 'Free medication program (Patient Assistance Program)',
        copayFor: 'For: commercial insurance only. Not for Medicare, Medicaid, or other government insurance.',
        papFor: (list) => `For: ${list}.`,
        check: 'Check eligibility with the program.',
        incomeLimit: (v) => `Income limit: ${v}.`,
        benefit: (v) => `Benefit: ${v}.`,
        phone: 'Phone',
        website: 'Website',
        noCopay: (n) => `We do not know of a manufacturer copay card for ${n}.`,
        noCopayGeneric: 'Generics do not have manufacturer copay cards.',
        noPapFor: (pap, who) => `The ${pap} does not accept ${who}.`,
        noPap: (n, who) => `We do not know of a free-medication program for ${n} that accepts ${who}.`,
        noPapGeneric: 'Generics do not have manufacturer free-medication programs.',
        extraHelp: 'Not available if you get Extra Help (the Medicare Low-Income Subsidy).',
        medicaidDenial: 'You may need a Medicaid denial letter to apply.',
        foundationsHint: 'Foundation grants may also help. See the list below.',
        cashTitle: 'Paying cash',
        costPlus: 'Mark Cuban Cost Plus Drugs often has low cash prices for generics.',
        discountCards: 'Discount cards such as GoodRx and SingleCare can lower the cash price.',
        foundationsTitle: 'Foundation grants',
        foundationsIntro: 'Charitable foundations help pay copays, coinsurance, or premiums. Funds open and close during the year.',
        foundationsKidney: 'For kidney patients.',
        foundationsDirectory: 'See the full foundation directory',
        priceTitle: 'Estimated cost',
        priceOwn: (n, r) => `${n}: ${r} cash price`,
        priceTypical: (r) => `Typical cash price for this medication: ${r}`,
        estimate: 'estimate',
        priceNote: 'Estimates vary by pharmacy, dose, and insurance. What you pay with insurance may be very different.',
        bottleTitle: 'Is this the right page for you?',
        bottleThis: (n) => `Check your bottle. If it says "${n}," this page is for you.`,
        bottleToGeneric: (g) => `If it says "${g}," you are on the generic, which has its own prices and programs:`,
        bottleToGenericLink: (g) => `go to the generic ${g} page`,
        bottleGenericNoPage: (g) => `If it shows only "${g}," you may have the generic, which has its own prices and no copay card. Ask your pharmacist.`,
        bottleToBrand: (b) => `If it says "${b}," you are on the brand-name version, which has its own prices and programs:`,
        bottleToBrandLink: (b) => `go to the ${b} page`,
        neverSwitch: 'We never tell you to change your medication. Brand, generic, and manufacturer choices belong to your transplant team.',
        faqTitle: 'Common questions',
        faqHelpQ: (n) => `How can I get help paying for ${n}?`,
        faqMedicareCopayQ: (n) => `Can Medicare patients use a ${n} copay card?`,
        faqMedicareCopayA: (who) => `No. Federal law bars manufacturer copay cards for Medicare and other government insurance. ${who}`,
        faqMedicareCopayPap: (pap) => `Medicare patients can check the ${pap} or a copay foundation instead.`,
        faqMedicareCopayFound: 'Medicare patients can check copay foundations instead.',
        faqMedicaidQ: (n) => `Does Medicaid cover ${n}?`,
        faqBottleBrandQ: (g, b) => `My bottle says ${g}, not ${b}. Does this page apply to me?`,
        faqBottleBrandA: (g) => `No. A bottle labeled ${g} is the generic, which has different prices and programs and no copay card. See the generic ${g} page at transplantmedicationnavigator.com/medications/${'{slug}'}/.`,
        faqBottleGenericQ: (b, g) => `My bottle says ${b}, not ${g}. Does this page apply to me?`,
        faqBottleGenericA: (b) => `No. ${b} is the brand-name version, which has its own prices and programs. See the ${b} page at transplantmedicationnavigator.com/medications/${'{slug}'}/.`,
        faqCostQ: (n) => `How much does ${n} cost?`,
        faqCostA: (line) => `${line}. This is an estimate. Prices vary by pharmacy and dose, and what you pay with insurance may be very different.`,
        quiz: 'Take the free 2-minute quiz',
        quizTail: 'to see which of these fit your insurance and income.',
        otherLang: 'Ver esta página en español',
        footer: 'Educational information only, not medical or legal advice. Created by Lorrinda Gray-Davis, liver transplant recipient. Nothing you enter on this site is stored on our servers.',
        audience: 'Transplant patients and caregivers',
        withdrawn: (n, y) => `${n} was withdrawn from the US market in ${y}. Ask your transplant team what to take instead.`,
        withdrawnSource: 'Read the FDA announcement',
        withdrawnHeading: (n) => `${n}: withdrawn from the US market`,
    },
    es: {
        heading: (n) => `Cómo pagar ${n}`,
        lastVerified: (d) => `Última verificación: ${d}.`,
        lastVerifiedTail: 'Revisamos de nuevo los programas, los enlaces y los teléfonos.',
        brandIs: (n, cat, mfr) => `${n} es un medicamento de marca (${cat})${mfr ? ` fabricado por ${mfr}` : ''}, y esta página trata solo de ${n}.`,
        genericIs: (n, cat) => `${n} es un medicamento genérico (${cat}), y esta página trata solo del genérico.`,
        routeCopay: 'Si tiene seguro comercial (del trabajo), empiece con la tarjeta de copago del fabricante.',
        routePap: (who, pap) => `Si tiene ${who}, el ${pap} puede darle este medicamento gratis si usted califica.`,
        routePapCheck: (pap) => `El ${pap} puede darle este medicamento gratis si usted califica. Consulte con el programa si usted califica.`,
        routeGeneric: 'Los genéricos no tienen tarjetas de copago ni programas de medicamento gratis del fabricante. Compare precios en efectivo y busque ayudas de fundaciones.',
        routeNone: (n) => `No conocemos una tarjeta de copago ni un programa de medicamento gratis del fabricante para ${n}. Las ayudas de fundaciones y comparar precios en efectivo pueden ayudar.`,
        copayNotMedicare: 'Las tarjetas de copago no se pueden usar con Medicare.',
        pathwayTitle: {
            commercial: 'Seguro comercial (del trabajo o del Mercado)',
            medicare: 'Medicare',
            medicaid: 'Medicaid',
            uninsured: 'Sin seguro',
        },
        whoList: { commercial: 'seguro comercial', medicare: 'Medicare', medicaid: 'Medicaid', uninsured: 'no tiene seguro' },
        whoNoun: { commercial: 'seguro comercial', medicare: 'Medicare', medicaid: 'Medicaid', uninsured: 'pacientes sin seguro' },
        or: 'o',
        and: 'y',
        copayTitle: 'Tarjeta de copago',
        papTitle: 'Programa de medicamento gratis (Programa de Asistencia al Paciente)',
        copayFor: 'Para: solo seguro comercial. No es para Medicare, Medicaid ni otro seguro del gobierno.',
        papFor: (list) => `Para: ${list}.`,
        check: 'Consulte con el programa si usted califica.',
        incomeLimit: (v) => `Límite de ingresos: ${v.replace(/%\s*FPL\b/, '% del nivel federal de pobreza (FPL)')}.`,
        benefit: (v) => `Beneficio: ${v}.`,
        phone: 'Teléfono',
        website: 'Sitio web',
        noCopay: (n) => `No conocemos una tarjeta de copago del fabricante para ${n}.`,
        noCopayGeneric: 'Los genéricos no tienen tarjetas de copago del fabricante.',
        noPapFor: (pap, who) => `El ${pap} no acepta ${who}.`,
        noPap: (n, who) => `No conocemos un programa de medicamento gratis para ${n} que acepte ${who}.`,
        noPapGeneric: 'Los genéricos no tienen programas de medicamento gratis del fabricante.',
        extraHelp: 'No está disponible si usted recibe Ayuda Adicional (Extra Help, el subsidio de Medicare por bajos ingresos).',
        medicaidDenial: 'Puede necesitar una carta de negación de Medicaid para solicitar.',
        foundationsHint: 'Las ayudas de fundaciones también pueden ayudar. Vea la lista más abajo.',
        cashTitle: 'Pagar en efectivo',
        costPlus: 'Mark Cuban Cost Plus Drugs suele tener precios bajos en efectivo para genéricos.',
        discountCards: 'Las tarjetas de descuento como GoodRx y SingleCare pueden bajar el precio en efectivo.',
        foundationsTitle: 'Ayudas de fundaciones',
        foundationsIntro: 'Las fundaciones caritativas ayudan a pagar copagos, coseguro o primas. Los fondos abren y cierran durante el año.',
        foundationsKidney: 'Para pacientes de riñón.',
        foundationsDirectory: 'Vea el directorio completo de fundaciones',
        priceTitle: 'Costo estimado',
        priceOwn: (n, r) => `${n}: ${r} en efectivo`,
        priceTypical: (r) => `Precio típico en efectivo de este medicamento: ${r}`,
        estimate: 'estimado',
        priceNote: 'Los estimados varían según la farmacia, la dosis y el seguro. Lo que usted paga con seguro puede ser muy diferente.',
        bottleTitle: '¿Es esta la página correcta para usted?',
        bottleThis: (n) => `Revise su frasco. Si dice "${n}", esta página es para usted.`,
        bottleToGeneric: (g) => `Si dice "${g}", usted toma el genérico, que tiene sus propios precios y programas:`,
        bottleToGenericLink: (g) => `vaya a la página del genérico ${g}`,
        bottleGenericNoPage: (g) => `Si solo dice "${g}", puede tener el genérico, que tiene sus propios precios y no tiene tarjeta de copago. Pregunte a su farmacéutico.`,
        bottleToBrand: (b) => `Si dice "${b}", usted toma la versión de marca, que tiene sus propios precios y programas:`,
        bottleToBrandLink: (b) => `vaya a la página de ${b}`,
        neverSwitch: 'Nunca le decimos que cambie su medicamento. Las decisiones sobre marca, genérico y fabricante son de su equipo de trasplante.',
        faqTitle: 'Preguntas comunes',
        faqHelpQ: (n) => `¿Cómo puedo obtener ayuda para pagar ${n}?`,
        faqMedicareCopayQ: (n) => `¿Pueden los pacientes de Medicare usar una tarjeta de copago de ${n}?`,
        faqMedicareCopayA: (who) => `No. La ley federal prohíbe las tarjetas de copago del fabricante con Medicare y otros seguros del gobierno. ${who}`,
        faqMedicareCopayPap: (pap) => `Los pacientes de Medicare pueden consultar el ${pap} o una fundación de copagos.`,
        faqMedicareCopayFound: 'Los pacientes de Medicare pueden consultar fundaciones de copagos.',
        faqMedicaidQ: (n) => `¿Cubre Medicaid ${n}?`,
        faqBottleBrandQ: (g, b) => `Mi frasco dice ${g}, no ${b}. ¿Esta página es para mí?`,
        faqBottleBrandA: (g) => `No. Un frasco que dice ${g} es el genérico, que tiene otros precios y programas y no tiene tarjeta de copago. Vea la página del genérico ${g} en transplantmedicationnavigator.com/es/medications/${'{slug}'}/.`,
        faqBottleGenericQ: (b, g) => `Mi frasco dice ${b}, no ${g}. ¿Esta página es para mí?`,
        faqBottleGenericA: (b) => `No. ${b} es la versión de marca, que tiene sus propios precios y programas. Vea la página de ${b} en transplantmedicationnavigator.com/es/medications/${'{slug}'}/.`,
        faqCostQ: (n) => `¿Cuánto cuesta ${n}?`,
        faqCostA: (line) => `${line}. Es un estimado. Los precios varían según la farmacia y la dosis, y lo que usted paga con seguro puede ser muy diferente.`,
        quiz: 'Haga el cuestionario gratis de 2 minutos',
        quizTail: 'para ver cuáles le sirven según su seguro e ingresos.',
        otherLang: 'View this page in English',
        footer: 'Información educativa solamente; no es consejo médico ni legal. Creado por Lorrinda Gray-Davis, receptora de un trasplante de hígado. Nada de lo que usted escribe en este sitio se guarda en nuestros servidores.',
        audience: 'Pacientes de trasplante y sus cuidadores',
        withdrawn: (n, y) => `${n} fue retirado del mercado de EE. UU. en ${y}. Pregunte a su equipo de trasplante qué tomar en su lugar.`,
        withdrawnSource: 'Lea el anuncio de la FDA (en inglés)',
        withdrawnHeading: (n) => `${n}: retirado del mercado de EE. UU.`,
    },
};

const lower = (s) => String(s || '').trim().toLowerCase();
const isPlaceholderMfr = (m) => !m || /^(generic|various)$/i.test(String(m).trim());

/** Join ["a","b","c"] as "a, b, or c" in the page language. */
function joinList(items, word) {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} ${word} ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, ${word} ${items[items.length - 1]}`;
}

/** The generic record a brand record pairs with (same generic name), if any. */
export function genericCounterpart(med, allMeds) {
    if (!med || isGenericRecord(med)) return null;
    const g = lower(med.genericName);
    return (allMeds || []).find((o) => o.id !== med.id && isGenericRecord(o) && lower(o.genericName) === g) || null;
}

/** The brand records a generic record pairs with (same generic name). */
export function brandCounterparts(med, allMeds) {
    if (!med || !isGenericRecord(med)) return [];
    const g = lower(med.genericName);
    return (allMeds || []).filter((o) => o.id !== med.id && !isGenericRecord(o) && lower(o.genericName) === g);
}

/**
 * Resolve this record's copay card and PAP. Returns the program records (or
 * a URL-only stand-in) plus the data issues found on the way. Generic records
 * never carry brand programs (the card hides them the same way).
 */
export function resolvePrograms(med, programs) {
    const issues = [];
    const out = { copay: null, pap: null, issues };
    if (!med) return out;
    const generic = isGenericRecord(med);

    const pick = (kind, groupKey, id, url) => {
        if (id && NOT_ASSISTANCE_PROGRAM_IDS.has(id)) {
            issues.push({ kind: 'not-assistance-program', detail: `${kind} link points at "${id}", which is a price-search or discount tool, not a ${kind === 'copay' ? 'copay card' : 'PAP'}` });
            return null;
        }
        if (id) {
            const p = programs?.[groupKey]?.[id];
            if (!p) {
                issues.push({ kind: `${kind}-program-missing`, detail: `${kind}ProgramId "${id}" is not in programs.json` });
                return null;
            }
            if (!p.lastVerified) issues.push({ kind: 'program-not-verified', detail: `${id} has no lastVerified date` });
            if (!p.eligibility) issues.push({ kind: 'program-no-eligibility', detail: `${id} has no eligibility flags` });
            return { ...p, programId: id, type: kind };
        }
        if (url) {
            if (kind === 'pap') issues.push({ kind: 'pap-url-only', detail: `PAP is a URL only (${url}), with no program record or eligibility flags` });
            return { url, programId: null, name: null, eligibility: null, type: kind };
        }
        return null;
    };

    const copay = pick('copay', 'copayPrograms', med.copayProgramId, med.copayUrl);
    const pap = pick('pap', 'papPrograms', med.papProgramId, med.papUrl);
    if (generic) {
        if (copay || pap) issues.push({ kind: 'generic-has-brand-program', detail: 'generic record is linked to a manufacturer program; not shown on the generic page' });
        // Issues about programs the generic page will not show don't block it.
        out.issues = issues.filter((i) => i.kind === 'generic-has-brand-program');
        return out;
    }
    out.copay = copay;
    out.pap = pap;
    return out;
}

/** Foundations shown on this medication's page (organ-limited ones only when they fit). */
export function foundationsFor(med, programs) {
    return Object.entries(programs?.foundationPrograms || {})
        .filter(([id]) => !FOUNDATION_ORGANS[id] || (med?.commonOrgans || []).some((o) => FOUNDATION_ORGANS[id].includes(o)))
        .map(([id, p]) => ({ ...p, programId: id, type: 'foundation' }));
}

/** Oldest lastVerified across every program in the data files. */
export function oldestVerified(programs) {
    const dates = [];
    for (const g of ['copayPrograms', 'papPrograms', 'foundationPrograms']) {
        for (const p of Object.values(programs?.[g] || {})) if (p?.lastVerified) dates.push(p.lastVerified);
    }
    return dates.sort()[0] || null;
}

/**
 * Cash-price estimate for THIS record only (one page = one product).
 *   - Brand records: the record's own override, never a Cost Plus figure
 *     (Cost Plus sells generics, so its number is not the brand's price).
 *     No override -> no price; the record is listed in the report.
 *   - Generic records: own override, else the typical range for the
 *     category (labeled "typical"), preferring Cost Plus when it carries it.
 */
export function priceFor(med, priceEstimates, costPlusExclusions = []) {
    if (!med || !priceEstimates) return null;
    const generic = isGenericRecord(med);
    const o = priceEstimates.medicationOverrides?.[med.id];
    const ok = (r) => r && r.min != null && r.max != null;
    if (o) {
        const src = generic ? (o.costplus || o.goodrx || o.walmart || o.singlecare) : (o.goodrx || o.singlecare || o.walmart);
        if (ok(src)) return { min: src.min, max: src.max, typical: false };
    }
    if (!generic) return null;
    const cat = priceEstimates.categoryDefaults?.[med.category] || priceEstimates.categoryDefaults?.default;
    if (!cat) return null;
    const costPlusOk = !costPlusExclusions.includes(med.id);
    const src = (costPlusOk && cat.costplus) || cat.goodrx || cat.walmart;
    return ok(src) ? { min: src.min, max: src.max, typical: true } : null;
}

/**
 * Build the facts model for one medication page.
 *
 * @param {object} med
 * @param {object} ctx
 *   lang            'en' | 'es'
 *   allMeds         medications.json
 *   programs        programs.json
 *   programsEs      programs.es.json (Spanish names/notes overlay)
 *   priceEstimates  price-estimates.json
 *   costPlusExclusions  cost-plus-exclusions.json
 *   localizeName    (name) => display name in the page language
 *   categoryLabel   (category) => category label in the page language
 *   priceRange      ({min,max}) => "$800 to $1,500/month" in the page language
 *   deductibleNote  { title, text } in the page language
 */
export function buildMedFacts(med, ctx) {
    const lang = ctx.lang === 'es' ? 'es' : 'en';
    const c = COPY[lang];
    const loc = ctx.localizeName || ((s) => s);
    const generic = isGenericRecord(med);
    const name = loc(medPageName(med));
    const genericName = loc(stripGenericTag(med.genericName));
    const category = lower(ctx.categoryLabel ? ctx.categoryLabel(med.category) : med.category) || (lang === 'es' ? 'medicamento' : 'medication');
    const mfr = isPlaceholderMfr(med.manufacturer) ? null : med.manufacturer;
    const prefix = lang === 'es' ? '/es' : '';

    const esOverlay = (group, p) => (lang === 'es' && p?.programId ? ctx.programsEs?.[group]?.[p.programId] : null) || {};
    const progName = (p) => {
        if (!p) return null;
        const group = p.type === 'copay' ? 'copayPrograms' : p.type === 'pap' ? 'papPrograms' : 'foundationPrograms';
        const es = esOverlay(group, p);
        if (es.name || p.name) return es.name || p.name;
        // URL-only links: name them the way the card does.
        if (p.type === 'pap') return lang === 'es'
            ? `Programa de Asistencia al Paciente de ${mfr || name}`
            : `${mfr || name} Patient Assistance Program`;
        return lang === 'es' ? `Tarjeta de copago de ${mfr || name}` : `${mfr || name} Copay Card`;
    };
    const progNotes = (p, group) => (lang === 'es' ? esOverlay(group, p).notes : p?.notes) || null;
    const progBenefit = (p, group) => (lang === 'es' ? esOverlay(group, p).maxBenefit : p?.maxBenefit) || null;

    const { copay, pap, issues } = resolvePrograms(med, ctx.programs);
    const foundations = foundationsFor(med, ctx.programs);

    // Program "cards" in the shape the renderer needs.
    const card = (p, status, group) => ({
        programId: p.programId,
        type: p.type,
        name: progName(p),
        url: p.url || null,
        phone: p.phone || null,
        incomeLimit: p.type === 'pap' && p.incomeLimit ? c.incomeLimit(p.incomeLimit) : null,
        benefit: progBenefit(p, group) ? c.benefit(progBenefit(p, group)) : null,
        notes: progNotes(p, group),
        forLine: p.type === 'copay' ? c.copayFor : forLine(p),
        check: status === STATUS.CHECK,
    });
    function forLine(p) {
        const e = normalizeEligibility(p.eligibility);
        const yes = PATHWAYS.filter((k) => e[k] === true).map((k) => c.whoList[k]);
        return yes.length ? c.papFor(joinList(yes, c.or)) : null;
    }

    // ---- Four insurance sections, all always present ----
    const sections = PATHWAYS.map((pathway) => {
        const s = { pathway, title: c.pathwayTitle[pathway], lead: [], copay: null, copayNote: null, pap: null, papNote: null, notes: [], cash: [] };
        if (pathway === 'medicaid') s.lead.push(MEDICAID_DEFAULT[lang]);

        // Copay card — commercial only.
        if (pathway === 'commercial') {
            const st = copay ? programStatus('copay', copay.eligibility, pathway) : STATUS.HIDDEN;
            if (copay && st !== STATUS.HIDDEN) s.copay = card(copay, st, 'copayPrograms');
            else s.copayNote = generic ? c.noCopayGeneric : c.noCopay(name);
        } else if (copay && pathway === 'medicare') {
            s.notes.push(c.copayNotMedicare);
        }

        // Patient Assistance Program.
        const pst = pap ? programStatus('pap', pap.eligibility, pathway) : STATUS.HIDDEN;
        if (pap && pst !== STATUS.HIDDEN) {
            s.pap = card(pap, pst, 'papPrograms');
            const e = normalizeEligibility(pap.eligibility);
            if (pathway === 'medicare' && e.excludesExtraHelp === true) s.pap.extra = c.extraHelp;
            if ((pathway === 'medicaid' || pathway === 'uninsured') && e.requiresMedicaidDenial === true) s.pap.extra = c.medicaidDenial;
        } else if (pathway !== 'commercial') {
            s.papNote = generic ? c.noPapGeneric
                : pap ? c.noPapFor(progName(pap), c.whoNoun[pathway])
                : c.noPap(name, c.whoNoun[pathway]);
        }

        if (foundations.some((f) => programStatus('foundation', f.eligibility, pathway) !== STATUS.HIDDEN)) {
            s.notes.push(c.foundationsHint);
        }
        if (pathway === 'uninsured') {
            if (generic && !(ctx.costPlusExclusions || []).includes(med.id)) s.cash.push(c.costPlus);
            s.cash.push(c.discountCards);
        }
        return s;
    });

    // ---- Foundations ----
    const foundationCards = foundations.map((f) => ({
        ...card(f, STATUS.ELIGIBLE, 'foundationPrograms'),
        forLine: forLine(f),
        kidneyOnly: !!FOUNDATION_ORGANS[f.programId],
        check: PATHWAYS.some((k) => normalizeEligibility(f.eligibility)[k] === null),
    }));

    // ---- Last verified: oldest date among everything the page shows ----
    const shown = [copay, pap, ...foundations].filter(Boolean);
    const dates = shown.map((p) => p.lastVerified).filter(Boolean).sort();
    const lastVerifiedIso = dates[0] || oldestVerified(ctx.programs);

    // ---- Price ----
    const price = priceFor(med, ctx.priceEstimates, ctx.costPlusExclusions);
    const priceRange = price && ctx.priceRange ? ctx.priceRange(price) : null;
    const priceLine = priceRange ? (price.typical ? c.priceTypical(priceRange) : c.priceOwn(name, priceRange)) : null;

    // ---- Quick answer (2-3 sentences) ----
    const answer = [];
    answer.push(generic ? c.genericIs(name, category) : c.brandIs(name, category, mfr));
    const route = [];
    const papWho = pap ? PATHWAYS.filter((k) => programStatus('pap', pap.eligibility, k) === STATUS.ELIGIBLE) : [];
    if (generic) {
        route.push(c.routeGeneric);
    } else {
        if (copay && programStatus('copay', copay.eligibility, 'commercial') !== STATUS.HIDDEN) route.push(c.routeCopay);
        if (pap && papWho.length) route.push(c.routePap(joinList(papWho.map((k) => c.whoList[k]), c.or), progName(pap)));
        else if (pap && PATHWAYS.some((k) => programStatus('pap', pap.eligibility, k) === STATUS.CHECK)) route.push(c.routePapCheck(progName(pap)));
        if (!route.length) route.push(c.routeNone(name));
    }
    answer.push(...route);
    const quickAnswer = answer.join(' ');

    // ---- Check your bottle ----
    const genericPage = genericCounterpart(med, ctx.allMeds);
    const brandPages = brandCounterparts(med, ctx.allMeds);
    const bottle = { lines: [] };
    bottle.lines.push({ text: c.bottleThis(generic ? genericName : name) });
    if (!generic && genericPage) {
        bottle.lines.push({ text: c.bottleToGeneric(genericName), link: { href: `${prefix}/medications/${genericPage.id}/`, label: c.bottleToGenericLink(genericName) } });
    } else if (!generic && lower(name) !== lower(genericName) && !lower(name).includes(lower(genericName))) {
        bottle.lines.push({ text: c.bottleGenericNoPage(genericName) });
    } else if (generic) {
        for (const b of brandPages) {
            const bn = loc(medPageName(b));
            bottle.lines.push({ text: c.bottleToBrand(bn), link: { href: `${prefix}/medications/${b.id}/`, label: c.bottleToBrandLink(bn) } });
        }
    }
    bottle.never = c.neverSwitch;

    // ---- FAQ (also the FAQPage JSON-LD, so the two always match) ----
    const faqs = [{ q: c.faqHelpQ(name), a: route.join(' ') }];
    if (copay && !generic) {
        const papMedicare = pap && programStatus('pap', pap.eligibility, 'medicare') !== STATUS.HIDDEN;
        faqs.push({ q: c.faqMedicareCopayQ(name), a: c.faqMedicareCopayA(papMedicare ? c.faqMedicareCopayPap(progName(pap)) : c.faqMedicareCopayFound) });
    }
    faqs.push({ q: c.faqMedicaidQ(name), a: MEDICAID_DEFAULT[lang] });
    if (!generic && genericPage) {
        faqs.push({ q: c.faqBottleBrandQ(genericName, name), a: c.faqBottleBrandA(genericName).replace('{slug}', genericPage.id) });
    } else if (generic && brandPages.length) {
        const b = brandPages[0];
        const bn = loc(medPageName(b));
        faqs.push({ q: c.faqBottleGenericQ(bn, name), a: c.faqBottleGenericA(bn).replace('{slug}', b.id) });
    }
    if (priceLine) faqs.push({ q: c.faqCostQ(name), a: c.faqCostA(priceLine) });

    // ---- Withdrawn from the market ----
    // A withdrawn medication keeps its page (people still search for it) but
    // shows only the notice: no programs, prices, or cash options for a drug
    // that can't be filled, and never a named substitute — that choice
    // belongs to the transplant team. Noindex. Source:
    // src/data/withdrawn-medications.json.
    const w = ctx.withdrawnMeds?.[med.id] || null;
    const withdrawn = w ? { text: c.withdrawn(loc(medNameWithGeneric(med)), w.year), source: w.sourceUrl ? { href: w.sourceUrl, label: c.withdrawnSource } : null } : null;
    if (withdrawn) {
        issues.push({ kind: 'withdrawn', detail: `withdrawn from the US market in ${w.year}` });
        faqs.length = 0;
    }

    // ---- Index status ----
    const blocking = issues.filter((i) => NOINDEX_ISSUES.has(i.kind));
    const unknownFlags = [copay, pap].filter((p) => p && p.programId && p.eligibility)
        .map((p) => ({ programId: p.programId, type: p.type, unknown: unknownPathways(p.type, p.eligibility) }))
        .filter((u) => u.unknown.length);

    // ---- JSON-LD ----
    const url = `${BASE_URL}${prefix}/medications/${med.id}/`;
    // Substance, not Drug: schema.org makes Drug a subtype of Product, so
    // Google reads it as something for sale and flags the page in Search
    // Console ("Either offers, review, or aggregateRating should be
    // specified"). We don't sell medications, so an Offer would be false.
    const drugName = generic ? stripGenericTag(med.genericName) : medPageName(med);
    const activeIngredient = lower(stripGenericTag(med.genericName));
    const drug = {
        '@type': 'Substance',
        name: drugName,
        ...(activeIngredient && activeIngredient !== lower(drugName) ? { alternateName: activeIngredient } : {}),
        ...(activeIngredient ? { activeIngredient } : {}),
    };
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'MedicalWebPage',
                '@id': url,
                url,
                name: withdrawn ? c.withdrawnHeading(loc(medNameWithGeneric(med))) : c.heading(name),
                inLanguage: lang,
                ...(lastVerifiedIso ? { dateModified: lastVerifiedIso, lastReviewed: lastVerifiedIso } : {}),
                audience: { '@type': 'PeopleAudience', audienceType: c.audience },
                about: drug,
                publisher: {
                    '@type': 'Organization',
                    name: 'Transplant Medication Navigator',
                    url: `${BASE_URL}/`,
                    founder: { '@type': 'Person', name: 'Lorrinda Gray-Davis' },
                },
            },
            ...(faqs.length ? [{
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }] : []),
        ],
    };

    return {
        id: med.id,
        lang,
        isGeneric: generic,
        name,
        nameWithGeneric: loc(medNameWithGeneric(med)),
        heading: withdrawn ? c.withdrawnHeading(loc(medNameWithGeneric(med))) : c.heading(name),
        lastVerifiedIso,
        lastVerified: lastVerifiedIso ? c.lastVerified(formatVerifiedDate(lastVerifiedIso, lang, 'full')) : null,
        lastVerifiedTail: c.lastVerifiedTail,
        quickAnswer,
        sections,
        copayTitle: c.copayTitle,
        papTitle: c.papTitle,
        cashTitle: c.cashTitle,
        phoneLabel: c.phone,
        websiteLabel: c.website,
        checkLabel: c.check,
        foundations: {
            title: c.foundationsTitle,
            intro: c.foundationsIntro,
            kidneyLabel: c.foundationsKidney,
            items: foundationCards,
            directory: { href: `${prefix}/application-help`, label: c.foundationsDirectory },
        },
        price: priceLine ? { title: c.priceTitle, line: priceLine, estimate: c.estimate, note: c.priceNote, typical: price.typical } : null,
        deductible: ctx.deductibleNote || null,
        bottle: { title: c.bottleTitle, ...bottle },
        faqTitle: c.faqTitle,
        faqs,
        quiz: { href: `${prefix}/wizard`, label: c.quiz, tail: c.quizTail },
        otherLang: { href: lang === 'es' ? `/medications/${med.id}/` : `/es/medications/${med.id}/`, label: c.otherLang, lang: lang === 'es' ? 'en' : 'es' },
        footer: c.footer,
        withdrawn,
        indexable: blocking.length === 0,
        issues,
        unknownFlags,
        hasPrice: !!priceLine,
        jsonLd,
    };
}

/**
 * Whether a medication page may be indexed — the same test buildMedFacts
 * applies, without building the page. Used by scripts/generate-sitemap.js.
 */
export function isIndexable(med, programs, withdrawnMeds = {}) {
    if (withdrawnMeds?.[med?.id]) return false;
    return !resolvePrograms(med, programs).issues.some((i) => NOINDEX_ISSUES.has(i.kind));
}
