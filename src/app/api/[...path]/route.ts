import { forwardToApi } from "@/shared/bff/forward-to-api";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: Request, { params }: RouteContext) {
  return forwardToApi(request, (await params).path);
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
