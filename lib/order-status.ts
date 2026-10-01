import type { OrderStatus } from "@/lib/api";

export const ORDER_STEPS = [
  "Order Placed",
  "Payment confirmed",
  "Processing",
  "Shipped",
  "Delivered",
] as const;

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