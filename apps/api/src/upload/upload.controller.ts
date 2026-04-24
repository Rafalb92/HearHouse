import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/users/entities/user.entity';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // trzymamy w pamięci, wysyłamy do Cloudinary
      limits: { fileSize: 15 * 1024 * 1024 }, // 15MB hard limit na multer
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    return this.upload.uploadFile(file, 'products');
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB dla avatarów
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('No file provided.');
    return this.upload.uploadFile(file, 'avatars');
  }

  @Delete(':publicId')
  async deleteFile(@Param('publicId') publicId: string) {
    // publicId może zawierać slash (hearhouse/products/abc123)
    // dekodujemy z base64url żeby bezpiecznie przekazać przez URL
    const decoded = Buffer.from(publicId, 'base64url').toString('utf-8');
    await this.upload.deleteFile(decoded);
    return { ok: true };
  }
}
