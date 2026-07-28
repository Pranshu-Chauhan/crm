import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContactsService, CreateContactDto } from './contacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post() create(@CurrentUser() user: any, @Body() dto: CreateContactDto) {
    return this.contactsService.create(user.tenantId, dto);
  }

  @Get() findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: any,
  ) {
    return this.contactsService.findAll(user.tenantId, page, limit, search, type);
  }

  @Get(':id') findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactsService.findOne(user.tenantId, id);
  }

  @Patch(':id') update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.contactsService.update(user.tenantId, id, dto);
  }

  @Delete(':id') remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactsService.remove(user.tenantId, id);
  }
}
