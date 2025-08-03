import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @MinLength(8, { message: 'New password must be at least 8 characters' })
  newPassword: string;
}
