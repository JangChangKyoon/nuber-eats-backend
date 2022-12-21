import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import {
  CategoryResolver,
  DishResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  // forFeature : designate entity that is injected in service
  imports: [TypeOrmModule.forFeature([Restaurant, Dish])], //  TypeOrmModule의 Restaurant 엔티티를 다른 곳에서 Inject할 수 있도록 import하기.
  providers: [
    RestaurantResolver,
    RestaurantService,
    CategoryResolver,
    CategoryRepository,
    DishResolver,
  ], //providers에 RestaurantService 주입 => RestaurantResolver에서 사용 가능.
})
export class RestaurantsModule {}
