import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { QueryProvider } from "@/query-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryProvider>
            <ReactQueryDevtools />
            <App />
        </QueryProvider>
    </StrictMode>,
);
