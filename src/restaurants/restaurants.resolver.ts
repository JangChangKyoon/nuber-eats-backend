import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    //veganOnly: boolean : determine arg type
    // console.log(veganOnly);
    return [];
  }

  @Mutation((returns) => Boolean)
  createRestaurant(
    /* 아래 코드로 대체
    @Args('name') name: string,
    @Args('isVegan') isVegan: boolean,
    @Args('address') address: string,
    @Args('ownersName') ownersName: string,
    */
    @Args() CreateRestaurantDto: CreateRestaurantDto,
  ): boolean {
    // console.log(createRestaurantDto); // createData API Test
    return true;
  }
}
