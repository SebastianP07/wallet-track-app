"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "cn";

import { formatCOP } from "../../domain/money";
import type { Account, AccountCreate } from "../../domain/types";
import { AccountRow } from "./account-row";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const AccountAddForm = dynamic(() => import("./account-add-form").then((module) => module.AccountAddForm));

interface AccountSectionProps {
  accounts: Account[];
  total: number | null;
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  totalIsSettling: boolean;
  isCreating: boolean;
  failure: string | null;
  reload: () => void;
  createAccount: (account: AccountCreate, callbacks: { onSuccess: () => void }) => void;
  rename: (id: string, name: string) => void;
  setBalance: (id: string, balance: number) => void;
  deleteAccount: (id: string) => void;
}

export function AccountSection({
  accounts,
  total,
  isLoading,
  loadFailed,
  refreshFailed,
  totalIsSettling,
  isCreating,
  failure,
  reload,
  createAccount,
  rename,
  setBalance,
  deleteAccount,
}: AccountSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div role="status" className="ledger-rows flex h-36 items-end">
        <p className="pb-2 font-mono text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message="These balances could not be loaded." />
        <Button variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-col gap-1" aria-busy={totalIsSettling}>
        <p className="text-sm text-muted-foreground">Total actual</p>
        <p
          className={cn(
            "font-mono text-[clamp(1.25rem,6vw,1.75rem)] leading-tight font-medium wrap-anywhere text-signal transition-opacity",
            total !== null && total < 0 && "text-destructive",
            totalIsSettling && "opacity-50",
          )}
        >
          {total === null ? "—" : formatCOP(total)}
        </p>
      </div>

      <FormAlert message={failure} />
      {refreshFailed ? (
        <p className="text-sm text-muted-foreground">
          Showing the last values received; they could not be refreshed.
        </p>
      ) : null}

      {accounts.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          No accounts yet. Add the first one to see your total.
        </p>
      ) : (
        // Two or three columns on wider screens, so a name and its balance never sit a page apart.
        <ul className="flex flex-col md:grid md:grid-cols-2 md:gap-x-6 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onRename={(name) => rename(account.id, name)}
              onSetBalance={(balance) => setBalance(account.id, balance)}
              onDelete={() => deleteAccount(account.id)}
            />
          ))}
        </ul>
      )}

      {isAdding ? (
        <AccountAddForm
          pending={isCreating}
          onCancel={() => setIsAdding(false)}
          onSubmit={(account) => createAccount(account, { onSuccess: () => setIsAdding(false) })}
        />
      ) : (
        <Button variant="outline" className="mt-auto md:self-start" onClick={() => setIsAdding(true)}>
          Add account
        </Button>
      )}
    </div>
  );
}
