import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

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
  me() {}
}
