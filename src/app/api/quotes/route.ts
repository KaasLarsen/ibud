import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/api/rate-limit";
import { getModelById } from "@/lib/quotes/catalog";
import { quoteRequestSchema } from "@/lib/quotes/schema";
import { getQuotes } from "@/lib/quotes/service";

export const maxDuration = 60;

export async function POST(req: Request) {
  const rate = checkRateLimit(`quotes:${clientIp(req)}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "For mange forespørgsler — prøv igen om lidt" },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldigt JSON" }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ugyldig forespørgsel", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const model = getModelById(parsed.data.modelId);
  if (!model) {
    return NextResponse.json({ error: "Ukendt model" }, { status: 400 });
  }
  if (!model.storageOptions.includes(parsed.data.storageGb)) {
    return NextResponse.json(
      { error: "Lagerstørrelse passer ikke til modellen" },
      { status: 400 },
    );
  }

  try {
    const result = await getQuotes(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Quote error:", err);
    return NextResponse.json(
      { error: "Kunne ikke hente tilbud lige nu" },
      { status: 500 },
    );
  }
}
