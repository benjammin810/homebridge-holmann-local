# homebridge-holmann-local

Local Homebridge/Apple Home on/off control for Holmann CLXW60 garden lights through Homebridge. No Tuya cloud dependency during normal operation! After years of relying on Tuya Cloud to manage my at-home Holmann garden lights, I've created this via Codex to bring control back to the local network. 

This will hopefully allow those running Homebridge, and Holmann garden lights with the Warm White controller (commonly available at Bunnings across New Zealand and Australia) to bring control to Apple Home. This is my first attempt at creating a Homebridge plugin, using Codex, and anything like this really - so feedback is very welcome.

Of note - I have only really tested this as a migration path from the homebridge-tuya plugin, and associated developer account setup. Plan is to continue to work on an alternative to bypass this all together...

## Plugin overview

Control a **Holman CLXW60 Warm White Wi-Fi Garden Light Controller** from Apple Home using Homebridge and your local network.

The plugin exposes a simple **on/off switch**, communicating directly with the controller over Tuya protocol 3.3 using Boolean DPS 20. Normal control requires no Tuya cloud connection or IoT Core subscription.

```text
Apple Home → Homebridge → local network → Holman CLXW60
```

## Features

- On/off control from Apple Home, Siri, scenes and HomeKit automations.
- Direct local communication with the controller over TCP port 6668.
- Automatic reconnection with backoff, periodic state checks and device update handling.
- Power readback before reporting a successful command.
- HomeKit communication errors when the controller cannot be reached or the change cannot be confirmed.
- Homebridge settings form with a masked local-key field.
- No analytics, cloud account configuration or embedded credentials.

**On/off only:** brightness, colours, scenes on the controller, irrigation and other Holman models are not implemented. The accessory appears as a Switch, not a dimmable Lightbulb.

## Compatibility and test status

| Item | Status |
| --- | --- |
| Holman CLXW60 Warm White Wi-Fi controller | Successful physical operation reported by the original user with version 1.0.0 |
| Homebridge in Docker on Unraid | Successful installation and operation reported with `homebridge/homebridge:ubuntu` |
| Community version 1.0.1 | Removes personal defaults; same power-control implementation; automated tests rerun, separate physical retest not yet reported |
| Homebridge 1.11.4 | Automated registration test passed |
| Homebridge 2.x | Allowed by package metadata; not separately validated |
| Other Holman models or Tuya protocol versions | Not tested or supported by this release |

Requires Node.js 20 or newer **and a Node version supported by your Homebridge installation**, plus Homebridge 1.8+ or 2.x. Exact software and controller firmware versions from the successful physical installation were not recorded. This is an early community release, not a Homebridge-verified plugin or an official Holman integration.

## Prerequisites — read before installing

**This is a manually configured local-control plugin. It does not pair your lights, sign into your app, retrieve keys or offer a built-in QR setup flow.** Pairing in Holman/Tuya alone is not sufficient.

You need:

1. A **Holman CLXW60 Warm White Wi-Fi controller**, already paired and working in its supported phone app, using the Tuya 3.3 / DPS 20 mapping covered by this release.
2. **Homebridge 1.8+ or 2.x**, running with Node.js 20+ and a Node version supported by that Homebridge release. See the testing limits above.
3. The controller's own **device ID and current 16-byte local key**.
4. Its **reserved local IPv4 address**, reachable from Homebridge over TCP 6668.
5. An Apple Home setup with Homebridge paired (or ready to pair), and access to install a local plugin archive in Homebridge's environment.

No prior Tuya Homebridge plugin is required. The Homebridge plugin itself needs no Tuya developer account, API ID or API Secret. **Obtaining the local key is a separate prerequisite:**

| Credential route | Developer account? | Status |
| --- | --- | --- |
| Reuse your existing valid device ID/key | No | Supported by the current plugin |
| Separate Smart Life/Tuya QR helper | No, according to that tool's documentation | Optional; not yet tested here with CLXW60 |
| TinyTuya developer-cloud wizard | Yes | Documented upstream route requiring appropriate service access |

Both retrieval routes can contact Tuya during setup. This is not a promise of cloud-free onboarding or guaranteed developer-account-free setup for every owner. Holman-app-only retrieval is unconfirmed. See [LOCAL-KEY.md](LOCAL-KEY.md) before resetting or changing app pairing.

## Set up from scratch

Follow **[INSTALL.md](INSTALL.md)** in order:

1. Confirm the controller works in its supported app and that you have Homebridge available.
2. Reserve its local IP in your router.
3. Obtain your device ID and local key using [LOCAL-KEY.md](LOCAL-KEY.md).
4. Install the release archive in the correct Homebridge environment.
5. Enter the three device values, save and restart.
6. Pair Homebridge with Apple Home if needed, then test physical ON and OFF.

Download `homebridge-holman-local-1.0.1.tgz` from [GitHub Releases](https://github.com/benjammin810/homebridge-holmann-local/releases) once the release is published. This package has not been published to npm as part of this work; do not assume Homebridge's plugin search can find it. Built JavaScript is included, so Python/TypeScript are unnecessary for plugin installation. A separate key-retrieval tool may have its own requirements. Installation downloads runtime dependencies; normal plugin control then uses the LAN.

## Configuration

Use the plugin's Settings form, or add this object to the existing `accessories` array in Homebridge's configuration:

```json
{
  "accessory": "HolmanLocal",
  "name": "Garden Lights",
  "deviceId": "YOUR_DEVICE_ID",
  "ip": "192.168.1.100",
  "localKey": "REPLACE_WITH_YOUR_LOCAL_KEY"
}
```

Replace all example device values. The key placeholder is intentionally invalid. Do not replace your whole Homebridge configuration or configure the same controller twice.

The settings field masks the key visually; Homebridge still stores it in its configuration and backups. The plugin does not log credentials or raw dependency errors. Do not post configuration files, raw packets, broad Tuya debug output or backups publicly.

## Behaviour

A single local connection is maintained. State is read at startup, polled every 30 seconds and updated from device notifications. Failed connections are retried with a delay that grows from 1 to 60 seconds. Each requested operation has a six-second overall deadline.

Writes set Boolean DPS 20 and read back power. Missing/non-Boolean state or a mismatch produces a HomeKit communication error, usually shown as **No Response**. A failed acknowledgement does not prove the lights stayed unchanged; inspect actual state before retrying. Failed commands are not queued to execute after reconnection.

Operations do not overlap. A request arriving while another is in progress returns a communication error; retry shortly. The plugin does not force the lights on or off at startup. Shutdown closes its connection and cancels reconnect timers.

## Troubleshooting and reporting issues

- **No Response:** confirm power, Wi-Fi, reserved IP, device ID and local key. Test from the actual Homebridge container/network. Stop other local Tuya clients.
- **Lights switch but Home reports an error:** the firmware may not return acknowledgements/state in the expected form. Report the model and firmware, with sanitized logs.
- **Plugin absent after installation:** confirm you installed inside the correct Homebridge environment and restarted it. For the official Docker image, install locally in `/homebridge`, not globally.
- **Key stopped working after re-pairing:** pairing/resetting can change a Tuya local key. Update it privately.
- **Accessory missing from Apple Home:** confirm the bridge is paired and the accessory configuration was saved. A separately configured child bridge needs its own pairing.

Report issues through [GitHub Issues](https://github.com/benjammin810/homebridge-holmann-local/issues). Include plugin version, controller model/firmware, Homebridge and Node versions, container image, expected/actual behaviour and sanitized error messages. Remove keys and identifying configuration first.

## Development

The source ZIP includes TypeScript, compiled JavaScript, tests, build configuration and a pnpm lockfile. With Node and pnpm installed:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm pack
```

Alternatively, `npm install`, `npm test` and `npm pack` work, but npm does not use the pnpm lockfile. Do not commit or distribute installed `node_modules`, private configs or real keys.

Tests exercise power state, failures, reconnect, timeouts, stale updates, shutdown, required user-supplied settings, real Homebridge Switch registration, and encrypted Tuya 3.3 communication against a loopback simulator. Simulated transport tests do not replace physical hardware tests.

TuyAPI is pinned to 7.7.1. The transport adapter replaces its retrying send method to prevent delayed replay of expired commands, and closes sockets still connecting. Review the adapter and rerun transport tests before upgrading TuyAPI. Some firmware may trigger TuyAPI's null-valued DPS read fallback; explicit power writes are Boolean.

## Licence and acknowledgements

MIT licensed; see [LICENSE](LICENSE). Built using [Homebridge](https://github.com/homebridge/homebridge) and [TuyAPI](https://github.com/codetheweb/tuyapi). Not affiliated with or endorsed by Holman, Tuya, Apple or the Homebridge project. Third-party dependencies retain their own licences.
