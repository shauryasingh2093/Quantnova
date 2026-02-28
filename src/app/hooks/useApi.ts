import { useState, useEffect, useCallback } from "react";

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * Custom hook for fetching data from the Flask API.
 * Supports auto-refresh with configurable interval.
 */
export function useApi<T>(
    url: string,
    refreshInterval: number = 0 // ms, 0 = no auto-refresh
): ApiState<T> & { refetch: () => void } {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || `Request failed (${res.status})`);
            }
            const json = await res.json();
            setState({ data: json, loading: false, error: null });
        } catch (err: any) {
            setState((prev) => ({
                data: prev.data, // keep stale data
                loading: false,
                error: err.message || "Failed to fetch",
            }));
        }
    }, [url]);

    useEffect(() => {
        fetchData();
        if (refreshInterval > 0) {
            const id = setInterval(fetchData, refreshInterval);
            return () => clearInterval(id);
        }
    }, [fetchData, refreshInterval]);

    return { ...state, refetch: fetchData };
}

/**
 * POST helper for placing orders.
 */
export async function postOrder(body: {
    symbol: string;
    side: string;
    type: string;
    quantity: number;
    price?: number;
    stopPrice?: number;
}) {
    const res = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Order failed");
    return json;
}
