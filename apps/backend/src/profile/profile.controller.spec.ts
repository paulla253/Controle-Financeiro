import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile.module';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

describe('ProfileController (integration)', () => {
  let app: INestApplication;
  let profileRepository: Repository<Profile>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    profileRepository = moduleFixture.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  beforeEach(async () => {
    await profileRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should GET profile and create a default one if not exists', async () => {
    return request(app.getHttpServer())
      .get('/api/profile')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(Number),
          jobTitle: '',
          monthlyIncome: 0,
        });
      });
  });

  it('should PUT to update the profile', async () => {
    const updateDto = { jobTitle: 'Senior Tester', monthlyIncome: 9999 };
    return request(app.getHttpServer())
      .put('/api/profile')
      .send(updateDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(Number),
          ...updateDto,
        });
      });
  });

  it('should GET the updated profile after a PUT', async () => {
    const updateDto = { jobTitle: 'Senior Tester', monthlyIncome: 9999 };
    await request(app.getHttpServer())
      .put('/api/profile')
      .send(updateDto);

    return request(app.getHttpServer())
      .get('/api/profile')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(Number),
          ...updateDto,
        });
      });
  });

  it('should fail to PUT with invalid data', async () => {
    const invalidDto = { jobTitle: 123, monthlyIncome: 'not-a-number' };
    return request(app.getHttpServer())
      .put('/api/profile')
      .send(invalidDto)
      .expect(400);
  });
});
