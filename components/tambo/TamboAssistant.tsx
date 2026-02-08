'use client';

import React from 'react';
import { MessageThreadFull } from '@/components/tambo/message-thread-full';
import { cn } from '@root/lib/utils';

// If lib/utils doesn't exist in root, I'll fallback or create it.
// I'll assume I need to create it if it's not there, but `src/lib/utils` likely exists.
// I'll use @/src/lib/utils manually if needed.

export function TamboAssistant({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col h-full bg-[#0a1020]/90 backdrop-blur-md border-l border-cyan-500/20", className)}>
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#05070d]">
                <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    Tambo AI Forensics
                </h2>
                <span className="text-xs text-cyan-600/60 font-mono">V.1.0.4</span>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {/* We override styles via CSS or wrapper classes since MessageThreadFull might have hardcoded classes */}
                <div className="absolute inset-0 [&_.bg-background]:bg-transparent [&_.text-foreground]:text-cyan-100">
                    <MessageThreadFull className="h-full" />
                </div>
            </div>
        </div>
    );
}
