import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { Address } from './entities/address.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertAddressDto } from './dto/upsert-address.dto';

const MAX_ADDRESSES = 10;

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly profilesRepo: Repository<CustomerProfile>,
    @InjectRepository(Address)
    private readonly addressesRepo: Repository<Address>,
  ) {}

  // ─── Profile ─────────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<CustomerProfile> {
    const existing = await this.profilesRepo.findOne({ where: { userId } });
    if (existing) return existing;

    // Leniwe tworzenie profilu przy pierwszym pobraniu
    return this.profilesRepo.save(
      this.profilesRepo.create({
        userId,
        firstName: null,
        lastName: null,
        phone: null,
        avatarUrl: null,
      }),
    );
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<CustomerProfile> {
    const profile = await this.getProfile(userId);

    Object.assign(profile, {
      firstName: dto.firstName ?? profile.firstName,
      lastName: dto.lastName ?? profile.lastName,
      phone: dto.phone ?? profile.phone,
      avatarUrl: dto.avatarUrl ?? profile.avatarUrl,
    });

    return this.profilesRepo.save(profile);
  }

  // ─── Addresses ───────────────────────────────────────────────────────────────

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressesRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async getAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressesRepo.findOne({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Address not found.');
    if (address.userId !== userId) throw new ForbiddenException();

    return address;
  }

  async createAddress(userId: string, dto: UpsertAddressDto): Promise<Address> {
    const count = await this.addressesRepo.count({ where: { userId } });

    if (count >= MAX_ADDRESSES) {
      throw new ForbiddenException(
        `Maximum of ${MAX_ADDRESSES} addresses allowed.`,
      );
    }

    // Jeśli to pierwszy adres lub isDefault=true → ustaw jako domyślny
    const shouldBeDefault = count === 0 || dto.isDefault === true;

    if (shouldBeDefault) {
      await this.clearDefault(userId);
    }

    return this.addressesRepo.save(
      this.addressesRepo.create({
        userId,
        label: dto.label ?? null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        street: dto.street,
        apartment: dto.apartment ?? null,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
        isDefault: shouldBeDefault,
      }),
    );
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpsertAddressDto,
  ): Promise<Address> {
    const address = await this.getAddress(userId, addressId);

    if (dto.isDefault === true) {
      await this.clearDefault(userId);
      address.isDefault = true;
    }

    Object.assign(address, {
      label: dto.label ?? address.label,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      street: dto.street,
      apartment: dto.apartment ?? null,
      city: dto.city,
      postalCode: dto.postalCode,
      country: dto.country,
    });

    return this.addressesRepo.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.getAddress(userId, addressId);

    await this.addressesRepo.remove(address);

    // Jeśli usunięty był domyślny → ustaw najstarszy jako domyślny
    if (address.isDefault) {
      const remaining = await this.addressesRepo.find({
        where: { userId },
        order: { createdAt: 'ASC' },
        take: 1,
      });

      if (remaining.length > 0) {
        remaining[0].isDefault = true;
        await this.addressesRepo.save(remaining[0]);
      }
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.getAddress(userId, addressId);

    await this.clearDefault(userId);

    address.isDefault = true;
    return this.addressesRepo.save(address);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async clearDefault(userId: string): Promise<void> {
    await this.addressesRepo
      .createQueryBuilder()
      .update()
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .andWhere('isDefault = true')
      .execute();
  }
}
