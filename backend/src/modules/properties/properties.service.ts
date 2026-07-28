import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';

export class CreatePropertyDto {
  name: string;
  projectName?: string;
  type?: any;
  status?: any;
  city: string;
  locality?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  carpetArea?: number;
  superArea?: number;
  priceMin?: number;
  priceMax?: number;
  pricePerSqft?: number;
  description?: string;
  amenities?: string[];
  reraId?: string;
  possessionDate?: string;
}

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: { ...dto, tenantId, amenities: dto.amenities || [] },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string, type?: string, status?: string, city?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { projectName: { contains: search, mode: 'insensitive' } },
        { locality: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.property.count({ where }),
    ]);
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const prop = await this.prisma.property.findFirst({ where: { id, tenantId } });
    if (!prop) throw new NotFoundException('Property not found');
    return prop;
  }

  async update(tenantId: string, id: string, dto: Partial<CreatePropertyDto>) {
    const existing = await this.prisma.property.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Property not found');
    return this.prisma.property.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.property.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Property not found');
    await this.prisma.property.delete({ where: { id } });
    return { message: 'Property deleted' };
  }
}
