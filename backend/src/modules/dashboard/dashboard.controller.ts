import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getKpis(@CurrentUser() user: any) {
    return this.dashboardService.getKpis(user.tenantId);
  }

  @Get('leads-by-status')
  getLeadsByStatus(@CurrentUser() user: any) {
    return this.dashboardService.getLeadsByStatus(user.tenantId);
  }

  @Get('leads-by-source')
  getLeadsBySource(@CurrentUser() user: any) {
    return this.dashboardService.getLeadsBySource(user.tenantId);
  }

  @Get('deals-by-stage')
  getDealsByStage(@CurrentUser() user: any) {
    return this.dashboardService.getDealsByStage(user.tenantId);
  }

  @Get('recent-leads')
  getRecentLeads(@CurrentUser() user: any) {
    return this.dashboardService.getRecentLeads(user.tenantId);
  }

  @Get('agent-performance')
  getAgentPerformance(@CurrentUser() user: any) {
    return this.dashboardService.getAgentPerformance(user.tenantId);
  }

  @Get('lead-trend')
  getLeadTrend(@CurrentUser() user: any) {
    return this.dashboardService.getLeadTrend(user.tenantId);
  }
}
