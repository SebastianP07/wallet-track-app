"use client";

import { useState } from "react";

import { formatDateTime } from "../../domain/security-display";
import type { Passkey, SecondFactorProof } from "../../domain/types";
import { PasskeyNameForm } from "./passkey-name-form";
import { PasskeyRemoveForm } from "./passkey-remove-form";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "rename" | "remove";

interface PasskeyRowProps {
  passkey: Passkey;
  isLast: boolean;
  isRenaming: boolean;
  isRemoving: boolean;
  onRename: (name: string, callbacks: { onSuccess: () => void }) => void;
  onRemove: (proof: SecondFactorProof, callbacks: { onSuccess: () => void; onFailure: () => void }) => void;
}

export function PasskeyRow({ passkey, isLast, isRenaming, isRemoving, onRename, onRemove }: PasskeyRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <p className="font-medium wrap-anywhere">{passkey.name}</p>
      <p className="font-mono text-xs text-muted-foreground">
        Added {formatDateTime(passkey.createdAt)} ·{" "}
        {passkey.lastUsedAt ? `Last used ${formatDateTime(passkey.lastUsedAt)}` : "Not used yet"}
      </p>

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button
            variant="link"
            className={ACTION}
            aria-label={`Rename passkey ${passkey.name}`}
            onClick={() => setMode("rename")}
          >
            Rename
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={`Remove passkey ${passkey.name}`}
            onClick={() => setMode("remove")}
          >
            Remove
          </Button>
        </div>
      ) : null}

      {mode === "rename" ? (
        <PasskeyNameForm
          name={passkey.name}
          pending={isRenaming}
          onCancel={toView}
          onSubmit={(name) => onRename(name, { onSuccess: toView })}
        />
      ) : null}

      {mode === "remove" ? (
        <PasskeyRemoveForm
          name={passkey.name}
          isLast={isLast}
          pending={isRemoving}
          onCancel={toView}
          onSubmit={(proof, { onFailure }) => onRemove(proof, { onSuccess: toView, onFailure })}
        />
      ) : null}
    </li>
  );
}
