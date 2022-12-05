import { Injectable, CanActivate } from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: GqlExecutionContext) {
    // http request 가져오기
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // http request를 gql로 변환
    const user = gqlContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
