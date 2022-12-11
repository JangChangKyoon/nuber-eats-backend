import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { boolean, string } from 'joi';

enum UserRole { // for DB
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' }); // for gql

@InputType({ isAbstract: true }) // this Inputtype is not included in schema
@ObjectType() // in gql designates each type with below @Field
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field((type) => String) //gql with @ObjectType
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((type) => String) //gql with @ObjectType
  password: string;
  // select: boolean - Defines whether or not to hide this column by default when making queries.
  // When set to false, the column data will not show with a standard query.
  // 이메일 인증할 때 재암호화 방지용

  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole) //gql with @ObjectType and registerEnumType
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((type) => Boolean)
  verified: boolean;

  @BeforeUpdate() // before save by update
  @BeforeInsert() // before save in database
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
        // 10 times hassing
        console.log('hashPassword');
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
