import { useMemo, useState } from "react";
import { styles } from "../styles";

const BASE_DAILY_RATE = 2500;
const DAILY_RATE_CAP = 5000;
const MOBILIZATION_FEE = 200;
const MOBILIZATION_WAIVER_DISTANCE = 15;
const MILEAGE_RATE = 3.5;
const STUMP_RATE_PER_INCH = 9;

const SERVICE_RATE_IMPACTS = {
  defensibleSpace: 500,
  selectiveClearing: 750,
  accessCreation: 750,
  ditchingDrainage: 750,
  culvertInstallation: 1000,
  basePrepCompaction: 750,
  drivewayWork: 750,
};

const TIMBER_HANDLING_RATE_IMPACT = {
  stack: 500,
  remove: 750,
  mulch: 1000,
};

const tierLabels = {
  TIER_1: "Tier 1 – Standard",
  TIER_2: "Tier 2 – Complexity",
  TIER_3: "Tier 3 – High Risk",
};

const tierPriority = {
  TIER_1: "Priority A – Fast Track",
  TIER_2: "Priority B – Planned",
  TIER_3: "Priority C – Controlled",
};

const tierActions = {
  TIER_1: "Proceed to scheduling review",
  TIER_2: "Manual scope review before estimate",
  TIER_3: "Senior review required before response",
};

const HARD_STOP_FLAGS = [
  "BELOW_MIN_SCOPE",
  "UNSAFE_SLOPE",
  "PERMIT_NOT_ACKNOWLEDGED",
  "INCOMPATIBLE_ACCESS",
];

const conditionModifierConfig = [
  {
    key: "SATURATED_GROUND",
    label: "Saturated or soft ground (+25%)",
    percent: 0.25,
    applies: (form) => form.groundCondition === "saturated",
  },
  {
    key: "STEEP_SLOPE_RISK",
    label: "Steep slope (<=18°) (+30%)",
    percent: 0.3,
    applies: (form) => form.terrain === "steep",
  },
  {
    key: "NO_ESTABLISHED_ACCESS",
    label: "No established access (+25%)",
    percent: 0.25,
    applies: (form) => form.access === "noAccess",
  },
  {
    key: "LIMITED_ACCESS",
    label: "Limited access (+15%)",
    percent: 0.15,
    applies: (form) => form.access === "limited",
  },
];

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdFormatterWithCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatUSD = (value, { cents = false } = {}) => {
  const safe = Number.isFinite(value) ? value : 0;
  return cents ? usdFormatterWithCents.format(safe) : usdFormatter.format(Math.round(safe));
};

const propertyStatusOptions = [
  { value: "vacant", label: "Vacant land" },
  { value: "developed", label: "Developed property" },
  { value: "commercial", label: "Commercial or multi-parcel property" },
];

const areaOptions = [
  { value: "underHalf", label: "Under ½ acre" },
  { value: "halfToOne", label: "½ – 1 acre" },
  { value: "oneToThree", label: "1 – 3 acres" },
  { value: "threeToFive", label: "3 – 5 acres" },
  { value: "overFive", label: "Over 5 acres" },
];

const vegetationOptions = [
  { value: "lightBrush", label: "Light brush & grass" },
  { value: "willowBrush", label: "Willow / riparian brush" },
  { value: "mixedBrushSaplings", label: "Mixed brush and saplings" },
  { value: "brushTimber", label: "Brush with timber over 8\"" },
  { value: "timberOnly", label: "Timber over 8\" (standalone)" },
  { value: "denseWoody", label: "Dense woody growth" },
];

const terrainOptions = [
  { value: "flat", label: "Mostly flat" },
  { value: "rolling", label: "Rolling terrain" },
  { value: "steep", label: "Steep slopes" },
];

const accessOptions = [
  { value: "road", label: "Existing road or driveway access" },
  { value: "limited", label: "Limited access" },
  { value: "noAccess", label: "No established access" },
];

const groundConditionOptions = [
  { value: "dry", label: "Dry / firm ground" },
  { value: "saturated", label: "Seasonally saturated or soft ground" },
];

const waterwaysOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

const supportOptions = [
  { value: "clearingOnly", label: "Clearing only (no ground shaping)" },
  { value: "ditching", label: "Ditching or drainage shaping required" },
  { value: "culverts", label: "Culverts required" },
  { value: "compaction", label: "Base preparation and compaction required" },
];

const serviceOptions = [
  { value: "forestryMulching", label: "Forestry mulching" },
  { value: "defensibleSpace", label: "Defensible space clearing" },
  { value: "selectiveClearing", label: "Selective land clearing" },
  { value: "accessCreation", label: "Access creation & site prep" },
  { value: "ditchingDrainage", label: "Ditching & drainage shaping" },
  { value: "culvertInstallation", label: "Culvert installation (prep + placement)" },
  { value: "basePrepCompaction", label: "Base preparation & compaction" },
  { value: "drivewayWork", label: "Driveway installation / repair" },
  { value: "stumpGrinding", label: "Stump grinding" },
];

const timberHandlingOptions = [
  {
    value: "stack",
    label: "Stack on site (owner-managed disposal)",
    description: "Felled material is stacked on site. No off-site hauling.",
  },
  {
    value: "remove",
    label: "Removed from site",
    description: "Material is loaded and hauled. Vegetation under 8\" mulched; larger stems are removed.",
  },
  {
    value: "mulch",
    label: "Mulched on site",
    description: "Timber is processed on site with slower production rates.",
  },
];

const timberTriggers = new Set(["brushTimber", "timberOnly"]);

const optionLabelMap = (options) =>
  options.reduce((map, option) => {
    map.set(option.value, option.label);
    return map;
  }, new Map());

const formatSelectionList = (values, map) => {
  if (!values.length) return "None specified";
  return values.map((value) => map.get(value) ?? value).join(", ");
};

const resolveConditionModifiers = (form) => {
  const applicable = conditionModifierConfig
    .filter((modifier) => modifier.applies(form))
    .sort((a, b) => b.percent - a.percent);
  return applicable.slice(0, 2);
};

const calculateStumpGrinding = (form) => {
  const count = Number.parseInt(form.stumpCount, 10) || 0;
  const averageDiameter = Number.parseFloat(form.avgStumpDiameter) || 0;
  if (count <= 0 || averageDiameter <= 0) {
    return { cost: 0, count: 0, averageDiameter: 0 };
  }
  const cost = count * averageDiameter * STUMP_RATE_PER_INCH;
  return { cost, count, averageDiameter };
};

const calculatePricingSummary = (form, requiresTimberHandling, labelMaps) => {
  const serviceImpacts = [];
  let serviceAddOns = 0;
  let stumpData = { cost: 0, count: 0, averageDiameter: 0 };

  form.services.forEach((service) => {
    if (service === "stumpGrinding") {
      stumpData = calculateStumpGrinding(form);
      if (stumpData.cost > 0) {
        serviceImpacts.push({
          label: labelMaps.services.get(service) ?? "Stump grinding",
          amount: stumpData.cost,
          detail: `${stumpData.count} stumps @ ~${stumpData.averageDiameter}\"`,
        });
      }
      serviceAddOns += stumpData.cost;
      return;
    }

    const addOn = SERVICE_RATE_IMPACTS[service] ?? 0;
    if (addOn > 0) {
      serviceImpacts.push({ label: labelMaps.services.get(service) ?? service, amount: addOn });
    }
    serviceAddOns += addOn;
  });

  let timberImpact = 0;
  if (requiresTimberHandling && form.timberHandling) {
    timberImpact = TIMBER_HANDLING_RATE_IMPACT[form.timberHandling] ?? 0;
    if (timberImpact > 0) {
      serviceImpacts.push({
        label: `Timber handling – ${labelMaps.timber.get(form.timberHandling) ?? "Not specified"}`,
        amount: timberImpact,
      });
    }
  }

  const baseSubtotal = BASE_DAILY_RATE + serviceAddOns + timberImpact;
  const modifiersApplied = resolveConditionModifiers(form);
  const modifierMultiplier = modifiersApplied.reduce((multiplier, modifier) => multiplier * (1 + modifier.percent), 1);
  const subtotalWithModifiers = baseSubtotal * modifierMultiplier;

  let capApplied = false;
  let dailyTotal = subtotalWithModifiers;
  if (dailyTotal > DAILY_RATE_CAP) {
    dailyTotal = DAILY_RATE_CAP;
    capApplied = true;
  }

  const distanceMiles = Math.max(Number.parseFloat(form.distanceMiles) || 0, 0);
  const mobilizationFee = distanceMiles > MOBILIZATION_WAIVER_DISTANCE ? MOBILIZATION_FEE : 0;
  const mileageCost = distanceMiles * MILEAGE_RATE;

  const baseTier = dailyTotal <= 3000 ? "TIER_1" : dailyTotal <= 4500 ? "TIER_2" : "TIER_3";
  let tier = baseTier;
  if (form.groundCondition === "saturated" && tier !== "TIER_3") {
    tier = tier === "TIER_1" ? "TIER_2" : "TIER_3";
  }

  return {
    baseRate: BASE_DAILY_RATE,
    baseSubtotal,
    serviceImpacts,
    serviceImpactTotal: serviceAddOns + timberImpact,
    modifiersApplied,
    modifierMultiplier,
    subtotalWithModifiers,
    dailyTotal,
    capApplied,
    distanceMiles,
    mobilizationFee,
    mileageCost,
    tier,
    tierLabel: tierLabels[tier] ?? tier,
    schedulingPriority: tierPriority[tier] ?? "Priority pending",
    tierAction: tierActions[tier] ?? "Manual review required",
    stumpData,
  };
};

const buildAutoFlags = (form, requiresTimberHandling) => {
  const flags = [];
  const hasTimber = form.vegetation.some((value) => timberTriggers.has(value));
  const hasBrush = form.vegetation.some((value) => !timberTriggers.has(value));
  const supportIncludes = (value) => form.supportNeeds.includes(value);
  const limitedAccess = form.access === "limited";
  const noAccess = form.access === "noAccess";
  const hasExactAddress = Boolean(form.projectAddress && form.projectAddress.trim().length);

  if (form.terrain === "steep") flags.push("STEEP_SLOPE_RISK");
  if (form.groundCondition === "saturated") flags.push("SATURATED_GROUND");
  if (requiresTimberHandling) flags.push("TIMBER_PRESENT");
  if (requiresTimberHandling && hasTimber && hasBrush) flags.push("BRUSH_PLUS_TIMBER");
  if (limitedAccess) flags.push("LIMITED_ACCESS");
  if (noAccess) flags.push("NO_ESTABLISHED_ACCESS");
  if (supportIncludes("culverts")) flags.push("CULVERT_REQUIRED");
  if (supportIncludes("ditching")) flags.push("DITCHING_REQUIRED");
  if (supportIncludes("compaction")) flags.push("BASE_COMPACTION_REQUIRED");
  if (form.services.length > 1) flags.push("MULTI_SERVICE_SCOPE");
  if (form.services.length > 0) flags.push("SERVICE_ADDONS_APPLIED");
  if (form.waterways === "yes" || form.waterways === "unsure") flags.push("WATERWAY_REVIEW");
  if (requiresTimberHandling && form.timberHandling === "mulch") flags.push("TIMBER_MULCHED_ON_SITE");

  const belowMinScope =
    form.area === "underHalf" && form.vegetation.length === 1 && form.vegetation[0] === "lightBrush";
  if (belowMinScope) flags.push("BELOW_MIN_SCOPE");

  const mechanizedServicesRequested = form.services.some((service) => service !== "stumpGrinding");
  const unsafeSlopeMechanized =
    form.terrain === "steep" && form.groundCondition === "saturated" && mechanizedServicesRequested;
  if (unsafeSlopeMechanized) flags.push("UNSAFE_SLOPE");

  if (!form.permitAck) flags.push("PERMIT_NOT_ACKNOWLEDGED");
  if (noAccess && !form.services.includes("accessCreation")) flags.push("INCOMPATIBLE_ACCESS");
  if (form.access === "road") flags.push("STANDARD_ACCESS");
  if (!requiresTimberHandling) flags.push("NO_TIMBER");
  if (form.terrain === "flat" || form.terrain === "rolling") flags.push("FLAT_OR_ROLLING");
  if (!hasExactAddress) flags.push("ADDRESS_APPROXIMATE");

  return [...new Set(flags)];
};

const hardStopMessages = {
  BELOW_MIN_SCOPE: "Request declined: scope below minimum thresholds.",
  UNSAFE_SLOPE: "Request declined: unsafe slopes for mechanized work.",
  PERMIT_NOT_ACKNOWLEDGED: "Request declined: permit responsibility not acknowledged.",
  INCOMPATIBLE_ACCESS: "Request declined: incompatible access without access creation scope.",
};

const getHardStopMessage = (flags) => {
  const flagSet = new Set(flags);
  for (const flag of HARD_STOP_FLAGS) {
    if (flagSet.has(flag)) {
      return hardStopMessages[flag] ?? "Request declined: project does not meet intake requirements.";
    }
  }
  return "";
};

const determineSuggestedAction = (form, pricingSummary) => {
  if (pricingSummary.tier === "TIER_3") {
    return "Senior review required before response";
  }
  if (pricingSummary.tier === "TIER_2") {
    return form.photos.length === 0
      ? "Manual scope review required – request supporting photos"
      : "Manual scope review before estimate";
  }
  if (pricingSummary.tier === "TIER_1" && form.photos.length === 0) {
    return "Request additional photos before scheduling review";
  }
  return pricingSummary.tierAction;
};

const buildInternalEmail = ({
  form,
  requiresTimberHandling,
  flags,
  suggestedAction,
  labelMaps,
  pricingSummary,
}) => {
  const contactName = form.fullName?.trim() || "Not provided";
  const contactPhone = form.phone?.trim() || "Not provided";
  const contactEmail = form.email?.trim() || "Not provided";
  const projectAddress = form.projectAddress?.trim();
  const photoStatus = form.photos.length
    ? `${form.photos.length} photo${form.photos.length === 1 ? "" : "s"} uploaded`
    : "No photos provided";
  const timberPresent = requiresTimberHandling ? "Yes" : "No";
  const timberLabel = form.timberHandling
    ? `${labelMaps.timber.get(form.timberHandling) ?? "Not specified"}${
        form.timberHandling === "remove"
          ? " (sub-8\" mulched; larger material hauled)"
          : form.timberHandling === "stack"
          ? " (owner-managed disposal)"
          : form.timberHandling === "mulch"
          ? " (processed on site; reduced production)"
          : ""
      }`
    : requiresTimberHandling
    ? "Selection pending"
    : "Not applicable";
  const serviceImpactLines = pricingSummary.serviceImpacts.length
    ? pricingSummary.serviceImpacts
        .map((impact) => {
          const detail = impact.detail ? ` (${impact.detail})` : "";
          return `- ${impact.label}: ${formatUSD(impact.amount, { cents: true })}${detail}`;
        })
        .join("\n")
    : "- None beyond baseline CTL day";
  const modifierLines = pricingSummary.modifiersApplied.length
    ? pricingSummary.modifiersApplied.map((modifier) => `- ${modifier.label}`).join("\n")
    : "- None applied";
  const distanceDisplay = pricingSummary.distanceMiles
    ? `${pricingSummary.distanceMiles.toFixed(1)} miles one-way`
    : "Not specified";
  const mobilizationFeeText = pricingSummary.mobilizationFee
    ? formatUSD(pricingSummary.mobilizationFee)
    : "Waived (<=15 miles)";
  const mileageText = formatUSD(pricingSummary.mileageCost, { cents: true });
  const permitStatus = form.permitAck ? "Acknowledged by owner" : "Not acknowledged";
  const groundConditionLabel = labelMaps.ground.get(form.groundCondition) ?? "Not specified";
  const capNote = pricingSummary.capApplied ? "Yes – daily cap enforced with bundled scope" : "No";

  return `Subject: New Estimate Request – Internal Review

📞 Contact Information
Name: ${contactName}
Phone: ${contactPhone}
Email: ${contactEmail}

📍 Project Location
Address / Parcel: ${projectAddress || "Not provided (city-level only)"}
City / Nearest Community: ${form.city || "Not provided"}
County: ${form.county || "Not provided"}
Location Precision: ${projectAddress ? "Exact" : "Approximate – flagged ADDRESS_APPROXIMATE"}

🧾 Project Overview
Property Status: ${labelMaps.property.get(form.propertyStatus) ?? "Not specified"}
Approximate Area: ${labelMaps.area.get(form.area) ?? "Not specified"}
Requested Services: ${formatSelectionList(form.services, labelMaps.services)}

🌿 Vegetation & Terrain
Vegetation Identified:
${formatSelectionList(form.vegetation, labelMaps.vegetation)}

Terrain Conditions: ${labelMaps.terrain.get(form.terrain) ?? "Not specified"}

🌲 Timber Handling
Timber Present: ${timberPresent}
Handling Method: ${timberLabel}
Standard Applied:
Timber diameter measured at ~4 ft above ground level (DBH).

🚧 Access & Ground Conditions
Access: ${labelMaps.access.get(form.access) ?? "Not specified"}
Ground Condition: ${groundConditionLabel}
Additional Requirements:
${formatSelectionList(form.supportNeeds, labelMaps.support)}

🌊 Environmental / Permits
Waterways or Sensitive Areas: ${labelMaps.waterways.get(form.waterways) ?? "Not specified"}
Permit Responsibility: ${permitStatus}

📎 Site Photos
${photoStatus}

🛠️ Services & Production Model
Base Rate Anchor: ${formatUSD(pricingSummary.baseRate)}
Service Add-ons:
${serviceImpactLines}

Condition Modifiers:
${modifierLines}

Daily Total${pricingSummary.capApplied ? " (capped at $5,000)" : ""}: ${formatUSD(pricingSummary.dailyTotal, { cents: true })}
Bundled Scope: ${capNote}

🚚 Mobilization & Mileage
Distance from Stevensville, MT: ${distanceDisplay}
Mobilization Fee: ${mobilizationFeeText}
Mileage Cost: ${mileageText}

🚩 Internal Flags
${flags.length ? flags.join(", ") : "None"}

💰 Pricing Tier & Priority
Tier: ${pricingSummary.tierLabel} (${pricingSummary.tier})
Scheduling Priority: ${pricingSummary.schedulingPriority}
Assigned Action: ${pricingSummary.tierAction}

🔍 Recommended Next Action
${suggestedAction}

This message is generated automatically.
Review scope, access, terrain, and equipment suitability before responding.`;
};

const QuoteCalculator = () => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    propertyStatus: "vacant",
    projectAddress: "",
    city: "",
    county: "",
    distanceMiles: "",
    area: "underHalf",
    services: [],
    vegetation: [],
    terrain: "flat",
    access: "road",
    groundCondition: "",
    waterways: "",
    timberHandling: "",
    supportNeeds: [],
    stumpCount: "",
    avgStumpDiameter: "",
    permitAck: false,
    photos: [],
  });
  const [status, setStatus] = useState({ submitted: false, error: "" });

  const requiresTimberHandling = useMemo(
    () => form.vegetation.some((value) => timberTriggers.has(value)),
    [form.vegetation]
  );

  const labelMaps = useMemo(
    () => ({
      property: optionLabelMap(propertyStatusOptions),
      area: optionLabelMap(areaOptions),
      vegetation: optionLabelMap(vegetationOptions),
      terrain: optionLabelMap(terrainOptions),
      access: optionLabelMap(accessOptions),
      ground: optionLabelMap(groundConditionOptions),
      waterways: optionLabelMap(waterwaysOptions),
      support: optionLabelMap(supportOptions),
      services: optionLabelMap(serviceOptions),
      timber: optionLabelMap(timberHandlingOptions),
    }),
    []
  );

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxList = (field, option) => {
    setForm((prev) => {
      const next = prev[field].includes(option)
        ? prev[field].filter((item) => item !== option)
        : [...prev[field], option];
      return { ...prev, [field]: next };
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    setForm((prev) => ({ ...prev, photos: files }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = [];
    const trimmedName = form.fullName.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedEmail = form.email.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!trimmedName) errors.push("Enter the full name for the primary contact.");
    if (!trimmedPhone) errors.push("Enter the best phone number for the project contact.");
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) errors.push("Enter a valid email address for the project contact.");
    if (!form.propertyStatus) errors.push("Select a property status.");
    if (!form.city.trim()) errors.push("Enter the project city.");
    if (!form.county.trim()) errors.push("Enter the project county.");
    if (!form.distanceMiles || Number.parseFloat(form.distanceMiles) <= 0) {
      errors.push("Enter the one-way distance from Stevensville, MT.");
    }
    if (!form.area) errors.push("Select an approximate area.");
    if (!form.services.length) errors.push("Select at least one requested service.");
    if (!form.vegetation.length) errors.push("Select at least one vegetation type.");
    if (!form.terrain) errors.push("Select a terrain profile.");
    if (!form.groundCondition) errors.push("Select current ground conditions.");
    if (!form.access) errors.push("Select site access conditions.");
    if (!form.waterways) errors.push("Indicate waterways or sensitive areas.");
    if (requiresTimberHandling && !form.timberHandling) errors.push("Choose a timber handling preference.");

    const stumpServiceSelected = form.services.includes("stumpGrinding");
    const stumpCount = Number.parseInt(form.stumpCount, 10);
    const averageStumpDiameter = Number.parseFloat(form.avgStumpDiameter);
    if (stumpServiceSelected) {
      if (!Number.isFinite(stumpCount) || stumpCount <= 0) {
        errors.push("Enter the approximate number of stumps for grinding.");
      }
      if (!Number.isFinite(averageStumpDiameter) || averageStumpDiameter <= 0) {
        errors.push("Enter the average stump diameter (inches) for grinding.");
      }
    }

    if (!form.permitAck) errors.push("Permit acknowledgment is required.");

    if (errors.length) {
      setStatus({ submitted: false, error: errors[0] });
      return;
    }

    let flags = buildAutoFlags(form, requiresTimberHandling);
    const hardStopMessage = getHardStopMessage(flags);
    if (hardStopMessage) {
      setStatus({ submitted: false, error: hardStopMessage });
      return;
    }

    const pricingSummary = calculatePricingSummary(form, requiresTimberHandling, labelMaps);
    const additionalFlags = [];
    if (pricingSummary.serviceImpactTotal > 0) additionalFlags.push("SERVICE_ADDONS_APPLIED");
    if (pricingSummary.capApplied) additionalFlags.push("DAILY_CAP_REACHED", "BUNDLED_SCOPE");
    flags = [...new Set([...flags, ...additionalFlags])];

    const suggestedAction = determineSuggestedAction(form, pricingSummary);
    const emailBody = buildInternalEmail({
      form,
      requiresTimberHandling,
      flags,
      suggestedAction,
      labelMaps,
      pricingSummary,
    });

    console.info("=== INTERNAL REVIEW EMAIL ===\n" + emailBody);
    setStatus({ submitted: true, error: "" });
  };

  return (
    <div className={`${styles.padding} max-w-6xl mx-auto quote-calculator`}>
      <p className={`${styles.sectionSubText} text-left sm:text-center text-forest-sage`}>Project Intake</p>
      <h2 className={`${styles.sectionHeadText} text-left sm:text-center`}>Project Estimate Request</h2>
      <p className="mt-4 text-stone-light text-base sm:text-lg max-w-4xl">
        Use this form to request a preliminary project estimate. This helps us confirm scope, access, terrain, and equipment suitability before scheduling.
      </p>
      <p className="mt-3 text-xs text-stone-mid sm:text-sm">
        Our work is equipment-intensive and best suited for full-scope projects. Minimum project sizes and terrain limitations apply.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8 bg-forest-dark/80 border border-stone-dark/40 rounded-2xl p-6 sm:p-8">
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Contact information</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Provide the best contact details for scheduling follow-up. Forms without complete contact info are not reviewed.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-stone-light mb-2">
                Full name
              </label>
              <input
                id="contact-name"
                name="fullName"
                value={form.fullName}
                onChange={handleFieldChange}
                autoComplete="name"
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-semibold text-stone-light mb-2">
                Phone number
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleFieldChange}
                autoComplete="tel"
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-email" className="block text-sm font-semibold text-stone-light mb-2">
                Email address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFieldChange}
                autoComplete="email"
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-stone-light">Property status</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {propertyStatusOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="radio"
                  name="propertyStatus"
                  value={option.value}
                  checked={form.propertyStatus === option.value}
                  onChange={handleFieldChange}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Project location</legend>
          <p className="text-xs text-stone-mid sm:text-sm">
            Project Location is the physical property where work occurs. Provide the street address or parcel description whenever possible. If the site has no formal address, enter the nearest city or community; we will mark the request as ADDRESS_APPROXIMATE.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="project-address" className="block text-sm font-semibold text-stone-light mb-2">
                Property address or parcel description
              </label>
              <input
                id="project-address"
                name="projectAddress"
                value={form.projectAddress}
                onChange={handleFieldChange}
                placeholder="123 Forest Rd, parcel 12, etc."
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="project-city" className="block text-sm font-semibold text-stone-light mb-2">
                City / nearest community
              </label>
              <input
                id="project-city"
                name="city"
                value={form.city}
                onChange={handleFieldChange}
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="project-county" className="block text-sm font-semibold text-stone-light mb-2">
                County
              </label>
              <input
                id="project-county"
                name="county"
                value={form.county}
                onChange={handleFieldChange}
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="distance-miles" className="block text-sm font-semibold text-stone-light mb-2">
                Distance from Stevensville, MT (one-way miles)
              </label>
              <input
                id="distance-miles"
                name="distanceMiles"
                type="number"
                min="1"
                step="0.5"
                value={form.distanceMiles}
                onChange={handleFieldChange}
                className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
              />
              <p className="mt-2 text-xs text-stone-mid sm:text-sm">
                Used for mobilization and mileage. Measure the one-way distance from Stevensville, MT directly to the project location—not a billing or mailing address.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Approximate area</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Estimates are based on area, vegetation density, and terrain.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {areaOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="radio"
                  name="area"
                  value={option.value}
                  checked={form.area === option.value}
                  onChange={handleFieldChange}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Requested services (select all that apply)</legend>
          <p className="text-xs text-stone-mid sm:text-sm">
            This list reflects CTL-capable scopes only. Each selection adds to the internal daily production total and may trigger review requirements.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-3 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.services.includes(option.value)}
                  onChange={() => handleCheckboxList("services", option.value)}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {form.services.includes("stumpGrinding") && (
          <fieldset className="space-y-3 rounded-2xl border border-stone-dark/40 bg-forest-mid/40 p-5">
            <legend className="text-lg font-semibold text-stone-light">Stump grinding details</legend>
            <p className="text-xs text-stone-mid sm:text-sm">
              Stump grinding is charged at $9 per inch of diameter measured at DBH (~4 ft). Provide estimated counts and average diameter for planning.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="stump-count" className="block text-sm font-semibold text-stone-light mb-2">
                  Approximate number of stumps
                </label>
                <input
                  id="stump-count"
                  name="stumpCount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.stumpCount}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="avg-stump-diameter" className="block text-sm font-semibold text-stone-light mb-2">
                  Average stump diameter (inches)
                </label>
                <input
                  id="avg-stump-diameter"
                  name="avgStumpDiameter"
                  type="number"
                  min="1"
                  step="0.5"
                  value={form.avgStumpDiameter}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg bg-white/95 text-black border border-stone-dark px-4 py-3 focus:border-forest-moss focus:ring-forest-moss focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </fieldset>
        )}

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Vegetation present (select all that apply)</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Mixed vegetation types may require staged methods, alternate tooling, or adjusted production rates.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {vegetationOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-3 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.vegetation.includes(option.value)}
                  onChange={() => handleCheckboxList("vegetation", option.value)}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Terrain</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Slopes over 18° may restrict mechanized mulching.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {terrainOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="radio"
                  name="terrain"
                  value={option.value}
                  checked={form.terrain === option.value}
                  onChange={handleFieldChange}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Ground conditions</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Saturated or soft ground changes production rates, scheduling priority, and tier selection.</p>
          <div className="flex flex-wrap gap-3">
            {groundConditionOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="radio"
                  name="groundCondition"
                  value={option.value}
                  checked={form.groundCondition === option.value}
                  onChange={handleFieldChange}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Access conditions</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Access limitations may affect equipment selection and pricing.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {accessOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="radio"
                  name="access"
                  value={option.value}
                  checked={form.access === option.value}
                  onChange={handleFieldChange}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-stone-light">Waterways / sensitive areas</legend>
          <p className="text-xs text-stone-mid sm:text-sm">Additional planning or permits may be required.</p>
          <div className="flex flex-wrap gap-3">
            {waterwaysOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="radio"
                  name="waterways"
                  value={option.value}
                  checked={form.waterways === option.value}
                  onChange={handleFieldChange}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-3">
          <label htmlFor="site-photos" className="text-lg font-semibold text-stone-light">
            Site photos (recommended)
          </label>
          <p className="text-xs text-stone-mid sm:text-sm">Photos significantly improve estimate accuracy and response time.</p>
          <input
            id="site-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full cursor-pointer rounded-lg border border-dashed border-stone-dark/30 bg-forest-mid/40 px-4 py-5 text-stone-light"
          />
          {form.photos.length > 0 && (
            <ul className="text-xs text-stone-mid sm:text-sm list-disc ml-6">
              {form.photos.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {requiresTimberHandling && (
          <fieldset className="space-y-4 rounded-2xl border border-forest-moss/40 bg-forest-dark/60 p-5">
            <legend className="text-lg font-semibold text-stone-light">Timber handling preference</legend>
            <p className="text-xs text-stone-mid sm:text-sm">
              When timber is present, handling method affects production rate, equipment use, and overall project cost.
            </p>
            <p className="text-xs text-stone-mid/80 sm:text-sm">
              Timber diameter is measured at approximately 4 feet above ground level (diameter at breast height, DBH), in accordance with standard forestry practices.
            </p>
            <div className="space-y-3">
              {timberHandlingOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex flex-col gap-1 rounded-lg border border-stone-dark/40 bg-forest-dark/60 px-4 py-3 text-stone-light cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="timberHandling"
                      value={option.value}
                      checked={form.timberHandling === option.value}
                      onChange={handleFieldChange}
                      className="accent-forest-moss"
                    />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <span className="text-xs text-stone-mid sm:text-sm ml-6">{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-stone-light">Access, drainage & compaction</legend>
          <p className="text-xs text-stone-mid sm:text-sm">
            Access creation may require drainage control, material placement, and ground compaction to support equipment and long-term use.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {supportOptions.map((option) => (
              <label
                key={option.value}
                className="flex gap-3 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-3 text-stone-light cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.supportNeeds.includes(option.value)}
                  onChange={() => handleCheckboxList("supportNeeds", option.value)}
                  className="accent-forest-moss"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2 rounded-lg border border-stone-dark/40 bg-forest-mid/40 px-4 py-4">
          <label className="flex items-start gap-3 text-stone-light">
            <input
              type="checkbox"
              checked={form.permitAck}
              onChange={(event) => setForm((prev) => ({ ...prev, permitAck: event.target.checked }))}
              className="mt-1 accent-forest-moss"
            />
            <span>
              I understand that property owners are responsible for obtaining any required permits prior to work.
              <span className="block text-xs text-stone-mid sm:text-sm">
                We may help identify likely permit types, but do not secure permits on behalf of owners.
              </span>
            </span>
          </label>
        </div>

        {status.error && <p className="text-sm text-rose-400">{status.error}</p>}
        {status.submitted && !status.error && (
          <p className="text-sm text-forest-sage">
            Request received. If the project meets scope and access requirements, we'll follow up with next steps.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!form.permitAck}
            className="bg-forest-moss hover:bg-forest-sage text-white font-semibold px-6 py-3 rounded-md transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Request Estimate Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteCalculator;
