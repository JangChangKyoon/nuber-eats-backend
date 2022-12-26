import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

const pubsub = new PubSub(); // subscriptions instance

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}
  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }
  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }
  @Query((returns) => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Subscription((returns) => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  // payload는 service에서 가져오는 Order
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER); // trigger : service에서 페이로드를 가져오는 역할
  }

  @Subscription((returns) => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription((returns) => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id && // 관련자가 아니면 listening을 못하도록
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id; // payload의 id와 아래 args에서 가져온 id를 비교하여 주문한 order만 listening
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  /*
  hotPodtatos : trigger that returns value in @Subscription
  */
  // @Mutation((returns) => Boolean)
  // async potatoReady(@Args('potatoId') potatoId: number) {
  //   await this.pubSub.publish('hotPotatos', {
  //     readyPotato: potatoId, // payload 역할
  //   });
  //   return true;
  // }

  // @Subscription(returns => Order, {
  //   filter: (payload, _, context) => {
  //     console.log(payload, context);
  //     return true;
  //   },
  // })
  // @Subscription((returns) => String, {
  //   filter: ({ readyPotato }, { potatoId }) => {
  //     return readyPotato === potatoId; // 데이터 검증하는 역할 true or false return
  //   },
  //   resolve: ({ readyPotato }) =>
  //     `Your potato with the id ${readyPotato} is ready!`, // 위 검증 끝나고 output
  // })
  // @Role(['Any'])
  // readyPotato(@Args('potatoId') potatoId: number) {
  //   // variable 역할
  //   return this.pubSub.asyncIterator('hotPotatos');
  // }
}
