// A failed action, carrying what to tell the owner already worded in their language.
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

// For an action someone waits on, as a confirmation does: it settles once the server answers, and a refusal
// arrives already described.
export function settled<Result>(task: Promise<Result>, describe: (error: unknown) => string): Promise<void> {
  return task.then(
    () => undefined,
    (error: unknown) => {
      throw new ActionError(describe(error));
    },
  );
}
