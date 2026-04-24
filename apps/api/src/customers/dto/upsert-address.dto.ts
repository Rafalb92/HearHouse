import {
  IsBoolean,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpsertAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Matches(/^\+?[\d\s\-().]{7,30}$/, {
    message: 'Invalid phone number format.',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apartment?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsNotEmpty()
  @IsISO31661Alpha2()
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
