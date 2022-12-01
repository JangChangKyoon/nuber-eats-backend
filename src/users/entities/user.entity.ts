import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

enum UserRole { // for DB
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' }); // for gql

@InputType({ isAbstract: true }) // this Inputtype is not include in schema
@ObjectType() // in gql designates each type with below @Field
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field((type) => String) //gql with @ObjectType
  email: string;

  @Column((type) => String)
  @Field((type) => String) //gql with @ObjectType
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole) //gql with @ObjectType and registerEnumType
  role: UserRole;
}
