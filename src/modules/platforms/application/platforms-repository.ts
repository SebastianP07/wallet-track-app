import type {
  Person,
  PersonCreate,
  PersonUpdate,
  Platform,
  PlatformCreate,
  PlatformPayment,
  PlatformPaymentCreate,
  PlatformUpdate,
} from "../domain/types";
import type { CreditCard } from "@/modules/cards/domain/types";

export interface PlatformsRepository {
  listPeople(period: string): Promise<Person[]>;
  createPerson(person: PersonCreate): Promise<Person>;
  updatePerson(id: string, changes: PersonUpdate): Promise<Person>;
  removePerson(id: string): Promise<void>;
  recordPayment(personId: string, payment: PlatformPaymentCreate): Promise<PlatformPayment>;
  removePayment(id: string): Promise<void>;
  listPlatforms(): Promise<Platform[]>;
  createPlatform(platform: PlatformCreate): Promise<Platform>;
  updatePlatform(id: string, changes: PlatformUpdate): Promise<Platform>;
  removePlatform(id: string): Promise<void>;
  addMember(platformId: string, personId: string): Promise<Platform>;
  removeMember(platformId: string, personId: string): Promise<Platform>;
  listCards(): Promise<CreditCard[]>;
}
