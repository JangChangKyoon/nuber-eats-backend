import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
// 'roles' 키와 role value로 roles metadata에 등록
// resolver에 metadata나 role이 없으면 그 resolver는 public(권한없어도 됨)으로 간주됨
