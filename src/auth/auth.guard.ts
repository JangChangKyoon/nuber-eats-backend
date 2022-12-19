import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

//인증 절차(authguard)
// CanActivate true와 false만 return하면서 request를 진행할 지 결정함
// 1. (!roles) : metadata가 있는 지 확인(권한이 무엇인지 확인)
// 2. (!user) : 로그인되었는 지 확인
// 위 둘을 가지고 true or false return하여 request 진행할지 결정

@Injectable()
export class AuthGuard implements CanActivate {
  // CanActivate return only true or false
  // if return true, request continue, nor false
  constructor(private readonly reflector: Reflector) {}
  // In order to access the route's role(s) (custom metadata),
  // we'll use the Reflector helper class,
  // which is provided out of the box by the framework
  // and exposed from the @nestjs/core package.
  // https://docs.nestjs.com/guards#putting-it-all-together
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      // AllowedRoles : from role.decorator
      // reflector : check metadata
      'roles',
      // 'role' is role.decorator Role's metadata key
      // for importing from resolver decorater @Role(['Delivery])
      context.getHandler(),
    );
    // console.log(roles);
    if (!roles) {
      return true;
      // roles가 없다면 metadata가 없다는 것이니까 public(권한없어도 됨)을 의미함

      // role is undefined, canAcitve return true
      // no metadata return true
      // if no decorator in resolver method, return true
    }
    // http request 가져오기
    // graphQL의 ExcutionContext에서 user 확인
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // http request를 gql로 변환
    // app.module에 설정하고 gql이 request할 때 포착
    const user = gqlContext['user'].user;
    // console.log('auth');
    // console.log(user);
    // 위 변수가 있다면 유저가 로그인했다는 것임.
    // console.log(user);
    if (!user) {
      return false;
      // request can't continue
    }

    /* 이하부터는 metadata도 있고, 유저도 로그인이 되었을 경우 */
    if (roles.includes('Any')) {
      return true;
      // request continue
    }
    // console.log(user);

    return roles.includes(user.role);
    // return true of false whether roles include user.role
  }
}
