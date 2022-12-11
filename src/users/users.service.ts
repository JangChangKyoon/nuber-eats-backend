import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(User) private readonly users: Repository<User>,

    private readonly jwtService: JwtService,
  ) {
    // console.log(this.config.get('SECRET_KEY'));
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // check new user
    // console.log('[---------service_createAcount start--------]');
    // console.log(password);

    try {
      const exists = await this.users.findOne({ where: { email } });
      // console.log(exists);
      if (exists) {
        // make error
        // console.log('[---------service_createAcount error--------]');
        return { ok: false, error: 'There is a user with that email already' };
      }
      // await this.users.save(this.users.create({ email, password, role }));
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(this.verifications.create({ user }));
      // verfication 호출하여 code 인증
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
        // select: ['password'] : entity에 기본적으로 출력되지 않도록 설정해놓아서(select: false)
        // 그걸을 무시하고 호출하도록 함
      });
      // console.log(user);
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong Password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id } });
      if (user) {
        return { ok: true, user: user };
      }
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  // user.entity의 @BeforeUpdate 오류 발생
  // async editProfile(userId: number, editProfileInput: EditProfileInput) {
  //   return this.users.update(userId, { ...editProfileInput });
  // }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      if (email) {
        user.email = email;

        user.verified = false;
        await this.verifications.save(this.verifications.create({ user }));
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: {
          user: true,
        },
      });
      // console.log(verification);
      if (verification) {
        verification.user.verified = true;
        // code가 있다먄 user테이블의 verifiedfmf true로 바꿔줘
        await this.users.save(verification.user);
        // 바꾼 내용을 user테이블에 저장해줘
        // entity의 BeforeInsert로 한번 더 헤시를 해서 재암호화로 비밀번호 인증에 에러 발생
        // 해결 : entity에 password column에 selete:false를 설정
        await this.verifications.delete(verification.id);
        // 인증이 끝났으니까 verifications테이블의 인증이 끝난 코드는 지워줘
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      // console.log(error);
      return { ok: false, error };
    }
  }
}
