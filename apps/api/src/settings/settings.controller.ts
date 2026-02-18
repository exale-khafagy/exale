import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { SettingsService, UpdateSettingsDto } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @UseGuards(AdminGuard)
  getSettings() {
    return this.settings.getSettings();
  }

  @Put()
  @UseGuards(AdminGuard)
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settings.updateSettings(dto);
  }
}
