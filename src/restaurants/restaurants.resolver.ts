import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

// GraphQL Query/Mutation으로 DB에 접근하는 RestaurantService의 메서드들 활용.
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}

// before #11.2 createRestaurant
//   @Query((returns) => [Restaurant])
//   restaurants(): Promise<Restaurant[]> {
//     return this.restaurantService.getAll();
//   }
//   @Mutation((returns) => Boolean)
//   async createRestaurant(
//     /* 아래 코드로 대체
//     @Args('name') name: string,
//     @Args('isVegan') isVegan: boolean,
//     @Args('address') address: string,
//     @Args('ownersName') ownersName: string,
//     */
//     // @Args() createRestaurantDto: CreateRestaurantDto,
//     @Args('input') createRestaurantDto: CreateRestaurantDto,
//     // 'input' : if arg is InputType, alias is required
//   ): Promise<boolean> {
//     console.log(createRestaurantDto);
//     try {
//       await this.restaurantService.createRestaurant(createRestaurantDto);
//       // console.log(createRestaurantDto); // createData API Test
//       return true;
//     } catch (e) {
//       console.log(e);
//       return false;
//     }
//   }

//   @Mutation((returns) => Boolean)
//   async updateRestaurant(
//     @Args('input') updateRestaurantDto: UpdateRestaurantDto,
//   ): Promise<boolean> {
//     try {
//       await this.restaurantService.updateRestaurant(updateRestaurantDto);
//       return true;
//     } catch (e) {
//       console.log(e);
//       return false;
//     }
//   }
// }

/* before #4.2 Injecting The Repository (07:44)
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
    //아래 코드로 대체
    //@Args('name') name: string,
    //@Args('isVegan') isVegan: boolean,
    //@Args('address') address: string,
    //@Args('ownersName') ownersName: string,
    
    @Args() CreateRestaurantDto: CreateRestaurantDto,
  ): boolean {
    // console.log(createRestaurantDto); // createData API Test
    return true;
  }
}
*/
