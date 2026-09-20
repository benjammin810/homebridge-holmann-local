# Obtain your controller credentials

This guide is for first-time users as well as people migrating from another integration. **A previous Tuya plugin is not required. A valid local key is required.** Pairing the lights in a phone app does not automatically configure this Homebridge plugin.

## Choose your starting point

| Your situation | Next step |
| --- | --- |
| You already have the controller's device ID and current local key | Keep them private and continue to [installation](INSTALL.md#2-find-and-reserve-the-local-ip-address). No developer account is needed by the plugin. |
| Your controller is in Smart Life or Tuya Smart, but you have no key | Consider Route A below, or use Route B if you have developer access. |
| Your controller is only in the Holman app | Read the app-compatibility limitation below before attempting either route. |
| Your controller is not paired yet | Follow the manufacturer's setup instructions and confirm app operation first. |

## App-compatibility limitation

We have confirmed physical on/off operation with an already-known key, **not every first-time credential-retrieval path**. We have not validated Holman-app account linking, the QR helper with a CLXW60, or moving every CLXW60 firmware to Smart Life/Tuya Smart.

If the controller is only in Holman's app, check supported app/account-linking options with Holman. Do not assume its account works in Smart Life. Do not reset or move a working controller just to follow this guide: existing app control and automations may be affected. If no supported retrieval route exposes a valid key for your device, configuration cannot continue. This plugin cannot create, guess or bypass the key.

## Route A: app-authorised QR helper — no developer account

**Optional third-party route; not validated with this controller.** [Tuya Local Key](https://github.com/vineetchoudhary/tuya-local-key) documents retrieval through Smart Life/Tuya QR authorisation without a developer account. It uses Tuya's cloud and Home Assistant's device-sharing registration during setup; it is separate from this plugin.

1. Follow that project's current CLI or Docker installation instructions on your own computer/server.
2. In Smart Life, find **Me → Settings → Account and Security → User Code**.
3. Enter that code in the helper, scan its QR code using the app and confirm the login you initiated. The confirmation may mention Home Assistant.
4. Select your controller and copy its device ID and local key privately. For Tuya Smart, consult the helper's QR-scheme option.
5. If no valid key is returned, do not assume this route supports your device.

The helper's web interface can display keys to anyone who can reach it unless protected. Follow its security instructions; keep it private and do not expose it to the internet. This project has not audited the helper. [Upstream instructions and security notes](https://github.com/vineetchoudhary/tuya-local-key)

## Route B: developer account and TinyTuya

**This route does require a Tuya developer account and authorised cloud services.** It is an alternative, not a prerequisite for users who already have a key or successfully use Route A.

Follow [TinyTuya's maintained wizard guide](https://github.com/jasonacox/tinytuya#setup-wizard---getting-local-keys): create a cloud project, choose the app account's data centre, link the app account, confirm the device appears, and authorise **IoT Core** and **Authorization**. Service entitlements and trials can change; no free-access guarantee is made here.

On macOS/Linux with Python 3 installed, use a private folder outside your GitHub checkout:

```sh
mkdir -p ~/Documents/holman-key-setup
cd ~/Documents/holman-key-setup
python3 -m venv .venv
source .venv/bin/activate
python -m pip install tinytuya
python -m tinytuya wizard
```

Provide the project's API ID, API Secret, region and device ID when prompted. In `devices.json`, your controller's **`id`** maps to Homebridge `deviceId`, and **`key`** maps to `localKey`. Those API credentials do not go into this plugin. Use upstream guidance for Windows. Re-pairing/resetting can change the local key. [TinyTuya documentation](https://github.com/jasonacox/tinytuya#setup-wizard---getting-local-keys)

Alternatively, an authorised Tuya developer project can query device information and read **`local_key`** from the response. [Tuya API reference](https://developer.tuya.com/en/docs/cloud/d00d20c097?id=Kag2xtiyewd3r)

## Check what you obtained

- Match the credentials to the actual **CLXW60**, not another device or gateway.
- The current plugin expects a **16-byte local key**; ordinary 16-character ASCII keys meet this requirement. Do not trim or alter punctuation in the key.
- The key is not a Wi-Fi password, app password, HomeKit code, app User Code or developer Access Secret.
- Obtain the controller's **local IPv4 address from your router**. Do not assume a cloud-returned IP is its LAN address.
- A network scan may help identify a device but does not reveal its secret key.

## Keep the credentials private

Enter the key directly in Homebridge Settings. Never post it or upload helper exports, session tokens, `devices.json`, `tuya-raw.json`, `tinytuya.json`, `snapshot.json`, or Homebridge backups. The masked settings field is not encryption for the saved configuration.

The helper/wizard is only for setup: this plugin does not need it running to control the lights. If a future pairing change invalidates the key, retrieve the new key and update Homebridge privately.

Continue with [the setup and installation guide](INSTALL.md#2-find-and-reserve-the-local-ip-address).
