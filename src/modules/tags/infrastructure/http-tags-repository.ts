import type { TagsRepository } from "../application/tags-repository";
import type { Tag, TagList } from "../domain/types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http-client";

export const httpTagsRepository: TagsRepository = {
  list() {
    return apiGet<TagList>("/tags");
  },
  create(tag) {
    return apiPost<Tag>("/tags", tag);
  },
  update(id, changes) {
    return apiPatch<Tag>(`/tags/${encodeURIComponent(id)}`, changes);
  },
  remove(id) {
    return apiDelete(`/tags/${encodeURIComponent(id)}`);
  },
};
