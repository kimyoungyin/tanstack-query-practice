import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource/ibm-plex-sans-kr/400.css";
import "@fontsource/ibm-plex-sans-kr/500.css";
import "@fontsource/ibm-plex-sans-kr/600.css";
import "@fontsource/ibm-plex-sans-kr/700.css";
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
