import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { Category } from './category.entity';

@InputType({ isAbstract: true }) // this Inputtype is not include in schema
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field((type) => String) // grapyql 스키마에서
  @Column() // database에서
  @IsString() // gql
  @Length(5) // validator
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field((type) => String, { defaultValue: 'korea' })
  @Column()
  @IsString()
  address: string;

  @Field((type) => Category)
  @ManyToOne((type) => Category, (category) => category.restaurants)
  category: Category;

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
