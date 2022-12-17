import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) //전달받은 entity를 기반으로 Repository 생성.
    private readonly restaurants: Repository<Restaurant>, //Repository<Restaurant> : type of restaurants
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const categoryName = createRestaurantInput.categoryName
        .trim() // 앞뒤 빈칸 제거
        .toLowerCase(); // 모두 소문자로
      const categorySlug = categoryName.replace(/ /g, '-'); // 모든 빈칸을 -로 변경
      let category = await this.categories.findOne({
        where: { slug: categorySlug },
      });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      newRestaurant.category = category;
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
