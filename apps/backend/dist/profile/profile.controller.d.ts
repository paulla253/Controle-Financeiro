import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(): Promise<Profile>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile>;
}
