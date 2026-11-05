import type { Tag, TagCreate, TagList, TagUpdate } from "../domain/types";

export interface TagsRepository {
  list(): Promise<TagList>;
  create(tag: TagCreate): Promise<Tag>;
  update(id: string, changes: TagUpdate): Promise<Tag>;
  remove(id: string): Promise<void>;
}
