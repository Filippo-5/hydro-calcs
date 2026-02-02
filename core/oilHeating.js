// core/oilHeating.js
// Modulo calcolo riscaldamento olio (MVP)
// Nota: è una stima ingegneristica. Puoi tarare i fattori in base a esperienza/dati reali.

export function calcOilHeating({
  liters,
  powerW,
  tStartC,
  tEndC,
  oilType = "generic"
}) {
  // Validazioni base
  if (!isFinite(liters) || liters <= 0) throw new Error("Litri non validi.");
  if (!isFinite(powerW) || powerW <= 0) throw new Error("Potenza non valida.");
  if (!isFinite(tStartC) || !isFinite(tEndC)) throw new Error("Temperature non valide.");
  if (tEndC <= tStartC) throw new Error("La temperatura finale deve essere maggiore di quella iniziale.");

  const dT = tEndC - tStartC;

  // Proprietà tipiche (approssimate)
  // densità (kg/L), cp (kJ/kgK)
  const oilDB = {
    generic: { rho: 0.87, cp: 1.90 },
    iso_vg_32: { rho: 0.86, cp: 1.90 },
    iso_vg_46: { rho: 0.87, cp: 1.90 },
    iso_vg_68: { rho: 0.88, cp: 1.90 },
  };

  const props = oilDB[oilType] ?? oilDB.generic;
  const mKg = liters * props.rho;
  const cpJ = props.cp * 1000; // kJ/kgK -> J/kgK

  // Energia teorica (senza perdite): Q = m * cp * dT
  const Q_J = mKg * cpJ * dT;

  // Perdite/inefficienze: fattore semplice (tarabile)
  // 0.85 significa: 85% della potenza va a scaldare l'olio
  // In impianti reali può scendere, soprattutto con serbatoi aperti o freddo ambiente.
  const efficiency = 0.85;

  const effectivePowerW = powerW * efficiency;

  const seconds = Q_J / effectivePowerW;
  const minutes = seconds / 60;
  const hours = minutes / 60;

  // kWh richiesti (teorici / effettivi)
  const kWh_thermal = Q_J / 3_600_000;
  const kWh_electric = kWh_thermal / efficiency;

  // Warning (semplici ma “vendibili”)
  const warnings = [];

  // range temperature consigliate (molto generico, tarabile)
  if (tEndC > 85) warnings.push("Temperatura finale alta (>85°C): valuta ossidazione/degradazione e sicurezza.");
  if (tEndC < 20) warnings.push("Temperatura finale bassa: la viscosità potrebbe restare alta (avviamento/efficienza).");

  // potenza specifica (W/L): indicatore rischio hotspot
  const wPerLiter = powerW / liters;
  if (wPerLiter > 200) warnings.push(`Potenza specifica elevata (${wPerLiter.toFixed(0)} W/L): rischio hotspot e degradazione locale se resistenza non adeguatamente immersa/circolata.`);
  else if (wPerLiter > 120) warnings.push(`Potenza specifica medio-alta (${wPerLiter.toFixed(0)} W/L): assicurati di avere circolazione o distribuzione termica.`);

  // delta T grande
  if (dT > 50) warnings.push(`ΔT elevato (${dT.toFixed(0)}°C): tempi lunghi e possibile riscaldamento non uniforme senza ricircolo.`);

  return {
    dT,
    mKg,
    wPerLiter,
    minutes,
    hours,
    kWh_thermal,
    kWh_electric,
    efficiency,
    warnings
  };
}
