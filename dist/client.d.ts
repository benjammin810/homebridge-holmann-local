import { EventEmitter } from 'node:events';
export interface Device extends EventEmitter {
    connect(): Promise<unknown>;
    disconnect(): void;
    isConnected(): boolean;
    get(options: {
        dps: number;
    }): Promise<unknown>;
    set(options: {
        dps: number;
        set: boolean;
    }): Promise<unknown>;
}
export type Factory = () => Device;
/** One socket, no queued writes, and no replay of a failed command after reconnect. */
export declare class PowerClient {
    private factory;
    private state;
    private fault;
    private log;
    private timeoutMs;
    private pollMs;
    private device?;
    private timer?;
    private stopped;
    private busy;
    private delay;
    private online;
    constructor(factory: Factory, state: (on: boolean) => void, fault: () => void, log: (message: string) => void, timeoutMs?: number, pollMs?: number);
    start(): void;
    private schedule;
    private drop;
    private failed;
    private obtain;
    private perform;
    read(): Promise<boolean>;
    write(on: boolean): Promise<boolean>;
    stop(): void;
}
