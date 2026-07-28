import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';
import { ActivityType, LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        tenantId,
        createdById: userId,
        tags: dto.tags || [],
      },
      include: this.includeRelations(),
    });

    await this.logActivity(tenantId, lead.id, null, userId, ActivityType.LEAD_CREATED, 'Lead created', `Lead ${lead.firstName} ${lead.lastName} was created`);

    return lead;
  }

  async findAll(tenantId: string, query: QueryLeadsDto) {
    const { page = 1, limit = 20, search, status, source, assignedToId, city, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (source) where.source = source;
    if (assignedToId) where.assignedToId = assignedToId;
    if (city) where.preferredCity = { contains: city, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.includeRelations(),
      }),
      this.prisma.lead.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        ...this.includeRelations(),
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
        tasks: { orderBy: { createdAt: 'desc' } },
        deals: true,
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateLeadDto) {
    const existing = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Lead not found');

    const updated = await this.prisma.lead.update({
      where: { id },
      data: dto,
      include: this.includeRelations(),
    });

    if (dto.status && dto.status !== existing.status) {
      await this.logActivity(
        tenantId, id, null, userId,
        ActivityType.STATUS_CHANGED,
        'Status changed',
        `Status changed from ${existing.status} to ${dto.status}`,
        { from: existing.status, to: dto.status },
      );
    } else {
      await this.logActivity(tenantId, id, null, userId, ActivityType.LEAD_UPDATED, 'Lead updated', 'Lead details were updated');
    }

    if (dto.assignedToId && dto.assignedToId !== existing.assignedToId) {
      await this.logActivity(tenantId, id, null, userId, ActivityType.LEAD_ASSIGNED, 'Lead assigned', `Lead assigned to agent`, { agentId: dto.assignedToId });
    }

    return updated;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Lead not found');
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted successfully' };
  }

  async addNote(tenantId: string, leadId: string, userId: string, note: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');

    await this.logActivity(tenantId, leadId, null, userId, ActivityType.NOTE_ADDED, 'Note added', note);
    return { message: 'Note added successfully' };
  }

  private includeRelations() {
    return {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    };
  }

  private async logActivity(
    tenantId: string,
    leadId: string | null,
    dealId: string | null,
    userId: string,
    type: ActivityType,
    title: string,
    description?: string,
    metadata?: any,
  ) {
    return this.prisma.activity.create({
      data: { tenantId, leadId, dealId, userId, type, title, description, metadata },
    });
  }
}
