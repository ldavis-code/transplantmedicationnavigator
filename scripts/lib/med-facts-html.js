/**
 * Renders the prerendered medication facts block from the model built by
 * src/utils/medFacts.js. Layout follows the Prograf model page
 * (prograf-prerender.html): name + last verified, quick answer, four
 * insurance sections, foundations, estimate, deductible note, "check your
 * bottle", FAQ, quiz button.
 *
 * Inline styles only: the block sits inside #root and React replaces it on
 * mount, so it must not add CSS that could leak into the hydrated app.
 */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const S = {
    article: 'max-width:720px;margin:0 auto;text-align:left;color:#1f2937;font-size:1rem;line-height:1.6;',
    h1: 'font-size:1.8rem;line-height:1.25;margin:0 0 4px;color:#0f172a;',
    h2: 'font-size:1.2rem;margin:28px 0 8px;color:#0f172a;',
    h3: 'font-size:1rem;margin:14px 0 6px;color:#0f172a;',
    verified: 'color:#6b7280;font-size:.9rem;margin:0 0 16px;',
    verifiedStrong: 'color:#047857;',
    answer: 'background:#ecfdf5;border-left:4px solid #059669;padding:12px 16px;border-radius:6px;margin:0 0 8px;',
    card: 'border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:10px 0;background:#fff;',
    who: 'color:#6b7280;font-size:.9rem;margin:0 0 6px;',
    check: 'display:inline-block;background:#fff7ed;border:1px solid #fdba74;color:#9a3412;padding:2px 8px;border-radius:4px;font-size:.85rem;font-weight:600;margin:4px 0;',
    p: 'margin:6px 0;',
    note: 'font-size:.9rem;color:#6b7280;margin:6px 0;',
    est: 'color:#6b7280;font-size:.85rem;',
    warn: 'background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:12px 16px;margin:10px 0;',
    link: 'color:#047857;',
    button: 'display:inline-block;background:#047857;color:#fff;font-weight:700;padding:10px 18px;border-radius:8px;text-decoration:none;',
};

const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`;
const hostOf = (url) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; } };

function programCard(p, f) {
    const contact = [
        p.phone ? `${esc(f.phoneLabel)}: <a href="${esc(telHref(p.phone))}" style="${S.link}">${esc(p.phone)}</a>` : null,
        p.url ? `${esc(f.websiteLabel)}: <a href="${esc(p.url)}" rel="noopener" style="${S.link}">${esc(hostOf(p.url))}</a>` : null,
    ].filter(Boolean).join(' &middot; ');
    return `<div style="${S.card}">
        ${p.forLine ? `<p style="${S.who}">${esc(p.forLine)}</p>` : ''}
        ${p.check ? `<p style="${S.check}">${esc(f.checkLabel)}</p>` : ''}
        <p style="${S.p}"><strong>${esc(p.name)}</strong>${contact ? `<br>${contact}` : ''}</p>
        ${p.benefit ? `<p style="${S.note}">${esc(p.benefit)}</p>` : ''}
        ${p.incomeLimit ? `<p style="${S.note}">${esc(p.incomeLimit)}</p>` : ''}
        ${p.notes ? `<p style="${S.note}">${esc(p.notes)}</p>` : ''}
        ${p.extra ? `<p style="${S.note}"><strong>${esc(p.extra)}</strong></p>` : ''}
      </div>`;
}

function section(s, f) {
    const parts = [];
    for (const l of s.lead) parts.push(`<p style="${S.answer}">${esc(l)}</p>`);
    if (s.copay || s.copayNote) {
        parts.push(`<h3 style="${S.h3}">${esc(f.copayTitle)}</h3>`);
        parts.push(s.copay ? programCard(s.copay, f) : `<p style="${S.p}">${esc(s.copayNote)}</p>`);
    }
    if (s.pap || s.papNote) {
        parts.push(`<h3 style="${S.h3}">${esc(f.papTitle)}</h3>`);
        parts.push(s.pap ? programCard(s.pap, f) : `<p style="${S.p}">${esc(s.papNote)}</p>`);
    }
    if (s.cash.length) {
        parts.push(`<h3 style="${S.h3}">${esc(f.cashTitle)}</h3>`);
        for (const line of s.cash) parts.push(`<p style="${S.p}">${esc(line)}</p>`);
    }
    for (const n of s.notes) parts.push(`<p style="${S.note}">${esc(n)}</p>`);
    return `<section aria-labelledby="ins-${s.pathway}">
      <h2 id="ins-${s.pathway}" style="${S.h2}">${esc(s.title)}</h2>
      ${parts.join('\n      ')}
    </section>`;
}

export function renderMedFactsHtml(f) {
    // Withdrawn from the market: the notice and nothing else that could read
    // as a way to fill it (see src/utils/medFacts.js).
    if (f.withdrawn) {
        return `<article style="${S.article}" data-med-facts="${esc(f.id)}">
    <h1 style="${S.h1}">${esc(f.heading)}</h1>
    <div role="alert" style="${S.warn}"><p style="${S.p}"><strong>${esc(f.withdrawn.text)}</strong></p>${f.withdrawn.source ? `<p style="${S.p}"><a href="${esc(f.withdrawn.source.href)}" rel="noopener" style="${S.link}">${esc(f.withdrawn.source.label)}</a></p>` : ''}</div>
    <p style="${S.p}"><strong>${esc(f.bottle.never)}</strong></p>
    <p style="${S.note}">${esc(f.footer)}</p>
  </article>`;
    }
    const foundations = f.foundations.items.map((p) => programCard({
        ...p,
        forLine: [p.forLine, p.kidneyOnly ? f.foundations.kidneyLabel : null].filter(Boolean).join(' '),
    }, f)).join('');

    const bottle = f.bottle.lines.map((l) => `<p style="${S.p}">${esc(l.text)}${l.link ? ` <a href="${esc(l.link.href)}" style="${S.link}">${esc(l.link.label)}</a>.` : ''}</p>`).join('');

    const faqs = f.faqs.map((q) => `<p style="${S.p}"><strong>${esc(q.q)}</strong><br>${esc(q.a)}</p>`).join('');

    return `<article style="${S.article}" data-med-facts="${esc(f.id)}">
    <h1 style="${S.h1}">${esc(f.heading)}</h1>
    ${f.lastVerified ? `<p style="${S.verified}"><strong style="${S.verifiedStrong}">${esc(f.lastVerified)}</strong> ${esc(f.lastVerifiedTail)}</p>` : ''}
    <p style="${S.answer}">${esc(f.quickAnswer)}</p>

    <h2 style="${S.h2}">${esc(f.bottle.title)}</h2>
    ${bottle}
    <p style="${S.p}"><strong>${esc(f.bottle.never)}</strong></p>

    ${f.sections.map((s) => section(s, f)).join('\n    ')}

    <h2 style="${S.h2}">${esc(f.foundations.title)}</h2>
    <p style="${S.p}">${esc(f.foundations.intro)}</p>
    ${foundations}
    <p style="${S.p}"><a href="${esc(f.foundations.directory.href)}" style="${S.link}">${esc(f.foundations.directory.label)}</a>.</p>

    ${f.price ? `<h2 style="${S.h2}">${esc(f.price.title)}</h2>
    <p style="${S.p}">${esc(f.price.line)} <span style="${S.est}">(${esc(f.price.estimate)})</span>.</p>
    <p style="${S.note}">${esc(f.price.note)}</p>` : ''}

    ${f.deductible ? `<div style="${S.warn}"><p style="${S.p}"><strong>${esc(f.deductible.title)}</strong></p><p style="${S.p}">${esc(f.deductible.text)}</p></div>` : ''}

    <h2 style="${S.h2}">${esc(f.faqTitle)}</h2>
    ${faqs}

    <p style="margin:24px 0 8px;"><a href="${esc(f.quiz.href)}" style="${S.button}">${esc(f.quiz.label)}</a></p>
    <p style="${S.note}">${esc(f.quiz.tail)}</p>
    <!-- The language switch link is added by the page wrapper (prerender-seo.js). -->
    <p style="${S.note}">${esc(f.footer)}</p>
  </article>`;
}
