import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

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
      // AllowedRoles : frome role.decorator
      // reflector : check metadata
      'roles',
      // import from resolver decorater @Role(['Delivery])
      context.getHandler(),
    );
    // console.log(roles);
    if (!roles) {
      return true;
      // role is undefined, canAcitve return true
      // no metadata return true
      // if no decorator in resolver method, return true
    }
    // http request 가져오기
    // graphQL의 ExcutionContext에서 user 확인
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // http request를 gql로 변환
    const user = gqlContext['user'];
    // console.log(user);
    if (!user) {
      return false;
      // request can't continue
    }
    if (roles.includes('Any')) {
      return true;
      // request continue
    }
    // console.log(user);

    return roles.includes(user.user.role);
    // return true of false whether roles include user.role
  }
}
