export async function GET(req: Request): Promise<Response> {
  return Response.json({
    message: "Hello, world!",
    method: "GET",
  })
}

export async function PUT(req: Request): Promise<Response> {
  return Response.json({
    message: "Hello, world!",
    method: "PUT",
  })
}

export async function fallback(req: RequestWithParams): Promise<Response> {
  const name = req.params.name
  return Response.json({
    message: `Hello, ${name}!`,
  })
}

interface RequestWithParams extends Request {
  params: {
    name: string
  }
}
