const { test } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { MessageParser: Parser } = require('tuyapi/lib/message-parser');
const { LocalTransport } = require('../dist/transport');
const { PowerClient } = require('../dist/client');
// A dummy test-only key, not a real device credential.
const key = '0123456789abcdef';
test('real Tuya 3.3 encrypted TCP round-trip for on/off and state', async () => {
  const parser = new Parser({key,version:'3.3'});
  let power=false; const writes=[], sockets=new Set();
  const server=net.createServer(socket=>{
    sockets.add(socket); socket.on('close',()=>sockets.delete(socket));
    let buffered=Buffer.alloc(0);
    socket.on('data',data=>{
      buffered=Buffer.concat([buffered,data]);
      while (buffered.length>=16) {
        const length=buffered.readUInt32BE(12)+16;
        if (buffered.length<length) break;
        const bytes=buffered.subarray(0,length); buffered=buffered.subarray(length);
        for (const packet of parser.parse(bytes)) {
          if(packet.commandByte===7) { writes.push(packet.payload.dps); power=packet.payload.dps['20']; }
          socket.write(parser.encode({data:{dps:{20:power}},commandByte:packet.commandByte===7?8:packet.commandByte,sequenceN:packet.sequenceN}));
        }
      }
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const c=new PowerClient(()=>new LocalTransport({id:'test-device',key,ip:'127.0.0.1',port:server.address().port,version:'3.3',issueGetOnConnect:false}),()=>{},()=>{},()=>{});
  try {
    assert.equal(await c.read(),false);
    assert.equal(await c.write(true),true);
    assert.equal(await c.write(false),false);
    assert.deepEqual(writes,[{'20':true},{'20':false}]);
  } finally {
    c.stop(); for(const socket of sockets) socket.destroy(); await new Promise(resolve=>server.close(resolve));
  }
});
test('retired transport cannot reconnect or resend', async () => {
  const d=new LocalTransport({id:'test-device',key,ip:'127.0.0.1',version:'3.3'});
  d.on('error',()=>{}); d.disconnect();
  await assert.rejects(d.connect(),/retired/);
  await assert.rejects(d._send(Buffer.from('test')),/retired/);
});
