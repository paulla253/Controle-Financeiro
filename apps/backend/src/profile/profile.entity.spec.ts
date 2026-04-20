import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

describe('Profile Entity', () => {
  let repository: Repository<Profile>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Profile],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Profile]),
      ],
    }).compile();

    repository = module.get('ProfileRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be able to create and retrieve a profile', async () => {
    const profileData = { jobTitle: 'Developer', monthlyIncome: 5000 };
    const profile = repository.create(profileData);
    await repository.save(profile);

    const foundProfile = await repository.findOne({ where: { id: profile.id } });

    expect(foundProfile).toBeDefined();
    expect(foundProfile.jobTitle).toEqual(profileData.jobTitle);
    expect(foundProfile.monthlyIncome).toEqual(profileData.monthlyIncome);
  });
});
