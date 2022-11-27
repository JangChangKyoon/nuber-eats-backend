import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  /*
  @Query((returns) => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    //veganOnly: boolean : determine arg type
    // console.log(veganOnly); 
    return [];
  }
  */

  @Query((returns) => [Restaurant])
  restaurants(): Restaurant[] {
    return [];
  }
}
