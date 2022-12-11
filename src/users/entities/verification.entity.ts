import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

// Restaurant entity에서 InputType decorator를 명시해주고 isAbstract:true를 해준다. 이는 InputType은 스키마에 포함되지 않고 어딘가에서 복사해서 쓰여짐을 의미한다. 이때 Dto에서 두 번째 인자는 지워준다.
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  // junction tables now have onDelete: "CASCADE" attribute on their foreign keys
  // onDelete: CASCADE : User가 지워질 때 같이 지워지도록 설정
  @JoinColumn()
  user: User;

  // 저장할 때마다 위 code를 갱신해줌
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
