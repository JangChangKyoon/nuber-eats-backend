import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testKey';
const USER_ID = 1;

/* mocking though jsonwebtoken*/
jest.mock('jsonwebtoken', () => {
  // 'jsonwebtoken' : 위 모듈 이름
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })), // return decoded token
  };
});

// const TEST_KEY = 'testKey';

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      /*  테스트 범위
          sign(userId: number): string {
          return jwt.sign({ id: userId }, this.options.privateKey);} */
      const ID = 1;
      const token = service.sign(USER_ID); // sign(userId: number)의 리턴값을 반환해줌
      // console.log(token);

      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY); // return jwt.sign({ id: userId }, this.options.privateKey);}
    });
  });

  describe('verify', () => {
    it('should return the decoded token', () => {
      const TOKEN = 'TOKEN'; // return value of the same above sign method
      const decodedToken = service.verify(TOKEN);

      /*  테스트 범위
          verify(token: string) {
          return jwt.verify(token, this.options.privateKey);} */
      expect(decodedToken).toEqual({ id: USER_ID });
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY); // return jwt.verify(token, this.options.privateKey);}
    });
  });
});
