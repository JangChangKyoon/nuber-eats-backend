import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';
import { JoinColumn, Repository } from 'typeorm';
import { isBooleanObject } from 'util/types';

// TEST module의 getRepositoryToken와 연관됨.
const mockRepository = () => ({
  //아래는 usersService에서 사용된 repository의 함수(findOne,save,create,update)들
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  // findOneOrFail: jest.fn(),
});
// TEST module(ockMailService)의 JwtService와 연관됨.
const mockJwtService = () => ({
  //아래는 JwtService에서 사용된 함수들
  sign: jest.fn(() => 'signed-token-baby'),
  // jwt의 sign 함수를 "sign token baby"을 return 하도록 만듦
  verify: jest.fn(),
});
// TEST module의 MailService와 연관됨.
const mockMailService = () => ({
  //아래는 mockMailService에서 사용된 함수들
  sendVerificationEmail: jest.fn(),
});

// import { Repository } from 'typeorm';
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
// 아래 let usersRepository의 타입을 정해줌
// repository의 함수들 즉, findOne,save,create,update 등의 타입이 mock이라고 지정

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
  /* 아래 TEST모듈(mockMailService)에 의해 맴버변수로 온 것, describe 아래 다른 것을 위해 사용될 것이다.*/
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<User>;
  let mailService: MailService;
  let jwtService: JwtService;

  // TEST Module
  // beforeAll(async () => { // calls 오류 발생
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // 모듈로 불러올 것들
      providers: [
        UsersService,
        // UsersService에서 사용되는 모든 함수들을 불러와서 모조하는 작업
        {
          provide: getRepositoryToken(User), // User Entity의 repository token(함수)들을 제공해줌
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification), // Verification Entity의 repository token(함수)들을 제공해줌
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile(); // 컴파일

    /* 불러온 것을 사용하려고 꺼내 위 맴버 변수로 보내주는 것*/
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  //describe(테스트대상함수, ()=>{해당함수내로직...})
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'jc@js.js',
      password: 'js.password',
      role: 0,
    };
    it('should fall if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        // mockResolvedValue = Promise.resolve(value)
        // 결과물을 mock
        id: 1,
        email: '',
      });
      const result = await service.createAccount(createAccountArgs);
      // service: 위 맴버변수를 가자와서 사용하며, 실제 로직(UsersService의 createAccount)에 접근하나,
      // 결과는 DB에 반영되지 않도록 함.
      expect(result).toMatchObject({
        // toMatchObject : {ok:boolean, error:string}
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    it('should create a new user', async () => {
      /* MOCKING return value
       - return value is returned by a function, the other one is returned by a promise.
      '- resolved' emulates returned value by an 'await'
      */

      usersRepository.findOne.mockResolvedValue(undefined); //mock return value : undefined
      // findOne에 들어온 값이 없음을 기대

      usersRepository.create.mockReturnValue(createAccountArgs); // create : return entity(looks like Object)
      // return 값을 설정해 줌 : createAccountArgs
      // for 아래 코드 인수 확인하려고 => expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      usersRepository.save.mockResolvedValue(createAccountArgs); // mock : return user Object : createAccountArgs
      // user 값을 mock save 해줌

      verificationRepository.create.mockReturnValue({
        user: createAccountArgs, // create return : return verification entity() : {user: createAccountArgs}
      }); //

      verificationRepository.save.mockResolvedValue({
        code: 'code',
      }); // mock : return verification.code : { code: 'code' }

      const result = await service.createAccount(createAccountArgs);
      // TEST하기 위해 변수에 담음

      /* 위 Mocking return과 인수를 대조하며 TEST */

      /* 테스트 범위
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
       */
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      // toHaveBeenCalledTimes(1) : 이 메소드가 한번 불릴 것이라 기대
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      // toHaveBeenCalledWith : 무엇과 같이 호출되는 지 확인(인수 확인)
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs); // 필요요건 await service.createAccount(createAccountArgs);

      /* 테스트 범위      
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      ); */
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs, // 필요요소(user값) usersRepository.save.mockResolvedValue(createAccountArgs)
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      /* 테스트 범위  
      this.mailService.sendVerificationEmail(user.email, verification.code);
      */
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      //verification.code이 있어야 작동하므로 위에서 mock해주자
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      /* 테스트 범위  
      catch (e) {
        return { ok: false, error: "Couldn't create account" };
      }
      */
      usersRepository.findOne.mockRejectedValue(new Error());
      // mockRejectedValue : 항상 거부하는 비동기 mock 함수를 만드는 데 유용
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'JC@Jo.ke',
      password: 'bs.password',
    };

    it('should fail if user does not exist', async () => {
      /* 테스트 범위
      await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      */

      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: expect.any(Object),
        select: expect.any(Array),
      });

      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });

    it('should fall if the password is wrong', async () => {
      /* 테스트 범위
      const passwordCorrect = await user.checkPassword(password);
       if (!passwordCorrect) {
         return {
            ok: false,
            error: 'Wrong Password',
         };
       } */

      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
        // promise.(~)를 return하는 mockfunction
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      // 일부로 (!passwordCorrect)로 만듦

      /* 아래 코드
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
       */
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong Password' });
    });
    it('should return token if password correct', async () => {
      /* 테스트 범위
         const token = this.jwtService.sign(user.id);
         sign(userId: number): string {
           return jwt.sign({ id: userId }, this.options.privateKey)};
  }
        */
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      // console.log(result);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
      // token: 위 맵버변수 Object에 설정한 값
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Can't log user in." });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  it.todo('editProfile');
  it.todo('verifyEmail');
});
