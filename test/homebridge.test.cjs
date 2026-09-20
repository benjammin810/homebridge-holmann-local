const { test }=require('node:test');
const assert=require('node:assert/strict');
const { EventEmitter }=require('node:events');
const { createRequire }=require('node:module');
const hbRequire=createRequire(require.resolve('homebridge'));
const hap=hbRequire('hap-nodejs');
const register=require('../dist');
test('registers a real Homebridge Switch with On and no brightness',()=>{
  let Constructor;
  const api=new EventEmitter(); api.hap=hap;
  api.registerAccessory=(plugin,alias,ctor)=>{assert.equal(plugin,'homebridge-holman-local');assert.equal(alias,'HolmanLocal');Constructor=ctor;};
  register(api);
  const logs=[]; const log={info:message=>logs.push(message)};
  const accessory=new Constructor(log,{accessory:'HolmanLocal',name:'Garden Lights',deviceId:'test-device',ip:'127.0.0.1',localKey:'0123456789abcdef'},api);
  const services=accessory.getServices();
  const service=services.find(s=>s.UUID===hap.Service.Switch.UUID);
  assert.ok(service);
  assert.ok(service.characteristics.some(c=>c.UUID===hap.Characteristic.On.UUID));
  assert.ok(!service.characteristics.some(c=>c.UUID===hap.Characteristic.Brightness.UUID));
  assert.ok(!logs.join().includes('0123456789abcdef'));
  api.emit('shutdown');
  assert.throws(()=>new Constructor(log,{accessory:'HolmanLocal',name:'test'},api),/16-byte/);
});

test('community configuration requires user-supplied device ID and IP',()=>{
  let Constructor; const api=new EventEmitter(); api.hap=hap;
  api.registerAccessory=(_plugin,_alias,ctor)=>{Constructor=ctor;}; register(api);
  const log={info:()=>{}};
  const base={accessory:'HolmanLocal',name:'Garden Lights',localKey:'0123456789abcdef'};
  assert.throws(()=>new Constructor(log,base,api),/requires a device ID/);
  assert.throws(()=>new Constructor(log,{...base,deviceId:'test-device'},api),/requires a device ID/);
  assert.throws(()=>new Constructor(log,{...base,ip:'127.0.0.1'},api),/requires a device ID/);
});
