export function formatNaira(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(num);
}


// Same as formatNaira, but keeps kobo when there is any. Used where fees and
// totals can be fractional (checkout), so the lines on screen add up exactly.
export function formatNairaExact(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const digits = Number.isInteger(num) ? 0 : 2;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}
 

export function getEmailDisplayName(email: string): string {
  return email.split("@")[0];
}


export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}



export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}