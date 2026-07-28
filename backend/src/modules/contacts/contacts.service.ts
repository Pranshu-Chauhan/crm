import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';
import { ContactType } from '@prisma/client';

export class CreateContactDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  phone2?: string;
  type?: ContactType;
  company?: string;
  city?: string;
  notes?: string;
  tags?: string[];
}

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: { ...dto, tenantId, tags: dto.tags || [] },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string, type?: ContactType) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.contact.count({ where }),
    ]);
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateContactDto>) {
    const existing = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Contact not found');
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact deleted' };
  }
}
