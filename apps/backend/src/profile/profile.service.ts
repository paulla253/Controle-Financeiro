import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getProfile(): Promise<Profile> {
    let profile = await this.profileRepository.findOne({ where: { id: 1 } });
    if (!profile) {
      // Create a default profile if it doesn't exist for the single user
      profile = this.profileRepository.create({ id: 1, jobTitle: '', monthlyIncome: 0 });
      await this.profileRepository.save(profile);
    }
    return profile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile> {
    let profile = await this.profileRepository.findOne({ where: { id: 1 } });
    if (!profile) {
        profile = this.profileRepository.create({ id: 1, ...updateProfileDto });
    } else {
        profile = this.profileRepository.merge(profile, updateProfileDto);
    }
    return this.profileRepository.save(profile);
  }
}
