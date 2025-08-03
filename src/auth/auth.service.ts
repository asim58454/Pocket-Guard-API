import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v2 as cloudinary } from 'cloudinary';
import { User } from './user.entity';
import { SignupDto } from './dto/signup.dto';
import { SignupWithFileDto } from './dto/signup-with-file.dto';
import { LoginDto } from './dto/logindto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

async signup(signupDto: SignupWithFileDto, profilePicture: Express.Multer.File) {
  const existingUserByEmail = await this.userRepo.findOne({
    where: { email: signupDto.email },
  });

  if (existingUserByEmail) {
    throw new BadRequestException('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(signupDto.password, 10);

  if (!profilePicture) {
    throw new BadRequestException('Profile picture is required');
  }

  let profilePictureUrl: string;
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile-pictures',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url);
          }
        }
      );
      uploadStream.end(profilePicture.buffer);
    });
    
    profilePictureUrl = await uploadPromise as string;
  } catch (error) {
    throw new BadRequestException('Failed to upload profile picture');
  }

  const newUser = this.userRepo.create({
    fullName: signupDto.fullName,
    email: signupDto.email,
    password: hashedPassword,
    profilePicture: profilePictureUrl,
  });

  const savedUser = await this.userRepo.save(newUser);

  const payload = { sub: savedUser.id, email: savedUser.email };
  const token = await this.jwtService.signAsync(payload);

  return {
    message: 'Registered successfully',
    access_token: token,
    user: {
      id: savedUser.id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePicture: savedUser.profilePicture,
    }
  };
}


  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Force a fresh database query to get the latest user data
    const freshUser = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id: user.id })
      .getOne();

    if (!freshUser) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: freshUser.id, email: freshUser.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: freshUser.id,
        fullName: freshUser.fullName,
        email: freshUser.email,
        profilePicture: freshUser.profilePicture,
      }
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
  const user = await this.userRepo.findOne({
    where: { email: dto.email },
  });

  if (!user) {
    throw new BadRequestException('Email does not exist');
  }

  const isPasswordMatch = await bcrypt.compare(dto.oldPassword, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedException('Old password does not match');
  }

  const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
  user.password = hashedNewPassword;

  await this.userRepo.save(user);

  return { message: 'Password updated successfully' };
}

  async checkEmail(dto: CheckEmailDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Email does not exist');
    }

    return { message: 'Email exists', exists: true };
  }

  async verifyPassword(dto: VerifyPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Email does not exist');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return { message: 'Password verified successfully', valid: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Email does not exist');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedNewPassword;

    await this.userRepo.save(user);

    return { message: 'Password reset successfully' };
  }

  async updateProfilePicture(userId: number, profilePicture: Express.Multer.File) {
    // Validate userId
    if (!userId || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!profilePicture) {
      throw new BadRequestException('Profile picture is required');
    }

    let profilePictureUrl: string;
    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile-pictures',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result?.secure_url);
            }
          }
        );
        uploadStream.end(profilePicture.buffer);
      });
      
      profilePictureUrl = await uploadPromise as string;
    } catch (error) {
      throw new BadRequestException('Failed to upload profile picture');
    }

    // Update the user entity and save it
    user.profilePicture = profilePictureUrl;
    const updatedUser = await this.userRepo.save(user);

    return {
      message: 'Profile picture updated successfully',
      profilePicture: updatedUser.profilePicture,
    };
  }

  async getCurrentUser(userId: number) {
    // Use query builder to ensure fresh data
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    };
  }

}
