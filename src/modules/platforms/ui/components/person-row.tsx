"use client";

import { useState } from "react";
import { cn } from "cn";

import {
  billingFrequency,
  defaultPaymentDate,
  formatDate,
  type PaymentDraft,
  type PersonDraft,
} from "../../domain/platform-forms";
import type { Person } from "../../domain/types";
import { PaymentForm } from "./payment-form";
import { PersonForm } from "./person-form";
import { formatCOP } from "@/modules/accounts/domain/money";
import { DoneToggle } from "@/modules/expenses/ui/components/done-toggle";
import { BADGE } from "@/modules/expenses/ui/components/urgency-badge";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";
const LOOK = cn(BADGE, "border-rule text-muted-foreground");

type RowMode = "view" | "edit" | "confirm-delete" | "confirm-paid" | "confirm-undo";

interface PersonRowProps {
  person: Person;
  period: string;
  isSavingPerson: boolean;
  isSavingPayment: boolean;
  onUpdate: (changes: PersonDraft, callbacks: { onSuccess: () => void }) => void;
  onDelete: () => void;
  onRecordPayment: (payment: PaymentDraft, callbacks: { onSuccess: () => void }) => void;
  onUndoPayment: (paymentId: string, callbacks: { onSuccess: () => void }) => void;
}

export function PersonRow({
  person,
  period,
  isSavingPerson,
  isSavingPayment,
  onUpdate,
  onDelete,
  onRecordPayment,
  onUndoPayment,
}: PersonRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const toView = () => setMode("view");
  const covered = person.coveredInPeriod === true;
  const canPay = !person.isOwner && person.monthlyOwed > 0;
  const paymentId = person.periodPaymentId;

  return (
    <li className="flex gap-3 border-t border-rule py-3">
      {canPay || covered ? (
        <DoneToggle
          name={person.name}
          word="paid"
          done={covered}
          disabled={isSavingPayment}
          onToggle={() => setMode(covered ? "confirm-undo" : "confirm-paid")}
        />
      ) : (
        <span className="size-12 shrink-0" aria-hidden="true" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <span className="font-medium wrap-anywhere">{person.name}</span>
          <span className="shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap">
            {formatCOP(person.monthlyOwed)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {person.isOwner ? <span className={LOOK}>Owner</span> : null}
          {!person.isOwner ? <span className={LOOK}>{billingFrequency(person.billingMonths)}</span> : null}
          {canPay || covered ? <span className={LOOK}>{covered ? "Covered" : "Owes"}</span> : null}
        </div>
        {person.lastPaymentDate ? (
          <p className="text-xs text-muted-foreground">
            Last paid {formatDate(person.lastPaymentDate)}
            {person.coveredUntil ? ` · Covered until ${formatDate(person.coveredUntil)}` : null}
          </p>
        ) : !person.isOwner ? (
          <p className="text-xs text-muted-foreground">No payments yet</p>
        ) : null}

        {mode === "view" ? (
          <div className="flex flex-wrap items-center">
            <Button variant="link" className={ACTION} aria-label={`Edit ${person.name}`} onClick={() => setMode("edit")}>
              Edit
            </Button>
            <Button
              variant="link"
              className={ACTION}
              aria-label={`Delete ${person.name}`}
              onClick={() => setMode("confirm-delete")}
            >
              Delete
            </Button>
          </div>
        ) : null}

        {mode === "confirm-paid" ? (
          <PaymentForm
            name={person.name}
            defaultValues={{
              paidAt: defaultPaymentDate(period, new Date()),
              monthsCovered: String(person.billingMonths),
            }}
            pending={isSavingPayment}
            onCancel={toView}
            onSubmit={(payment) => onRecordPayment(payment, { onSuccess: toView })}
          />
        ) : null}

        {mode === "confirm-undo" ? (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-sm">
              Remove the payment that covers this month? All its coverage goes with it, and the income
              item it marked received, if any, goes back to expected.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isSavingPayment || !paymentId}
                aria-label={`Remove payment from ${person.name}`}
                onClick={() => {
                  if (paymentId) {
                    onUndoPayment(paymentId, { onSuccess: toView });
                  }
                }}
              >
                Remove payment
              </Button>
              <Button variant="outline" className="flex-1" onClick={toView}>
                Keep it
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "edit" ? (
          <PersonForm
            defaultValues={{
              name: person.name,
              billingMonths: String(person.billingMonths),
              isOwner: person.isOwner,
            }}
            submitLabel="Save changes"
            pending={isSavingPerson}
            onCancel={toView}
            onSubmit={(changes) => onUpdate(changes, { onSuccess: toView })}
          />
        ) : null}

        {mode === "confirm-delete" ? (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-sm">
              Delete <span className="font-medium wrap-anywhere">{person.name}</span> for good? They leave
              every platform, which raises the others&apos; shares. Income items already in a month stay,
              as plain income. Someone with payments can&apos;t be deleted.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onDelete();
                  toView();
                }}
              >
                Delete
              </Button>
              <Button variant="outline" className="flex-1" onClick={toView}>
                Keep them
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
