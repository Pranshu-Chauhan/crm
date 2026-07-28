import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const [
      totalLeads,
      newLeadsThisMonth,
      newLeadsLastMonth,
      activeDeals,
      wonDealsThisMonth,
      pendingTasks,
      overdueTasksCount,
      followUpsToday,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      this.prisma.deal.count({ where: { tenantId, stage: { notIn: ['WON', 'LOST'] } } }),
      this.prisma.deal.count({ where: { tenantId, stage: 'WON', updatedAt: { gte: startOfMonth } } }),
      this.prisma.task.count({ where: { tenantId, isCompleted: false } }),
      this.prisma.task.count({ where: { tenantId, isCompleted: false, dueDate: { lt: now } } }),
      this.prisma.task.count({ where: { tenantId, isCompleted: false, dueDate: { gte: now, lte: next7Days } } }),
    ]);

    const leadGrowth = newLeadsLastMonth > 0
      ? Math.round(((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100)
      : 100;

    return {
      totalLeads,
      newLeadsThisMonth,
      leadGrowth,
      activeDeals,
      wonDealsThisMonth,
      pendingTasks,
      overdueTasksCount,
      followUpsToday,
    };
  }

  async getLeadsByStatus(tenantId: string) {
    const results = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });
    return results.map((r) => ({ status: r.status, count: r._count.status }));
  }

  async getLeadsBySource(tenantId: string) {
    const results = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { source: true },
    });
    return results.map((r) => ({ source: r.source, count: r._count.source }));
  }

  async getDealsByStage(tenantId: string) {
    const results = await this.prisma.deal.groupBy({
      by: ['stage'],
      where: { tenantId },
      _count: { stage: true },
      _sum: { value: true },
    });
    return results.map((r) => ({
      stage: r.stage,
      count: r._count.stage,
      value: r._sum.value || 0,
    }));
  }

  async getRecentLeads(tenantId: string, limit = 5) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async getAgentPerformance(tenantId: string) {
    const agents = await this.prisma.user.findMany({
      where: { tenantId, role: { in: ['AGENT', 'MANAGER'] }, isActive: true },
      select: {
        id: true, firstName: true, lastName: true, avatarUrl: true,
        assignedLeads: { select: { id: true, status: true } },
      },
    });

    return agents.map((a) => ({
      id: a.id,
      name: `${a.firstName} ${a.lastName}`,
      avatarUrl: a.avatarUrl,
      totalLeads: a.assignedLeads.length,
      wonLeads: a.assignedLeads.filter((l) => l.status === 'WON').length,
      activeLeads: a.assignedLeads.filter((l) => !['WON', 'LOST', 'UNQUALIFIED'].includes(l.status)).length,
    }));
  }

  async getLeadTrend(tenantId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const leads = await this.prisma.lead.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const dateMap: Record<string, number> = {};
    leads.forEach((lead) => {
      const date = lead.createdAt.toISOString().split('T')[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    const result: { date: string; count: number }[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, count: dateMap[dateStr] || 0 });
    }
    return result;
  }
}
