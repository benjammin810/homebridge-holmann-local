"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalTransport = void 0;
exports.createTransport = createTransport;
// Pinned to TuyAPI 7.7.1: the adapter replaces its retrying _send so a timed-out
// power command cannot reconnect and execute later. Protocol encoding stays upstream.
const TuyaDevice = require('tuyapi');
class LocalTransport extends TuyaDevice {
    retired = false;
    pending = new Set();
    constructor(options) { super(options); }
    async connect() {
        if (this.retired)
            throw new Error('Transport retired.');
        const result = await super.connect();
        if (this.retired)
            throw new Error('Transport retired.');
        return result;
    }
    async _send(buffer) {
        const sequence = this._currentSequenceN;
        await this.connect();
        if (this.retired)
            throw new Error('Transport retired.');
        return new Promise((resolve, reject) => {
            const clean = () => {
                clearTimeout(timer);
                delete this._resolvers[sequence];
                this.pending.delete(fail);
            };
            const fail = (error) => { clean(); reject(error); };
            const timer = setTimeout(() => fail(new Error('Local response timeout.')), 3000);
            this.pending.add(fail);
            this._resolvers[sequence] = (value) => { clean(); resolve(value); };
            try {
                this.client.write(buffer);
            }
            catch {
                fail(new Error('Local write failed.'));
            }
        });
    }
    disconnect() {
        this.retired = true;
        for (const fail of [...this.pending])
            fail(new Error('Transport closed.'));
        super.disconnect();
        // Upstream disconnect only closes established sockets; also cancel a connect.
        this.client?.destroy();
        if (this.connectPromise) {
            this.connectPromise.reject(new Error('Transport closed.'));
            delete this.connectPromise;
        }
    }
}
exports.LocalTransport = LocalTransport;
function createTransport(options) {
    return new LocalTransport(options);
}
