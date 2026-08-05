import { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllMedications } from '../lib/medicationsApi.js';

const MedicationsContext = createContext(null);

// The 94 KB medications fallback loads as its own chunk instead of riding in
// the entry bundle. main.jsx awaits `medicationsReady` (alongside i18nReady)
// before the first render, and index.html carries a modulepreload hint for
// the chunk, so by the time any component runs, MEDICATIONS_FALLBACK is
// populated exactly as if it were statically imported — no consumer ever
// sees an empty list unless the chunk itself failed to load (same failure
// class as the entry bundle; the API fetch below can still populate).
let MEDICATIONS_FALLBACK = [];
export const medicationsReady = import('../data/medications.json').then(
    (mod) => { MEDICATIONS_FALLBACK = mod.default; },
    () => { /* chunk unreachable — keep [] and rely on the API fetch */ }
);

/**
 * Collapse duplicate medication rows (same brand + generic that exist more than
 * once in the data, e.g. a record imported twice in the database). Keeps the
 * best copy: a human-readable slug id over a generated UUID, then the record
 * with the most populated fields.
 */
function dedupeMedications(list) {
    const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(id || ''));
    const score = (m) =>
        ['copayUrl', 'papUrl', 'copayProgramId', 'papProgramId', 'cost_tier', 'rxcui', 'stage']
            .filter((k) => m && m[k]).length + (m && m.commonOrgans && m.commonOrgans.length ? 1 : 0);
    const byKey = new Map();
    for (const m of list) {
        const key = `${(m.brandName || '').toLowerCase().trim()}|${(m.genericName || '').toLowerCase().trim()}`;
        const prev = byKey.get(key);
        if (!prev) {
            byKey.set(key, m);
            continue;
        }
        const prevUuid = isUuid(prev.id);
        const curUuid = isUuid(m.id);
        let keep;
        if (prevUuid !== curUuid) keep = prevUuid ? m : prev; // prefer the slug id
        else keep = score(m) > score(prev) ? m : prev; // otherwise the richer record
        byKey.set(key, keep);
    }
    return [...byKey.values()];
}

export function MedicationsProvider({ children }) {
    const [medications, setMedications] = useState(MEDICATIONS_FALLBACK);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [source, setSource] = useState('local'); // 'local' or 'database'

    useEffect(() => {
        let cancelled = false;

        async function loadMedications() {
            try {
                setIsLoading(true);
                const dbMedications = await fetchAllMedications();

                if (!cancelled && dbMedications && dbMedications.length > 0) {
                    // Merge database data with JSON fallback to ensure all medications are present
                    // Start with ALL fallback medications, then merge in database values
                    // This ensures medications like prednisone are always included even if missing from DB
                    const dbMedicationsMap = new Map(dbMedications.map(m => [m.id, m]));

                    const mergedMedications = MEDICATIONS_FALLBACK.map(fallbackMed => {
                        const dbMed = dbMedicationsMap.get(fallbackMed.id);
                        if (dbMed) {
                            // Database values take priority, but use fallback for missing/null fields
                            return {
                                ...fallbackMed,
                                ...dbMed,
                                // Explicit fallbacks for critical program fields
                                copayUrl: dbMed.copayUrl || fallbackMed.copayUrl,
                                copayProgramId: dbMed.copayProgramId || fallbackMed.copayProgramId,
                                papUrl: dbMed.papUrl || fallbackMed.papUrl,
                                papProgramId: dbMed.papProgramId || fallbackMed.papProgramId,
                                supportUrl: dbMed.supportUrl || fallbackMed.supportUrl,
                                medicarePartDUrl: dbMed.medicarePartDUrl || fallbackMed.medicarePartDUrl,
                                medicare2026Note: dbMed.medicare2026Note || fallbackMed.medicare2026Note,
                            };
                        }
                        // Medication exists in fallback but not in database - use fallback
                        return fallbackMed;
                    });

                    // Also add any medications that exist in database but not in fallback
                    const fallbackIds = new Set(MEDICATIONS_FALLBACK.map(m => m.id));
                    const dbOnlyMedications = dbMedications.filter(m => !fallbackIds.has(m.id));

                    setMedications(dedupeMedications([...mergedMedications, ...dbOnlyMedications]));
                    setSource('database');
                    setError(null);
                }
            } catch (err) {
                console.warn('Failed to fetch medications from database, using local fallback:', err);
                if (!cancelled) {
                    setError(err);
                    // Keep using the fallback data that was set initially
                    setSource('local');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadMedications();

        return () => {
            cancelled = true;
        };
    }, []);

    const value = {
        medications,
        isLoading,
        error,
        source,
        // Helper to find a medication by ID
        findMedication: (id) => medications.find(m => m.id === id),
        // Helper to filter medications
        filterMedications: (filterFn) => medications.filter(filterFn)
    };

    return (
        <MedicationsContext.Provider value={value}>
            {children}
        </MedicationsContext.Provider>
    );
}

export function useMedications() {
    const context = useContext(MedicationsContext);
    if (!context) {
        throw new Error('useMedications must be used within a MedicationsProvider');
    }
    return context;
}

// For backward compatibility - returns medications array directly
export function useMedicationsList() {
    const { medications } = useMedications();
    return medications;
}

export default MedicationsContext;
