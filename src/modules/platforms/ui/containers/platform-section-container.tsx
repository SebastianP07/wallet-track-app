"use client";

import { useState } from "react";

import { usePlatformSection } from "../../application/use-platform-section";
import { httpPlatformsRepository } from "../../infrastructure/http-platforms-repository";
import { PersonForm } from "../components/person-form";
import { PersonRow } from "../components/person-row";
import { PlatformForm } from "../components/platform-form";
import { PlatformRow } from "../components/platform-row";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

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
  const [addingPlatform, setAddingPlatform] = useState(false);

  if (section.isLoading) {
    return (
      <p role="status" className="font-mono text-xs text-muted-foreground">
        Loading…
      </p>
    );
  }
  if (section.loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message="The platforms could not be loaded." />
        <Button variant="outline" onClick={section.reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <FormAlert message={section.failure} />
      {section.refreshFailed ? (
        <p className="text-sm text-muted-foreground">
          Showing the platforms last loaded; they could not be refreshed.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <h4 className={SUBHEADING}>Who owes what, per month</h4>
        {section.people.length === 0 ? (
          <p className="border-t border-rule py-3 text-sm text-muted-foreground">
            No people yet. Add yourself as the owner, then whoever shares a platform with you.
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
              submitLabel="Save"
              pending={section.isSavingPerson}
              onCancel={() => setAddingPerson(false)}
              onSubmit={(person) =>
                section.createPerson(person, { onSuccess: () => setAddingPerson(false) })
              }
            />
          </div>
        ) : (
          <Button variant="outline" className="lg:self-start" onClick={() => setAddingPerson(true)}>
            Add person
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-rule pt-4">
        <h4 className={SUBHEADING}>Platforms</h4>
        {section.platforms.length === 0 ? (
          <p className="border-t border-rule py-3 text-sm text-muted-foreground">
            No platforms yet. Add one, then tap who shares it.
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
              submitLabel="Save"
              pending={section.isSavingPlatform}
              onCancel={() => setAddingPlatform(false)}
              onSubmit={(platform) =>
                section.createPlatform(platform, { onSuccess: () => setAddingPlatform(false) })
              }
            />
          </div>
        ) : (
          <Button variant="outline" className="lg:self-start" onClick={() => setAddingPlatform(true)}>
            Add platform
          </Button>
        )}
      </div>
    </div>
  );
}
