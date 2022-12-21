import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/order.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  RelationId,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true }) // this Inputtype is not include in schema
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field((type) => String) // grapyql 스키마에서
  @Column() // database에서
  @IsString() // gql
  @Length(5) // validator
  name: string;

  // @Field(type => Boolean, { nullable: true })
  // @Column({ default: true })
  // @IsOptional()
  // @IsBoolean()
  // isVegan: boolean;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field((type) => String, { defaultValue: 'korea' })
  @Column()
  @IsString()
  address: string;

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.restaurant)
  orders: Order[];

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field((type) => [Dish])
  @OneToMany((type) => Dish, (dish) => dish.restaurant)
  menu: Dish[];

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
