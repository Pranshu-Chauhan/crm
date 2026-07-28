import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';
import { ActivityType } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: { ...dto, tenantId, createdById: userId },
      include: this.includeRelations(),
    });

    if (dto.leadId) {
      await this.prisma.activity.create({
        data: {
          tenantId,
          leadId: dto.leadId,
          userId,
          type: ActivityType.TASK_CREATED,
          title: 'Task created',
          description: `Task "${task.title}" was created`,
        },
      });
    }

    return task;
  }

  async findAll(tenantId: string, page = 1, limit = 20, completed?: boolean, leadId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (completed !== undefined) where.isCompleted = completed;
    if (leadId) where.leadId = leadId;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        include: this.includeRelations(),
      }),
      this.prisma.task.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, tenantId },
      include: this.includeRelations(),
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(tenantId: string, id: string, userId: string, dto: Partial<CreateTaskDto> & { isCompleted?: boolean }) {
    const existing = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Task not found');

    const data: any = { ...dto };
    if (dto.isCompleted && !existing.isCompleted) {
      data.completedAt = new Date();

      if (existing.leadId) {
        await this.prisma.activity.create({
          data: {
            tenantId,
            leadId: existing.leadId,
            userId,
            type: ActivityType.TASK_COMPLETED,
            title: 'Task completed',
            description: `Task "${existing.title}" was marked as completed`,
          },
        });
      }
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: this.includeRelations(),
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Task not found');
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  async getUpcoming(tenantId: string, days = 7) {
    const end = new Date();
    end.setDate(end.getDate() + days);
    return this.prisma.task.findMany({
      where: {
        tenantId,
        isCompleted: false,
        dueDate: { gte: new Date(), lte: end },
      },
      orderBy: { dueDate: 'asc' },
      include: this.includeRelations(),
      take: 20,
    });
  }

  private includeRelations() {
    return {
      lead: { select: { id: true, firstName: true, lastName: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    };
  }
}
