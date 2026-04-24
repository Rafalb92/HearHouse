import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export type UploadResult = {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export type UploadFolder = 'products' | 'avatars';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly maxBytes: number;
  private readonly allowedFormats: string[];

  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });

    const maxMb = Number(config.get<string>('UPLOAD_MAX_FILE_SIZE_MB') ?? '10');
    this.maxBytes = maxMb * 1024 * 1024;

    this.allowedFormats = (
      config.get<string>('UPLOAD_ALLOWED_FORMATS') ?? 'jpg,jpeg,png,webp,avif'
    ).split(',');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: UploadFolder = 'products',
  ): Promise<UploadResult> {
    this.validateFile(file);

    const result = await this.streamUpload(file.buffer, folder);

    this.logger.log(`Uploaded ${file.originalname} → ${result.secure_url}`);

    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Deleted Cloudinary asset: ${publicId}`);
    } catch (err) {
      this.logger.error(`Failed to delete asset ${publicId}`, err);
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private validateFile(file: Express.Multer.File): void {
    if (file.size > this.maxBytes) {
      throw new BadRequestException(
        `File too large. Max size is ${this.maxBytes / 1024 / 1024}MB.`,
      );
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (!this.allowedFormats.includes(ext)) {
      throw new BadRequestException(
        `File format not allowed. Allowed: ${this.allowedFormats.join(', ')}.`,
      );
    }
  }

  private streamUpload(
    buffer: Buffer,
    folder: UploadFolder,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `hear-house/${folder}`,
          resource_type: 'image',
          // Automatyczna optymalizacja jakości i formatu
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error)
            return reject(
              new Error(error.message ?? 'Cloudinary upload failed.'),
            );
          if (!result)
            return reject(
              new Error('Upload failed: no result from Cloudinary.'),
            );
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
