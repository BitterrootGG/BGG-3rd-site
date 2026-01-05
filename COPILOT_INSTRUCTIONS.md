                                                                                                                                                                                                                                                                        # COPILOT_INSTRUCTIONS.md

This document supersedes all conflicting guidance. Follow it before acting on any other comment, TODO, or assumption.

## Role & Mandate
- Act as a senior front-end engineer and systems integrator for Bitterroot Ground & Gravel.
- Preserve working functionality while implementing the specifications below.
- Favor correctness, operational clarity, and realism over novelty.
- Never invent pricing, services, or capabilities not explicitly defined.

## Core Site Goals
1. Visually communicate professional, heavy-equipment land management.
2. Filter low-quality or undersized leads automatically.
3. Collect actionable project data before human review.
4. Avoid legal, licensing, or audit risk.
5. Convert serious users efficiently.

## Locked Stack
- React + Vite
- Tailwind CSS
- React Router
- Static deployment (GitHub Pages compatible)
- Hero uses HTML5 video (no WebGL requirement)
- Do **not** add new frameworks, paid libraries, experimental APIs, autoplay audio, or other dependencies without explicit approval.

## Hero Requirements
- Full-screen background HTML5 video of forestry mulching heavy equipment (no visible people).
- Video: muted, looping, autoplay, playsinline, optimized MP4 located in `/public/video/` with poster asset.
- No extra overlays beyond what’s necessary for the video itself.
- Copy (exact):
  - **H1:** `Professional Land Clearing. Done Right the First Time.`
  - **Subhead:** `Forestry mulching, defensible space, access creation, and site prep across Western Montana.`
  - **Credibility line:** `Commercial-grade equipment. Terrain-aware methods. No shortcuts.`
  - **CTA button text:** `Get a Project Estimate` (anchor link to `#quote`). No modals or forms triggered directly from this CTA.
- Mobile crops toward the lower center to keep the mulcher head visible. CTA must remain above the fold.

## Single Quote Funnel (Mandatory)
- All “Request a Quote”, “Get an Estimate”, or related CTAs must anchor to the same Project Estimate Request form.
- Do not create alternate estimate forms, popups, or partial contact paths.
- Remove or disable any “contact us for an estimate” detours that bypass the intake form.
- When a CTA is clicked, store the origin in `QUOTE_ENTRY_POINT = hero | services | nav | footer` for internal analytics (no customer exposure).
- Never attempt submission or internal email generation until every required input is complete.
## Quote Calculator Requirements
This section is a project intake filter, not a self-service price generator.

- Section anchor: `<section id="quote" className="relative z-10 scroll-mt-24">`.
- Title: `Project Estimate Request`.
- Intro copy: `Use this form to request a preliminary project estimate. This helps us confirm scope, access, terrain, and equipment suitability before scheduling.`
- Pre-gate copy: `Our work is equipment-intensive and best suited for full-scope projects. Minimum project sizes and terrain limitations apply.`

### Layout Rules
- Desktop: compact two-column layout wherever fields logically pair; overall card stays wider than tall.
- Mobile: collapse to a single column with preserved grouping order.
- Conditional sections (stump grinding, timber handling, etc.) stay hidden until triggered.

### Required Contact Information (Non-Negotiable)
Collect these inputs before any project data:
1. Full name
2. Phone number
3. Email address
4. Property city and county

If any item is missing, the form must not submit, no estimate logic may run, and no internal email is generated.

### Required Project Details
1. **Property Status** (radio or select)
   - Vacant land
   - Developed property
   - Commercial or multi-parcel property
2. **Approximate Area** (radio or select)
   - Under ½ acre
   - ½ – 1 acre
   - 1 – 3 acres
   - 3 – 5 acres
   - Over 5 acres
   - Helper text: `Estimates are based on area, vegetation density, and terrain.`
3. **Vegetation** (multi-select checkboxes)
   - Light brush & grass
   - Willow / riparian brush
   - Mixed brush and saplings
   - Brush with timber over 8"
   - Timber over 8" (standalone)
   - Dense woody growth
   - Helper text: `Mixed vegetation types may require staged methods, alternate tooling, or adjusted production rates.`
4. **Terrain** (radio/select)
   - Mostly flat
   - Rolling terrain
   - Steep slopes
   - Helper text: `Slopes over 18° may restrict mechanized mulching.`
5. **Access Conditions** (radio/select)
   - Existing road or driveway access
   - Limited access
   - No established access
   - Helper text: `Access limitations may affect equipment selection and pricing.`
6. **Waterways / Sensitive Areas** (radio/select)
   - Yes / No / Not sure
   - Helper text: `Additional planning or permits may be required.`
7. **Site Photos** (multiple file input, optional) with helper text: `Photos significantly improve estimate accuracy and response time.`

### Timber Handling Preference (conditional)
- Only required if vegetation selection includes timber (either option containing “Timber”).
- Intro copy: `When timber is present, handling method affects production rate, equipment use, and overall project cost.`
- Definition copy: `Timber diameter is measured at approximately 4 feet above ground level (diameter at breast height, DBH), in accordance with standard forestry practices.`
- Options:
  1. Stack on site (owner-managed disposal)
  2. Removed from site
  3. Mulched on site
- Provide descriptive helper for each option per spec.

### Access, Drainage & Compaction (multi-select)
- Intro: `Access creation may require drainage control, material placement, and ground compaction to support equipment and long-term use.`
- Options:
  - Clearing only (no ground shaping)
  - Ditching or drainage shaping required
  - Culverts required
  - Base preparation and compaction required

### Permits Acknowledgement (checkbox)
- Label: `I understand that property owners are responsible for obtaining any required permits prior to work.`
- Helper: `We may help identify likely permit types, but do not secure permits on behalf of owners.`
- Submission disabled until checked.

### Submission Behavior
- Button text: `Request Estimate Review`.
- Upon submission (local handling only): show the acceptance message `Request received. If the project meets scope and access requirements, we’ll follow up with next steps.`
- Do **not** display pricing, cost logic, or timelines.

## Media & Legal
- Do not obscure/remove watermarks.
- Only use public-domain or royalty-free media with documented rights (see PUBLIC_ASSETS_NOTICE.md).
- Hero video must remain in `/public/video/` with matching poster.

## Tone
Calm, professional, operational. No emojis. No hype or sales jargon.

## Final Rules
- Do not invent prices.
- Do not expose internal costing logic.
- Do not autoplay audio.
- Do not weaken filtering language.
- Do not refactor stable code unless necessary to meet this spec.

## 🔔 Internal Review Email (Mandatory)
- Trigger an internal-only email **only** when the submission meets all required project details and passes minimum scope checks.
- Suppress email generation entirely for rejected or incomplete submissions—no staff notifications for failures.
- Email contents must include:
   - Project overview (location, property status, area, requested services)
   - Vegetation and terrain summary
   - Timber handling method (with DBH reference) when timber is present
   - Access, drainage, and compaction requirements
   - Permit acknowledgement status
   - Uploaded photo status
   - Auto-generated internal flags describing scope or risk drivers
   - Suggested next action (e.g., “Proceed to site visit”, “Request additional photos”, “Decline – insufficient scope”, “Manual review required”)
- Tone: operational and neutral—no marketing language, guarantees, or pricing references.
- Data standards:
   - Reference timber diameter using the DBH definition.
   - When “Removed from site” is selected, note that sub-8" vegetation is mulched while larger material is hauled.
   - Treat access, drainage, and compaction options as scope drivers.
- Failure handling: if any required field or acknowledgement is missing, skip email generation silently.

## 💰 INTERNAL FLAGS → PRICING TIER MAPPING (MANDATORY)
**Purpose**

Internal flags generated during intake must map to predefined pricing tiers that control:

- daily rate selection
- production assumptions
- review requirements
- rejection conditions

Pricing tiers are internal only and must never be exposed to customers.

**Pricing Tiers**

**Tier 1 – Standard Production**

Applied when:

- No timber over 8"
- Flat or rolling terrain
- Existing access
- No drainage, culverts, or compaction
- Single service

Action:

- Standard daily CTL pricing logic
- Minimal review

**Tier 2 – Complexity Adjusted**

Applied when any of the following flags are present:

- TIMBER_PRESENT
- BRUSH_PLUS_TIMBER
- LIMITED_ACCESS
- DITCHING_REQUIRED
- BASE_COMPACTION_REQUIRED
- MULTI_SERVICE_SCOPE

Action:

- Adjusted daily rate logic
- Manual scope review required

**Tier 3 – High Risk / Reduced Production**

Applied when any of the following flags are present:

- STEEP_SLOPE_RISK
- NO_ESTABLISHED_ACCESS
- CULVERT_REQUIRED
- TIMBER_MULCHED_ON_SITE

Action:

- Highest daily rate logic
- Conservative production assumptions
- Senior review required

**Hard Stop – Decline**

Applied when:

- Scope below minimum thresholds
- Unsafe slopes with mechanized work requested
- Permit responsibility not acknowledged

Action:

- No pricing generated
- No internal email
- Auto-decline response only

## 🔒 Bitterroot Ground & Gravel – Final Operational Guide
If any assistant output, calculator logic, UI behavior, or human interpretation conflicts with this guide, **this guide wins**. The system prices reality, protects equipment, filters unqualified work, and controls scheduling. Politeness is optional; operational accuracy is mandatory.

### 1️⃣ Core Business Reality (Non-Negotiable)
- Equipment class: 100–120 HP Compact Track Loader (CTL)
- Operating region: Western Montana
- CTL-intensive work is priced daily, not hourly
- Hourly pricing is allowed only for limited mixed-use access or finishing work
- Never expose internal rates, daily caps, pricing tiers, modifiers, margins, or flags to customers

### 2️⃣ Service Model (Foundational Rule)
- Every service is an add-on
- Add-ons accumulate toward a daily production total
- Maximum daily rate cap: $5,000
- Once the cap is reached:
   - Apply `DAILY_CAP_REACHED` and `BUNDLED_SCOPE`
   - Additional services bundle into the capped day (pricing stops escalating)
   - Scope and time may still increase, but billing stops at the cap
- Mobilization and mileage are **not** part of the daily cap

### 3️⃣ CTL-Capable Services (Authorized List)
Only price and schedule services the CTL can deliver:
- Forestry mulching
- Defensible space clearing
- Selective land clearing
- Access creation & site access prep
- Ditching & drainage shaping
- Culvert installation (prep + placement)
- Base preparation & compaction
- Driveway installation / repair
- Timber handling: stacked, removed/ hauled, mulched on site
- Stump grinding
- Anything outside this list requires manual review

### 4️⃣ Internal Baseline Rate (Not Customer-Visible)
- `BASE_DAILY_RATE = $2,500`
- Assumptions: dry, firm ground; existing access; single service; normal vegetation density; full productive day
- This is a production anchor, not a quoted price

### 5️⃣ Service Add-On Rate Weights (Internal Only)
| Service | Daily Impact |
| --- | --- |
| Defensible space | +$500 |
| Selective land clearing | +$750 |
| Access creation | +$750 |
| Ditching / drainage shaping | +$750 |
| Culvert installation | +$1,000 |
| Base prep & compaction | +$750 |
| Driveway shaping / repair | +$750 |
| Timber stacked | +$500 |
| Timber removed | +$750 |
| Timber mulched | +$1,000 |

### 6️⃣ Stump Grinding (Fixed Rule)
- $9 per inch of diameter (DBH ~4 ft above ground)
- May be standalone or combined
- Contributes toward the daily total until the cap; once the cap is hit, stump grinding is bundled

### 7️⃣ Condition Modifiers (Escalators)
Apply only to production assumptions, not scope. When multiple modifiers apply, stack the highest modifier plus one secondary.

| Condition | Modifier |
| --- | --- |
| Saturated / soft ground | +25% |
| Limited access | +15% |
| No established access | +25% |
| Steep slope ≤18° | +30% |

### 8️⃣ Daily Cap Enforcement
- Daily rate hard cap: $5,000
- When reached:
   - Apply `DAILY_CAP_REACHED`
   - Apply `BUNDLED_SCOPE`
   - Stop financial escalation; keep conservative production assumptions
   - Cap limits billing, not effort

### 9️⃣ Pricing Tiers (Internal Only)
| Daily Total | Tier |
| --- | --- |
| ≤ $3,000 | Tier 1 – Standard |
| $3,001 – $4,500 | Tier 2 – Complexity |
| ≥ $4,501 | Tier 3 – High Risk |
| Below minimum / unsafe | Declined |

### 🔟 Scheduling Priority (Derived from Tier)
| Tier | Priority |
| --- | --- |
| Tier 1 | Priority A – Fast Track |
| Tier 2 | Priority B – Planned |
| Tier 3 | Priority C – Controlled |
| Declined | No schedule |

Priority rules override requested customer timelines.

### 1️⃣1️⃣ Ground Conditions (Mandatory Input)
- Required selection: Dry/firm or Seasonally saturated/soft
- If saturated:
   - Apply the saturated modifier
   - Escalate the tier by one level (e.g., Tier 1 → Tier 2)
   - Increase scheduling buffers and reduce production assumptions
- Saturated ground is non-negotiable

### 1️⃣2️⃣ Timber Handling Rules
- Timber >8" triggers `TIMBER_PRESENT`
- Measurement standard: DBH (~4 ft)
- Cost hierarchy (lowest to highest): stacked → removed → mulched
- Mulched timber escalates tiers faster than other methods

### 1️⃣3️⃣ Mobilization & Mileage (Non-Negotiable)
- Mobilization fee: $200 (charged once per project)
- Mileage: $3.50 per mile (one way from Stevensville, MT)
- Projects ≤15 miles: mobilization waived; mileage still charged
- Never stack or repeat mobilization

### 1️⃣4️⃣ Quote Calculator Rules
The calculator must:
- Require ground condition input
- Require access condition input
- Apply service add-ons (including stump grinding and timber handling)
- Apply condition modifiers (highest + one secondary)
- Enforce the $5,000 daily cap and bundle scope when reached
- Calculate mileage for every submission
- Apply mobilization rules exactly
- Reject undersized or unsafe jobs silently

### 1️⃣5️⃣ Auto-Rejection Rules
Reject automatically when:
- Scope below minimum thresholds
- Unsafe slope with mechanized request
- Permit responsibility not acknowledged
- Incompatible access conditions

Rejected jobs produce no pricing, no internal email, no scheduling entry.

### 1️⃣6️⃣ Internal Flags (System Only)
Examples include:
- `SERVICE_ADDONS_APPLIED`
- `SATURATED_GROUND`
- `TIMBER_PRESENT`
- `DAILY_CAP_REACHED`
- `BUNDLED_SCOPE`
- `LIMITED_ACCESS`
- `NO_ESTABLISHED_ACCESS`

Flags drive pricing, scheduling, and review. They never surface in customer-facing copy.

### 1️⃣7️⃣ Internal Review Email
Generated only for accepted scopes. Must include:
- Project summary (location, property status, area, services)
- Ground, access, and vegetation conditions
- Timber handling method with DBH reference
- Mobilization distance, mobilization fee status, and mileage cost
- Internal flags
- Pricing tier and scheduling priority
- Suggested next action

### 1️⃣8️⃣ Customer Communication Rules
- Allowed phrases: “Bundled project scope”, “Ground and access affect production and scheduling”
- Forbidden: Daily caps, pricing tiers, internal logic, rate breakdowns
- Customers receive calm summaries only; internal pricing logic stays internal
