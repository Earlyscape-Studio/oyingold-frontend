import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getOrders, resolveOrderAttention } from "@/lib/api";

const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

describe("getOrders", () => {
    it("adds no attention filter by default", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse([]));

        await getOrders("tok");

        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(url.pathname).toBe("/orders");
        expect(url.searchParams.has("needsAttention")).toBe(false);
    });

    it("sends the status and attention filters together", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse([]));

        await getOrders("tok", "UNFULFILLED", { needsAttention: true });

        const [rawUrl, init] = fetchMock.mock.calls[0];
        const url = new URL(rawUrl);
        expect(url.searchParams.get("status")).toBe("UNFULFILLED");
        expect(url.searchParams.get("needsAttention")).toBe("true");
        expect(init.headers.Authorization).toBe("Bearer tok");
    });
});

describe("resolveOrderAttention", () => {
    it("PATCHes the attention endpoint", async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({ id: "o1", needsAttention: false, needsAttentionReason: null })
        );

        const result = await resolveOrderAttention("o1", "tok");

        expect(result).toEqual({ ok: true });
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://localhost:8000/orders/o1/attention");
        expect(init.method).toBe("PATCH");
        expect(init.headers.Authorization).toBe("Bearer tok");
    });

    it("returns the server's error message on failure", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Order not found" }, 404));

        const result = await resolveOrderAttention("missing", "tok");

        expect(result).toEqual({ ok: false, error: "Order not found" });
    });

    it("falls back to a generic message when the body isn't JSON", async () => {
        fetchMock.mockResolvedValueOnce(new Response("oops", { status: 500 }));

        const result = await resolveOrderAttention("o1", "tok");

        expect(result).toEqual({ ok: false, error: "Failed to mark the order as resolved" });
    });
});