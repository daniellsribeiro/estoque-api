import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  find() {
    return this.preferencesService.find();
  }

  @Patch()
  update(@Body() dto: UpdatePreferenceDto, @CurrentUser() user?: any) {
    return this.preferencesService.update(dto.alertaEstoque, user?.id);
  }
}

