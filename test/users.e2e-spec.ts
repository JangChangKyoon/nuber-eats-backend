import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // 모든 모듈을 불러옴
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it.todo('me');
});
