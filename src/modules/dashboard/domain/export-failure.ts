const NOT_FOUND = 404;
const TOO_MANY_REQUESTS = 429;
const NETWORK_FAILURE = 0;

export function describeExportFailure(status: number): string {
  switch (status) {
    case NOT_FOUND:
      return "This month has not been opened, so there is nothing to export.";
    case TOO_MANY_REQUESTS:
      return "Too many requests. Wait a moment and try again.";
    case NETWORK_FAILURE:
      return "The export needs a connection. Nothing was downloaded.";
    default:
      return "The export failed. Nothing was downloaded.";
  }
}
