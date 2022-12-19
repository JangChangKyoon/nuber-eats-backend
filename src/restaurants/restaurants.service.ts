import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) //전달받은 entity를 기반으로 Repository 생성.
    private readonly restaurants: Repository<Restaurant>, //Repository<Restaurant> : type of restaurants
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      // console.log('hi1');
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      // console.log(newRestaurant);
      newRestaurant.owner = owner;
      // newRestaurant.ownerId = owner.user.id;
      // console.log(newRestaurant.owner);
      // console.log(newRestaurant.ownerId);
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      // console.log(category);
      newRestaurant.category = category;
      // console.log('hi2');
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // 성능상 Object보다 id를 비교하는 것이 좋음
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
          // if(category) { return category }
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }
}

// before #11.2 createRestaurant
// getAll(): Promise<Restaurant[]> {
//   return this.restaurants.find();
// }

// createRestaurant(
//   createRestaurantDto: CreateRestaurantDto,
// ): Promise<Restaurant> {
//   const newRestaurant = this.restaurants.create(createRestaurantDto);
//   return this.restaurants.save(newRestaurant);
// }

// updateRestaurant({ id, data }: UpdateRestaurantDto) {
//   return this.restaurants.update(id, { ...data });
// }
