"use client";

import { useOverdueSection } from "../../application/use-overdue-section";
import { OVERDUE_COPY } from "../../domain/overdue-groups";
import { httpOverdueRepository } from "../../infrastructure/http-overdue-repository";
import { OverdueGroupsList } from "../components/overdue-groups-list";
import { OverdueRow } from "../components/overdue-row";
import { ItemList } from "@/modules/expenses/ui/components/item-list";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";

interface OverdueSectionContainerProps {
  tagId: string | null;
  onSessionEnded: () => void;
}

export function OverdueSectionContainer({ tagId, onSessionEnded }: OverdueSectionContainerProps) {
  const { tags } = useTagList(httpTagsRepository);
  const section = useOverdueSection(httpOverdueRepository, tagId, onSessionEnded);

  return (
    <ItemList
      copy={OVERDUE_COPY}
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
            <OverdueRow key={item.id} item={item} tags={tags} onSettle={() => section.settle(item.id)} />
          )}
        />
      )}
    />
  );
}
