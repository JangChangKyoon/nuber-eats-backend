import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, Length, IsNumber, IsDate } from 'class-validator';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { isNumber } from 'util';
import { isDate } from 'util/types';

@ObjectType() // 이걸 넣어주어야 퀴리에 output이 출력됨, 다만 이거 없어도 데이터베이스에는 입력이 됨.
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
