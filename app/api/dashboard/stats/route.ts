// app/api/dashboard/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  LeadStatus,
  CampaignStatus,
  AgentStatus,
  AppointmentStatus,
  FlagSeverity,
} from "@prisma/client";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required.", statusCode: 401 },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      leadsThisMonth,
      leadsLastMonth,
      leadsByStatus,
      leadsByVertical,
      leadsBySource,
      hotLeads,
      totalCampaigns,
      activeCampaigns,
      campaignTotals,
      closedWonThisMonth,
      closedWonLastMonth,
      appointmentsSetThisMonth,
      appointmentsSetLastMonth,
      upcomingAppointments,
      appointmentsByStatus,
      totalAgents,
      activeAgents,
      agentStats,
      openFlags,
      criticalFlags,
      flagsByStatus,
      totalCreatives,
      liveCreatives,
      recentActivity,
      leadTrend,
      activeWorkflows,
      totalWorkflowExecutions,
    ] = await prisma.$transaction([
      prisma.lead.count({ where: { orgId } }),
      prisma.lead.count({
        where: { orgId, createdAt: { gte: startOfMonth } },
      }),
      prisma.lead.count({
        where: { orgId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        where: { orgId },
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["vertical"],
        where: { orgId },
        _count: { _all: true },
        orderBy: { _count: { vertical: "desc" } },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        where: { orgId },
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
      }),
      prisma.lead.count({
        where: { orgId, score: { gte: 80 } },
      }),
      prisma.campaign.count({ where: { orgId } }),
      prisma.campaign.count({
        where: { orgId, status: CampaignStatus.ACTIVE },
      }),
      prisma.campaign.aggregate({
        where: { orgId },
        _sum: {
          budget: true,
          spend: true,
          leadsCount: true,
          conversions: true,
        },
      }),
      prisma.lead.count({
        where: {
          orgId,
          status: LeadStatus.CLOSED_WON,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.lead.count({
        where: {
          orgId,
          status: LeadStatus.CLOSED_WON,
          updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.appointment.count({
        where: { orgId, createdAt: { gte: startOfMonth } },
      }),
      prisma.appointment.count({
        where: { orgId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.appointment.count({
        where: {
          orgId,
          scheduledAt: { gte: now },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { orgId },
        _count: { _all: true },
      }),
      prisma.agent.count({ where: { orgId } }),
      prisma.agent.count({
        where: { orgId, status: AgentStatus.ACTIVE },
      }),
      prisma.agent.aggregate({
        where: { orgId, status: AgentStatus.ACTIVE },
        _avg: { successRate: true },
        _sum: { tasksCompleted: true },
      }),
      prisma.complianceFlag.count({
        where: { status: "OPEN", creative: { orgId } },
      }),
      prisma.complianceFlag.count({
        where: {
          status: "OPEN",
          severity: FlagSeverity.CRITICAL,
          creative: { orgId },
        },
      }),
      prisma.complianceFlag.groupBy({
        by: ["status"],
        where: { creative: { orgId } },
        _count: { _all: true },
      }),
      prisma.creative.count({ where: { orgId } }),
      prisma.creative.count({ where: { orgId, status: "LIVE" } }),
      prisma.activity.findMany({
        where: { orgId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          lead: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.lead.findMany({
        where: { orgId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.workflow.count({ where: { orgId, status: "ACTIVE" } }),
      prisma.workflow.aggregate({
        where: { orgId },
        _sum: { executionCount: true },
      }),
    ]);

    // Derived calculations
    const leadGrowthPct =
      leadsLastMonth > 0
        ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100
        : leadsThisMonth > 0
        ? 100
        : 0;

    const conversionRateThisMonth =
      leadsThisMonth > 0 ? (closedWonThisMonth / leadsThisMonth) * 100 : 0;

    const conversionRateLastMonth =
      leadsLastMonth > 0 ? (closedWonLastMonth / leadsLastMonth) * 100 : 0;

    const conversionRateChange = conversionRateThisMonth - conversionRateLastMonth;

    const totalClosedWon =
      leadsByStatus.find((s) => s.status === LeadStatus.CLOSED_WON)?._count._all ?? 0;
    const overallConversionRate =
      totalLeads > 0 ? (totalClosedWon / totalLeads) * 100 : 0;

    const totalSpend = campaignTotals._sum.spend ?? 0;
    const totalBudget = campaignTotals._sum.budget ?? 0;
    const totalCampaignLeads = campaignTotals._sum.leadsCount ?? 0;
    const totalConversions = campaignTotals._sum.conversions ?? 0;
    const costPerLead = totalCampaignLeads > 0 ? totalSpend / totalCampaignLeads : 0;
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    const appointmentGrowthPct =
      appointmentsSetLastMonth > 0
        ? ((appointmentsSetThisMonth - appointmentsSetLastMonth) / appointmentsSetLastMonth) * 100
        : appointmentsSetThisMonth > 0
        ? 100
        : 0;

    // Build daily lead trend
    const trendMap: Record<string, { date: string; leads: number; conversions: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      trendMap[key] = { date: key, leads: 0, conversions: 0 };
    }
    for (const lead of leadTrend) {
      const key = lead.createdAt.toISOString().slice(0, 10);
      if (trendMap[key]) {
        trendMap[key].leads += 1;
        if (lead.status === LeadStatus.CLOSED_WON) {
          trendMap[key].conversions += 1;
        }
      }
    }
    const dailyLeadTrend = Object.values(trendMap);

    const statusBreakdown = leadsByStatus.map((s) => ({
      status: s.status,
      count: s._count._all,
      percentage:
        totalLeads > 0
          ? parseFloat(((s._count._all / totalLeads) * 100).toFixed(1))
          : 0,
    }));

    const verticalBreakdown = leadsByVertical.map((v) => ({
      vertical: v.vertical,
      count: v._count._all,
      percentage:
        totalLeads > 0
          ? parseFloat(((v._count._all / totalLeads) * 100).toFixed(1))
          : 0,
    }));

    const sourceBreakdown = leadsBySource.map((s) => ({
      source: s.source,
      count: s._count._all,
      percentage:
        totalLeads > 0
          ? parseFloat(((s._count._all / totalLeads) * 100).toFixed(1))
          : 0,
    }));

    const complianceHealthScore = Math.max(
      0,
      Math.min(100, 100 - openFlags * 2 - criticalFlags * 8)
    );

    return NextResponse.json({
      data: {
        overview: {
          totalLeads,
          leadsThisMonth,
          leadsLastMonth,
          leadGrowthPct: parseFloat(leadGrowthPct.toFixed(1)),
          hotLeads,
          totalClosedWon,
          closedWonThisMonth,
          closedWonLastMonth,
          conversionRateThisMonth: parseFloat(conversionRateThisMonth.toFixed(2)),
          conversionRateLastMonth: parseFloat(conversionRateLastMonth.toFixed(2)),
          conversionRateChange: parseFloat(conversionRateChange.toFixed(2)),
          overallConversionRate: parseFloat(overallConversionRate.toFixed(2)),
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          totalBudget: parseFloat(totalBudget.toFixed(2)),
          totalSpend: parseFloat(totalSpend.toFixed(2)),
          budgetUtilization: parseFloat(budgetUtilization.toFixed(1)),
          totalCampaignLeads,
          totalConversions,
          costPerLead: parseFloat(costPerLead.toFixed(2)),
          costPerConversion: parseFloat(costPerConversion.toFixed(2)),
        },
        appointments: {
          setThisMonth: appointmentsSetThisMonth,
          setLastMonth: appointmentsSetLastMonth,
          growthPct: parseFloat(appointmentGrowthPct.toFixed(1)),
          upcoming: upcomingAppointments,
          byStatus: appointmentsByStatus.map((a) => ({
            status: a.status,
            count: a._count._all,
          })),
        },
        agents: {
          total: totalAgents,
          active: activeAgents,
          avgSuccessRate: parseFloat(
            (agentStats._avg.successRate ?? 0).toFixed(1)
          ),
          totalTasksCompleted: agentStats._sum.tasksCompleted ?? 0,
        },
        compliance: {
          openFlags,
          criticalFlags,
          healthScore: complianceHealthScore,
          byStatus: flagsByStatus.map((f) => ({
            status: f.status,
            count: f._count._all,
          })),
        },
        creatives: {
          total: totalCreatives,
          live: liveCreatives,
        },
        workflows: {
          active: activeWorkflows,
          totalExecutions: totalWorkflowExecutions._sum.executionCount ?? 0,
        },
        breakdowns: {
          byStatus: statusBreakdown,
          byVertical: verticalBreakdown,
          bySource: sourceBreakdown,
        },
        trends: {
          dailyLeads: dailyLeadTrend,
        },
        recentActivity,
        generatedAt: now.toISOString(),
      },
    });
  } catch (err) {
    console.error("[GET /api/dashboard/stats]", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Something went wrong.",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
