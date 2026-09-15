export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function errorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Não foi possível processar sua solicitação";
  return json({ error: message }, 400);
}
