import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
