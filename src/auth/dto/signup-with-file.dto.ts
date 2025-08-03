import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupWithFileDto {
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
} 