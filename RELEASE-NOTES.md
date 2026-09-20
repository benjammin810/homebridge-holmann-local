# v1.0.1 — First community release

Local on/off control for the Holman CLXW60 Warm White Wi-Fi Garden Light Controller through Homebridge and Apple Home.

- Simple HomeKit Switch using Tuya 3.3 and Boolean DPS 20.
- No Tuya cloud or IoT Core dependency during normal operation.
- Automatic reconnection, state checks and communication-error handling.
- Private local-key entry through the Homebridge settings form.
- Step-by-step Docker/Unraid installation instructions.

The original 1.0.0 build was reported working on a physical CLXW60 with Homebridge Docker on Unraid. This 1.0.1 community release removes personal device defaults and adds documentation; its power-control implementation is unchanged. Automated tests passed. A separate physical retest of 1.0.1 has not yet been reported.

Download **homebridge-holman-local-1.0.1.tgz** for installation and follow **INSTALL.md** in the repository. GitHub's automatically generated “Source code” downloads are for source inspection/development, not the prebuilt npm archive.

Requires your controller's existing device ID, reserved IPv4 address and local key. Enter your own values privately. Brightness and other Holman models are not supported in this release.

Not yet published to npm or verified by Homebridge. Feedback and sanitized bug reports welcome through GitHub Issues.

Upgrading from 1.0.0: ensure your device ID and IP are explicitly saved before installing, because they no longer have defaults.
