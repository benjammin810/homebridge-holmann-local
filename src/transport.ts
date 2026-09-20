import type { Socket } from 'node:net';
import type { Device } from './client';

// Pinned to TuyAPI 7.7.1: the adapter replaces its retrying _send so a timed-out
// power command cannot reconnect and execute later. Protocol encoding stays upstream.
const TuyaDevice = require('tuyapi');
export class LocalTransport extends TuyaDevice {
  private retired = false;
  private pending = new Set<(error: Error) => void>();
  constructor(options: Record<string, unknown>) { super(options); }

  async connect(): Promise<unknown> {
    if (this.retired) throw new Error('Transport retired.');
    const result = await super.connect();
    if (this.retired) throw new Error('Transport retired.');
    return result;
  }

  async _send(buffer: Buffer): Promise<unknown> {
    const sequence = this._currentSequenceN as number;
    await this.connect();
    if (this.retired) throw new Error('Transport retired.');
    return new Promise((resolve, reject) => {
      const clean = () => {
        clearTimeout(timer);
        delete this._resolvers[sequence];
        this.pending.delete(fail);
      };
      const fail = (error: Error) => { clean(); reject(error); };
      const timer = setTimeout(() => fail(new Error('Local response timeout.')), 3000);
      this.pending.add(fail);
      this._resolvers[sequence] = (value: unknown) => { clean(); resolve(value); };
      try { (this.client as Socket).write(buffer); } catch { fail(new Error('Local write failed.')); }
    });
  }

  disconnect(): void {
    this.retired = true;
    for (const fail of [...this.pending]) fail(new Error('Transport closed.'));
    super.disconnect();
    // Upstream disconnect only closes established sockets; also cancel a connect.
    (this.client as Socket | undefined)?.destroy();
    if (this.connectPromise) {
      this.connectPromise.reject(new Error('Transport closed.'));
      delete this.connectPromise;
    }
  }
}
export function createTransport(options: Record<string, unknown>): Device {
  return new LocalTransport(options) as unknown as Device;
}
