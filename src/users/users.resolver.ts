import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean) // from @nestjs/graphql not common
  hi() {
    return true;
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    console.log('[-------come In resolve_Mutation_createAccount_Args--------]');
    console.log(createAccountInput.password);
    console.log(createAccountInput.email);
    console.log(createAccountInput.role);
    try {
      const { ok, error } = await this.usersService.createAccount(
        createAccountInput,
      );
      return {
        ok,
        error,
      };
      // return this.usersService.createAccount(createAccountInput);
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      // return this.usersService.login(loginInput);
      const { ok, error, token } = await this.usersService.login(loginInput);
      return { ok, error, token };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Query((returns) => User)
  // me(@Context() context) {
  //   if (!context.user) {
  //     return;
  //   } else {
  // console.log(context);
  /* context :
      User {
        id: 2,
        createdAt: 2022-12-02T12:14:35.361Z,
        updatedAt: 2022-12-02T12:14:35.361Z,
        email: 'Jang1k@jangc.ok',
        password: '$2b$10$jgprrxvMT4O3/o/Crjhaz.QJMgcLT1lJz.ifeq0cGV4iCfwzfGMZi',
        role: 1
      }
      */
  // return context.user;
  //   }
  // }
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @UseGuards(AuthGuard)
  @Query((returns) => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(authUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  //import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
  @Mutation((returns) => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    //  { code } means there is an object that has a prop. called 'code' inside.
    try {
      await this.usersService.verifyEmail(code);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
