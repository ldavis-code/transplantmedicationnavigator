// PricingLinks.jsx
// Drop-in component for TMN medication detail page.
// Links out to each pricing service's homepage so users can search there.

import React from "react";
import { ExternalLink } from "lucide-react";

// --- URL builders ----------------------------------------------------------

export function costPlusUrl() {
  return "https://costplusdrugs.com/";
}

export function goodRxUrl() {
  return "https://www.goodrx.com/";
}

export function singleCareUrl() {
  return "https://www.singlecare.com/";
}

// --- Component -------------------------------------------------------------

export default function PricingLinks({ medication }) {
  if (!medication?.genericName) return null;

  const links = [
    {
      label: "Cost Plus Drugs",
      sublabel: "Mark Cuban's Cost Plus pricing",
      url: costPlusUrl(medication),
    },
    {
      label: "GoodRx",
      sublabel: "Compare pharmacy coupon prices",
      url: goodRxUrl(medication),
    },
    {
      label: "SingleCare",
      sublabel: "Free discount card pricing",
      url: singleCareUrl(medication),
    },
  ];

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="text-base font-bold text-emerald-800 mb-3">
        Compare Generic Pricing
      </h3>

      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-md border border-emerald-200 bg-white px-3 py-2 min-h-touch hover:border-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 transition-colors"
              aria-label={`${link.label}: ${link.sublabel} (opens in new tab)`}
            >
              <span className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-emerald-800 text-sm">
                  {link.label}
                </span>
                <span className="text-xs text-accessible-secondary">
                  {link.sublabel}
                </span>
              </span>
              <ExternalLink
                size={16}
                className="text-emerald-700 group-hover:text-emerald-800 flex-shrink-0"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-accessible-secondary">
        Prices are shown on partner sites and vary by pharmacy and location.
        TMN does not set or guarantee these prices.
      </p>
    </section>
  );
}
