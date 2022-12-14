import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { UsersModule } from './users/users.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Context } from 'apollo-server-core';
import { compareSync } from 'bcrypt';
import { FragmentsOnCompositeTypesRule } from 'graphql';
import { CommonModule } from './common/common.module';
import { Payment } from './payments/entities/payment.entity';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';

// const TOKEN_KEY = 'x-jwt';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      // 환경변수 경로
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      // 배포시 환경변수 무시
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      // 환경변수 유효성 검사기
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),

    // DB세팅
    // import { Verification } from './users/entities/verification.entity';

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, // + : turn string to int
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ], // 데이터베이스가 entity를 인식할 수 있도록 함.
    }),
    // GraphQL 설정
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // 메모리에 저장 //join(process.cwd(), 'src/schema.gql'),// 경로에 저장

      context: ({ req, connectionParams }) => {
        const TOKEN_KEY = 'x-jwt';

        return {
          token: req ? req.headers[TOKEN_KEY] : connectionParams[TOKEN_KEY],
        };
        // set in jwt.middleware ,imported in users.resolver
        //미들웨어에서 집어넣은 user entity를 graphql 컨텍스트로 보냄(context.user)
      },
      subscriptions: {
        /* 첫번째 방법
        'subscriptions-transport-ws': {
          onConnect: (connectionParams, connection) => {
            console.log(connectionParams);
            // console.log(connection);
            return connectionParams;
          },
          onDisconnect: () => {},
        },
        */

        /* 권장하는 방법 */
        'subscriptions-transport-ws': true,

        'graphql-ws': true,

        /*
        {
          // extra : token을 가지고 있으며, 웹소캣 jwt인증할 때 쓰임
          // connectionParams : extra에 jwt를 넣어주는 역할을 함.
          onConnect: (context: Context<any>) => {
            // const { connectionParams, extra } = context;
            // extra.token = connectionParams['x-jwt'];
            // console.log(connectionParams); //{connectionParam that is written subscriptionUrl in Altair}
            // console.log(extra.token); // undefined
          },
        },
        */
      },

      // return { token: req.headers['x-jwt'], user: req['user'] };

      // return { token: connection.context['X-JWT'] };

      // context: ({ req }) => ({ user: req['user'] }),
    }),
    ScheduleModule.forRoot(),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }), // Dynamic Module : 설정이 적용되어 있거나 설정을 적용할 수 있는 모듈
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    OrdersModule,
    AuthModule, // static module : 어떠한 설정도 적용되어 있지 않은 모듈
    UsersModule,
    RestaurantsModule,
    CommonModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(JwtMiddleware)
//       .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
//     //if JwtMiddleware is a function, u can use it in main.ts as app.use(JwtMiddleware)
//     //JwtMiddleware를 모든 경로의 모든 메소드에 적용시킴
//   }
// }

// 환경변수 작동 확인
// console.log('app.module');
// console.log(process.env.DB_PASSWORD);

// joi 작동 확인
// console.log(Joi);
