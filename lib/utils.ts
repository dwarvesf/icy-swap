import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetchKeys = {
  SWAP_INFO: "/swap/info",
  TXNS: "/transactions",
};

/**
 * The rate carries fractional sats (1613.82), and the conversion uses it
 * unrounded. Flooring it for display made the headline disagree with the
 * amount field, so show what is actually applied.
 */
export function formatRate(rate: number): string {
  if (!rate) return "0";
  return commify(Number.isInteger(rate) ? rate : rate.toFixed(2));
}

/**
 * The wallet's ICY balance, floored to 2dp.
 *
 * FLOOR, never round. toFixed(2) rounds up, so a balance of 4200.999 shows as
 * 4201.00 and Max then asks to swap more ICY than the wallet holds. That
 * reverts on chain after the user has already paid gas, and trips the
 * backend's balance check too. Truncating can only ever under-ask.
 *
 * Lives here because both the field that displays it and the button that has
 * to refuse to exceed it need the same number.
 */
export function floorIcyBalance(raw: string): string {
  return (Math.floor(+raw * 100) / 100).toFixed(2);
}

/**
 * Group an EDITABLE field's digits. Unlike commify this only inserts
 * separators: it keeps a trailing ".", leading zeros and trailing decimal
 * zeros, every one of which is a legitimate half-typed state. Normalising
 * those mid-keystroke fights the person typing.
 */
export function groupDigits(value: string): string {
  const [whole, ...rest] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return rest.length ? `${grouped}.${rest.join(".")}` : grouped;
}

export function stripGroups(value: string): string {
  return value.replace(/,/g, "");
}

/**
 * Where to put the caret so it stays next to the same digit after regrouping.
 * Character offsets shift as separators appear and vanish; the digit index
 * does not, so that is what gets pinned.
 */
export function caretAfterDigits(formatted: string, digits: number): number {
  if (digits <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== ",") seen++;
    if (seen === digits) return i + 1;
  }
  return formatted.length;
}

export function commify(value: string | number): string {
  const comps = String(value).split(".");

  if (
    comps.length > 2 ||
    !comps[0].match(/^-?[0-9]*$/) ||
    (comps[1] && !comps[1].match(/^[0-9]*$/)) ||
    value === "." ||
    value === "-."
  ) {
    return String(value);
  }

  // Make sure we have at least one whole digit (0 if none)
  let whole = comps[0];

  let negative = "";
  if (whole.substring(0, 1) === "-") {
    negative = "-";
    whole = whole.substring(1);
  }

  // Make sure we have at least 1 whole digit with no leading zeros
  while (whole.substring(0, 1) === "0") {
    whole = whole.substring(1);
  }
  if (whole === "") {
    whole = "0";
  }

  let suffix = "";
  if (comps.length === 2) {
    suffix = "." + (comps[1] || "0");
  }
  // Strip to length 1 (the bare "."), not 2. Stopping at 2 left an orphan
  // zero on whole numbers, so a 45 ICY swap rendered "45.0" and the list
  // looked like it was quoting one decimal of precision it does not have.
  while (suffix.length > 1 && suffix[suffix.length - 1] === "0") {
    suffix = suffix.substring(0, suffix.length - 1);
  }
  if (suffix === ".") {
    suffix = "";
  }

  const formatted = [];
  while (whole.length) {
    if (whole.length <= 3) {
      formatted.unshift(whole);
      break;
    } else {
      const index = whole.length - 3;
      formatted.unshift(whole.substring(index));
      whole = whole.substring(0, index);
    }
  }

  return negative + formatted.join(",") + suffix;
}
