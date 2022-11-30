import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

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
  ownerName: string;

  @Field((type) => String)
  @Column()
  categoryName: string;
}
