import type { MouseEvent } from "react";
import {
  CreditCard,
  HandCoins,
  Landmark,
  LayoutDashboard,
  ReceiptText,
  Repeat,
  type LucideIcon,
} from "lucide-react";

import { DASHBOARD_DESTINATIONS, type DestinationId } from "../../domain/destinations";
import { useMessages } from "@/shared/i18n/use-i18n";

const ICONS: Record<DestinationId, LucideIcon> = {
  overview: LayoutDashboard,
  accounts: Landmark,
  expenses: ReceiptText,
  income: HandCoins,
  cards: CreditCard,
  templates: Repeat,
};

interface BottomNavProps {
  current: DestinationId | null;
  onNavigate: (id: DestinationId) => void;
}

// Fixed to the bottom and centred: the full width of a phone, a floating bar on wider screens. Each destination is
// a link to its section, so it still works before the page is interactive; once it is, the click opens the section
// too. Globals hide the bar while a text field has focus on a narrow screen, where the keyboard is likely open.
export function BottomNav({ current, onNavigate }: BottomNavProps) {
  const t = useMessages().dashboard.nav;
  return (
    <nav
      aria-label={t.label}
      className="bottom-nav pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center sm:bottom-3 sm:px-4"
    >
      <ul className="pointer-events-auto grid w-full max-w-xl grid-cols-6 border-t border-rule bg-[#111111] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(0_0_0/0.5)] sm:rounded-xl sm:border sm:border-border sm:pb-0">
        {DASHBOARD_DESTINATIONS.map(({ id, target }) => {
          const Icon = ICONS[id];
          const isCurrent = current === id;
          return (
            <li key={id} className="min-w-0">
              <a
                href={`#${target}`}
                aria-current={isCurrent ? "location" : undefined}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  event.preventDefault();
                  onNavigate(id);
                }}
                className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-0.5 py-1.5 text-[0.6875rem] leading-none font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=location]:text-signal"
              >
                {isCurrent ? (
                  <span aria-hidden="true" className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-signal" />
                ) : null}
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span className="max-w-full truncate">{t[id]}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
