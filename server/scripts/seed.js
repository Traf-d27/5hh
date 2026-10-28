import { presidencyStore } from "../data/store.js";

console.log("==============================================================");
console.log("⚡ ECHOTECH: Seeding Presidency University Block-Wise Telemetry");
console.log("==============================================================");
console.log("Calibrating 12 campus blocks against official published references:");
console.log("  • Central Admin 220 kWp Rooftop Solar PV (~800 kWh/day)");
console.log("  • Central Sewage Treatment Plant (STP) (300,000 L/day, 88% reuse)");
console.log("  • Food Court Organic Waste (120-150 kg/day vermicomposted)");
console.log("  • BESCOM Commercial HT Tariff: ₹8.50/kWh");
console.log("  • CEA India CO2 Grid Emission Factor: 0.716 kg CO2e/kWh\n");

presidencyStore.resetToSeedData();

const blocks = presidencyStore.getBlocks();
console.log(`✅ Successfully seeded ${blocks.length} campus building blocks:`);
blocks.forEach(b => {
  console.log(`  - [${b.id.padEnd(9)}] ${b.name.padEnd(42)} Score: ${b.sustainabilityScore}/100 | ${b.kpis.todayElectricityKwh} kWh/day | ${b.kpis.activeAlertsCount} alerts`);
});

console.log("\n✅ Injected fault signatures active:");
console.log("  1. CSE Block: Overnight lab idle baseload (>35% of peak draw)");
console.log("  2. ADMIN Block: 220 kWp solar PV soiling degradation (PR < 0.65)");
console.log("  3. STP Plant: Underground irrigation pipe joint pressure drop (352 kL)");
console.log("  4. FOOD Court: Post-event buffet meal surplus (>200 kg)");
console.log("  5. HOSTEL_G: Domestic plumbing nocturnal float valve leak (18 L/min)");
console.log("\n==============================================================");
console.log("Seed complete. Presidency University telemetry state restored.");
console.log("==============================================================\n");
