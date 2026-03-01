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
  { pattern: /có\s+xe\s+ghép\s+từ/, weight: 3 }, // "có xe ghép từ X" — driver advertising a ride
  { pattern: /bác\s+nào\s+cần\s+xe/, weight: 3 }, // "bác nào cần xe" — driver seeking passengers
  { pattern: /ai\s+cần\s+xe/, weight: 3 }, // "ai cần xe" — driver seeking passengers
  { pattern: /mình\s+có\s+xe\s+\d+\s+chỗ/, weight: 3 }, // "mình có xe 7 chỗ"
  { pattern: /nhà\s+em\s+có\s+xe/, weight: 3 }, // "nhà em có xe" — driver
  { pattern: /phục\s+vụ\s+quý\s+khách/, weight: 3 },
  { pattern: /đội\s+ngũ\s+lái\s+xe/, weight: 3 },
  { pattern: /khách\s+hàng/, weight: 2 },
  { pattern: /giá\s+chỉ\s+từ/, weight: 2 },
  { pattern: /tìm\s+người/, weight: 2 },
  { pattern: /nhận\s+gửi\s+hàng/, weight: 2 },
  { pattern: /đưa\s+đón/, weight: 2 },
  { pattern: /tuyến\s+cố\s+định/, weight: 2 },
];

/**
 * Weighted passenger patterns. Higher weight = stronger signal.
 */
const PASSENGER_PATTERNS: WeightedPattern[] = [
  { pattern: /cần\s+tìm\s+xe/, weight: 3 }, // "cần tìm xe"
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
  { pattern: /ai\s+đi\s+ib\s+em/, weight: 3 }, // "ai đi ib em" — passenger asking anyone going to contact
  { pattern: /cần\s+bao\s+\d{0,2}\s*xe/, weight: 3 }, // "cần bao xe", "cần bao 1 xe"
  { pattern: /e\s+bao\s+xe/, weight: 3 }, // "e bao xe"
  { pattern: /báo\s+giá\s+bao\s+xe/, weight: 3 }, // "báo giá bao xe"
  { pattern: /cần\s+gửi/, weight: 2 }, // "cần gửi đồ"
  { pattern: /(?<!ai\s)cần\s+xe/, weight: 2 }, // "cần xe" — need a car (not "ai cần xe" which is a driver)
  { pattern: /cần\s+\d+\s+xe/, weight: 2 }, // "cần 1 xe"
  { pattern: /tìm\s+xe/, weight: 2 }, // "tìm xe"
  { pattern: /có\s+xe\s+nào/, weight: 2 }, // "có xe nào"
  { pattern: /còn\s+xe\s+nào/, weight: 2 }, // "còn xe nào"
  { pattern: /bác\s+tài/, weight: 2 }, // addressing a driver = passenger
  { pattern: /có\s+bác\s+nào\s+(?:xe|cần|coa)/, weight: 2 }, // "có bác nào xe/cần/coa"
  { pattern: /mình\s+cần\s+đi/, weight: 2 }, // "mình cần đi"
  { pattern: /xin\s+giá/, weight: 2 }, // "xin giá"
  { pattern: /muốn\s+hỏi\s+xe/, weight: 2 }, // "muốn hỏi xe"
  { pattern: /cần\s+tìm\s+\d+/, weight: 2 }, // "cần tìm 2 ghế"
  { pattern: /nhà\s+em\s+(?:cần|muốn|đi|đang|xin)/, weight: 2 }, // "nhà em cần/đi..." (NOT "nhà em có xe")
];

function score(content: string, patterns: WeightedPattern[]): number {
  return patterns.reduce(
    (total, { pattern, weight }) =>
      pattern.test(content) ? total + weight : total,
    0,
  );
}

export function detectPostType(content: string): AuthorType {
  if (!content || typeof content !== "string") return "driver";

  const normalized = content.toLowerCase();
  const driverScore = score(normalized, DRIVER_PATTERNS);
  const passengerScore = score(normalized, PASSENGER_PATTERNS);

  // Ties default to "driver" since unclassifiable posts are more likely driver ads
  return passengerScore > driverScore ? "passenger" : "driver";
}
