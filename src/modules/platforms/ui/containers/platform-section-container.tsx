"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { usePlatformSection } from "../../application/use-platform-section";
import { httpPlatformsRepository } from "../../infrastructure/http-platforms-repository";
import { PersonRow } from "../components/person-row";
import { PlatformRow } from "../components/platform-row";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const PersonForm = dynamic(() => import("../components/person-form").then((module) => module.PersonForm));
const PlatformForm = dynamic(() => import("../components/platform-form").then((module) => module.PlatformForm));

const NEW_PERSON = { name: "", billingMonths: "1", isOwner: false };
const NEW_PLATFORM = { name: "", monthlyCost: "", cardId: "" };
const SUBHEADING = "font-mono text-xs tracking-wide text-muted-foreground uppercase";

interface PlatformSectionContainerProps {
  period: string;
  onSessionEnded: () => void;
}

// People and platforms belong to no month, so they stay manageable whatever state the month is in.
export function PlatformSectionContainer({ period, onSessionEnded }: PlatformSectionContainerProps) {
  const section = usePlatformSection(httpPlatformsRepository, period, onSessionEnded);
  const [addingPerson, setAddingPerson] = useState(false);
  const { common, platforms: t } = useMessages();
  const [addingPlatform, setAddingPlatform] = useState(false);

  if (section.isLoading) {
    return (
      <p role="status" className="font-mono text-xs text-muted-foreground">
        {common.loading}
      </p>
    );
  }
  if (section.loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={t.loadFailed} />
        <Button variant="outline" onClick={section.reload}>
          {common.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <FormAlert message={section.failure} />
      {section.refreshFailed ? (
        <p className="text-sm text-muted-foreground">
          {t.refreshFailed}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <h4 className={SUBHEADING}>{t.whoOwes}</h4>
        {section.people.length === 0 ? (
          <p className="border-t border-rule py-3 text-sm text-muted-foreground">
            {t.noPeople}
          </p>
        ) : (
          <ul className="flex flex-col">
            {section.people.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                period={period}
                isSavingPerson={section.isSavingPerson}
                isSavingPayment={section.isSavingPayment}
                onUpdate={(changes, callbacks) => section.updatePerson(person.id, changes, callbacks)}
                onDelete={() => section.deletePerson(person.id)}
                onRecordPayment={(payment, callbacks) =>
                  section.recordPayment(person.id, payment, callbacks)
                }
                onUndoPayment={section.undoPayment}
              />
            ))}
          </ul>
        )}
        {addingPerson ? (
          <div className="border-t border-rule pt-3">
            <PersonForm
              defaultValues={NEW_PERSON}
              submitLabel={common.save}
              pending={section.isSavingPerson}
              onCancel={() => setAddingPerson(false)}
              onSubmit={(person) =>
                section.createPerson(person, { onSuccess: () => setAddingPerson(false) })
              }
            />
          </div>
        ) : (
          <Button variant="outline" className="lg:self-start" onClick={() => setAddingPerson(true)}>
            {t.addPerson}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-rule pt-4">
        <h4 className={SUBHEADING}>{t.platforms}</h4>
        {section.platforms.length === 0 ? (
          <p className="border-t border-rule py-3 text-sm text-muted-foreground">
            {t.noPlatforms}
          </p>
        ) : (
          <ul className="flex flex-col">
            {section.platforms.map((platform) => (
              <PlatformRow
                key={platform.id}
                platform={platform}
                people={section.people}
                cards={section.cards}
                isSaving={section.isSavingPlatform}
                isChangingMembers={section.isChangingMembers}
                onUpdate={(changes, callbacks) => section.updatePlatform(platform.id, changes, callbacks)}
                onDelete={() => section.deletePlatform(platform.id)}
                onSetMember={(personId, member) => section.setMember(platform.id, personId, member)}
              />
            ))}
          </ul>
        )}
        {addingPlatform ? (
          <div className="border-t border-rule pt-3">
            <PlatformForm
              defaultValues={NEW_PLATFORM}
              cards={section.cards}
              submitLabel={common.save}
              pending={section.isSavingPlatform}
              onCancel={() => setAddingPlatform(false)}
              onSubmit={(platform) =>
                section.createPlatform(platform, { onSuccess: () => setAddingPlatform(false) })
              }
            />
          </div>
        ) : (
          <Button variant="outline" className="lg:self-start" onClick={() => setAddingPlatform(true)}>
            {t.addPlatform}
          </Button>
        )}
      </div>
    </div>
  );
}
