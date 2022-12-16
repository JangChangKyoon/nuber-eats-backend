import { Injectable, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {
    // console.log(options); // inject test
  }

  // excuted in usersService
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }

  // configure verify
  // excuted in jwt.middleware
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
