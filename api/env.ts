export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const envName = url.searchParams.get("envName");

  if (!envName) {
    return new Response(JSON.stringify({ error: "Missing envName query parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // IMPORTANT: only expose whether the variable is set, never its value.
  const value = process.env[envName];
  const isSet = typeof value === "string" && value.length > 0;

  return new Response(JSON.stringify({ envName, isSet }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
