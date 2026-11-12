"use client";

import { useState } from "react";

import { useOverdueSection } from "../../application/use-overdue-section";
import { httpOverdueRepository } from "../../infrastructure/http-overdue-repository";
import { OverdueGroupsList } from "../components/overdue-groups-list";
import { OverdueRow } from "../components/overdue-row";
import { SettleConfirmDialog } from "../components/settle-confirm-dialog";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { ItemList } from "@/modules/expenses/ui/components/item-list";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";
import { useMessages } from "@/shared/i18n/use-i18n";

interface OverdueSectionContainerProps {
  period: string;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function OverdueSectionContainer({ period, tagId, onSessionEnded }: OverdueSectionContainerProps) {
  const t = useMessages().overdue;
  const { tags } = useTagList(httpTagsRepository);
  const section = useOverdueSection(httpOverdueRepository, period, tagId, onSessionEnded);
  const [settling, setSettling] = useState<PeriodItem | null>(null);

  if (section.notOpened && !section.isLoading) {
    return <p className="border-t border-rule py-3 text-sm text-muted-foreground">{t.copy.notOpened}</p>;
  }

  return (
    <>
      <SettleConfirmDialog
        item={settling}
        onConfirm={(item) => section.settle(item.id)}
        onClose={() => setSettling(null)}
      />
      <ItemList
        copy={t.copy}
        isFiltered={tagId !== null}
        items={section.items}
        isLoading={section.isLoading}
        loadFailed={section.loadFailed}
        refreshFailed={section.refreshFailed}
        failure={section.failure}
        reload={section.reload}
        renderItems={() => (
          <OverdueGroupsList
            groups={section.groups}
            isFiltered={tagId !== null}
            totalsAreSettling={section.totalsAreSettling}
            renderRow={(item) => (
              <OverdueRow key={item.id} item={item} tags={tags} onAskSettle={() => setSettling(item)} />
            )}
          />
        )}
      />
    </>
  );
}
