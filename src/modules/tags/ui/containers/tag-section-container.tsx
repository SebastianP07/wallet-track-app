"use client";

import { useTagSection } from "../../application/use-tag-section";
import { httpTagsRepository } from "../../infrastructure/http-tags-repository";
import { TagSection } from "../components/tag-section";

export function TagSectionContainer({ onSessionEnded }: { onSessionEnded: () => void }) {
  const section = useTagSection(httpTagsRepository, onSessionEnded);
  return <TagSection {...section} />;
}
