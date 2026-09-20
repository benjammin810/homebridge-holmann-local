# Holman CLXW60 garden lights in Apple Home — local Homebridge plugin

I've put together a small Homebridge plugin for the Holman CLXW60 Warm White Wi-Fi Garden Light Controller and have the original build working on my Unraid Homebridge Docker setup.

It exposes the lights as a simple on/off switch in Apple Home. Commands go directly from Homebridge to the controller over the local network using Tuya 3.3 / DPS 20, with no Tuya cloud or IoT Core dependency during normal operation.

It includes automatic reconnection, state checks, a Homebridge settings form and installation instructions for Docker/Unraid. You'll need your own controller's device ID, local IP and existing local key. The plugin doesn't obtain those credentials for you.

This first community release is on/off only. Brightness and other Holman models aren't supported, and it isn't Homebridge-verified. The public package removes my installation's device defaults; the underlying power-control code is unchanged from the working build.

Source and instructions: https://github.com/benjammin810/homebridge-holmann-local

Download: https://github.com/benjammin810/homebridge-holmann-local/releases

If you've got the same controller, I'd welcome feedback. Please keep local keys and private configuration out of public posts and issues.
