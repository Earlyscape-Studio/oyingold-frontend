import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { formatNairaExact } from "@/lib/format";
import type { AdminPayment } from "@/lib/api";

const STATUS_VARIANT = {
    PAID: "default",
    PENDING: "secondary",
    FAILED: "destructive"
} as const;

// Every payment attempt on an order, so a flagged order can be matched to FCMB's dashboard.
export function OrderPaymentsCard({ payments }: { payments: AdminPayment[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Payments</CardTitle>
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No card payments on this order.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Gateway response</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <p className="font-mono text-xs">{payment.reference}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.checkoutMode === "INLINE" ? "Inline" : "Standard"}
                                            {payment.gatewayReference
                                                ? ` · ${payment.gatewayReference}`
                                                : ""}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={STATUS_VARIANT[payment.status]}>
                                            {payment.status}
                                        </Badge>
                                        {payment.paidAt && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(payment.paidAt).toLocaleString()}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {payment.gatewayCode
                                            ? `${payment.gatewayCode}${payment.gatewayMessage ? ` – ${payment.gatewayMessage}` : ""}`
                                            : "No response yet"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatNairaExact(payment.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}