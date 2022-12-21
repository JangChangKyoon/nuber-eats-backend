import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
    });
    // console.log('hi');
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not found',
      };
    }
    // console.log('hiIII');
    for (const item of items) {
      const dish = await this.dishes.findOne({ where: { id: item.dishId } });
      if (!dish) {
        // abort this whole thing
        return {
          ok: false,
          error: 'Dish not found.',
        };
      }
      console.log(`Dish price: ${dish.price}`);
      for (const itemOption of item.options) {
        // console.log('hi');
        const dishOption = dish.options.find(
          (dishOption) => dishOption.name === itemOption.name,
        );
        // console.log(itemOption);
        // console.log(dishOption);
        if (dishOption) {
          if (dishOption.extra) {
            console.log(`$USD + ${dishOption.extra}`);
          } else {
            console.log(itemOption.choice);
            console.log(dishOption); //.choices);
            // console.log(dishOption.choices[0]);
            // console.log(dishOption.choices[0].name);
            const dishOptionChoice = dishOption.choices.find(
              (optionChoice) => optionChoice.name === itemOption.choice,
            );
            if (dishOptionChoice) {
              if (dishOptionChoice.extra) {
                console.log(`$USD + ${dishOptionChoice.extra}`);
              }
            }
          }
        }
      }
    }
    //   this.orders.create({
    //     customer,
    //     restaurant,
    //   }),
    // );
    // console.log(order);
  }
}
