// Organ-specific medication reference data, shared by the wizard's guide
// tables (pages/main/Wizard.jsx) and the chat widget's suggestion logic
// (App.jsx). Extracted from App.jsx so the wizard route chunk and the entry
// chunk can share it without either bundling the other.
export const ORGAN_MEDICATIONS = {
    Heart: {
        title: 'Heart Transplant',
        description: 'Heart transplant recipients typically receive a combination of a calcineurin inhibitor, an antimetabolite, and a corticosteroid.',
        medications: [
            { id: 'tacrolimus', name: 'Tacrolimus', brand: 'Tacrolimus (generic)', class: 'Calcineurin Inhibitor', notes: 'Mainstay of maintenance therapy. Generic, lowest cost via Cost Plus Drugs / discount cards (no copay card).' },
            { id: 'prograf', name: 'Tacrolimus', brand: 'Prograf', class: 'Calcineurin Inhibitor', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'cyclosporine', name: 'Cyclosporine', brand: 'Neoral', class: 'Calcineurin Inhibitor', notes: 'Alternative to tacrolimus.' },
            { id: 'mycophenolate', name: 'Mycophenolate Mofetil', brand: 'Mycophenolate (generic)', class: 'Antimetabolite', notes: 'Used in combination with a CNI. Generic, lowest cost via discount cards (no copay card).' },
            { id: 'cellcept', name: 'Mycophenolate Mofetil', brand: 'CellCept', class: 'Antimetabolite', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'imuran', name: 'Azathioprine', brand: 'Imuran', class: 'Antimetabolite', notes: 'Alternative antimetabolite.' },
            { id: 'prednisone', name: 'Prednisone', brand: 'Prednisone', class: 'Corticosteroid', notes: 'Often tapered to a low dose or discontinued over time.' }
        ]
    },
    Kidney: {
        title: 'Kidney Transplant',
        description: 'Kidney transplant immunosuppression is similar to that for heart transplants, with a focus on balancing efficacy and minimizing side effects.',
        medications: [
            { id: 'tacrolimus', name: 'Tacrolimus', brand: 'Tacrolimus (generic)', class: 'Calcineurin Inhibitor', notes: 'Standard of care. Generic, lowest cost via Cost Plus Drugs / discount cards (no copay card).' },
            { id: 'prograf', name: 'Tacrolimus', brand: 'Prograf', class: 'Calcineurin Inhibitor', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'cyclosporine', name: 'Cyclosporine', brand: 'Neoral', class: 'Calcineurin Inhibitor', notes: 'Alternative to tacrolimus.' },
            { id: 'mycophenolate', name: 'Mycophenolate Mofetil', brand: 'Mycophenolate (generic)', class: 'Antimetabolite', notes: 'Commonly used in combination with a CNI. Generic, lowest cost via discount cards (no copay card).' },
            { id: 'cellcept', name: 'Mycophenolate Mofetil', brand: 'CellCept', class: 'Antimetabolite', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'myfortic', name: 'Mycophenolic Acid', brand: 'Myfortic', class: 'Antimetabolite', notes: 'Alternative to mycophenolate mofetil.' },
            { id: 'prednisone', name: 'Prednisone', brand: 'Prednisone', class: 'Corticosteroid', notes: 'Many centers aim for steroid-free regimens to reduce long-term side effects.' },
            { id: 'belatacept', name: 'Belatacept', brand: 'Nulojix', class: 'Biologic', notes: 'An alternative to CNIs for certain patients.' }
        ]
    },
    Liver: {
        title: 'Liver Transplant',
        description: 'Liver transplant patients often require lower levels of immunosuppression compared to other organ recipients due to the liver\'s unique immunological properties.',
        medications: [
            { id: 'tacrolimus', name: 'Tacrolimus', brand: 'Tacrolimus (generic)', class: 'Calcineurin Inhibitor', notes: 'Most commonly used CNI in liver transplant. Generic, lowest cost via Cost Plus Drugs / discount cards (no copay card).' },
            { id: 'prograf', name: 'Tacrolimus', brand: 'Prograf', class: 'Calcineurin Inhibitor', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'mycophenolate', name: 'Mycophenolate Mofetil', brand: 'Mycophenolate (generic)', class: 'Antimetabolite', notes: 'Often used in combination with a CNI. Generic, lowest cost via discount cards (no copay card).' },
            { id: 'cellcept', name: 'Mycophenolate Mofetil', brand: 'CellCept', class: 'Antimetabolite', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'prednisone', name: 'Prednisone', brand: 'Prednisone', class: 'Corticosteroid', notes: 'Typically tapered and discontinued within the first few months post-transplant.' }
        ]
    },
    Lung: {
        title: 'Lung Transplant',
        description: 'Lung transplant recipients are at a high risk of rejection, and immunosuppressive regimens are often more intensive.',
        medications: [
            { id: 'tacrolimus', name: 'Tacrolimus', brand: 'Tacrolimus (generic)', class: 'Calcineurin Inhibitor', notes: 'Preferred CNI for lung transplant. Generic, lowest cost via Cost Plus Drugs / discount cards (no copay card).' },
            { id: 'prograf', name: 'Tacrolimus', brand: 'Prograf', class: 'Calcineurin Inhibitor', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'mycophenolate', name: 'Mycophenolate Mofetil', brand: 'Mycophenolate (generic)', class: 'Antimetabolite', notes: 'Used in combination with tacrolimus. Generic, lowest cost via discount cards (no copay card).' },
            { id: 'cellcept', name: 'Mycophenolate Mofetil', brand: 'CellCept', class: 'Antimetabolite', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'prednisone', name: 'Prednisone', brand: 'Prednisone', class: 'Corticosteroid', notes: 'Maintained at a low dose long-term.' }
        ]
    },
    Pancreas: {
        title: 'Pancreas Transplant',
        description: 'Pancreas transplant immunosuppression is similar to kidney transplantation, as the two are often performed together.',
        medications: [
            { id: 'tacrolimus', name: 'Tacrolimus', brand: 'Tacrolimus (generic)', class: 'Calcineurin Inhibitor', notes: 'Standard of care. Generic, lowest cost via Cost Plus Drugs / discount cards (no copay card).' },
            { id: 'prograf', name: 'Tacrolimus', brand: 'Prograf', class: 'Calcineurin Inhibitor', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'mycophenolate', name: 'Mycophenolate Mofetil', brand: 'Mycophenolate (generic)', class: 'Antimetabolite', notes: 'Used in combination with tacrolimus. Generic, lowest cost via discount cards (no copay card).' },
            { id: 'cellcept', name: 'Mycophenolate Mofetil', brand: 'CellCept', class: 'Antimetabolite', notes: 'Brand-name version, may qualify for a manufacturer copay card.' },
            { id: 'prednisone', name: 'Prednisone', brand: 'Prednisone', class: 'Corticosteroid', notes: 'Often tapered to a low dose or discontinued over time.' }
        ]
    }
};

// Pre-transplant medication data by organ type
export const PRE_TRANSPLANT_MEDICATIONS = {
    Heart: {
        title: 'Heart Transplant',
        description: 'For patients awaiting a heart transplant, the primary goal is to manage advanced heart failure and maintain hemodynamic stability. This is often referred to as "bridge to transplantation."',
        medications: [
            { class: 'ACE Inhibitors / ARBs', notes: 'Reduce afterload and improve cardiac function.', examples: [{ id: 'lisinopril', label: 'Lisinopril' }, { id: 'losartan', label: 'Losartan' }] },
            { class: 'Beta-Blockers', notes: 'Improve survival and reduce the workload on the heart.', examples: [{ id: 'coreg', label: 'Carvedilol' }, { id: 'lopressor', label: 'Metoprolol' }] },
            { class: 'Diuretics', notes: 'Manage fluid overload and congestion.', examples: [{ id: 'lasix', label: 'Furosemide' }, { id: 'bumetanide', label: 'Bumetanide' }] },
            { class: 'Mineralocorticoid Receptor Antagonists', notes: 'Block the effects of aldosterone, reducing fibrosis and improving survival.', examples: [{ id: 'aldactone', label: 'Spironolactone' }, { id: 'eplerenone', label: 'Eplerenone' }] },
            { class: 'Antiarrhythmics', notes: 'Control arrhythmias.', examples: [{ id: 'amiodarone', label: 'Amiodarone' }] }
        ]
    },
    Kidney: {
        title: 'Kidney Transplant',
        description: 'Patients with end-stage renal disease (ESRD) awaiting a kidney transplant require management of various complications arising from kidney failure, most commonly through dialysis.',
        medications: [
            { class: 'Erythropoiesis-Stimulating Agents (ESAs)', notes: 'Stimulate red blood cell production to treat anemia.', examples: [{ id: 'procrit', label: 'Epoetin alfa' }, { id: 'aranesp', label: 'Darbepoetin alfa' }] },
            { class: 'Iron Supplements', notes: 'Replenish iron stores necessary for red blood cell formation.', examples: [{ id: 'venofer', label: 'IV Iron' }, { id: 'ferrous-sulfate', label: 'Oral Iron' }] },
            { class: 'Phosphate Binders', notes: 'Control high phosphorus levels in the blood.', examples: [{ id: 'sevelamer', label: 'Sevelamer' }, { id: 'phoslo', label: 'Calcium Acetate' }, { id: 'auryxia', label: 'Ferric Citrate' }] },
            { class: 'Vitamin D Analogs', notes: 'Suppress parathyroid hormone (PTH) and manage calcium/phosphorus balance.', examples: [{ id: 'calcitriol', label: 'Calcitriol' }, { id: 'zemplar', label: 'Paricalcitol' }] },
            { class: 'Antihypertensives', notes: 'Manage hypertension, a common complication of ESRD.', examples: [{ id: 'lisinopril', label: 'Lisinopril' }, { id: 'losartan', label: 'Losartan' }, { id: 'amlodipine', label: 'Amlodipine' }] }
        ]
    },
    Liver: {
        title: 'Liver Transplant',
        description: 'Pre-transplant management for liver transplant candidates focuses on managing the complications of cirrhosis and portal hypertension.',
        medications: [
            { class: 'Diuretics (Ascites)', notes: 'Remove excess fluid from the body.', examples: [{ id: 'aldactone', label: 'Spironolactone' }, { id: 'lasix', label: 'Furosemide' }] },
            { class: 'Ammonia-reducing Agents', notes: 'Reduce the buildup of toxins in the blood that affect the brain.', examples: [{ id: 'lactulose', label: 'Lactulose' }, { id: 'rifaximin', label: 'Rifaximin' }] },
            { class: 'Non-selective Beta-Blockers', notes: 'Reduce pressure in the portal vein to prevent bleeding from varices.', examples: [{ id: 'inderal', label: 'Propranolol' }, { id: 'nadolol', label: 'Nadolol' }] },
            { class: 'Antibiotics (SBP Prevention)', notes: 'Prevent spontaneous bacterial peritonitis in high-risk patients.', examples: [{ id: 'ciprofloxacin', label: 'Ciprofloxacin' }] },
            { class: 'Bone Health', notes: 'Prevent or treat osteoporosis, which is common in cirrhosis.', examples: [{ id: 'cholecalciferol', label: 'Vitamin D' }] }
        ],
        warning: 'It is crucial for patients with cirrhosis to avoid certain medications, such as Nonsteroidal Anti-Inflammatory Drugs (NSAIDs), which can increase the risk of kidney injury and bleeding.'
    },
    Lung: {
        title: 'Lung Transplant',
        description: 'Medication management for lung transplant candidates is tailored to their specific underlying lung disease, such as idiopathic pulmonary fibrosis (IPF), chronic obstructive pulmonary disease (COPD), or pulmonary hypertension.',
        medications: [
            { class: 'IPF Antifibrotics', notes: 'Slow the progression of lung scarring.', examples: [{ id: 'esbriet', label: 'Pirfenidone' }, { id: 'ofev', label: 'Nintedanib' }] },
            { class: 'COPD Bronchodilators / Inhaled Steroids', notes: 'Improve airflow and reduce inflammation.', examples: [{ id: 'albuterol', label: 'Albuterol' }, { id: 'tiotropium', label: 'Tiotropium' }, { id: 'fluticasone', label: 'Fluticasone' }] },
            { class: 'Pulmonary Hypertension Vasodilators', notes: 'Reduce high blood pressure in the lungs.', examples: [{ id: 'flolan', label: 'Epoprostenol' }, { id: 'revatio', label: 'Sildenafil' }, { id: 'tracleer', label: 'Bosentan' }] },
            { class: 'Diuretics (Supportive)', notes: 'Manage fluid retention.', examples: [{ id: 'lasix', label: 'Furosemide' }] }
        ]
    },
    Pancreas: {
        title: 'Pancreas Transplant',
        description: 'For patients awaiting a pancreas transplant, who typically have type 1 diabetes, the focus is on intensive glycemic control and managing diabetes-related complications.',
        medications: [
            { class: 'Insulin', notes: 'Maintain blood glucose levels within a target range.', examples: [{ id: 'insulin-glargine', label: 'Basal (Glargine)' }, { id: 'insulin-lispro', label: 'Bolus (Lispro)' }] },
            { class: 'ACE Inhibitors / ARBs', notes: 'Provide kidney protection.', examples: [{ id: 'lisinopril', label: 'Lisinopril' }, { id: 'losartan', label: 'Losartan' }] },
            { class: 'Statins', notes: 'Manage cholesterol and reduce cardiovascular risk.', examples: [{ id: 'atorvastatin', label: 'Atorvastatin' }, { id: 'simvastatin', label: 'Simvastatin' }] }
        ]
    }
};

// Organ icons mapping
