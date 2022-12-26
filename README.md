# Nuber Eats

The Backend of Nuber Eats Clone

## User Model

- id
- createdAt
- updatedAt
- email
- password
- role(client|owner|deliver)

## User CRUD

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

## Resraurant Model

- name
- category
- address
- coverImage

## Resraurant CRUD

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant

- Edit Restaurant
- Delete Restaurant

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant
- Search Restaurant

## Dish

- Create Dish
- Edit Dish
- Delete Dish

## Order

- Orders Subscription:

  - Pending Orders (Owner) (Trigger: createOrder) => owner가 restaurant에 들어오는 order을 listening하기 위한 것
  - Order Status (Customer, Delivery, Owner) (T: editOrder) => 특정 id의 order가 update되는 걸 listen하기 위한 것
  - Pending Pickup Order (Delivery) => delivery가 pick order하기 위한 것
