import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { SaveApifyHousingDto } from './dto/save-apify-housing.dto';
import { SaveHousingComDto } from './dto/save-housing-com.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('apify/housing')
  @Roles('ADMIN' as any, 'MANAGER' as any)
  @ApiOperation({ summary: 'Get Apify Housing.com integration settings (token excluded)' })
  getApifyHousing(@CurrentUser() user: any) {
    return this.integrationsService.getApifyHousing(user.tenantId);
  }

  @Post('apify/housing')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Save Apify Housing.com developer settings' })
  saveApifyHousing(@CurrentUser() user: any, @Body() dto: SaveApifyHousingDto) {
    return this.integrationsService.saveApifyHousing(user.tenantId, dto);
  }

  @Post('apify/housing/test-import')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Run the configured actor once and import valid lead records' })
  testImport(@CurrentUser() user: any) {
    return this.integrationsService.testImportApifyHousing(user.tenantId, user.id);
  }

  @Get('housing')
  @Roles('ADMIN' as any, 'MANAGER' as any)
  @ApiOperation({ summary: 'Get Housing.com integration settings (secret key excluded)' })
  getHousingCom(@CurrentUser() user: any) {
    return this.integrationsService.getHousingCom(user.tenantId);
  }

  @Post('housing')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Save Housing.com API credentials' })
  saveHousingCom(@CurrentUser() user: any, @Body() dto: SaveHousingComDto) {
    return this.integrationsService.saveHousingCom(user.tenantId, dto);
  }

  @Post('housing/fetch-leads')
  @Roles('ADMIN' as any, 'MANAGER' as any)
  @ApiOperation({ summary: 'Fetch leads from Housing.com using saved credentials' })
  fetchHousingLeads(@CurrentUser() user: any) {
    return this.integrationsService.fetchHousingComLeads(user.tenantId, user.id);
  }
}
