import type { OrderStatus } from "@/lib/api";

export type PaymentMethod = "CARD" | "COD";

export const ORDER_STEPS = [
  "Order Placed",
  "Payment confirmed",
  "Processing",
  "Shipped",
  "Delivered",
] as const;

// Cash on delivery isn't paid online: the shop confirms the order, and the cash
// is collected when it arrives. So its second step is a confirmation, not a payment.
const COD_ORDER_STEPS = [
  "Order Placed",
  "Order confirmed",
  "Processing",
  "Shipped",
  "Delivered",
] as const;

export function getOrderSteps(paymentMethod?: PaymentMethod): readonly string[] {
  return paymentMethod === "COD" ? COD_ORDER_STEPS : ORDER_STEPS;
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "Awaiting Payment",
    className: "bg-yellow-200 text-yellow-900",
  },
  UNFULFILLED: {
    label: "Payment Confirmed",
    className: "bg-blue-100 text-blue-900",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-blue-100 text-blue-900",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-indigo-100 text-indigo-900",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-100 text-green-900",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
  },
};

const COD_LABELS: Partial<Record<OrderStatus, string>> = {
  PENDING_PAYMENT: "Awaiting Confirmation",
  UNFULFILLED: "Order Confirmed",
};

export function getOrderStatusMeta(status: OrderStatus, paymentMethod?: PaymentMethod) {
  const meta = ORDER_STATUS_META[status];
  const codLabel = paymentMethod === "COD" ? COD_LABELS[status] : undefined;

  return codLabel ? { ...meta, label: codLabel } : meta;
}
