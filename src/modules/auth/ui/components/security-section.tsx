"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

import type { ActiveSession, Passkey, SecondFactorProof } from "../../domain/types";
import { PasskeyRow } from "./passkey-row";
import { SessionRow } from "./session-row";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const PasskeyAddForm = dynamic(() => import("./passkey-add-form").then((module) => module.PasskeyAddForm));

interface ListState {
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  reload: () => void;
  failure: string | null;
}

interface PasskeysProps extends ListState {
  passkeys: Passkey[];
  isSupported: boolean;
  isAdding: boolean;
  isRenaming: boolean;
  isRemoving: boolean;
  addPasskey: (
    name: string,
    proof: SecondFactorProof,
    callbacks: { onSuccess: () => void; onFailure: () => void },
  ) => void;
  renamePasskey: (id: string, name: string, callbacks: { onSuccess: () => void }) => void;
  removePasskey: (
    id: string,
    proof: SecondFactorProof,
    callbacks: { onSuccess: () => void; onFailure: () => void },
  ) => void;
}

interface SessionsProps extends ListState {
  sessions: ActiveSession[];
  isRevoking: boolean;
  revokeSession: (session: ActiveSession) => void;
}

function ListFrame({
  title,
  noun,
  state,
  children,
}: {
  title: string;
  noun: string;
  state: ListState;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h4 className="font-mono text-xs tracking-wide text-muted-foreground">{title}</h4>
      {state.isLoading ? (
        <div role="status" className="ledger-rows flex h-18 items-end">
          <p className="pb-2 font-mono text-xs text-muted-foreground">Loading…</p>
        </div>
      ) : state.loadFailed ? (
        <div className="flex flex-col items-start gap-3">
          <FormAlert message={`The ${noun} could not be loaded.`} />
          <Button variant="outline" onClick={state.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <FormAlert message={state.failure} />
          {state.refreshFailed ? (
            <p className="text-sm text-muted-foreground">
              Showing the last {noun} received; they could not be refreshed.
            </p>
          ) : null}
          {children}
        </>
      )}
    </div>
  );
}

function PasskeysBlock(props: PasskeysProps) {
  const { passkeys, isSupported, isAdding, isRenaming, isRemoving } = props;
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <ListFrame title="PASSKEYS" noun="passkeys" state={props}>
      {passkeys.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          No passkeys yet. Add one to sign in with your device&apos;s screen lock instead of typing a code.
        </p>
      ) : (
        <ul className="flex flex-col">
          {passkeys.map((passkey) => (
            <PasskeyRow
              key={passkey.id}
              passkey={passkey}
              isLast={passkeys.length === 1}
              isRenaming={isRenaming}
              isRemoving={isRemoving}
              onRename={(name, callbacks) => props.renamePasskey(passkey.id, name, callbacks)}
              onRemove={(proof, callbacks) => props.removePasskey(passkey.id, proof, callbacks)}
            />
          ))}
        </ul>
      )}

      {!isSupported ? (
        <p className="text-sm text-muted-foreground">
          This browser can&apos;t create passkeys. You can still rename or remove the ones listed here.
        </p>
      ) : isFormOpen ? (
        <div className="border-t border-rule pt-3">
          <PasskeyAddForm
            pending={isAdding}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={(name, proof, { onFailure }) =>
              props.addPasskey(name, proof, { onSuccess: () => setIsFormOpen(false), onFailure })
            }
          />
        </div>
      ) : (
        <Button variant="outline" className="lg:self-start" onClick={() => setIsFormOpen(true)}>
          Add passkey
        </Button>
      )}
    </ListFrame>
  );
}

function SessionsBlock(props: SessionsProps) {
  return (
    <ListFrame title="ACTIVE SESSIONS" noun="sessions" state={props}>
      <ul className="flex flex-col">
        {props.sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            isRevoking={props.isRevoking}
            onRevoke={() => props.revokeSession(session)}
          />
        ))}
      </ul>
    </ListFrame>
  );
}

export function SecuritySection({ passkeys, sessions }: { passkeys: PasskeysProps; sessions: SessionsProps }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <PasskeysBlock {...passkeys} />
      <SessionsBlock {...sessions} />
    </div>
  );
}
