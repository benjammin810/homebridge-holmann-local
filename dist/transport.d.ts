import type { Device } from './client';
declare const TuyaDevice: any;
export declare class LocalTransport extends TuyaDevice {
    private retired;
    private pending;
    constructor(options: Record<string, unknown>);
    connect(): Promise<unknown>;
    _send(buffer: Buffer): Promise<unknown>;
    disconnect(): void;
}
export declare function createTransport(options: Record<string, unknown>): Device;
export {};
