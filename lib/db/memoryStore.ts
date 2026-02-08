import { InvestigationCase } from '@root/types/investigation';

// Global declaration for hot reload persistence in dev mode
const globalStore = global as unknown as { investigationStore: Map<string, InvestigationCase> };

export const memoryStore = globalStore.investigationStore || new Map<string, InvestigationCase>();

if (process.env.NODE_ENV !== 'production') {
    globalStore.investigationStore = memoryStore;
}

export const db = {
    getCase: async (id: string): Promise<InvestigationCase | undefined> => {
        // Simulate async
        return memoryStore.get(id);
    },

    getAllCases: async (): Promise<InvestigationCase[]> => {
        return Array.from(memoryStore.values()).sort((a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
    },

    saveCase: async (c: InvestigationCase): Promise<void> => {
        memoryStore.set(c.id, c);
    },

    updateCase: async (id: string, updates: Partial<InvestigationCase>): Promise<void> => {
        const existing = memoryStore.get(id);
        if (!existing) throw new Error(`Case ${id} not found`);
        memoryStore.set(id, { ...existing, ...updates, updated: new Date().toISOString() });
    },

    clear: async () => {
        memoryStore.clear();
    }
};
