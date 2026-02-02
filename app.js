// app.js
import { calcOilHeating } from "./core/oilHeating.js";

const $ = (sel) => document.querySelector(sel);

function fmtTime(hours) {
  if (!isFinite(hours)) return "-";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m} min`;
  return `${h} h ${m} min`;
}

function fmt(num, digits = 2) {
  if (!isFinite(num)) return "-";
  return num.toFixed(digits);
}

function showResult(result) {
  $("#out_time").textContent = fmtTime(result.hours);
  $("#out_energy").textContent = `${fmt(result.kWh_electric, 2)} kWh (elettrici)`;
  $("#out_energy_th").textContent = `${fmt(result.kWh_thermal, 2)} kWh (termici)`;
  $("#out_wpl").textContent = `${fmt(result.wPerLiter, 0)} W/L`;
  $("#out_mass").textContent = `${fmt(result.mKg, 1)} kg`;
  $("#out_eff").textContent = `${fmt(result.efficiency * 100, 0)}%`;

  const box = $("#warnings");
  box.innerHTML = "";

  if (result.warnings.length === 0) {
    box.innerHTML = `<div class="ok">Nessun warning rilevante con questi valori.</div>`;
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "warnlist";
  result.warnings.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    ul.appendChild(li);
  });
  box.appendChild(ul);
}

function showError(msg) {
  $("#out_time").textContent = "-";
  $("#out_energy").textContent = "-";
  $("#out_energy_th").textContent = "-";
  $("#out_wpl").textContent = "-";
  $("#out_mass").textContent = "-";
  $("#out_eff").textContent = "-";
  $("#warnings").innerHTML = `<div class="err">${msg}</div>`;
}

function readInputs() {
  return {
    liters: Number($("#liters").value),
    powerW: Number($("#powerW").value),
    tStartC: Number($("#tStart").value),
    tEndC: Number($("#tEnd").value),
    oilType: $("#oilType").value
  };
}

function compute() {
  try {
    const inputs = readInputs();
    const res = calcOilHeating(inputs);
    showResult(res);
  } catch (e) {
    showError(e.message || "Errore di calcolo.");
  }
}

["liters","powerW","tStart","tEnd","oilType"].forEach(id => {
  $("#" + id).addEventListener("input", compute);
});

$("#btn_calc").addEventListener("click", (e) => {
  e.preventDefault();
  compute();
});

// Primo calcolo
compute();
