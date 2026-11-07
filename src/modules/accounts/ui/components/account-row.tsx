"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "cn";

import { formatCOP } from "../../domain/money";
import { isPendingAccount } from "../../domain/optimistic-list";
import type { Account } from "../../domain/types";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const AccountBalanceForm = dynamic(() => import("./account-balance-form").then((module) => module.AccountBalanceForm));
const AccountNameForm = dynamic(() => import("./account-name-form").then((module) => module.AccountNameForm));

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "rename" | "balance" | "confirm-delete";

interface AccountRowProps {
  account: Account;
  onRename: (name: string) => void;
  onSetBalance: (balance: number) => void;
  onDelete: () => void;
}

export function AccountRow({ account, onRename, onSetBalance, onDelete }: AccountRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const pending = isPendingAccount(account);
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 font-medium wrap-anywhere">{account.name}</span>
        <span
          className={cn(
            "shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap",
            account.balance < 0 && "text-destructive",
          )}
        >
          {formatCOP(account.balance)}
        </span>
      </div>

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button
            variant="link"
            className={ACTION}
            disabled={pending}
            aria-label={`Update balance of ${account.name}`}
            onClick={() => setMode("balance")}
          >
            Update balance
          </Button>
          <Button
            variant="link"
            className={ACTION}
            disabled={pending}
            aria-label={`Rename ${account.name}`}
            onClick={() => setMode("rename")}
          >
            Rename
          </Button>
          <Button
            variant="link"
            className={ACTION}
            disabled={pending}
            aria-label={`Delete ${account.name}`}
            onClick={() => setMode("confirm-delete")}
          >
            Delete
          </Button>
        </div>
      ) : null}

      {mode === "rename" ? (
        <AccountNameForm
          name={account.name}
          onCancel={toView}
          onSubmit={(name) => {
            onRename(name);
            toView();
          }}
        />
      ) : null}

      {mode === "balance" ? (
        <AccountBalanceForm
          balance={account.balance}
          onCancel={toView}
          onSubmit={(balance) => {
            onSetBalance(balance);
            toView();
          }}
        />
      ) : null}

      {mode === "confirm-delete" ? (
        <ConfirmPanel
          confirmLabel="Delete"
          onConfirm={() => {
            onDelete();
            toView();
          }}
          onKeep={toView}
        >
          Delete <span className="font-medium wrap-anywhere">{account.name}</span> for good? This
          can&apos;t be undone.
        </ConfirmPanel>
      ) : null}
    </li>
  );
}
