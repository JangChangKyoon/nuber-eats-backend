import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';

// TEST module의 getRepositoryToken와 연관됨.
const mockRepository = {
  //아래는 usersService에서 사용된 repository의 함수들
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};
// TEST module(ockMailService)의 JwtService와 연관됨.
const mockJwtService = {
  //아래는 JwtService에서 사용된 함수들
  sign: jest.fn(),
  verify: jest.fn(),
};
// TEST module의 MailService와 연관됨.
const mockMailService = {
  //아래는 mockMailService에서 사용된 함수들
  sendVerificationEmail: jest.fn(),
};

// import { Repository } from 'typeorm';
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
// 아래 let usersRepository의 타입을 정해줌
/*
 Record(https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) 
  - 속성키가 Key이고 속성값이 Type인 객체 유형을 구성, 
  - 한 유형의 속성을 다른 유형에 매핑하는 데 사용
*/
/*
 Keyof Type Operator(https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
  - 객체 Type을 사용하여 해당 키의 문자열 또는 숫자 리터럴 통합을 생성
*/

describe('UsersService', () => {
  let service: UsersService;
  // 아래 TEST모듈(mockMailService)에 의해 맴버변수로 온 것, describe 아래 다른 것을 위해 사용될 것이다.

  let usersRepository: MockRepository<User>;
  // 아래 TEST모듈(mockMailService)에 의해 맴버변수로 온 것

  // TEST Module
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      // 모듈로 불러올 것들
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), // User Entity의 repository token을 제공해줌
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification), // Verification Entity의 repository token을 제공해줌
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile(); // 컴파일
    service = module.get<UsersService>(UsersService);
    // 불러온 것을 사용하려고 꺼내 위 맴버 변수로 보내주는 것
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fall if user exists', () => {});
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
