const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PowerClient } = require('../dist/client');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class Fake extends EventEmitter {
  connected = false; power = false; writes = []; reads = [];
  async connect() { this.connected = true; }
  disconnect() { this.connected = false; this.emit('disconnected'); }
  isConnected() { return this.connected; }
  async get(options) { this.reads.push(options); return this.power; }
  async set(options) { this.writes.push(options); this.power = options.set; }
}
function setup(factory, timeout = 50) {
  const states = [], logs = []; let faults = 0;
  const client = new PowerClient(factory, x => states.push(x), () => faults++, x => logs.push(x), timeout, 100000);
  return { client, states, logs, faults: () => faults };
}
test('reads and writes only Boolean DPS 20, and accepts false', async () => {
  const d = new Fake(); const {client} = setup(() => d);
  try {
    assert.equal(await client.read(), false);
    assert.equal(await client.write(true), true);
    assert.equal(await client.write(false), false);
    assert.deepEqual(d.writes, [{dps:20,set:true},{dps:20,set:false}]);
    assert.ok(d.reads.every(x => x.dps === 20));
  } finally { client.stop(); }
});
test('invalid state is unavailable, never coerced to off', async () => {
  const d = new Fake(); d.power = undefined; const s = setup(() => d);
  try { await assert.rejects(s.client.read()); assert.equal(s.faults(),1); assert.deepEqual(s.states,[]); }
  finally { s.client.stop(); }
});
test('unconfirmed write fails and is not replayed on reconnect', async () => {
  const a = new Fake(); a.set = async options => { a.writes.push(options); throw Error('secret'); };
  const b = new Fake(); let n=0; const s=setup(() => ++n === 1 ? a : b);
  try {
    await assert.rejects(s.client.write(true), e => !e.message.includes('secret'));
    assert.equal(await s.client.read(),false); assert.deepEqual(b.writes,[]);
    assert.ok(!s.logs.join().includes('secret'));
  } finally { s.client.stop(); }
});
test('bounded connect timeout prevents a late write', async () => {
  const a = new Fake(); a.connect = async () => { await sleep(60); a.connected=true; };
  const s = setup(() => a, 10);
  try { await assert.rejects(s.client.write(true)); await sleep(80); assert.deepEqual(a.writes,[]); }
  finally { s.client.stop(); }
});
test('concurrent commands do not overlap or queue', async () => {
  const a = new Fake(); a.get = async () => { await sleep(20); return false; };
  const s = setup(() => a);
  try { const read = s.client.read(); await assert.rejects(s.client.write(true)); await read; assert.deepEqual(a.writes,[]); }
  finally { s.client.stop(); }
});
test('push updates and disconnect fault are forwarded; stale events ignored', async () => {
  const a=new Fake(), b=new Fake(); let n=0; const s=setup(() => ++n===1?a:b);
  try {
    await s.client.read(); a.emit('data',{dps:{20:true}}); assert.equal(s.states.at(-1),true);
    a.emit('error',Error('private detail')); assert.ok(s.faults()>0);
    await s.client.read(); a.emit('data',{dps:{20:true}}); assert.equal(s.states.at(-1),false);
  } finally { s.client.stop(); }
});
test('background connection retries automatically after a failure', async () => {
  const a=new Fake(); a.connect=async()=>{throw Error('offline');};
  const b=new Fake(); let n=0; const s=setup(()=> ++n===1?a:b);
  s.client.start();
  try { await sleep(1150); assert.equal(n,2); assert.equal(s.states.at(-1),false); }
  finally { s.client.stop(); }
});
test('shutdown prevents new actions and suppresses late status', async () => {
  const a=new Fake(); const s=setup(()=>a); await s.client.read(); s.client.stop();
  await assert.rejects(s.client.write(true)); a.emit('data',{dps:{20:true}}); assert.equal(s.states.at(-1),false);
});
