"use client";

import { QRCodeSVG } from "qrcode.react";

import type { MfaEnrollment } from "../../domain/types";

// Drawn in the browser so that the secret never leaves this page.
export function EnrollmentQr({ enrollment }: { enrollment: MfaEnrollment }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="w-fit shrink-0 rounded-md bg-white p-2">
        <QRCodeSVG
          value={enrollment.otpauthUri}
          size={184}
          level="M"
          bgColor="#ffffff"
          fgColor="#0a0a0a"
          title="QR code to add Wallet Track to your authenticator app"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-2 text-sm">
        <p className="text-muted-foreground">
          Scan it with your authenticator app, or type this secret in by hand.
        </p>
        <p className="font-mono text-xs leading-relaxed break-all text-foreground select-all">
          {enrollment.secret}
        </p>
      </div>
    </div>
  );
}
