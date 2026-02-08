'use client';

import React from 'react';
import { TamboProvider } from "@tambo-ai/react";
import { components, tools } from "@root/lib/tambo";

export function TamboProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <TamboProvider
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || "demo-key"}
            components={components}
            tools={tools}
            tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL} // Optional: user might set this for local dev
        >
            {children}
        </TamboProvider>
    );
}
