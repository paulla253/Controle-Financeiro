import { Controller, Get, Put, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.', type: Profile })
  getProfile(): Promise<Profile> {
    return this.profileService.getProfile();
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'The profile has been successfully updated.', type: Profile })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updateProfile(@Body() updateProfileDto: UpdateProfileDto): Promise<Profile> {
    return this.profileService.updateProfile(updateProfileDto);
  }
}
