import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    //come from usersModule by exports
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // find a token and decode it
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      const decoded = this.jwtService.verify(token.toString());

      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        try {
          // const user = await this.userService.findById(decoded['id']);
          // req['user'] = user;

          const { user, ok } = await this.userService.findById(decoded['id']);
          if (ok) {
            // 그냥저장하면 ok와 user를 같이 출력하니까, user만 걸러서 메모리에 입력되도록
            req['user'] = user;
          }

          // decoded Object에서 id의 value 값 가져오기
          // console.log(user);
        } catch (e) {}
      }
    }
    next();
  }
}
