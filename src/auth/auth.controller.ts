import { Controller, Post, Body, UseInterceptors, UploadedFile, UseGuards, Request, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SignupWithFileDto } from './dto/signup-with-file.dto';
import { LoginDto } from './dto/logindto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async signup(@Body() signupDto: SignupWithFileDto, @UploadedFile() profilePicture: Express.Multer.File) {
    return this.authService.signup(signupDto, profilePicture);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto) {
    return this.authService.checkEmail(dto);
  }

  @Post('verify-password')
  async verifyPassword(@Body() dto: VerifyPasswordDto) {
    return this.authService.verifyPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('update-profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @Request() req,
    @UploadedFile() profilePicture: Express.Multer.File
  ) {
    return this.authService.updateProfilePicture(req.user.userId, profilePicture);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }

  @Get('debug-profile')
  @UseGuards(JwtAuthGuard)
  async debugProfile(@Request() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }
}
