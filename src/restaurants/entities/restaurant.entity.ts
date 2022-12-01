import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@InputType({ isAbstract: true }) // this Inputtype is not include in schema
@ObjectType()
@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Boolean, { nullable: true }) // grapyql 스키마에서
  @Column({ default: true }) // database에서
  @IsOptional() // gql
  @IsBoolean() // gql
  isVegan: boolean; //db

  @Field((type) => String, { defaultValue: 'korea' })
  @Column()
  @IsString()
  address: string;

  // @Field((type) => String)
  // @Column()
  // @IsString()
  // ownersName: string;

  // @Field((type) => String)
  // @Column()
  // @IsString()
  // categoryName: string;
}

/* before #4.5 Mapped Types (12:23)
@ObjectType()
@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @Column()
  name: string;

  //   @Field((type) => Boolean, { nullable: true })
  //   isGood?: boolean;

  @Field((type) => Boolean)
  @Column()
  isVegan: boolean;

  @Field((type) => String)
  @Column()
  address: string;

  @Field((type) => String)
  @Column()
  ownersName: string;

  // @Field((type) => String)
  // @Column()
  // categoryName: string;
}
*/
