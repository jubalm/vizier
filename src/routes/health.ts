import { type BunRequest } from 'bun'

export async function GET(req: BunRequest): Promise<Response> {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
}
