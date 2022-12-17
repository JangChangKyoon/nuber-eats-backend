import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, Length, IsNumber, IsDate } from 'class-validator';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { isNumber } from 'util';
import { isDate } from 'util/types';

export class CoreEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @Field((type) => String)
  id: number;

  @CreateDateColumn()
  @Field((type) => Date)
  // @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @Field((type) => Date)
  // @IsDate()
  updatedAt: Date;
}
