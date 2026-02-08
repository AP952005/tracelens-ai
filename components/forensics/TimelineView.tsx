'use client';

import React from 'react';
import { TimelineEvent } from '@root/types/investigation';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@root/lib/utils';

interface TimelineViewProps {
    events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
    return (
        <div className="w-full max-w-2xl bg-black/50 p-4 rounded-lg border border-cyan-500/30">
            <h3 className="text-cyan-400 text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Evidence Timeline
            </h3>
            <div className="relative border-l-2 border-cyan-500/20 ml-3 space-y-6">
                {events.map((event, idx) => (
                    <div key={event.id} className="ml-6 relative">
                        <div className={cn(
                            "absolute -left-[31px] w-4 h-4 rounded-full border-2 bg-black",
                            event.significance === 'high' ? "border-red-500 shadow-[0_0_10px_red]" :
                                event.significance === 'medium' ? "border-orange-500" : "border-cyan-500"
                        )} />

                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-cyan-500/70">{new Date(event.timestamp).toLocaleString()}</span>
                            {event.significance === 'high' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>

                        <h4 className="text-white font-semibold text-md">{event.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                        <span className="text-xs text-gray-600 bg-gray-900 px-2 py-0.5 rounded mt-2 inline-block border border-gray-800">
                            Src: {event.source}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
