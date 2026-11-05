import type {
  CreditCard,
  Period,
  PeriodList,
  Template,
  TemplateCreate,
  TemplateList,
  TemplateUpdate,
} from "../domain/types";

export interface PeriodsRepository {
  list(): Promise<PeriodList>;
  open(period: string): Promise<Period>;
  close(period: string): Promise<Period>;
}

export interface TemplatesRepository {
  list(): Promise<TemplateList>;
  create(template: TemplateCreate): Promise<Template>;
  update(id: string, changes: TemplateUpdate): Promise<Template>;
  remove(id: string): Promise<void>;
  listCards(): Promise<CreditCard[]>;
}
