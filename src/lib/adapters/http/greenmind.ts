import { getModelById } from "../../quotes/catalog";
import { partnerDeepLink } from "../../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../../quotes/types";
import { baseResult } from "../types";

const GM_API = "https://greenmind.dk/api/odoo";

type GmProduct = {
  id: number;
  name: string;
  color: { code: string; name: string }[];
  storage: { code: string; name: string }[];
};

type GmQuestion = {
  id: number;
  question: string;
  description?: string;
};

async function gmPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${GM_API}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
      Origin: "https://greenmind.dk",
      Referer: "https://greenmind.dk/saelg-din-enhed",
      "User-Agent":
        "iBudBot/1.0 (+https://ibud.dk; info@ibud.dk) Mozilla/5.0",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GreenMind HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

function storageCode(storageGb: number): string {
  if (storageGb >= 1024) return `${storageGb / 1024}_TB`;
  return `${storageGb}_GB`;
}

function matchProduct(
  products: GmProduct[],
  modelName: string,
): GmProduct | undefined {
  const target = `apple ${modelName}`.toLowerCase();
  const exact = products.find((p) => p.name.toLowerCase() === target);
  if (exact) return exact;

  // Match fuldt modelnavn; kræv at resten ikke tilføjer pro/plus/mini/max/air
  return products.find((p) => {
    const n = p.name.toLowerCase();
    if (!n.startsWith("apple ")) return false;
    const rest = n.slice("apple ".length);
    if (rest === modelName.toLowerCase()) return true;
    return false;
  });
}

function answersForRequest(
  questions: GmQuestion[],
  request: QuoteRequest,
): { questionId: number; answer: boolean }[] {
  const { condition } = request;
  return questions.map((q) => {
    const text = `${q.question} ${q.description ?? ""}`.toLowerCase();
    let answer = true;

    if (/tænd|virker|fungerer/.test(text)) {
      answer = condition.worksNormally;
    } else if (/touchscreen|skærm|revn/.test(text)) {
      answer = condition.screenIntact && condition.cosmetic !== "damaged";
    } else if (/perfekt kosmetisk/.test(text)) {
      answer =
        condition.cosmetic === "fine" &&
        condition.battery === "ok" &&
        condition.screenIntact;
    } else if (/god stand/.test(text)) {
      answer =
        condition.worksNormally &&
        condition.screenIntact &&
        condition.cosmetic !== "damaged" &&
        condition.battery !== "poor";
    }

    return { questionId: q.id, answer };
  });
}

export async function fetchGreenmindHttpQuote(
  request: QuoteRequest,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("greenmind", request);
  if (!model) {
    return baseResult("greenmind", deepLink, { error: "Ukendt model" });
  }

  try {
    const list = await gmPost<{
      data?: { buybackProductList?: { products?: GmProduct[] } };
    }>("buybackProductList", [
      { code: "PHONE_IPHONE", manufacturerId: null },
    ]);

    const products = list.data?.buybackProductList?.products ?? [];
    const product = matchProduct(products, model.name);
    if (!product) {
      return baseResult("greenmind", deepLink, {
        error: `GreenMind har ikke ${model.name}`,
      });
    }

    const storage = storageCode(request.storageGb);
    const hasStorage = product.storage.some((s) => s.code === storage);
    if (!hasStorage) {
      return baseResult("greenmind", deepLink, {
        error: `GreenMind understøtter ikke ${storage} for ${model.name}`,
      });
    }

    const color = product.color[0]?.code ?? "BLACK";

    const qRes = await gmPost<{
      data?: { buybackQuestionList?: { questions?: GmQuestion[] } };
    }>("buybackQuestionList", [product.id]);
    const questions = qRes.data?.buybackQuestionList?.questions ?? [];
    if (!questions.length) {
      return baseResult("greenmind", deepLink, {
        error: "GreenMind returnerede ingen spørgsmål",
      });
    }

    const answers = answersForRequest(questions, request);
    // Positional GraphQL vars: [productId, colorCode, storageCode, questionAnswers]
    const quote = await gmPost<{
      data?: { buybackQuote?: { price?: number; currency?: string } };
      graphQLErrors?: { message: string }[];
      message?: string;
    }>("buybackQuote", [product.id, color, storage, answers]);

    if (quote.graphQLErrors?.length) {
      return baseResult("greenmind", deepLink, {
        error: quote.graphQLErrors[0]?.message ?? "GreenMind quote-fejl",
      });
    }

    const price = quote.data?.buybackQuote?.price;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return baseResult("greenmind", deepLink, {
        error: "GreenMind returnerede ingen pris",
      });
    }

    return baseResult("greenmind", deepLink, {
      amountDkk: Math.round(price),
      rawNotes: "GreenMind Odoo buybackQuote API",
    });
  } catch (err) {
    return baseResult("greenmind", deepLink, {
      error: err instanceof Error ? err.message : "GreenMind-fejl",
    });
  }
}
