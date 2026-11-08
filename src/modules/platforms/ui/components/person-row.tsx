"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "cn";

import {
  billingFrequency,
  defaultPaymentDate,
  formatDate,
  type PaymentDraft,
  type PersonDraft,
} from "../../domain/platform-forms";
import type { Person } from "../../domain/types";
import { formatCOP } from "@/modules/accounts/domain/money";
import { DoneToggle } from "@/modules/expenses/ui/components/done-toggle";
import { BADGE } from "@/modules/expenses/ui/components/urgency-badge";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const PaymentForm = dynamic(() => import("./payment-form").then((module) => module.PaymentForm));
const PersonForm = dynamic(() => import("./person-form").then((module) => module.PersonForm));

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
  const { locale, messages } = useI18n();
  const { common, expenses, platforms: t } = messages;
  const toView = () => setMode("view");
  const toggleRef = useRef<HTMLButtonElement>(null);
  // The toggle opened the payment form or the confirmation, so backing out of either returns there.
  const backToToggle = () => {
    flushSync(() => setMode("view"));
    toggleRef.current?.focus();
  };
  const covered = person.coveredInPeriod === true;
  const canPay = !person.isOwner && person.monthlyOwed > 0;
  const paymentId = person.periodPaymentId;

  return (
    <li className="flex gap-3 border-t border-rule py-3">
      {canPay || covered ? (
        <DoneToggle
          name={person.name}
          word="paid"
          ref={toggleRef}
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
          {person.isOwner ? <span className={LOOK}>{t.owner}</span> : null}
          {!person.isOwner ? <span className={LOOK}>{billingFrequency(person.billingMonths, messages)}</span> : null}
          {canPay || covered ? <span className={LOOK}>{covered ? t.covered : t.owes}</span> : null}
        </div>
        {person.lastPaymentDate ? (
          <p className="text-xs text-muted-foreground">
            {t.lastPaid(formatDate(person.lastPaymentDate, locale))}
            {person.coveredUntil ? t.coveredUntil(formatDate(person.coveredUntil, locale)) : null}
          </p>
        ) : !person.isOwner ? (
          <p className="text-xs text-muted-foreground">{t.noPayments}</p>
        ) : null}

        {mode === "view" ? (
          <div className="flex flex-wrap items-center">
            <Button variant="link" className={ACTION} aria-label={expenses.editItem(person.name)} onClick={() => setMode("edit")}>
              {common.edit}
            </Button>
            <Button
              variant="link"
              className={ACTION}
              aria-label={expenses.deleteItem(person.name)}
              onClick={() => setMode("confirm-delete")}
            >
              {common.delete}
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
            onCancel={backToToggle}
            onSubmit={(payment) => onRecordPayment(payment, { onSuccess: toView })}
          />
        ) : null}

        {mode === "confirm-undo" ? (
          <ConfirmPanel
            confirmLabel={t.removePayment}
            confirmAriaLabel={t.removePaymentFrom(person.name)}
            confirmDisabled={isSavingPayment || !paymentId}
            onConfirm={() => {
              if (paymentId) {
                onUndoPayment(paymentId, { onSuccess: toView });
              }
            }}
            onKeep={backToToggle}
          >
            {t.removePaymentConfirm}
          </ConfirmPanel>
        ) : null}

        {mode === "edit" ? (
          <PersonForm
            defaultValues={{
              name: person.name,
              billingMonths: String(person.billingMonths),
              isOwner: person.isOwner,
            }}
            submitLabel={expenses.saveChanges}
            pending={isSavingPerson}
            onCancel={toView}
            onSubmit={(changes) => onUpdate(changes, { onSuccess: toView })}
          />
        ) : null}

        {mode === "confirm-delete" ? (
          <ConfirmPanel
            confirmLabel={common.delete}
            keepLabel={t.keepThem}
            onConfirm={() => {
              onDelete();
              toView();
            }}
            onKeep={toView}
          >
            {t.deletePersonBefore}
            <span className="font-medium wrap-anywhere">{person.name}</span>
            {t.deletePersonAfter}
          </ConfirmPanel>
        ) : null}
      </div>
    </li>
  );
}
