async function lookupDrugRxNorm(rawName) {
  try {
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(rawName)}`
    );
    const data = await res.json();
    const rxcui = data?.idGroup?.rxnormId?.[0];
    if (!rxcui) return null;

    const detail = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/property.json?propName=RxNorm%20Name`
    ).then((r) => r.json());

    return {
      rxcui,
      name:
        detail?.propConceptGroup?.propConcept?.[0]?.propValue ||
        rawName,
    };
  } catch {
    return null;
  }
}


function parseDoseNotation(notationRaw = "") {
  const notation = notationRaw.trim().toUpperCase().replace(/\s+/g, "");

  const out = {
    timesPerDay: 0,
    timings: [], // ["morning","afternoon","night"]
    raw: notationRaw,
  };

  const add = (t) => {
    if (!out.timings.includes(t)) out.timings.push(t);
  };

  // ― 1-0-1 style ―
  const dashTriplet = /^([01])[-–]([01])[-–]([01])$/;
  if (dashTriplet.test(notation)) {
    const [, m, a, n] = notation.match(dashTriplet);
    if (m === "1") {
      add("morning");
      out.timesPerDay++;
    }
    if (a === "1") {
      add("afternoon");
      out.timesPerDay++;
    }
    if (n === "1") {
      add("night");
      out.timesPerDay++;
    }
    return out;
  }

  // Latin
  if (/(OD|QD)/.test(notation)) {
    out.timesPerDay = 1;
    add("morning");
    return out;
  }
  if (/BD/.test(notation)) {
    out.timesPerDay = 2;
    out.timings = ["morning", "night"];
    return out;
  }
  if (/(TDS|TID)/.test(notation)) {
    out.timesPerDay = 3;
    out.timings = ["morning", "afternoon", "night"];
    return out;
  }
  if (/QID/.test(notation)) {
    out.timesPerDay = 4;
    out.timings = ["morning", "noon", "evening", "night"];
    return out;
  }
  if (/HS/.test(notation)) {
    out.timesPerDay = 1;
    add("night");
    return out;
  }
  if (/SOS/.test(notation)) {
    out.timesPerDay = 0;
    out.timings = ["as-needed"];
    return out;
  }

  // Food
  if (/AC/.test(notation)) out.food = "before";
  if (/PC/.test(notation)) out.food = "after";

  return out;
}



function localFallbackParser(text = "") {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const meds = [];

  const rx = new RegExp(
    String.raw`^([A-Za-z][A-Za-z0-9 \-/()+]+?)\s+(\d+(\.\d+)?\s?(mg|mcg|g|ml|IU|units))?[, ]*\s*(\(?[A-Za-z0-9\-–/ ]+\)?)?[, ]*\s*(x\s*\d+\s*(day|days|wk|week|weeks))?[, ]*(before food|after food)?`,
    "i"
  );

  for (const line of lines) {
    const m = line.match(rx);
    if (!m) continue;

    const name = m[1]?.trim();
    const dosage = (m[2] || "").trim();
    const notationRaw = (m[5] || "").replace(/[()]/g, "").trim();
    const durationPhrase = (m[6] || "").trim();
    const foodPhrase = (m[8] || "").trim();

    const notation = parseDoseNotation(notationRaw);

    const durationDays = /x\s*(\d+)\s*(day|days)/i.test(durationPhrase)
      ? parseInt(durationPhrase.match(/x\s*(\d+)/i)[1], 10)
      : /wk|week/i.test(durationPhrase)
      ? 7
      : undefined;

    meds.push({
      name,
      dosage: dosage || undefined,
      frequency: notationRaw || undefined,
      timings: notation.timings,
      timesPerDay: notation.timesPerDay,
      food: foodPhrase
        ? foodPhrase.includes("after")
          ? "after"
          : "before"
        : notation.food,
      durationDays,
      notes: undefined,
    });
  }

  return meds;
}



export async function analyzePrescription(
  prescriptionText,
  patientInfo = {}
) {
  const prompt = [
    "You are a medical prescription extractor. Return STRICT JSON only.",
    "Extract medicines with fields: name, dosage, frequency, timings, timesPerDay, durationDays, food, notes.",
    "Support Indian formats: 1-0-1, OD, BD, TDS, QID, HS, SOS, AC, PC.",
    "Respond JSON: {\"medicines\": [ ... ]}",
  ].join("\n");

  const generationConfig = { response_mime_type: "application/json" };

  let meds = [];

  /* ---------- GEMINI CALL ---------- */
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${prompt}\n\nPATIENT: ${
                    patientInfo?.name || ""
                  }\n\nPRESCRIPTION:\n${prescriptionText}`,
                },
              ],
            },
          ],
          generationConfig,
        }),
      }
    );

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    if (Array.isArray(parsed?.medicines)) {
      meds = parsed.medicines;
    }
  } catch {
    /* ignore */
  }

  /* ---------- FALLBACK ---------- */
  if (!meds?.length) {
    meds = localFallbackParser(prescriptionText);
  }

  /* ---------- NORMALIZE ---------- */
  meds = meds
    .map((m) => {
      const parsed = parseDoseNotation(m.frequency || "");

      const timings =
        m.timings?.length && m.timings.length > 0
          ? m.timings
          : parsed.timings;

      const timesPerDay =
        m.timesPerDay ??
        parsed.timesPerDay ??
        (timings?.length || 0);

      return {
        name: String(m.name || "").trim(),
        dosage: m.dosage || undefined,
        frequency: m.frequency || parsed.raw || undefined,
        timings,
        timesPerDay,
        durationDays: Number.isFinite(m.durationDays)
          ? m.durationDays
          : undefined,
        food: m.food || parsed.food,
        notes: m.instructions || m.notes || undefined,
      };
    })
    .filter((m) => m.name);

  /* ---------- RXNORM ENRICH ---------- */
  for (let m of meds) {
    const norm = await lookupDrugRxNorm(m.name);
    if (norm) {
      m.rxcui = norm.rxcui;
      m.standardName = norm.name;
    } else {
      m.standardName = m.name;
    }
  }

  return {
    success: meds.length > 0,
    meds,
    timestamp: new Date().toISOString(),
  };
}

/************************************************************
   ✅ EXPORT UTILITY
************************************************************/

export function sendMedicineListToPatient(
  medicineData,
  patientId,
  doctorId
) {
  const medicineList = JSON.parse(
    localStorage.getItem("patientMedicines") || "[]"
  );
  medicineList.push({
    id: Date.now(),
    patientId,
    doctorId,
    medicines: medicineData.meds,
    timestamp: medicineData.timestamp,
    doctorName: doctorId,
    source: "prescription",
    prescribed: true,
  });
  localStorage.setItem("patientMedicines", JSON.stringify(medicineList));
  return { success: true, message: "Medicine list sent to patient" };
}
