"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface RecoveryCodesDisplayProps {
  codes: string[];
  onContinue: () => void;
}

export function RecoveryCodesDisplay({ codes, onContinue }: RecoveryCodesDisplayProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const acknowledgeId = useId();
  const t = useMessages().auth;

  useEffect(() => headingRef.current?.focus(), []);

  // The codes exist only in this component's memory: leaving the page loses them for good.
  useEffect(() => {
    if (acknowledged) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [acknowledged]);

  return (
    <section aria-labelledby={`${acknowledgeId}-heading`} className="flex flex-col gap-5">
      <h3
        id={`${acknowledgeId}-heading`}
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-xl font-semibold outline-none"
      >
        {t.saveCodes}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t.saveCodesHelp}
      </p>
      <ol className="receipt-edge grid grid-cols-1 gap-x-4 gap-y-2.5 rounded-b-md bg-card px-4 pt-6 pb-4 font-mono text-sm select-all min-[26rem]:grid-cols-2">
        {codes.map((code) => (
          <li key={code} className="break-all">
            {code}
          </li>
        ))}
      </ol>
      <label
        htmlFor={acknowledgeId}
        className="flex min-h-12 cursor-pointer items-center gap-3 text-sm"
      >
        <input
          id={acknowledgeId}
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          className="size-5 shrink-0 accent-signal"
        />
        {t.savedCodes}
      </label>
      <Button disabled={!acknowledged} onClick={onContinue}>
        {t.continueToDashboard}
      </Button>
    </section>
  );
}
