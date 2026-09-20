# Changelog

## 1.0.1 — Community release

- Removed the original installation's device ID and IP defaults from code and settings.
- Require each user to provide their own device ID, reserved IPv4 address and local key.
- Added community documentation, Docker/Unraid installation steps and sharing guidance.
- Preserved the local Tuya 3.3 / Boolean DPS 20 control path from 1.0.0.

Existing users: if device ID and IP were previously omitted from your saved configuration, enter them before upgrading. The accessory alias and switch service are unchanged.

## 1.0.0 — Initial private release

- Local on/off control for Holman CLXW60 through a HomeKit Switch.
- Reconnection, bounded requests, state readback and masked local-key configuration.
- User confirmed successful installation and operation on a physical CLXW60 using Homebridge Docker on Unraid. Exact Homebridge, Node.js and controller firmware versions were not recorded.
