import { EventEmitter } from 'node:events';

export interface Device extends EventEmitter {
  connect(): Promise<unknown>;
  disconnect(): void;
  isConnected(): boolean;
  get(options: { dps: number }): Promise<unknown>;
  set(options: { dps: number; set: boolean }): Promise<unknown>;
}
export type Factory = () => Device;

/** One socket, no queued writes, and no replay of a failed command after reconnect. */
export class PowerClient {
  private device?: Device;
  private timer?: ReturnType<typeof setTimeout>;
  private stopped = false;
  private busy = false;
  private delay = 1000;
  private online = false;

  constructor(private factory: Factory, private state: (on: boolean) => void,
    private fault: () => void, private log: (message: string) => void,
    private timeoutMs = 6000, private pollMs = 30000) {}

  start(): void { this.schedule(0); }

  private schedule(ms: number): void {
    if (this.stopped || this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.busy) { this.schedule(1000); return; }
      void this.read().catch(() => undefined);
    }, ms);
    this.timer.unref();
  }

  private drop(): void {
    const old = this.device;
    this.device = undefined;
    // Keep the error listener attached to absorb late socket errors safely.
    try { old?.disconnect(); } catch { /* already closed */ }
  }

  private failed(): void {
    if (this.stopped) return;
    this.drop();
    this.fault();
    if (this.online) this.log('Controller unavailable; reconnecting automatically.');
    this.online = false;
  }

  private obtain(): Device {
    if (this.device) return this.device;
    const device = this.factory();
    this.device = device;
    device.on('error', () => { if (this.device === device) { this.failed(); this.schedule(this.delay); } });
    device.on('disconnected', () => {
      if (this.device === device) { this.failed(); this.schedule(this.delay); }
    });
    const update = (packet: unknown) => {
      if (this.device !== device || this.stopped) return;
      const on = (packet as { dps?: Record<string, unknown> } | null)?.dps?.['20'];
      if (typeof on === 'boolean') this.state(on);
    };
    device.on('data', update);
    device.on('dp-refresh', update);
    return device;
  }

  private async perform(desired?: boolean): Promise<boolean> {
    if (this.stopped || this.busy) throw new Error('Controller busy or stopped; retry shortly.');
    this.busy = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let active = true;
    try {
      const device = this.obtain();
      const assertActive = () => {
        if (!active || this.stopped || this.device !== device) throw new Error('Connection closed.');
      };
      const operation = async () => {
        if (!device.isConnected()) await device.connect();
        assertActive();
        if (desired !== undefined) {
          await device.set({ dps: 20, set: desired });
          assertActive();
        }
        const on = await device.get({ dps: 20 });
        assertActive();
        if (typeof on !== 'boolean') throw new Error('DPS 20 did not return a Boolean.');
        if (desired !== undefined && on !== desired) throw new Error('Power change not confirmed.');
        return on;
      };
      const on = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          deadline = setTimeout(() => reject(new Error('Controller timeout.')), this.timeoutMs);
        }),
      ]);
      this.state(on);
      if (!this.online) this.log('Connected to Holman controller over the local LAN.');
      this.online = true;
      this.delay = 1000;
      return on;
    } catch {
      this.failed();
      // Never log dependency errors, config objects, packets, or the local key.
      throw new Error('Holman unavailable: check power, LAN access and local key.');
    } finally {
      active = false;
      if (deadline) clearTimeout(deadline);
      this.busy = false;
      this.schedule(this.online ? this.pollMs : this.delay);
      if (!this.online) this.delay = Math.min(this.delay * 2, 60000);
    }
  }

  read(): Promise<boolean> { return this.perform(); }
  write(on: boolean): Promise<boolean> { return this.perform(on); }
  stop(): void {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    this.drop();
  }
}
