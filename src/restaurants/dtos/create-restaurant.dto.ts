import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
// ['id] : omit id

//before #4.5 Mapped Types (12:23)
// @ArgsType()
// export class CreateRestaurantDto {
//   @Field((type) => String)
//   @IsString()
//   @Length(5, 10)
//   name: string;

//   @Field((type) => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field((type) => String)
//   @IsString()
//   address: string;

//   @Field((type) => String)
//   @IsString()
//   ownersName: string;
// }
