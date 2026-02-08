import { ChainOfCustodyEvent } from '@root/types/investigation';
import { generateHash, generateId } from './hashUtils';

export function createCustodyLog(
    action: ChainOfCustodyEvent['action'],
    actor: string,
    details: string,
    data: any
): ChainOfCustodyEvent {
    return {
        id: generateId(),
        timestamp: new Date().toISOString(),
        action,
        actor,
        details,
        hashAfter: generateHash(data)
    };
}
