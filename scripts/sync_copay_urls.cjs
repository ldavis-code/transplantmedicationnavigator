const fs = require("fs");

const medsPath = "./src/data/medications.json";
const programsPath = "./src/data/programs.json";

const meds = JSON.parse(fs.readFileSync(medsPath, "utf8"));
const programs = JSON.parse(fs.readFileSync(programsPath, "utf8"));

// Build a map of medication ID -> copay program info
const copayMap = {};
for (const [programId, program] of Object.entries(programs.copayPrograms || {})) {
  if (program.medications && program.url) {
    for (const medId of program.medications) {
      // Only set if not already set (prefer more specific programs)
      if (!copayMap[medId]) {
        copayMap[medId] = {
          copayUrl: program.url,
          copayProgramId: programId
        };
      }
    }
  }
}

console.log("=== COPAY MAP FROM PROGRAMS.JSON ===");
console.log("Medications with copay programs:", Object.keys(copayMap).length);
console.log("");

// Update medications
let updatedCount = 0;
const updatedMeds = meds.map(med => {
  if (copayMap[med.id] && !med.copayUrl) {
    updatedCount++;
    console.log("Adding copayUrl to:", med.brandName, "->", copayMap[med.id].copayUrl);
    return {
      ...med,
      copayUrl: copayMap[med.id].copayUrl,
      copayProgramId: copayMap[med.id].copayProgramId
    };
  }
  return med;
});

console.log("");
console.log("Total medications updated:", updatedCount);

// Write back
fs.writeFileSync(medsPath, JSON.stringify(updatedMeds, null, 2) + "\n");
console.log("medications.json updated!");
