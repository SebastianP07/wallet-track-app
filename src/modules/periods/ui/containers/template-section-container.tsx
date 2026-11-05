"use client";

import { useTemplateSection } from "../../application/use-template-section";
import { httpTemplatesRepository } from "../../infrastructure/http-periods-repository";
import { TemplateSection } from "../components/template-section";

interface TemplateSectionContainerProps {
  onSessionEnded: () => void;
}

export function TemplateSectionContainer({ onSessionEnded }: TemplateSectionContainerProps) {
  const section = useTemplateSection(httpTemplatesRepository, onSessionEnded);
  return <TemplateSection {...section} />;
}
