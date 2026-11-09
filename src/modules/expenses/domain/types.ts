import type { components } from "@/shared/api/openapi";

export type PeriodItem = components["schemas"]["PeriodItem"];
export type PeriodItemList = components["schemas"]["PeriodItemList"];
export type PeriodItemUpdate = components["schemas"]["PeriodItemUpdate"];
export type ExpenseCreate = components["schemas"]["ExpenseItemCreate"];
export type ExpenseKind = ExpenseCreate["kind"];
export type IncomeCreate = components["schemas"]["IncomeItemCreate"];
export type CardChargeCreate = components["schemas"]["CardChargeItemCreate"];
export type ItemCreate = ExpenseCreate | IncomeCreate | CardChargeCreate;
export type PeriodItemOrder = components["schemas"]["PeriodItemOrder"];
export type OrderedKind = PeriodItemOrder["kind"];
