import { QueryClient, QueryClientConfig, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

export function QueryProvider({ children, ...options }: PropsWithChildren<QueryClientConfig>) {
    return <QueryClientProvider client={new QueryClient(options)} children={children} />
}
