import DEFAULT from "@/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime:
                Number(localStorage.getItem("staleTime")) || DEFAULT.STALE_TIME, // 1분
            gcTime: Number(localStorage.getItem("gcTime")) || DEFAULT.GC_TIME, // 2분
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
