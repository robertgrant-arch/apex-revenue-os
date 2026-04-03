// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = {
    stats: {
      totalLeads: 2130,
      leadsChange: 12.4,
      activeCampaigns: 3,
      campaignsChange: 0,
      revenueMtd: 64700,
      revenueChange: 18.2,
      conversionRate: 0.047,
      conversionChange: 3.1,
      appointmentsSet: 187,
      appointmentsChange: 8.6,
      activeAgents: 4,
      agentsChange: 0,
    },
    recentLeads: [
      { id: "l1", firstName: "Margaret", lastName: "Thompson", vertical: "Medicare", status: "NEW", score: 94, createdAt: "2025-07-14T09:30:00Z" },
      { id: "l2", firstName: "Robert", lastName: "Kincaid", vertical: "Medicare", status: "CONTACTED", score: 88, createdAt: "2025-07-14T08:15:00Z" },
      { id: "l3", firstName: "Sandra", lastName: "Williams", vertical: "ACA", status: "QUALIFIED", score: 61, createdAt: "2025-07-13T14:20:00Z" },
      { id: "l4", firstName: "James", lastName: "Okonkwo", vertical: "Life Insurance", status: "CONTACTED", score: 79, createdAt: "2025-07-13T11:00:00Z" },
      { id: "l5", firstName: "Patricia", lastName: "Nguyen", vertical: "Final Expense", status: "QUALIFIED", score: 72, createdAt: "2025-07-12T16:45:00Z" },
    ],
    revenueChart: [
      { date: "Jan", revenue: 28000 },
      { date: "Feb", revenue: 32000 },
      { date: "Mar", revenue: 38000 },
      { date: "Apr", revenue: 35000 },
      { date: "May", revenue: 42000 },
      { date: "Jun", revenue: 52000 },
      { date: "Jul", revenue: 64700 },
    ],
    conversionChart: [
      { vertical: "Medicare", conversions: 420 },
      { vertical: "ACA", conversions: 310 },
      { vertical: "Life", conversions: 185 },
      { vertical: "Final Exp", conversions: 145 },
      { vertical: "Dental", conversions: 90 },
    ],
    topCampaigns: [
      { id: "c1", name: "Q3 Medicare Advantage Push", budget: 50000, spent: 32400, status: "active" },
      { id: "c2", name: "Final Expense Spring Drive", budget: 25000, spent: 24100, status: "completed" },
      { id: "c3", name: "ACA Open Enrollment 2025", budget: 75000, spent: 8200, status: "draft" },
    ],
    agentActivity: [
      { id: "a1", name: "LeadScorer", type: "Lead Intelligence", status: "active" },
      { id: "a2", name: "CampaignOptimizer", type: "Media & Spend", status: "active" },
      { id: "a3", name: "ComplianceGuardian", type: "Regulatory & Legal", status: "active" },
      { id: "a4", name: "AnalyticsEngine", type: "Insights & Reporting", status: "active" },
    ],
  };

  return NextResponse.json({ data });
}