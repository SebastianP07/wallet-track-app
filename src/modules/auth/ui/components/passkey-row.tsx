"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { Passkey, SecondFactorProof } from "../../domain/types";
import { formatDateTime } from "@/shared/format/date";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

const PasskeyNameForm = dynamic(() => import("./passkey-name-form").then((module) => module.PasskeyNameForm));
const PasskeyRemoveForm = dynamic(() => import("./passkey-remove-form").then((module) => module.PasskeyRemoveForm));

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
  const { messages } = useI18n();
  const t = messages.security;
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <p className="font-medium wrap-anywhere">{passkey.name}</p>
      <p className="font-mono text-xs text-muted-foreground">
        {t.added(formatDateTime(passkey.createdAt))} ·{" "}
        {passkey.lastUsedAt ? t.lastUsed(formatDateTime(passkey.lastUsedAt)) : t.notUsed}
      </p>

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button
            variant="link"
            className={ACTION}
            aria-label={t.renamePasskey(passkey.name)}
            onClick={() => setMode("rename")}
          >
            {messages.common.rename}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={t.removePasskey(passkey.name)}
            onClick={() => setMode("remove")}
          >
            {t.remove}
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
