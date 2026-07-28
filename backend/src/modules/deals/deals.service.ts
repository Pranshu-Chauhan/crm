import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ActivityType } from '@prisma/client';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateDealDto) {
    const deal = await this.prisma.deal.create({
      data: { ...dto, tenantId },
      include: this.includeRelations(),
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        leadId: dto.leadId,
        dealId: deal.id,
        userId,
        type: ActivityType.DEAL_CREATED,
        title: 'Deal created',
        description: `Deal "${deal.title}" was created`,
      },
    });

    return deal;
  }

  async findAll(tenantId: string, page = 1, limit = 20, stage?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (stage) where.stage = stage;

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.includeRelations(),
      }),
      this.prisma.deal.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getPipeline(tenantId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { tenantId },
      include: this.includeRelations(),
      orderBy: { updatedAt: 'desc' },
    });

    const stages = ['NEW', 'CONTACTED', 'SITE_VISIT', 'NEGOTIATION', 'BOOKED', 'WON', 'LOST'];
    const pipeline: Record<string, any[]> = {};
    stages.forEach((s) => (pipeline[s] = []));
    deals.forEach((deal) => {
      if (pipeline[deal.stage]) pipeline[deal.stage].push(deal);
    });
    return pipeline;
  }

  async findOne(tenantId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: this.includeRelations(),
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateDealDto) {
    const existing = await this.prisma.deal.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Deal not found');

    const updated = await this.prisma.deal.update({
      where: { id },
      data: dto,
      include: this.includeRelations(),
    });

    if (dto.stage && dto.stage !== existing.stage) {
      await this.prisma.activity.create({
        data: {
          tenantId,
          dealId: id,
          leadId: updated.leadId,
          userId,
          type: ActivityType.DEAL_STAGE_CHANGED,
          title: 'Stage changed',
          description: `Deal moved from ${existing.stage} to ${dto.stage}`,
          metadata: { from: existing.stage, to: dto.stage },
        },
      });
    }

    return updated;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.deal.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Deal not found');
    await this.prisma.deal.delete({ where: { id } });
    return { message: 'Deal deleted' };
  }

  private includeRelations() {
    return {
      lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      property: { select: { id: true, name: true, type: true, city: true, priceMin: true } },
    };
  }
}
