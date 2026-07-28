import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService, CreatePropertyDto } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post() create(@CurrentUser() user: any, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.tenantId, dto);
  }

  @Get() findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.propertiesService.findAll(user.tenantId, page, limit, search, type, status, city);
  }

  @Get(':id') findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.propertiesService.findOne(user.tenantId, id);
  }

  @Patch(':id') update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.propertiesService.update(user.tenantId, id, dto);
  }

  @Delete(':id') remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.propertiesService.remove(user.tenantId, id);
  }
}
