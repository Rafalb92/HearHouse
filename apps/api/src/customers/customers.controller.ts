import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertAddressDto } from './dto/upsert-address.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';

@Controller('customers')
@UseGuards(JwtAuthGuard) // wszystkie endpointy wymagają autentykacji
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  // ─── Profile ─────────────────────────────────────────────────────────────────

  @Get('profile')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.customers.getProfile(user.id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.customers.updateProfile(user.id, dto);
  }

  // ─── Addresses ───────────────────────────────────────────────────────────────

  @Get('addresses')
  getAddresses(@CurrentUser() user: AuthUser) {
    return this.customers.getAddresses(user.id);
  }

  @Get('addresses/:id')
  getAddress(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.customers.getAddress(user.id, id);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(@CurrentUser() user: AuthUser, @Body() dto: UpsertAddressDto) {
    return this.customers.createAddress(user.id, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpsertAddressDto,
  ) {
    return this.customers.updateAddress(user.id, id, dto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.customers.deleteAddress(user.id, id);
  }

  @Patch('addresses/:id/default')
  setDefaultAddress(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.customers.setDefaultAddress(user.id, id);
  }
}
