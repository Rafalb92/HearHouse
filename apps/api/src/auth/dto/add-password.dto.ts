import { IsString, MinLength } from 'class-validator';
export class AddPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}
