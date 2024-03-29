import { Injectable } from '@nestjs/common';
import {
  Cron,
  Interval,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOuput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>, // private schedulerRegistry: SchedulerRegistry,
  ) {}
  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOuput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowed to do this.',
        };
      }
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.restaurants.save(restaurant);
      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: 'Could not create payment.' };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      //   console.log(user);
      const payments = await this.payments.find({
        relations: {
          user: true,
        },
      });

      console.log(payments);
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments.',
      };
    }
  }

  // 날짜가 만료되었음에도 여전히 promote되고 있는 restaurant들을 체크
  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      where: { isPromoted: true, promotedUntil: LessThan(new Date()) },
    });
    console.log(restaurants);
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }

  // @Cron('30 * * * * *', {
  //   name: 'myJob',
  // })
  // checkForPayments() {
  //   console.log("@Cron('30 * * * * *'");
  //   const job = this.schedulerRegistry.getCronJob('myJob');
  //   // console.log(job);
  //   job.stop();
  // }

  //   @Interval(5000)
  //   checkForPaymentsI() {
  //     console.log('@Interval(5000)');
  //   }

  //   @Timeout(2000)
  //   afterStarts() {
  //     console.log('Timeout(2000)');
  //   }
}
