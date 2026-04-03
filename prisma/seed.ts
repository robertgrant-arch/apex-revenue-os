// 5. prisma/seed.ts
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed…");

  // ─── Clean existing data ────────────────────────────────────────────────────
  await prisma.complianceFlag.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log("  ✓ Cleared existing data");

  // ─── Organization ───────────────────────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "APEX Demo Corp",
      slug: "apex-demo",
      plan: "ENTERPRISE",
      settings: {
        timezone: "America/New_York",
        currency: "USD",
        fiscalYearStart: "01-01",
      },
    },
  });
  console.log(`  ✓ Created organization: ${org.name}`);

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);
  const adminUser = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "demo@apex.io",
      password: hashedPassword,
      role: "ADMIN",
      organizationId: org.id,
      emailVerified: new Date(),
      image: null,
    },
  });
  console.log(`  ✓ Created admin user: ${adminUser.email}`);

  // Second user for assignment variety
  const agentUser = await prisma.user.create({
    data: {
      name: "Jordan Kim",
      email: "jordan@apex.io",
      password: await bcrypt.hash("password123", 12),
      role: "USER",
      organizationId: org.id,
      emailVerified: new Date(),
    },
  });

  // ─── Campaigns ──────────────────────────────────────────────────────────────
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: "Q1 Solar Homeowners",
        description:
          "Targeting homeowners in sun-belt states with high utility bills",
        type: "OUTBOUND",
        status: "ACTIVE",
        budget: 45000,
        spent: 18320,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-03-31"),
        targetVertical: "SOLAR",
        organizationId: org.id,
        createdBy: adminUser.id,
        metrics: {
          impressions: 142000,
          clicks: 8900,
          leads: 312,
          conversions: 47,
          cpl: 58.72,
          cpa: 389.79,
        },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Medicare Advantage Spring Push",
        description: "Annual enrollment period follow-up campaign",
        type: "INBOUND",
        status: "ACTIVE",
        budget: 30000,
        spent: 22100,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-04-30"),
        targetVertical: "INSURANCE",
        organizationId: org.id,
        createdBy: adminUser.id,
        metrics: {
          impressions: 98000,
          clicks: 6200,
          leads: 278,
          conversions: 61,
          cpl: 79.5,
          cpa: 362.3,
        },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Home Equity Refi Wave",
        description:
          "Rate-and-term refinance leads targeting equity-rich homeowners",
        type: "OUTBOUND",
        status: "PAUSED",
        budget: 60000,
        spent: 31450,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
        targetVertical: "MORTGAGE",
        organizationId: org.id,
        createdBy: agentUser.id,
        metrics: {
          impressions: 210000,
          clicks: 12400,
          leads: 431,
          conversions: 38,
          cpl: 73.0,
          cpa: 827.63,
        },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Personal Injury Intake Q2",
        description: "Auto accident PI lead generation via search & social",
        type: "INBOUND",
        status: "DRAFT",
        budget: 25000,
        spent: 0,
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-06-30"),
        targetVertical: "LEGAL",
        organizationId: org.id,
        createdBy: adminUser.id,
        metrics: {},
      },
    }),
  ]);
  console.log(`  ✓ Created ${campaigns.length} campaigns`);

  // ─── Creatives ──────────────────────────────────────────────────────────────
  const creativeTemplates = [
    {
      name: "Solar Savings Calculator Hero",
      type: "LANDING_PAGE",
      status: "ACTIVE",
      campaignId: campaigns[0].id,
      headline: "Cut Your Electric Bill by 70%",
      body: "See exactly how much you could save with solar. Free instant estimate – no sales pressure.",
      cta: "Calculate My Savings",
      metrics: { views: 48200, clicks: 3140, conversions: 187, ctr: 6.51 },
    },
    {
      name: "Solar Facebook Video Ad",
      type: "VIDEO",
      status: "ACTIVE",
      campaignId: campaigns[0].id,
      headline: "Neighbors Are Going Solar For $0 Down",
      body: "Federal tax credit covers 30%. Lock in today's rates before incentives expire.",
      cta: "Get Free Quote",
      metrics: { views: 93800, clicks: 5760, conversions: 125, ctr: 6.14 },
    },
    {
      name: "Medicare Comparison Chart",
      type: "DISPLAY",
      status: "ACTIVE",
      campaignId: campaigns[1].id,
      headline: "Compare Medicare Plans in 60 Seconds",
      body: "Find the plan with the best coverage for your doctors and prescriptions at no cost.",
      cta: "Compare Now",
      metrics: { views: 31400, clicks: 1890, conversions: 94, ctr: 6.02 },
    },
    {
      name: "Medicare Phone Script v3",
      type: "SCRIPT",
      status: "ACTIVE",
      campaignId: campaigns[1].id,
      headline: "Medicare Advantage Benefits Review",
      body: "Hi, I'm calling to help you understand additional Medicare benefits you may be eligible for this year...",
      cta: null,
      metrics: { calls: 840, connects: 412, conversions: 61, connectRate: 49.0 },
    },
    {
      name: "Refi Rate Alert Email",
      type: "EMAIL",
      status: "PAUSED",
      campaignId: campaigns[2].id,
      headline: "Rates Just Dropped — Lock Yours In",
      body: "Your home may qualify for a lower rate. With your current equity, you could save $400/month.",
      cta: "Check My Rate",
      metrics: { sent: 12400, opens: 3100, clicks: 620, conversions: 22, openRate: 25.0 },
    },
    {
      name: "Refi Pre-Qualification Form",
      type: "FORM",
      status: "PAUSED",
      campaignId: campaigns[2].id,
      headline: "Pre-Qualify in 2 Minutes",
      body: "No hard credit pull. See your rate options from top lenders instantly.",
      cta: "Pre-Qualify Now",
      metrics: { views: 8900, starts: 2100, completions: 431, completionRate: 20.5 },
    },
    {
      name: "PI Case Value Calculator",
      type: "LANDING_PAGE",
      status: "DRAFT",
      campaignId: campaigns[3].id,
      headline: "What Is Your Injury Case Worth?",
      body: "Get a free case value estimate. Our attorneys have recovered over $500M for clients like you.",
      cta: "Get Free Case Review",
      metrics: {},
    },
    {
      name: "PI Social Proof Carousel",
      type: "DISPLAY",
      status: "DRAFT",
      campaignId: campaigns[3].id,
      headline: "Real Clients. Real Settlements.",
      body: "See what our attorneys recovered for accident victims in your area.",
      cta: "See Results",
      metrics: {},
    },
  ];

  const creatives = await Promise.all(
    creativeTemplates.map((c) =>
      prisma.creative.create({
        data: {
          name: c.name,
          type: c.type,
          status: c.status,
          campaignId: c.campaignId,
          organizationId: org.id,
          content: {
            headline: c.headline,
            body: c.body,
            cta: c.cta,
          },
          metrics: c.metrics,
          createdBy: adminUser.id,
        },
      })
    )
  );
  console.log(`  ✓ Created ${creatives.length} creatives`);

  // ─── Agents ─────────────────────────────────────────────────────────────────
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: "APEX Lead Qualifier",
        type: "QUALIFIER",
        status: "ACTIVE",
        description:
          "Scores and qualifies inbound leads using BANT framework and vertical-specific rules",
        systemPrompt:
          "You are an expert lead qualification agent. Assess leads based on Budget, Authority, Need, and Timeline (BANT). Score each lead 0-100 and provide a qualification summary.",
        config: {
          model: "gpt-4-turbo",
          temperature: 0.3,
          maxTokens: 500,
          scoringWeights: { budget: 30, authority: 25, need: 30, timeline: 15 },
          autoQualifyThreshold: 70,
          autoDisqualifyThreshold: 20,
        },
        metrics: {
          totalProcessed: 1247,
          avgScore: 63.4,
          qualifiedRate: 0.38,
          avgProcessingTime: 1.2,
        },
        organizationId: org.id,
        createdBy: adminUser.id,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Outreach Composer",
        type: "OUTREACH",
        status: "ACTIVE",
        description:
          "Generates personalized multi-channel outreach sequences for each lead",
        systemPrompt:
          "You are a master copywriter specializing in B2C sales outreach. Create personalized, compelling sequences that feel human. Match tone to the vertical and lead profile.",
        config: {
          model: "gpt-4-turbo",
          temperature: 0.7,
          channels: ["email", "sms", "voicemail"],
          sequenceLength: 7,
          touchpointIntervals: [0, 2, 4, 7, 10, 14, 21],
          personalizationDepth: "HIGH",
        },
        metrics: {
          sequencesCreated: 892,
          avgOpenRate: 0.34,
          avgReplyRate: 0.12,
          avgBookingRate: 0.048,
        },
        organizationId: org.id,
        createdBy: adminUser.id,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Appointment Setter",
        type: "SCHEDULER",
        status: "ACTIVE",
        description:
          "Handles conversation flows to book qualified leads into calendar slots",
        systemPrompt:
          "You are a friendly, professional appointment setter. Your goal is to book a consultation. Handle objections warmly, create urgency naturally, and always confirm details.",
        config: {
          model: "gpt-4-turbo",
          temperature: 0.5,
          calendarIntegration: "CALENDLY",
          reminderSequence: [24, 2],
          confirmationTemplate: "appointment_confirmed_v2",
          noShowFollowUp: true,
        },
        metrics: {
          totalConversations: 634,
          bookingRate: 0.31,
          showRate: 0.74,
          avgTimeToBook: 8.3,
        },
        organizationId: org.id,
        createdBy: agentUser.id,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Compliance Sentinel",
        type: "COMPLIANCE",
        status: "ACTIVE",
        description:
          "Monitors all communications for TCPA, CAN-SPAM, and vertical-specific compliance",
        systemPrompt:
          "You are a compliance expert. Review all outbound communications for regulatory violations including TCPA consent issues, DNC registry violations, required disclosures, and deceptive claims.",
        config: {
          model: "gpt-4-turbo",
          temperature: 0.1,
          regulations: ["TCPA", "CAN-SPAM", "FCC", "FTC", "CCPA"],
          autoBlockOnCritical: true,
          flagThreshold: "MEDIUM",
          reviewQueue: true,
        },
        metrics: {
          totalReviewed: 3891,
          flagRate: 0.023,
          criticalFlags: 12,
          autoBlocked: 8,
          falsePositiveRate: 0.15,
        },
        organizationId: org.id,
        createdBy: adminUser.id,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Revenue Forecaster",
        type: "ANALYTICS",
        status: "IDLE",
        description:
          "Analyzes pipeline data to generate revenue forecasts and conversion predictions",
        systemPrompt:
          "You are a revenue intelligence analyst. Analyze pipeline metrics, historical conversion rates, and market signals to generate accurate revenue forecasts with confidence intervals.",
        config: {
          model: "gpt-4-turbo",
          temperature: 0.2,
          forecastHorizons: [7, 30, 90],
          confidenceInterval: 0.8,
          refreshSchedule: "0 6 * * 1",
        },
        metrics: {
          forecastsGenerated: 48,
          avgAccuracy: 0.87,
          lastRunAt: new Date("2024-03-10T06:00:00Z"),
        },
        organizationId: org.id,
        createdBy: adminUser.id,
      },
    }),
  ]);
  console.log(`  ✓ Created ${agents.length} agents`);

  // ─── Workflows ──────────────────────────────────────────────────────────────
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        name: "New Lead Full Automation",
        description:
          "End-to-end automation from lead intake to appointment booked",
        status: "ACTIVE",
        trigger: "LEAD_CREATED",
        organizationId: org.id,
        createdBy: adminUser.id,
        steps: [
          { order: 1, type: "AGENT", agentId: agents[0].id, name: "Qualify Lead", waitFor: null },
          { order: 2, type: "CONDITION", name: "Score >= 60?", condition: "lead.score >= 60", branches: ["qualified", "nurture"] },
          { order: 3, type: "AGENT", agentId: agents[1].id, name: "Compose Outreach", branch: "qualified" },
          { order: 4, type: "AGENT", agentId: agents[2].id, name: "Book Appointment", branch: "qualified" },
          { order: 5, type: "AGENT", agentId: agents[3].id, name: "Compliance Check", waitFor: null },
          { order: 6, type: "NOTIFICATION", name: "Alert Sales Rep", template: "new_booked_lead" },
        ],
        metrics: {
          totalRuns: 312,
          successRate: 0.91,
          avgCompletionTime: 14.2,
          bookingRate: 0.29,
        },
      },
    }),
    prisma.workflow.create({
      data: {
        name: "No-Show Recovery",
        description: "Automated re-engagement for leads who missed appointments",
        status: "ACTIVE",
        trigger: "APPOINTMENT_NO_SHOW",
        organizationId: org.id,
        createdBy: adminUser.id,
        steps: [
          { order: 1, type: "DELAY", name: "Wait 1 Hour", duration: 60 },
          { order: 2, type: "AGENT", agentId: agents[1].id, name: "Generate Recovery Message" },
          { order: 3, type: "ACTION", name: "Send SMS + Email", channels: ["sms", "email"] },
          { order: 4, type: "DELAY", name: "Wait 24 Hours", duration: 1440 },
          { order: 5, type: "AGENT", agentId: agents[2].id, name: "Attempt Reschedule" },
          { order: 6, type: "CONDITION", name: "Rescheduled?", condition: "appointment.status == RESCHEDULED" },
        ],
        metrics: {
          totalRuns: 87,
          successRate: 0.83,
          recoveryRate: 0.41,
        },
      },
    }),
    prisma.workflow.create({
      data: {
        name: "High-Value Lead VIP Track",
        description:
          "White-glove handling for leads scoring 85+ with immediate human escalation",
        status: "ACTIVE",
        trigger: "LEAD_SCORE_THRESHOLD",
        organizationId: org.id,
        createdBy: agentUser.id,
        steps: [
          { order: 1, type: "ACTION", name: "Flag as VIP", action: "SET_PRIORITY_HIGH" },
          { order: 2, type: "NOTIFICATION", name: "Alert Senior Rep", template: "vip_lead_alert", urgency: "IMMEDIATE" },
          { order: 3, type: "AGENT", agentId: agents[1].id, name: "Craft Personalized Outreach", config: { personalizationDepth: "EXTREME" } },
          { order: 4, type: "ACTION", name: "Reserve Premium Time Slot", action: "BLOCK_CALENDAR" },
          { order: 5, type: "AGENT", agentId: agents[3].id, name: "Compliance Check" },
        ],
        metrics: {
          totalRuns: 43,
          successRate: 0.97,
          avgDealValue: 18400,
          closeRate: 0.62,
        },
      },
    }),
  ]);
  console.log(`  ✓ Created ${workflows.length} workflows`);

  // ─── Leads ──────────────────────────────────────────────────────────────────
  type LeadSeed = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    vertical: string;
    source: string;
    status: string;
    score: number;
    campaignIndex: number;
    assignedIndex: number;
    notes?: string;
    metadata?: Prisma.InputJsonValue;
    createdAt?: Date;
  };

  const leadSeeds: LeadSeed[] = [
    // Solar leads
    {
      firstName: "Marcus",
      lastName: "Thompson",
      email: "m.thompson@gmail.com",
      phone: "+14085559201",
      company: null,
      vertical: "SOLAR",
      source: "FACEBOOK_AD",
      status: "QUALIFIED",
      score: 88,
      campaignIndex: 0,
      assignedIndex: 0,
      notes: "2,400 sq ft home, $340/mo electric bill, owns home outright",
      metadata: { utilityBill: 340, homeOwnership: "owned", sqft: 2400, roof: "good", shading: "low" },
      createdAt: new Date("2024-01-18"),
    },
    {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya.patel@outlook.com",
      phone: "+14805558847",
      vertical: "SOLAR",
      source: "GOOGLE_SEARCH",
      status: "APPOINTMENT_SET",
      score: 92,
      campaignIndex: 0,
      assignedIndex: 0,
      notes: "Very motivated. Utility rates going up 18% next quarter.",
      metadata: { utilityBill: 520, homeOwnership: "owned", sqft: 3100, roof: "excellent", shading: "none" },
      createdAt: new Date("2024-01-22"),
    },
    {
      firstName: "Derek",
      lastName: "Williams",
      email: "derek.w@yahoo.com",
      phone: "+17025554392",
      vertical: "SOLAR",
      source: "REFERRAL",
      status: "CONTACTED",
      score: 74,
      campaignIndex: 0,
      assignedIndex: 1,
      notes: "Neighbor already went solar, interested in same deal",
      metadata: { utilityBill: 280, homeOwnership: "owned", sqft: 1950, roof: "good" },
      createdAt: new Date("2024-01-29"),
    },
    {
      firstName: "Sandra",
      lastName: "Nguyen",
      email: "s.nguyen@gmail.com",
      phone: "+16025551847",
      vertical: "SOLAR",
      source: "FACEBOOK_AD",
      status: "NEW",
      score: 61,
      campaignIndex: 0,
      assignedIndex: 0,
      notes: "Renter but claims to be buying soon",
      metadata: { utilityBill: 195, homeOwnership: "renting" },
      createdAt: new Date("2024-02-05"),
    },
    {
      firstName: "Robert",
      lastName: "Castro",
      email: "rcastro@hotmail.com",
      phone: "+16195553021",
      vertical: "SOLAR",
      source: "ORGANIC",
      status: "DISQUALIFIED",
      score: 18,
      campaignIndex: 0,
      assignedIndex: 1,
      notes: "HOA prohibits solar panels. Cannot proceed.",
      metadata: { utilityBill: 310, homeOwnership: "owned", disqualReason: "HOA_RESTRICTION" },
      createdAt: new Date("2024-02-08"),
    },
    {
      firstName: "Tamara",
      lastName: "Johnson",
      email: "tamara.j@gmail.com",
      phone: "+17135557823",
      vertical: "SOLAR",
      source: "GOOGLE_SEARCH",
      status: "PROPOSAL_SENT",
      score: 85,
      campaignIndex: 0,
      assignedIndex: 0,
      notes: "Reviewed 3 competitors, price sensitive but quality focused",
      metadata: { utilityBill: 415, homeOwnership: "owned", sqft: 2800, competing: ["SunPower", "Vivint"] },
      createdAt: new Date("2024-02-12"),
    },
    // Insurance leads
    {
      firstName: "Eugene",
      lastName: "Mitchell",
      email: "gene.mitchell@aol.com",
      phone: "+13055556712",
      vertical: "INSURANCE",
      source: "INBOUND_CALL",
      status: "APPOINTMENT_SET",
      score: 91,
      campaignIndex: 1,
      assignedIndex: 0,
      notes: "Turning 65 in March. Wants Medicare Advantage with dental. Currently on employer plan.",
      metadata: { age: 64, currentPlan: "employer", turningAge: 65, priorities: ["dental", "vision", "low_premium"] },
      createdAt: new Date("2024-01-20"),
    },
    {
      firstName: "Dorothy",
      lastName: "Reyes",
      email: "dorothy.reyes@gmail.com",
      phone: "+17135558934",
      vertical: "INSURANCE",
      source: "FACEBOOK_AD",
      status: "QUALIFIED",
      score: 79,
      campaignIndex: 1,
      assignedIndex: 1,
      notes: "Currently on Original Medicare. Looking for prescription drug coverage.",
      metadata: { age: 68, currentPlan: "original_medicare", priorities: ["prescription", "specialist_network"] },
      createdAt: new Date("2024-01-28"),
    },
    {
      firstName: "Harold",
      lastName: "Baker",
      email: "hbaker55@yahoo.com",
      phone: "+16145559034",
      vertical: "INSURANCE",
      source: "DIRECT_MAIL",
      status: "CONTACTED",
      score: 66,
      campaignIndex: 1,
      assignedIndex: 0,
      notes: "Responded to mailer. Income below 150% FPL, may qualify for extra help.",
      metadata: { age: 72, income: "LOW", extraHelpEligible: true },
      createdAt: new Date("2024-02-03"),
    },
    {
      firstName: "Beverly",
      lastName: "Chen",
      email: "bev.chen@gmail.com",
      phone: "+14085554421",
      vertical: "INSURANCE",
      source: "ORGANIC",
      status: "WON",
      score: 95,
      campaignIndex: 1,
      assignedIndex: 0,
      notes: "Enrolled in Humana MA Gold Plus. Happy with coverage.",
      metadata: { age: 66, enrolledPlan: "Humana MA Gold Plus", enrollmentDate: "2024-02-15", premium: 0 },
      createdAt: new Date("2024-01-31"),
    },
    {
      firstName: "Walter",
      lastName: "Gonzalez",
      email: "wgonzalez@outlook.com",
      phone: "+13215557723",
      vertical: "INSURANCE",
      source: "TV_AD",
      status: "NEW",
      score: 58,
      campaignIndex: 1,
      assignedIndex: 1,
      notes: "Saw TV commercial. Wants lowest premium option.",
      metadata: { age: 67, priorities: ["lowest_premium"] },
      createdAt: new Date("2024-02-14"),
    },
    // Mortgage leads
    {
      firstName: "Jason",
      lastName: "Park",
      email: "j.park@gmail.com",
      phone: "+14255551839",
      company: "Self-employed",
      vertical: "MORTGAGE",
      source: "GOOGLE_SEARCH",
      status: "QUALIFIED",
      score: 82,
      campaignIndex: 2,
      assignedIndex: 0,
      notes: "800 credit score. $380k equity. Wants to consolidate HELOC into refi.",
      metadata: { creditScore: 800, equity: 380000, currentRate: 7.125, loanBalance: 420000, goal: "HELOC_CONSOLIDATION" },
      createdAt: new Date("2024-01-25"),
    },
    {
      firstName: "Michelle",
      lastName: "Davis",
      email: "michelle.davis@hotmail.com",
      phone: "+17025556201",
      vertical: "MORTGAGE",
      source: "REFERRAL",
      status: "APPOINTMENT_SET",
      score: 89,
      campaignIndex: 2,
      assignedIndex: 1,
      notes: "Rate dropped 1.5%. Would save $620/mo. Motivated to close before rates rise again.",
      metadata: { creditScore: 748, equity: 215000, currentRate: 7.75, loanBalance: 310000, potentialSavings: 620 },
      createdAt: new Date("2024-02-01"),
    },
    {
      firstName: "Thomas",
      lastName: "Lee",
      email: "t.lee.refi@gmail.com",
      phone: "+15035559182",
      vertical: "MORTGAGE",
      source: "EMAIL",
      status: "DISQUALIFIED",
      score: 22,
      campaignIndex: 2,
      assignedIndex: 0,
      notes: "Filed Chapter 7 bankruptcy 18 months ago. Need 24 months post-discharge.",
      metadata: { creditScore: 590, bankruptcyDischarge: "2022-09-01", disqualReason: "BANKRUPTCY_TOO_RECENT" },
      createdAt: new Date("2024-02-06"),
    },
    {
      firstName: "Angela",
      lastName: "White",
      email: "angela.white@yahoo.com",
      phone: "+16025552947",
      vertical: "MORTGAGE",
      source: "FACEBOOK_AD",
      status: "CONTACTED",
      score: 71,
      campaignIndex: 2,
      assignedIndex: 1,
      notes: "Interested but rate quote higher than expected. Needs to think about it.",
      metadata: { creditScore: 710, equity: 145000, currentRate: 7.5, objection: "RATE_TOO_HIGH" },
      createdAt: new Date("2024-02-09"),
    },
    {
      firstName: "Kevin",
      lastName: "Robinson",
      email: "k.robinson@gmail.com",
      phone: "+19162228834",
      vertical: "MORTGAGE",
      source: "ORGANIC",
      status: "PROPOSAL_SENT",
      score: 87,
      campaignIndex: 2,
      assignedIndex: 0,
      notes: "Cash-out refi for home renovation. $75k needed. Excellent profile.",
      metadata: { creditScore: 788, equity: 340000, currentRate: 6.875, cashOutAmount: 75000, purpose: "RENOVATION" },
      createdAt: new Date("2024-02-18"),
    },
    // Legal leads
    {
      firstName: "Christina",
      lastName: "Martinez",
      email: "c.martinez@gmail.com",
      phone: "+17135554490",
      vertical: "LEGAL",
      source: "GOOGLE_SEARCH",
      status: "QUALIFIED",
      score: 93,
      campaignIndex: 3,
      assignedIndex: 0,
      notes: "Rear-end collision 2 weeks ago. ER visit, 3 follow-up PT sessions. Clear liability. Good case.",
      metadata: { caseType: "AUTO_ACCIDENT", liability: "CLEAR", injuries: ["whiplash", "lower_back"], medBills: 8400, liabilityInsurance: true, accidentDate: "2024-02-20" },
      createdAt: new Date("2024-03-05"),
    },
    {
      firstName: "James",
      lastName: "Anderson",
      email: "j.anderson78@yahoo.com",
      phone: "+14045558821",
      vertical: "LEGAL",
      source: "FACEBOOK_AD",
      status: "NEW",
      score: 72,
      campaignIndex: 3,
      assignedIndex: 1,
      notes: "Slip and fall at grocery store. Has incident report.",
      metadata: { caseType: "SLIP_FALL", location: "GROCERY_STORE", injuries: ["knee"], hasIncidentReport: true, accidentDate: "2024-02-28" },
      createdAt: new Date("2024-03-07"),
    },
    {
      firstName: "Nancy",
      lastName: "Thomas",
      email: "nancy.t@outlook.com",
      phone: "+15125557291",
      vertical: "LEGAL",
      source: "REFERRAL",
      status: "APPOINTMENT_SET",
      score: 88,
      campaignIndex: 3,
      assignedIndex: 0,
      notes: "T-bone collision at intersection. Other driver ran red light. Witness present.",
      metadata: { caseType: "AUTO_ACCIDENT", liability: "CLEAR", injuries: ["shoulder", "cervical"], medBills: 14200, witness: true, policeReport: true },
      createdAt: new Date("2024-03-10"),
    },
    {
      firstName: "Gary",
      lastName: "Jackson",
      email: "gjackson@gmail.com",
      phone: "+16025559034",
      vertical: "LEGAL",
      source: "TV_AD",
      status: "DISQUALIFIED",
      score: 15,
      campaignIndex: 3,
      assignedIndex: 1,
      notes: "Statute of limitations exceeded. Accident was 3 years ago in a 2-year SOL state.",
      metadata: { caseType: "AUTO_ACCIDENT", disqualReason: "STATUTE_OF_LIMITATIONS", accidentDate: "2021-01-15" },
      createdAt: new Date("2024-03-12"),
    },
    // Multi-vertical bonus leads
    {
      firstName: "Rachel",
      lastName: "Green",
      email: "r.green@gmail.com",
      phone: "+12125558890",
      company: "Green Properties LLC",
      vertical: "MORTGAGE",
      source: "GOOGLE_SEARCH",
      status: "WON",
      score: 98,
      campaignIndex: 2,
      assignedIndex: 0,
      notes: "Investment property portfolio refi. 4 properties. Closed all 4.",
      metadata: { creditScore: 820, properties: 4, totalLoanValue: 1800000, closedDate: "2024-03-01" },
      createdAt: new Date("2024-01-15"),
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "d.kim.solar@gmail.com",
      phone: "+14085553382",
      vertical: "SOLAR",
      source: "REFERRAL",
      status: "CONTACTED",
      score: 68,
      campaignIndex: 0,
      assignedIndex: 1,
      notes: "Referred by Marcus Thompson. Interested in same package.",
      metadata: { utilityBill: 290, homeOwnership: "owned", referredBy: "Marcus Thompson" },
      createdAt: new Date("2024-03-01"),
    },
    {
      firstName: "Susan",
      lastName: "Brown",
      email: "susan.brown@aol.com",
      phone: "+18135554421",
      vertical: "INSURANCE",
      source: "DIRECT_MAIL",
      status: "QUALIFIED",
      score: 76,
      campaignIndex: 1,
      assignedIndex: 1,
      notes: "Turning 65 in June. Proactive planner. Already researched options.",
      metadata: { age: 64, turningAge: 65, turnDate: "2024-06-15", currentPlan: "employer" },
      createdAt: new Date("2024-03-08"),
    },
    {
      firstName: "Carlos",
      lastName: "Rivera",
      email: "c.rivera@gmail.com",
      phone: "+17865551923",
      company: "Rivera Construction",
      vertical: "LEGAL",
      source: "ORGANIC",
      status: "NEW",
      score: 55,
      campaignIndex: 3,
      assignedIndex: 0,
      notes: "Worker's comp case. Fell off scaffolding. Employer denying claim.",
      metadata: { caseType: "WORKERS_COMP", employer: "denying", injuryDate: "2024-02-25", injuries: ["wrist", "ankle"] },
      createdAt: new Date("2024-03-14"),
    },
    {
      firstName: "Lisa",
      lastName: "Taylor",
      email: "lisa.taylor@outlook.com",
      phone: "+13125558847",
      vertical: "MORTGAGE",
      source: "EMAIL",
      status: "CONTACTED",
      score: 63,
      campaignIndex: 2,
      assignedIndex: 1,
      notes: "Interested in ARM to fixed conversion. Rate concern is her primary driver.",
      metadata: { creditScore: 735, equity: 190000, currentType: "ARM", currentRate: 8.25, goal: "ARM_TO_FIXED" },
      createdAt: new Date("2024-03-15"),
    },
  ];

  const createdLeads = await Promise.all(
    leadSeeds.map((seed) =>
      prisma.lead.create({
        data: {
          firstName: seed.firstName,
          lastName: seed.lastName,
          email: seed.email,
          phone: seed.phone,
          company: seed.company,
          vertical: seed.vertical,
          source: seed.source,
          status: seed.status,
          score: seed.score,
          campaignId: campaigns[seed.campaignIndex].id,
          assignedTo: seed.assignedIndex === 0 ? adminUser.id : agentUser.id,
          organizationId: org.id,
          notes: seed.notes,
          metadata: seed.metadata ?? Prisma.JsonNull,
          createdAt: seed.createdAt ?? new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );
  console.log(`  ✓ Created ${createdLeads.length} leads`);

  // ─── Appointments ───────────────────────────────────────────────────────────
  const qualifiedLeads = createdLeads.filter((l) =>
    ["APPOINTMENT_SET", "PROPOSAL_SENT", "WON"].includes(l.status)
  );

  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        leadId: qualifiedLeads[0].id,
        organizationId: org.id,
        scheduledAt: new Date("2024-03-20T14:00:00Z"),
        duration: 30,
        type: "CONSULTATION",
        status: "CONFIRMED",
        medium: "PHONE",
        notes: "Initial solar consultation. Send savings report beforehand.",
        assignedTo: adminUser.id,
      },
    }),
    prisma.appointment.create({
      data: {
        leadId: qualifiedLeads[1]?.id ?? qualifiedLeads[0].id,
        organizationId: org.id,
        scheduledAt: new Date("2024-03-19T10:30:00Z"),
        duration: 45,
        type: "DISCOVERY",
        status: "COMPLETED",
        medium: "VIDEO",
        notes: "Medicare plan comparison completed. Enrolled in Humana.",
        assignedTo: adminUser.id,
      },
    }),
    prisma.appointment.create({
      data: {
        leadId: qualifiedLeads[2]?.id ?? qualifiedLeads[0].id,
        organizationId: org.id,
        scheduledAt: new Date("2024-03-22T15:00:00Z"),
        duration: 60,
        type: "PROPOSAL",
        status: "SCHEDULED",
        medium: "IN_PERSON",
        notes: "Refi proposal walk-through. Bring loan comparison sheet.",
        assignedTo: agentUser.id,
      },
    }),
    prisma.appointment.create({
      data: {
        leadId: qualifiedLeads[3]?.id ?? qualifiedLeads[0].id,
        organizationId: org.id,
        scheduledAt: new Date("2024-03-18T09:00:00Z"),
        duration: 30,
        type: "CONSULTATION",
        status: "NO_SHOW",
        medium: "PHONE",
        notes: "Did not answer. Triggered no-show recovery workflow.",
        assignedTo: agentUser.id,
      },
    }),
    prisma.appointment.create({
      data: {
        leadId: qualifiedLeads[4]?.id ?? qualifiedLeads[0].id,
        organizationId: org.id,
        scheduledAt: new Date("2024-03-21T13:00:00Z"),
        duration: 45,
        type: "CASE_REVIEW",
        status: "CONFIRMED",
        medium: "VIDEO",
        notes: "PI case evaluation. Have case intake form ready.",
        assignedTo: adminUser.id,
      },
    }),
  ]);
  console.log(`  ✓ Created ${appointments.length} appointments`);

  // ─── Activities ─────────────────────────────────────────────────────────────
  const activityData = [
    {
      leadId: createdLeads[0].id,
      type: "EMAIL",
      direction: "OUTBOUND",
      subject: "Your Solar Savings Report is Ready",
      body: "Hi Marcus, I've put together a personalized savings estimate showing you could save $284/month...",
      status: "DELIVERED",
      userId: adminUser.id,
      createdAt: new Date("2024-01-19T09:00:00Z"),
    },
    {
      leadId: createdLeads[0].id,
      type: "CALL",
      direction: "OUTBOUND",
      subject: "Intro call",
      body: "Connected. 12 min conversation. Confirmed interest and home ownership. Scheduled follow-up.",
      status: "COMPLETED",
      userId: adminUser.id,
      duration: 720,
      createdAt: new Date("2024-01-21T14:30:00Z"),
    },
    {
      leadId: createdLeads[1].id,
      type: "SMS",
      direction: "OUTBOUND",
      subject: "Quick question about your solar interest",
      body: "Hi Priya! This is Alex from APEX Solar. You requested info about going solar — do you have 5 minutes for a quick call?",
      status: "DELIVERED",
      userId: adminUser.id,
      createdAt: new Date("2024-01-23T10:15:00Z"),
    },
    {
      leadId: createdLeads[1].id,
      type: "SMS",
      direction: "INBOUND",
      subject: null,
      body: "Yes! I'm very interested. Can we talk tomorrow afternoon?",
      status: "RECEIVED",
      userId: adminUser.id,
      createdAt: new Date("2024-01-23T10:42:00Z"),
    },
    {
      leadId: createdLeads[6].id,
      type: "CALL",
      direction: "INBOUND",
      subject: "Medicare inquiry",
      body: "Eugene called in after seeing TV ad. Very motivated. Turning 65 in 6 weeks. Set appointment for in-depth review.",
      status: "COMPLETED",
      userId: adminUser.id,
      duration: 1080,
      createdAt: new Date("2024-01-20T11:00:00Z"),
    },
    {
      leadId: createdLeads[11].id,
      type: "EMAIL",
      direction: "OUTBOUND",
      subject: "Your Custom Refinance Quote",
      body: "Hi Jason, based on your profile I've secured a pre-approval at 6.375% fixed for 30 years. This would save you approximately $389/month vs your current HELOC structure...",
      status: "OPENED",
      userId: agentUser.id,
      createdAt: new Date("2024-01-27T08:30:00Z"),
    },
    {
      leadId: createdLeads[12].id,
      type: "CALL",
      direction: "OUTBOUND",
      subject: "Rate lock discussion",
      body: "Michelle excited about savings. Explained rate lock process. She wants to proceed. Sending DocuSign tonight.",
      status: "COMPLETED",
      userId: agentUser.id,
      duration: 1440,
      createdAt: new Date("2024-02-05T15:00:00Z"),
    },
    {
      leadId: createdLeads[16].id,
      type: "NOTE",
      direction: "INTERNAL",
      subject: "Case notes",
      body: "Strong PI case. ER records received. Clear liability with dashcam footage. Estimated case value $45k-$65k. Moving to intake.",
      status: "COMPLETED",
      userId: adminUser.id,
      createdAt: new Date("2024-03-06T16:00:00Z"),
    },
  ];

  const activities = await Promise.all(
    activityData.map((a) =>
      prisma.activity.create({
        data: {
          leadId: a.leadId,
          type: a.type,
          direction: a.direction,
          subject: a.subject,
          body: a.body,
          status: a.status,
          userId: a.userId,
          organizationId: org.id,
          duration: a.duration,
          createdAt: a.createdAt,
          metadata: {},
        },
      })
    )
  );
  console.log(`  ✓ Created ${activities.length} activities`);

  // ─── Compliance Flags ───────────────────────────────────────────────────────
  const complianceFlags = await Promise.all([
    prisma.complianceFlag.create({
      data: {
        leadId: createdLeads[3].id,
        organizationId: org.id,
        type: "TCPA",
        severity: "HIGH",
        status: "RESOLVED",
        description:
          "Lead phone number found on National DNC Registry. SMS campaign paused for this contact.",
        resolution: "Removed from SMS sequence. Email-only communications permitted.",
        flaggedBy: agents[3].id,
        resolvedBy: adminUser.id,
        resolvedAt: new Date("2024-02-06T09:00:00Z"),
        createdAt: new Date("2024-02-05T14:22:00Z"),
      },
    }),
    prisma.complianceFlag.create({
      data: {
        leadId: createdLeads[10].id,
        organizationId: org.id,
        type: "DISCLOSURE",
        severity: "MEDIUM",
        status: "RESOLVED",
        description:
          "Email missing required Medicare marketing disclosure language per CMS guidelines.",
        resolution:
          "Email template updated with required H10 plan identifier and CMS-approved disclosure.",
        flaggedBy: agents[3].id,
        resolvedBy: adminUser.id,
        resolvedAt: new Date("2024-02-16T11:00:00Z"),
        createdAt: new Date("2024-02-14T16:45:00Z"),
      },
    }),
    prisma.complianceFlag.create({
      data: {
        leadId: createdLeads[22].id,
        organizationId: org.id,
        type: "TCPA",
        severity: "CRITICAL",
        status: "OPEN",
        description:
          "Attempted contact outside TCPA permissible hours (before 8am local time). Auto-blocked by Compliance Sentinel.",
        resolution: null,
        flaggedBy: agents[3].id,
        resolvedBy: null,
        resolvedAt: null,
        createdAt: new Date("2024-03-08T06:47:00Z"),
      },
    }),
    prisma.complianceFlag.create({
      data: {
        leadId: createdLeads[13].id,
        organizationId: org.id,
        type: "ADVERTISING",
        severity: "LOW",
        status: "RESOLVED",
        description:
          'Outreach message used phrase "guaranteed lowest rate" which constitutes a deceptive claim under FTC guidelines.',
        resolution:
          'Message revised to "competitive rate options" with appropriate conditional language.',
        flaggedBy: agents[3].id,
        resolvedBy: agentUser.id,
        resolvedAt: new Date("2024-02-11T14:00:00Z"),
        createdAt: new Date("2024-02-10T09:30:00Z"),
      },
    }),
  ]);
  console.log(`  ✓ Created ${complianceFlags.length} compliance flags`);

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log("\n✅ Seed completed successfully!");
  console.log("─────────────────────────────────────────");
  console.log(`  Organization : ${org.name}`);
  console.log(`  Admin login  : demo@apex.io / password123`);
  console.log(`  Agent login  : jordan@apex.io / password123`);
  console.log(`  Leads        : ${createdLeads.length}`);
  console.log(`  Campaigns    : ${campaigns.length}`);
  console.log(`  Creatives    : ${creatives.length}`);
  console.log(`  Agents       : ${agents.length}`);
  console.log(`  Workflows    : ${workflows.length}`);
  console.log(`  Appointments : ${appointments.length}`);
  console.log(`  Activities   : ${activities.length}`);
  console.log(`  Comp. Flags  : ${complianceFlags.length}`);
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
