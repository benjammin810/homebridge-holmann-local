"use strict";
const node_net_1 = require("node:net");
const client_1 = require("./client");
const transport_1 = require("./transport");
class HolmanAccessory {
    services;
    constructor(log, config, api) {
        const id = config.deviceId;
        const ip = config.ip;
        const key = config.localKey;
        if (typeof id !== 'string' || !id.trim() || typeof ip !== 'string' || (0, node_net_1.isIP)(ip) !== 4 ||
            typeof key !== 'string' || Buffer.byteLength(key, 'utf8') !== 16) {
            throw new Error('HolmanLocal requires a device ID, IPv4 address and a 16-byte localKey. Enter the key privately in plugin settings.');
        }
        const name = config.name || 'Garden Lights';
        const information = new api.hap.Service.AccessoryInformation()
            .setCharacteristic(api.hap.Characteristic.Manufacturer, 'Holman')
            .setCharacteristic(api.hap.Characteristic.Model, 'CLXW60')
            .setCharacteristic(api.hap.Characteristic.SerialNumber, id)
            .setCharacteristic(api.hap.Characteristic.FirmwareRevision, '1.0.1');
        const service = new api.hap.Service.Switch(name);
        const power = service.getCharacteristic(api.hap.Characteristic.On);
        const unavailable = () => new api.hap.HapStatusError(-70402 /* api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
        const client = new client_1.PowerClient(() => (0, transport_1.createTransport)({
            id, ip, key, version: '3.3', port: 6668,
            issueGetOnConnect: false, issueRefreshOnConnect: false,
        }), on => power.updateValue(on), () => power.updateValue(unavailable()), message => log.info(message));
        power.onGet(async () => {
            try {
                return await client.read();
            }
            catch {
                throw unavailable();
            }
        });
        power.onSet(async (value) => {
            if (typeof value !== 'boolean')
                throw new api.hap.HapStatusError(-70410 /* api.hap.HAPStatus.INVALID_VALUE_IN_REQUEST */);
            try {
                await client.write(value);
            }
            catch {
                throw unavailable();
            }
        });
        this.services = [information, service];
        api.on('didFinishLaunching', () => client.start());
        api.on('shutdown', () => client.stop());
        log.info('Holman local on/off control ready; protocol 3.3, DPS 20.');
    }
    getServices() { return this.services; }
}
module.exports = (api) => {
    api.registerAccessory('homebridge-holman-local', 'HolmanLocal', HolmanAccessory);
};
