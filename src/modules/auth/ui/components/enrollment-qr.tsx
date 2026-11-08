"use client";

import { QRCodeSVG } from "qrcode.react";

import type { MfaEnrollment } from "../../domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";

// Drawn in the browser so that the secret never leaves this page.
export function EnrollmentQr({ enrollment }: { enrollment: MfaEnrollment }) {
  const t = useMessages().auth;
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="w-fit shrink-0 rounded-md bg-white p-2">
        <QRCodeSVG
          value={enrollment.otpauthUri}
          size={184}
          level="M"
          bgColor="#ffffff"
          fgColor="#0a0a0a"
          title={t.qrTitle}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-2 text-sm">
        <p className="text-muted-foreground">
          {t.qrHelp}
        </p>
        <p className="font-mono text-xs leading-relaxed break-all text-foreground select-all">
          {enrollment.secret}
        </p>
      </div>
    </div>
  );
}
