import {
  Args,
  Query,
  Resolver,
  Mutation,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
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
    console.log(createRestaurantInput.address);
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation((returns) => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }

  @Query((returns) => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query((returns) => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query((returns) => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField((type) => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    // @Parent() category : 부모 field인 category를 args로 가져옴
    // console.log(category);
    return this.restaurantService.countRestaurants(category);
  }
  // dynamic Field : db(entity)에 실제 저장되지 않는 field,
  // request 있을 때마다 계산해서 보여주는 field
  // 로그인된 사용자의 상태에 따라 계산되는 field임

  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver((of) => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((type) => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.CreateDishInput(owner, createDishInput);
  }

  @Mutation((type) => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation((type) => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
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
