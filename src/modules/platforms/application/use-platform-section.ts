import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PlatformsRepository } from "./platforms-repository";
import {
  describePlatformFailure,
  OWNER_CONFLICT,
  PERSON_HAS_PAYMENTS,
} from "../domain/failures";
import type { PaymentDraft, PersonDraft, PlatformDraft } from "../domain/platform-forms";
import { monthItemsKey } from "@/modules/expenses/application/use-expense-list";
import { statusOf } from "@/shared/api/http-client";
import { CREDIT_CARDS_KEY, PERIOD_ITEMS_KEY, PLATFORMS_KEY } from "@/shared/api/query-keys";

interface Callbacks {
  onSuccess: () => void;
}

// These wait for the server: everything shown here is computed there, and any of these writes can
// change a share, a total or an income item in several months. People sit under the month's items, so
// toggling an income row refreshes them with the list.
export function usePlatformSection(
  repository: PlatformsRepository,
  period: string,
  onSessionEnded: () => void,
) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);
  const retry = (count: number, error: unknown) => statusOf(error) !== 401 && count < 2;

  const people = useQuery({
    queryKey: [...monthItemsKey(period), "people"],
    queryFn: () => repository.listPeople(period),
    retry,
  });
  const platforms = useQuery({
    queryKey: PLATFORMS_KEY,
    queryFn: () => repository.listPlatforms(),
    retry,
  });
  const cards = useQuery({
    queryKey: CREDIT_CARDS_KEY,
    queryFn: () => repository.listCards(),
    retry,
  });

  const peopleError = people.error;
  const platformsError = platforms.error;
  useEffect(() => {
    if (statusOf(peopleError) === 401 || statusOf(platformsError) === 401) {
      onSessionEnded();
    }
  }, [peopleError, platformsError, onSessionEnded]);

  const options = (conflict?: string) => ({
    onMutate: () => setFailure(null),
    onError: (error: unknown) => {
      if (statusOf(error) === 401) {
        onSessionEnded();
        return;
      }
      setFailure(describePlatformFailure(statusOf(error), conflict));
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PLATFORMS_KEY }),
        queryClient.invalidateQueries({ queryKey: PERIOD_ITEMS_KEY }),
      ]),
  });

  const createPerson = useMutation({
    mutationFn: (person: PersonDraft) => repository.createPerson(person),
    ...options(OWNER_CONFLICT),
  });
  const updatePerson = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: PersonDraft }) =>
      repository.updatePerson(id, changes),
    ...options(OWNER_CONFLICT),
  });
  const removePerson = useMutation({
    mutationFn: (id: string) => repository.removePerson(id),
    ...options(PERSON_HAS_PAYMENTS),
  });
  const recordPayment = useMutation({
    mutationFn: ({ personId, payment }: { personId: string; payment: PaymentDraft }) =>
      repository.recordPayment(personId, payment),
    ...options(),
  });
  const removePayment = useMutation({
    mutationFn: (id: string) => repository.removePayment(id),
    ...options(),
  });
  const createPlatform = useMutation({
    mutationFn: (platform: PlatformDraft) => repository.createPlatform(platform),
    ...options(),
  });
  const updatePlatform = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: PlatformDraft }) =>
      repository.updatePlatform(id, changes),
    ...options(),
  });
  const removePlatform = useMutation({
    mutationFn: (id: string) => repository.removePlatform(id),
    ...options(),
  });
  const setMember = useMutation({
    mutationFn: ({
      platformId,
      personId,
      member,
    }: {
      platformId: string;
      personId: string;
      member: boolean;
    }) =>
      member
        ? repository.addMember(platformId, personId)
        : repository.removeMember(platformId, personId),
    ...options(),
  });

  return {
    people: people.data ?? [],
    platforms: platforms.data ?? [],
    cards: cards.data ?? [],
    isLoading: people.isPending || platforms.isPending,
    loadFailed: (people.isError && !people.data) || (platforms.isError && !platforms.data),
    refreshFailed: (people.isError && Boolean(people.data)) || (platforms.isError && Boolean(platforms.data)),
    reload: () => {
      void people.refetch();
      void platforms.refetch();
    },
    failure,
    isSavingPerson: createPerson.isPending || updatePerson.isPending,
    isSavingPayment: recordPayment.isPending || removePayment.isPending,
    isSavingPlatform: createPlatform.isPending || updatePlatform.isPending,
    isChangingMembers: setMember.isPending,
    createPerson: (person: PersonDraft, callbacks: Callbacks) => createPerson.mutate(person, callbacks),
    updatePerson: (id: string, changes: PersonDraft, callbacks: Callbacks) =>
      updatePerson.mutate({ id, changes }, callbacks),
    deletePerson: (id: string) => removePerson.mutate(id),
    recordPayment: (personId: string, payment: PaymentDraft, callbacks: Callbacks) =>
      recordPayment.mutate({ personId, payment }, callbacks),
    undoPayment: (id: string, callbacks: Callbacks) => removePayment.mutate(id, callbacks),
    createPlatform: (platform: PlatformDraft, callbacks: Callbacks) =>
      createPlatform.mutate(platform, callbacks),
    updatePlatform: (id: string, changes: PlatformDraft, callbacks: Callbacks) =>
      updatePlatform.mutate({ id, changes }, callbacks),
    deletePlatform: (id: string) => removePlatform.mutate(id),
    setMember: (platformId: string, personId: string, member: boolean) =>
      setMember.mutate({ platformId, personId, member }),
  };
}
