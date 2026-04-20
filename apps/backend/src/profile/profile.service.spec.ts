import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';

describe('ProfileService', () => {
  let service: ProfileService;
  let repository: Repository<Profile>;

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return an existing profile', async () => {
      const profile = { id: 1, jobTitle: 'Developer', monthlyIncome: 5000 };
      mockProfileRepository.findOne.mockResolvedValue(profile);

      expect(await service.getProfile()).toEqual(profile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should create and return a default profile if none exists', async () => {
      const defaultProfile = { id: 1, jobTitle: '', monthlyIncome: 0 };
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue(defaultProfile);
      mockProfileRepository.save.mockResolvedValue(defaultProfile);

      expect(await service.getProfile()).toEqual(defaultProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the profile', async () => {
      const existingProfile = { id: 1, jobTitle: 'Developer', monthlyIncome: 5000 };
      const updatedData = { jobTitle: 'Senior Developer', monthlyIncome: 7000 };
      
      // First, getProfile is called, which might find an existing profile
      mockProfileRepository.findOne.mockResolvedValue(existingProfile);
      // Then merge is called
      mockProfileRepository.merge.mockImplementation((profile, data) => ({...profile, ...data}));
      // Finally, save is called
      mockProfileRepository.save.mockImplementation(profile => Promise.resolve(profile));

      const result = await service.updateProfile(updatedData);

      expect(result.jobTitle).toEqual(updatedData.jobTitle);
      expect(result.monthlyIncome).toEqual(updatedData.monthlyIncome);
      expect(mockProfileRepository.merge).toHaveBeenCalledWith(existingProfile, updatedData);
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });
  });
});
