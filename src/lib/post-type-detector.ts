import type { AuthorType } from "@/types";

interface WeightedPattern {
  pattern: RegExp;
  weight: number;
}

/**
 * Weighted driver patterns. Higher weight = stronger signal.
 */
const DRIVER_PATTERNS: WeightedPattern[] = [
  { pattern: /hotline/, weight: 3 },
  { pattern: /tìm\s+khách/, weight: 3 },
  { pattern: /có\s+xe\s+trống/, weight: 3 },
  { pattern: /có\s+xe\s+(\d)c\s+trống/, weight: 3 },
  { pattern: /có\s+xe\s+ghép\s+từ/, weight: 3 }, // "có xe ghép từ X" — driver advertising a ride
  { pattern: /bác\s+nào\s+cần\s+xe/, weight: 3 }, // "bác nào cần xe" — driver seeking passengers
  { pattern: /(ai|ace)\s+cần\s+xe/, weight: 3 }, // "ai cần xe" — driver seeking passengers
  { pattern: /(mình|em)\s+có\s+xe/, weight: 3 }, // "mình/em có xe 7 chỗ"
  { pattern: /có\s+xe\s+quay\s+đầu/, weight: 3 }, // "có xe quay đầu" — returning empty vehicle
  { pattern: /nhận\s+bao\s+xe/, weight: 3 }, // "nhận bao xe" — driver accepting charter bookings
  { pattern: /mọi\s+người\s+cần\s+xe/, weight: 3 }, // "mọi người cần xe" — driver addressing potential passengers
  { pattern: /nhà\s+em\s+có\s+xe/, weight: 3 }, // "nhà em có xe" — driver
  { pattern: /phục\s+vụ/, weight: 3 },
  { pattern: /quý\s+khách/, weight: 3 },
  { pattern: /đội\s+ngũ\s+lái\s+xe/, weight: 3 },
  { pattern: /kính\s+chào\s/, weight: 3 }, // "kính chào quý khách" — formal driver greeting to customers
  { pattern: /nhận\s+ghép\s+khách/, weight: 3 }, // "nhận ghép khách" — driver accepting shared-ride passengers
  { pattern: /các\s+bác\s+cần\s+xe/, weight: 3 }, // "các bác cần xe" — driver addressing potential passengers
  { pattern: /xe\s+(?:mình|em)\s+trống/, weight: 3 }, // "xe mình/em trống" — driver has empty seats
  { pattern: /khách\s+hàng/, weight: 3 },
  { pattern: /giá\s+chỉ\s+từ/, weight: 3 },
  { pattern: /tìm\s+người/, weight: 3 },
  { pattern: /tuyến\s+cố\s+định/, weight: 3 },
  { pattern: /(?:mình|em|tôi)\s+có\s+xe\s+tiện\s+chuyến/, weight: 3 }, // "mình/em/tôi có xe tiện chuyến" — driver offering a convenient trip
  { pattern: /nhận\s+đón\s+trả\s+khách/, weight: 3 }, // "nhận đón trả khách" — driver accepting pick-up/drop-off
  { pattern: /nhận\s+gửi\s+đồ/, weight: 3 }, // "nhận gửi đồ" — driver accepting parcel deliveries
  { pattern: /bao\s+cả\s+xe/, weight: 3 }, // "bao cả xe" — driver offering full charter
  { pattern: /bao\s+xe\s+từ/, weight: 3 }, // "bao xe từ Xk" — driver listing charter prices
  { pattern: /nhận\s+ghép\s+xe/, weight: 3 }, // "nhận ghép xe" — driver accepting shared-ride requests
  { pattern: /xe\s+nhà\s+(?:mình|em)\s+chạy/, weight: 3 }, // "xe nhà mình/em chạy" — driver's business vehicle
  { pattern: /24\/7/, weight: 3 }, //
  { pattern: /vf/, weight: 3 }, //
  { pattern: /24\/24/, weight: 3 },
  { pattern: /tổng\s+đài/, weight: 3 },
  { pattern: /đón\s+tận\s+nơi/, weight: 3 }, // "đưa đón tận nơi" — driver's service phrase
  { pattern: /xe\s+(?:mình|em)\s+từ/, weight: 3 }, // "xe em từ HN về HL" — driver's vehicle route
  { pattern: /xe\s+(?:mình|em)\s+\d/, weight: 3 }, // "xe em 5c" — driver's specific vehicle capacity
  { pattern: /đưa\s+đón/, weight: 3 }, // "đưa đón sân bay" — driver airport transfer service
  { pattern: /ghép\s+cho/, weight: 3 }, // "ghép cho" — driver offering to add passengers
  { pattern: /hằng\s+ngày/, weight: 3 }, // "ib em" — driver asking passengers to message them
  { pattern: /khách\s+bao\s+xe/, weight: 3 }, // "khách bao xe" — passengers can charter, ie driver listing service
  { pattern: /(e|em)\s+có\s+xe/, weight: 3 },
  { pattern: /nhận\s+chở\s+hàng/, weight: 3 },
  { pattern: /nhận\s+hàng\s+tận\s+nhà/, weight: 3 },
  { pattern: /đón\s+trả\s+tận\s+nơi/, weight: 3 },
  {pattern: /có\s+xe\s+\d+\s+chỗ\s+trống/, weight: 3},
  {pattern: /ngày\s+trong\s+tuần/, weight: 3},
  {pattern: /đi\s+xe\s+rỗng/, weight: 3},
  {pattern: /tiện\s+chuyến\s+giá\s+rẻ/, weight: 3},

];

/**
 * Weighted passenger patterns. Higher weight = stronger signal.
 */
const PASSENGER_PATTERNS: WeightedPattern[] = [
  { pattern: /có\s+xe\s+ghép\s+nào/, weight: 3 }, // "có xe ghép nào" — asking for shared ride
  { pattern: /có\s+xe\s+tiện\s+chuyến\s+nào/, weight: 3 }, // "có xe tiện chuyến nào"
  { pattern: /có\s+nhà\s+xe\s+nào/, weight: 3 }, // "có nhà xe nào"
  { pattern: /cần\s+\d+\s+ghế/, weight: 3 }, // "cần 2 ghế"
  { pattern: /muốn\s+ghép\s+\d*\s*ghế/, weight: 3 }, // "muốn ghép 2 ghế"
  { pattern: /cho\s+e\s+\d*\s*(?:một\s+)?ghế/, weight: 3 }, // "cho e một ghế", "cho e 1 ghế"
  { pattern: /cần\s+\d+\s+vé/, weight: 3 }, // "cần 2 vé"
  { pattern: /cần\s+\d+\s+slot/, weight: 3 }, // "cần 1 slot"
  { pattern: /cần\s+\d+\s+chuyến\s+xe/, weight: 3 }, // "cần 01 chuyến xe"
  { pattern: /cần\s+chuyến\s+xe/, weight: 3 }, // "cần chuyến xe"
  { pattern: /có\s+ai\s+tiện\s+chuyến/, weight: 3 }, // "có ai tiện chuyến"
  { pattern: /(?<!ai\s)cần\s+bao\s+\d{0,2}\s*xe/, weight: 3 }, // "cần bao xe", "cần bao 1 xe" (not "ai cần bao xe" which is a driver)
  { pattern: /(?<!ai\s)cần\s+gửi/, weight: 3 }, // "cần gửi" (not "ai cần gửi" which is a driver)
  { pattern: /(?<!ai\s)muốn\s+gửi/, weight: 3 }, // "muốn gửi" (not "ai cần muốn gửi" which is a driver)
  { pattern: /(?<!\w)e\s+bao\s+xe/, weight: 3 }, // "e bao xe" (not the "e" at the end of "xe")
  { pattern: /báo\s+giá\s+bao\s+xe/, weight: 3 }, // "báo giá bao xe"
  { pattern: /muốn\s+tìm\s+\d*\s*xe/, weight: 3 }, // "muốn tìm 1 xe"
  { pattern: /cần\s+\d+\s+xe/, weight: 3 }, // "cần 1 xe"
  { pattern: /có\s+(xe|chuyến)\s+nào/, weight: 3 }, // "có xe nào"
  { pattern: /còn\s+xe\s+nào/, weight: 3 }, // "còn xe nào"
  { pattern: /mình\s+cần\s+đi/, weight: 3 }, // "mình cần đi"
  { pattern: /muốn\s+hỏi\s+xe/, weight: 3 }, // "muốn hỏi xe"
  { pattern: /cần\s+tìm\s+\d+/, weight: 3 }, // "cần tìm 2 ghế"
  {
    pattern: /nhà\s+em\s+(?:cần|muốn|đang|xin)|nhà\s+em\s+đi\s+(?!xe)/,
    weight: 3,
  }, // "nhà em cần/đi..." but NOT "nhà em đi xe không" (driver scenario)
  { pattern: /báo\s+phí/, weight: 3 }, // "báo phí giúp" — asking for a price quote = passenger
  { pattern: /(?<!\w)e\s+tìm\s+xe/, weight: 3 }, // word-boundary: avoid matching "ace tìm xe"
  { pattern: /(?<!\w)e\s+cần\s+xe/, weight: 3 }, // word-boundary: avoid matching "ace cần xe"
  { pattern: /em\s+cần\s+xe/, weight: 3 }, 
  { pattern: /cần\s+tìm\s+xe/, weight: 3 }, // "cần tìm xe" — passenger looking for a ride
  { pattern: /có\s+\d+người/, weight: 3 },
  { pattern: /ai\s+có\s+xe/, weight: 3 },
  { pattern: /^tìm\s+xe/, weight: 3}
];

/** Minimum score from a single weight-3 pattern to be considered a "strong" signal. */
const STRONG_THRESHOLD = 3;

/** Default OpenRouter model — cheap and fast for classification tasks. */
const DEFAULT_OPENROUTER_MODEL = "arcee-ai/trinity-large-preview:free";

function score(content: string, patterns: WeightedPattern[]): number {
  return patterns.reduce(
    (total, { pattern, weight }) =>
      pattern.test(content) ? total + weight : total,
    0,
  );
}

/**
 * Calls the OpenRouter chat-completion API and returns "driver" | "passenger" | "irrelevant".
 * Returns `null` on any error so the caller can fall back gracefully.
 */
async function classifyViaLLM(
  content: string,
): Promise<AuthorType | "irrelevant" | null> {
  const apiKey = process.env.NEXT_OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn(
      "[classifyViaLLM] NEXT_OPENROUTER_API_KEY not set, skipping LLM classification",
    );
    return null;
  }
  console.info(`Classifying post content: "${content}"`);

  const model = process.env.NEXT_OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

  const systemPrompt = `Bạn là hệ thống phân loại bài đăng trên bảng tin xe ghép Việt Nam.
  Nhiệm vụ: Xác định bài đăng dưới đây thuộc loại nào.
  - TÀI XẾ (driver): người lái xe, chào mời/tìm khách, thông báo xe trống, nhận đặt xe.
  - HÀNH KHÁCH (passenger): người cần đi xe, đặt xe, tìm chỗ ghép, hỏi giá.
  - KHÔNG LIÊN QUAN (irrelevant): quảng cáo, mua bán xe, tin tức, nội dung không liên quan đến dịch vụ vận chuyển hành khách.
  Chỉ trả lời đúng một từ: "driver", "passenger" hoặc "irrelevant". Không giải thích.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "Sekar Post Classifier",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(
        `[classifyViaLLM] OpenRouter API error: ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const json = await res.json();
    const answer = (json?.choices?.[0]?.message?.content ?? "")
      .trim()
      .toLowerCase();

    console.debug(`[classifyViaLLM] LLM response: "${answer}"`);

    if (answer.startsWith("passenger")) {
      console.debug("[classifyViaLLM] Classified as passenger");
      return "passenger";
    }
    if (answer.startsWith("driver")) {
      console.debug("[classifyViaLLM] Classified as driver");
      return "driver";
    }
    if (answer.startsWith("irrelevant")) {
      console.debug("[classifyViaLLM] Classified as irrelevant");
      return "irrelevant";
    }
    console.warn(`[classifyViaLLM] Unexpected response format: "${answer}"`);
    return null;
  } catch (err) {
    console.error(
      "[classifyViaLLM] Error during classification:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

/**
 * Detects whether a post was written by a driver or a passenger,
 * and whether it is relevant to ride-sharing at all.
 *
 * Strategy:
 * 1. If one side has a strong weighted pattern match (score ≥ STRONG_THRESHOLD)
 *    and the other does not → return immediately without an LLM call (relevant).
 * 2. Otherwise (ambiguous or no signal) → call OpenRouter for classification.
 *    The LLM may also return "irrelevant" to filter off-topic posts.
 * 3. On LLM failure → fall back to score comparison (assume relevant).
 */
export async function detectPostType(
  content: string,
): Promise<{
  type: AuthorType;
  usedLLM: boolean;
  fallback: boolean;
  isRelevant: boolean;
}> {
  if (!content || typeof content !== "string")
    return { type: "driver", usedLLM: false, fallback: false, isRelevant: false };

  const normalized = content.normalize("NFKC").toLowerCase();
  const driverScore = score(normalized, DRIVER_PATTERNS);
  const passengerScore = score(normalized, PASSENGER_PATTERNS);

  const driverStrong = driverScore >= STRONG_THRESHOLD;
  const passengerStrong = passengerScore >= STRONG_THRESHOLD;

  // Unambiguous strong signal — no LLM call needed, definitely relevant.
  if (driverStrong && !passengerStrong)
    return { type: "driver", usedLLM: false, fallback: false, isRelevant: true };
  if (passengerStrong && !driverStrong)
    return { type: "passenger", usedLLM: false, fallback: false, isRelevant: true };

  // Ambiguous or no signal — defer to LLM (handles both type and relevance).
  const llmResult = await classifyViaLLM(content);
  if (llmResult === "irrelevant")
    return { type: "driver", usedLLM: true, fallback: false, isRelevant: false };
  if (llmResult !== null)
    return { type: llmResult, usedLLM: true, fallback: false, isRelevant: true };

  // Final fallback: score comparison (ties → "driver"), assume relevant.
  return {
    type: passengerScore > driverScore ? "passenger" : "driver",
    usedLLM: false,
    fallback: true,
    isRelevant: true,
  };
}
