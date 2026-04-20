import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private readonly profileRepository;
    constructor(profileRepository: Repository<Profile>);
    getProfile(): Promise<Profile>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile>;
}
