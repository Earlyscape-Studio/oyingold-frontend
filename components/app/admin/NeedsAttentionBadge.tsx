import { Badge } from "@/components/ui/badge";

// Red tag for orders the system has flagged for a person to look at.
// The reason shows on hover; the order detail page spells it out.
export function NeedsAttentionBadge({ reason }: { reason?: string | null }) {
    return (
        <Badge variant="destructive" title={reason ?? undefined}>
            Needs attention
        </Badge>
    );
}