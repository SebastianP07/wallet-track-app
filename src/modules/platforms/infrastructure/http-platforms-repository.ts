import type { PlatformsRepository } from "../application/platforms-repository";
import type {
  Person,
  PersonList,
  Platform,
  PlatformList,
  PlatformPayment,
} from "../domain/types";
import { httpCardsRepository } from "@/modules/cards/infrastructure/http-cards-repository";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/shared/api/http-client";

const personPath = (id: string) => `/people/${encodeURIComponent(id)}`;
const platformPath = (id: string) => `/platforms/${encodeURIComponent(id)}`;
const memberPath = (platformId: string, personId: string) =>
  `${platformPath(platformId)}/members/${encodeURIComponent(personId)}`;

export const httpPlatformsRepository: PlatformsRepository = {
  async listPeople(period) {
    const { items } = await apiGet<PersonList>(`/people?period=${encodeURIComponent(period)}`);
    return items;
  },
  createPerson(person) {
    return apiPost<Person>("/people", person);
  },
  updatePerson(id, changes) {
    return apiPatch<Person>(personPath(id), changes);
  },
  removePerson(id) {
    return apiDelete(personPath(id));
  },
  recordPayment(personId, payment) {
    return apiPost<PlatformPayment>(`${personPath(personId)}/payments`, payment);
  },
  removePayment(id) {
    return apiDelete(`/platform-payments/${encodeURIComponent(id)}`);
  },
  async listPlatforms() {
    const { items } = await apiGet<PlatformList>("/platforms");
    return items;
  },
  createPlatform(platform) {
    return apiPost<Platform>("/platforms", platform);
  },
  updatePlatform(id, changes) {
    return apiPatch<Platform>(platformPath(id), changes);
  },
  removePlatform(id) {
    return apiDelete(platformPath(id));
  },
  addMember(platformId, personId) {
    return apiPut<Platform>(memberPath(platformId, personId));
  },
  removeMember(platformId, personId) {
    return apiDelete<Platform>(memberPath(platformId, personId));
  },
  listCards() {
    return httpCardsRepository.list();
  },
};
