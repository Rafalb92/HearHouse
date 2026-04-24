import { IsString } from 'class-validator';
export class ConfirmLinkDto {
  @IsString() linkToken: string;
  @IsString() password: string;
}
