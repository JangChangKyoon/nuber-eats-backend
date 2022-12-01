import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput {
  // role of responseDto in java
  @Field((type) => String, { nullable: true }) // for TS
  error?: string; // for DB
  // 'error' has ? it means sometimes we will return an object with or without it.

  @Field((type) => Boolean)
  ok: boolean;
}
