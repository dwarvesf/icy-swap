import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetchKeys = {
  SWAP_INFO: "/swap/info",
  TXNS: "/transactions",
};

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
  while (suffix.length > 2 && suffix[suffix.length - 1] === "0") {
    suffix = suffix.substring(0, suffix.length - 1);
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
