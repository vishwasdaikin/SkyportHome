/**
 * Site content — edit here or paste in chat and we’ll update the site.
 *
 * Optional: add an image to any section by including:
 *   image: 'images/your-file.png',   (put the file in public/images/)
 *   imageAlt: 'Description for accessibility',
 */

/** Playbook metadata — update when you change the playbook */
export const playbookMeta = {
  lastUpdated: '2025-03-14',
  owner: 'Digital Strategy',
  whatsChanged: `2025-03-14 — Initial playbook with 5 sections
2025-03-14 — Added Last updated, Owner, What's changed`,
}

export const sections = [
  {
    title: "Creating the Digital Foundation for Scalable Growth",
    content: `Digital Strategy & Operating Playbook

Purpose: Define the operating model that enables scalable growth through long‑term homeowner and dealer engagement.

What this playbook enables:

• A consistent, always‑on experience across the homeowner and dealer lifecycle

• Engagement that spans before, during, and beyond install and replacement events

• The operating layer required to support scalable growth across products, services, and lifecycle value

• The foundation for repeat sales, loyalty, and lifetime value

Takeaway: This is the foundation for scalable growth and lifetime value — not a collection of apps.`,
  },
  {
    title: "Digital: The Opportunity",
    content: `Purpose: Explain why existing investments are not translating into full business impact

What's broken today:

• Tools, data, and features exist, but are fragmented across teams and platforms

• Emails, escalations, and tribal knowledge have become the default operating system

• We ship connected hardware and collect rich data, but gaps in usability, workflows, and orchestration limit how effectively that data is turned into action

• Fragmentation and known experience gaps keep adoption and engagement across SkyportHome and SkyportCare low — stalling the growth flywheel

• This inconsistency creates variable dealer experiences and reduces sales efficiency

• The Daikin brand experience varies based on who you ask and which tool you use

Takeaway: Fragmentation prevents adoption, engagement, and the product‑led growth flywheel that scales sales and lifetime value`,
  },
  {
    title: "Digital North Star",
    content: `Purpose: Define what we own to resolve fragmentation and enable scalable growth

What we own:

• End‑to‑end user journeys across homeowner, dealer, and sales‑facing experiences

• System and configuration clarity that removes ambiguity in FIT selling

• Workflow efficiency that reduces handoffs, rework, and delays

• Lifecycle intelligence across before install à install à operate à service à replace

• User and lifecycle analytics that translates behavior and system data into actionable insights

• A single, connected experience across apps, services, and data

• The operating system that enables Product, Channel, and Support to scale together across the lifecycle

What we do NOT own:

• FIT sales targets or quotas

• Individual hardware or controls sales objectives

Takeaway: Our role is to remove friction and enable scale — not to sell products directly`,
  },
  {
    title: "Current Situation: Controls & Connectivity",
    content: `Purpose: Establish the baseline reality and highlight where leverage exists today

What the data shows:

• Controls generated >$45M in FY24 revenue with continued growth

• ~320K thermostats sold, with ~56% connected to Wi‑Fi

• Only ~8% of connected systems have Cloud Services activated, limiting ongoing engagement

• A significant gap exists between connected and engaged

What this means:

• We already have a large connected installed base

• Engagement, not connectivity, is the binding constraint

• Closing the connected à engaged gap unlocks a scalable growth flywheel across sales, service, and lifecycle value

Takeaway: Engagement—not connectivity alone—is what unlocks product‑led growth, advocacy, and more connected systems over time`,
  },
  {
    title: "What Works / What Doesn't",
    content: `Purpose: Describe the current dealer and sales experience as it exists today

What We Do Well:

• A strong integrated FIT hardware portfolio with differentiated system performance

• A broad set of tools spanning selection, install, commissioning, warranty, service, and training

• A growing connected installed base with hundreds of thousands of deployed systems

• Rich operational and performance data across install, runtime, diagnostics, and energy behavior

What We Don't Do Well:

• The dealer experience is fragmented across too many tools

• System‑level clarity is not self‑serve, requiring emails, escalations, or cheat sheets

• Workflows break across lifecycle stages, rather than operating end‑to‑end

• Connected does not equal engaged, limiting ongoing value creation

• Execution is task‑driven, not outcome‑driven

Takeaway: We have the right capabilities, but they are not operating as a single system for dealers and sales`,
  },
  {
    title: "Key Gaps We Must Close",
    content: `Purpose: Identify the structural gaps preventing scale, consistency, and engagement

What's missing today:

• A single dealer platform that orchestrates end‑to‑end workflows across the full dealer lifecycle

• A cohesive dealer experience where workflows execute seamlessly across tools — instead of breaking into isolated, task‑based interactions

• Embedded system intelligence at the point of decision -- FIT & Controls compatibility, configuration guidance, and clear "what works with what" context

• Lifecycle intelligence that translates data into action, enabling proactive insights, recommendations, and timely interventions

• An outcome‑based operating cadence, with consistent KPI‑driven execution and feedback loops

Takeaway: The challenge is not capability — it's the absence of orchestration, embedded intelligence, and outcome‑driven execution`,
  },
  {
    title: "From Fragmented Execution to a Platform‑Led Operating Model",
    content: `Purpose: Define how we change the way we operate to close the identified gaps

What changes with this playbook:

• Shift from independent tools and local workarounds to a platform‑led operating model

• Move from task‑driven execution to theme‑based execution with clear KPIs

• Replace locally created cheat sheets with system‑generated, always‑current guidance

• Establish one platform as the authoritative source for configuration, workflows, and lifecycle actions

How we will operate going forward:

• The platform owns end‑to‑end system experience and orchestration

• Hardware domain teams own component‑level feature execution

• Product, configuration, and workflow logic are defined once and consumed everywhere

• Sales, dealers, support, and engineering operate from a single, platform‑defined source of truth through SkyportCare

• Changes are absorbed at the platform level, not redistributed to field teams

Takeaway: Shift from fragmented execution to a single, orchestrated operating model that scales`,
  },
  {
    title: "Digital DNA: Whole‑Home, Always‑On, LTV",
    content: `Purpose: Define how Daikin evolves to homeowner‑centric outcomes through platform‑led execution

What this operating model enables

• Homeowner‑centric experience and outcomes, delivered through dealer‑fulfilled execution

• Always‑on engagement beyond install and replacement events

• Whole‑home expansion across comfort, energy, and electrification

• Lifecycle intelligence across before install à install à operate à service à replace

• Repeat sales, loyalty, and lifetime value over decades

Digital DNA in practice:

• SkyportHome: Continuous homeowner engagement for comfort, system control, services, and lifecycle awareness

• SkyportCare: Dealer execution across install quality, diagnostics, service, and proactive lifecycle care

• E‑Platform: Consumer‑led demand capture and end‑to‑end job orchestration — Daikin sells the solution, dealers execute delivery

• SkyportEnergy: HEMS, demand response, and VPP participation — enabling grid programs, monetization, and fleet‑level optimization

Takeaway: Homeowner‑centric engagement creates the pull; platform‑led, dealer‑fulfilled execution delivers the scale`,
  },
];

/** Experiences page content (SkyportHome) */
export const experiencesContent = `Purpose: Show how homeowners remain engaged after connection, beyond the install moment

SkyportHome is the persistent homeowner experience layer once a system is connected - the homeowner's ongoing window into comfort, performance, and energy

What it is NOT:

• A sales funnel

• A one‑time setup app

• A thermostat control replacement

From As‑Is to To‑Be

• As‑Is

• Reactive homeowner behavior

• Limited visibility into system health

• Engagement spikes only when something breaks or needs attention

• To‑Be

• Continuous awareness and confidence

• Insights that explain what's happening and why

• Education that continues after installation

• A natural bridge to energy insights and whole‑home improvements

What SkyportHome enables

• Peace of mind through visibility and explanation, giving homeowners confidence in system operation

• Ongoing understanding and optimization awareness, helping homeowners learn how comfort, usage, and energy interact over time

• Stronger trust in the dealer relationship, by making dealer‑led service, maintenance, and recommendations transparent and easy to understand

• A foundation for SkyportEnergy and whole‑home expansion, enabling energy awareness and future participation

Takeaway: SkyportHome turns ownership into an ongoing relationship, not a one‑time event`;

/** Experiences page content (SkyportCare) */
export const skyportCareContent = `Purpose: Show how dealers operationalize homeowner engagement consistently and profitably

SkyportCare is the dealer operating layer across the full lifecycle - the system dealers rely on, not another optional tool.

• Across the full lifecycle: Install → Service → Maintenance → Replacement

• Over time, SkyportCare extends upstream to surface pre‑sales and sales context — guided selection, quote support, and replacement signals.

From As‑Is to To‑Be

• As‑Is

• Fragmented tools and workflows

• Reactive service models

• Manual follow‑ups and tribal knowledge

• Inconsistent homeowner experiences

• To‑Be

• One dealer front door

• Guided, data‑backed workflows

• Proactive service and maintenance

• Consistent, trusted homeowner communication

• Scalable service and revenue model

What SkyportCare enables

• Reduced unnecessary truck rolls

• Higher service efficiency

• Stronger, long-term dealer‑homeowner trust

• Lifecycle‑driven revenue (maintenance, upgrades, replacement)

Takeaway: SkyportCare enables dealers to scale trust, service, and lifetime value`;

/** Experiences page content (E‑Platform) */
export const ePlatformContent = `Purpose: Show how the E‑Platform captures demand early and routes it to dealer‑fulfilled execution.

The E‑Platform fills the pre‑engagement gap that exists today and serves as the digital front porch for homeowners who are:

• Not yet ready to buy

• Unsure who to trust

• Exploring HVAC or broader whole‑home solutions

What the E‑Platform enables: End‑to‑end solution orchestration — Daikin sells the job; dealers execute installation and service

• Education: Clear, unbiased guidance to reduce confusion and misinformation

• HVAC, comfort, and efficiency

• Electrification and energy concepts

• Costs, incentives, and tradeoffs

• Inspiration: Helps homeowners imagine:

• A more comfortable home

• Lower energy costs

• A pathway to electrification and sustainability

• Trust building

• Positions Daikin as a long‑term advisor, not just a product vendor

• Creates confidence to commit to a dealer-fulfilled solution

Operating principle: The E‑Platform does not replace dealers. It:

• Captures intent earlier

• Educates homeowners

• Routes demand to dealer‑fulfilled solutions

Takeaway: The E‑Platform creates informed demand; dealers deliver execution and service`;

/** Experiences page content (SkyportEnergy) */
export const skyportEnergyContent = `Purpose: Clarify SkyportEnergy's role as an advanced extension of the platform — not a prerequisite for core execution

What SkyportEnergy is

• A Home Energy Management System (HEMS)

• Enables:

• Demand response

• VPP participation

• Utility and aggregator programs

• Built on the same platform, data, and lifecycle intelligence

What SkyportEnergy is NOT:

• Not required for every homeowner

• A replacement for SkyportHome

Homeowner participation is optional and is based on eligibility and timing

Why it matters

• Monetization beyond hardware through energy and whole‑home services

• Grid participation that enables new utility‑backed value streams

• Differentiation and expansion into whole‑home technologies over time

Takeaway: SkyportEnergy extends the lifecycle into grid‑interactive and monetized use cases — once the foundation is in place`;

/** Platform page content */
export const platformContent = `Purpose: Make the platform decision that enables consistent execution across all dealer‑executed work, regardless of how demand is captured.

The strategic decision:

• SkyportCare is the single platform enabling dealer‑fulfilled execution across workflows and lifecycle actions

• Sales, dealers, and support operate through a shared, platform‑defined execution experience

• SkyportCare serves as the authoritative, always‑current source of truth for configuration, execution context, and dealer‑fulfilled actions

Why this matters:

• Eliminates tool choice and local reference decks

• Updates occur once and propagate everywhere

• Consistency improves across dealers, sales, support, and engineering

What does NOT change:

• Existing tools are not eliminated

• Ownership of systems of record remains intact

• This is experience orchestration, not tool replacement

Takeaway: One platform creates consistency, scale, and confidence across the dealer lifecycle`;

/** Platform page — section 2 */
export const platformContent2 = `This operating model supports all demand sources — dealer‑led, E‑Platform‑led, and future energy programs — without changing how dealers work.

Tool Orchestration Model: Front Door vs. Backend

Purpose: Explain how the platform decision works in practice without changing ownership of product domains






Front Door (Dealer & Sales Experience): SkyportCare

• Single entry point for dealer execution workflows and platform‑surfaced sales context

• Guided, end‑to‑end experience across the lifecycle

• System‑generated guidance that is always current

Backend Capabilities

• Existing configuration, lifecycle, and analytics systems remain the systems of record and retain domain authority

• The Digital Platform manages data access, orchestration, and intelligent use to deliver consistent execution and experiences.

Operating Principle: Logic is defined once and surfaced consistently everywhere

Takeaway: One front door simplifies work while preserving existing system ownership

Dealer Workflow: Today vs. Future

Purpose: Show how the platform‑led operating model changes day‑to‑day dealer behavior

TODAY — Inconsistent, Installer‑Defined Workflow

• Selection and compatibility verified manually

• Install and commissioning vary by installer

• Service and upgrades identified late or reactively

FUTURE — Platform‑Led, Default Workflow

• Selection and configuration guided in‑workflow

• Quality Install becomes the default commissioning path

• Continuous visibility enables proactive service and earlier upgrades

Takeaway: The platform defines the standard, eliminating variability without changing hardware`;

/** Platform page — section 3 */
export const platformContent3 = `Purpose: Show how E‑Platform, SkyportHome, SkyportCare and SkyportEnergy work together as one connected system across the full homeowner lifecycle.

The Daikin digital ecosystem is built on a single platform with multiple experience surfaces, powered by shared data, logic, and intelligence.

E‑Platform

• Engages homeowners early through education, inspiration, and trust building

• Serves emergency replacers, HVAC seekers, and whole‑home seekers

• Routes demand to dealer‑fulfilled execution

SkyportHome (Homeowner Surface)

• Always‑on engagement after connection

• Comfort and system visibility, education, and insights

• Energy and whole‑home awareness over time

SkyportCare (Dealer Surface)

• Dealer operating system across the lifecycle

• Quality installation, proactive service, and maintenance

• Data‑backed homeowner communication and lifecycle revenue

SkyportEnergy (HEMS)

• Executes demand response, VPP participation, and energy programs

• Extends engagement into grid‑interactive and monetized use cases

Foundational principle: Different users. Different interfaces. Shared intelligence.

• One system of record

• One set of rules and logic

• One lifecycle view

• Multiple tailored experiences

Takeaway: One platform orchestrates the entire lifecycle — from discovery to decades of ownership`;

/** Platform page — section 4 */
export const platformContent4 = `Purpose: Surface the opportunity to simplify the digital experience now that a platform front door exists

What We See Today: Multiple front‑end tools exist (Matchup Xpress, TechHub, DaikinCity & more) across the dealer lifecycle, each created to solve valid point‑in‑time needs

What the Platform Enables

• SkyportCare as the single front door for dealer and sales workflows

• APIs and services that allow tools to function as capabilities, not destinations

• Consistent, end‑to‑end execution across the lifecycle, regardless of which tools power the workflow

The Opportunity

Systematically review each tool to understand why it exists, who it serves, and whether it truly requires its own UI

Identify candidates to:

• Be embedded into the platform

• Be merged with adjacent capabilities

• Remain standalone where justified

Takeaway: The platform does not eliminate tools — it creates the opportunity to simplify the experience by consolidating front ends and elevating shared capabilities`;

/** Lifecycle & Growth page content */
export const lifecycleGrowthContent = `Purpose: Show how platform‑led dealer execution creates long‑term homeowner value

Install & Onboard

• Quality install and commissioning completed through SkyportCare

• Homeowner connected via SkyportHome with a persistent, lifecycle system record

Operate & Optimize

• Continuous visibility into comfort, usage, and system health

• Insights replace reactive troubleshooting and build trust

Service & Care

• Proactive alerts reduce unnecessary truck rolls

• Dealer becomes the trusted, default service provider

• Maintenance and extended service attach naturally

Upgrade & Expand

• Earlier identification of end‑of‑life and upgrade opportunities

• Expansion into energy and whole‑home solutions

• Loyalty and advocacy increase over time

Engagement loop: Connect à Monitor à Optimize à Service à Upgrade à Repeat

Takeaway: Always‑on, dealer‑led engagement turns one‑time installs into lifetime value`;

/** Lifecycle & Growth page — section 2 */
export const lifecycleGrowthContent2 = `Purpose: Clarify how different homeowner entry paths converge into one lifecycle and LTV engine

Two primary entry paths

1. Dealer‑Led Entry (Today's core path)

Homeowners who start with a trusted contractor

• Typically emergency or near‑term replacers

• System failure or performance issue drives immediate action

• Homeowner engages a dealer first

• Installation and onboarding occur immediately

• Homeowner is connected via SkyportHome

2. E‑Platform‑Led Entry (Growth path)

• Homeowners start digitally with different intents:

• Emergency replacers (need solution now: seek speed, clarity & trusted path forward)

• HVAC seekers (actively learning, comparing comfort, efficiency & cost)

• Whole‑home seekers (broader energy solutions, electrification, planning)

• Daikin educates, builds trust, and routes demand

• All outcomes lead to dealer‑fulfilled execution

Key principle: Different intents. Different starting points. One connected lifecycle. All paths converge into:

• A dealer‑fulfilled installation

• A shared system record

• The same homeowner lifecycle and engagement loop

Takeaway: The E‑Platform captures demand early; dealers deliver trust and execution`;

/** Metrics page content */
export const metricsContent = `Purpose: Show how digital experience and platform execution enable scalable growth across hardware, services, and lifecycle value — without owning revenue targets

What Digital Ownership Enables

• The growth engine that turns installed base into engaged, repeat customers

• The operating model that makes activation, engagement, and execution the default

• The platform layer that scales value across products, channels, and services

Digital does not own revenue targets — it owns the growth engine that makes those targets achievable and scalable.

Growth Levers Digital Enabled by Platform

• SkyportHome: Higher activation and sustained homeowner engagement

• SkyportCare: Improved dealer efficiency and stronger service attachment

• E‑Platform: Earlier, better‑qualified demand capture

• SkyportEnergy: Incremental post‑install monetization through energy programs

What This Unlocks

• Higher utilization of the connected installed base

• More predictable sales, replacement, and upgrade cycles

• More service and energy value without more truck rolls

Where the Growth Shows Up

• Hardware (FIT systems, thermostats, controls, and accessories): Higher close rates & attachment driven by earlier, better‑informed homeowners

• Services (maintenance attach, lifecycle upgrades, and retention): Higher service penetration driven by ongoing, proactive engagement

• Future:

• Expansion into whole‑home and adjacent solution categories over time

• Energy programs, HEMS, and grid‑interactive offerings

Takeaway: Digital doesn't replace product growth plans — it makes them repeatable and scalable`;

/** Capability Depth appendix — SkyportHome section */
export const capabilityDepthSkyportHomeContent = `Purpose: Show SkyportHome is concrete and intentional, without listing every feature.

Homeowner Visibility & Peace of Mind

• System status & health visibility

• Runtime, mode, and performance transparency

• Alerts and explanations that build trust

Comfort & Performance Insights

• Personalized comfort optimization

• Sensor‑driven awareness (RHT, zoning)

• Intelligent scheduling and behavior learning

Energy Awareness & Optimization

• Energy usage and trend visibility

• Cost and efficiency insights

• Foundations for demand response, TOU, and future HEMS integration

Education & Guidance After Install

• In‑app explanations and recommendations

• Plain‑language diagnostics and insights

• Ongoing learning beyond the install event

Whole‑Home & Energy Expansion

• HVAC as the anchor, not the ceiling

Takeaway: SkyportHome turns ownership into an ongoing relationship.`;

/** Capability Depth appendix — SkyportCare section */
export const capabilityDepthSkyportCareContent = `Purpose: Clarify SkyportCare's dealer value, not just its features.

Install Quality & Commissioning

• Guided commissioning workflows

• Validation against system requirements

• Data‑backed proof of quality install

Proactive Diagnostics & Maintenance

• Remote diagnostics and monitoring

• Predictive maintenance signals

• Reduced unnecessary truck rolls

Dealer Workflow Efficiency

• Single front door for lifecycle activities

• Clear prioritization and insights

• Reduced reliance on tribal knowledge

Homeowner Communication & Trust

• Dealer‑branded reports and insights

• Clear explanations homeowners can understand

• Stronger, longer‑term relationships

Lifecycle Revenue Enablement

• Maintenance agreement support

• Upgrade and replacement timing insights

• Predictable, scalable service revenue

Takeaway: SkyportCare enables dealers to scale trust and service profitably.`;
