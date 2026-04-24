import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Account } from '@/users/entities/account.entity';
import { Session } from '@/users/entities/session.entity';
import { Verification } from '@/users/entities/verification.entity';
import { CustomerProfile } from '@/customers/entities/customer-profile.entity';
import { Address } from '@/customers/entities/address.entity';
import { Product } from '@/products/entities/product.entity';
import { ProductVariant } from '@/products/entities/product-variant.entity';
import { ProductImage } from '@/products/entities/product-image.entity';
import { WishlistItem } from '@/wishlist/entities/wishlist-item.entity';
import { Review } from '@/reviews/entities/review.entity';
import { Order, OrderItem } from '@/orders/entities/order.entity';

export function createTypeOrmConfig(databaseUrl: string): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [
      User,
      Account,
      Session,
      Verification,
      CustomerProfile,
      Address,
      Product,
      ProductVariant,
      ProductImage,
      WishlistItem,
      Review,
      Order,
      OrderItem,
    ],
    synchronize: true, // na start możesz dać true, ale docelowo migracje
    logging: false,
  };
}
