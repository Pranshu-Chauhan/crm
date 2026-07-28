import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  create(@CurrentUser() user: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('completed') completed?: string,
    @Query('leadId') leadId?: string,
  ) {
    return this.tasksService.findAll(
      user.tenantId,
      page,
      limit,
      completed !== undefined ? completed === 'true' : undefined,
      leadId,
    );
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks (next 7 days)' })
  getUpcoming(@CurrentUser() user: any) {
    return this.tasksService.getUpcoming(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.tasksService.update(user.tenantId, id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.remove(user.tenantId, id);
  }
}
