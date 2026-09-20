# Install Homebridge Holman Local 1.0.1

Use the **`.tgz` plugin archive** for installation. The source ZIP is for reviewing, modifying or hosting the project. Do not extract the `.tgz` before installing it.

Have your own controller's device ID, reserved IPv4 address and 16-character local key ready. This package contains none of your credentials. It supports the Holman CLXW60 using Tuya 3.3 and Boolean DPS 20.

## Unraid with the official Homebridge Docker image

These steps match the setup on which the original version was reported working: `homebridge/homebridge:ubuntu` with a persistent folder mapped to `/homebridge`.

1. Download `homebridge-holman-local-1.0.1.tgz`.
2. In **Unraid → Docker → Homebridge icon → Edit**, locate the host folder mapped to container path `/homebridge`. A common example is `/mnt/user/appdata/homebridge`; use your actual mapping.
3. Copy the `.tgz` into that host folder using your normal file-transfer method. If `appdata` is already available to you as a network share, open it and copy the file into its `homebridge` folder. If not, use an existing server file manager or SSH/SFTP access rather than changing share permissions unnecessarily.
4. In **Unraid → Docker → Homebridge icon → Console**, run these commands one at a time:

   ```sh
   cd /homebridge
   ls -l homebridge-holman-local-1.0.1.tgz
   npm install --save ./homebridge-holman-local-1.0.1.tgz
   ```

   If `ls` cannot find the archive, correct the transfer path first. If npm reports an error, resolve it before proceeding. Do not use `-g` or `sudo` for this official Docker installation.
5. Keep the archive in `/homebridge`: the saved local-file dependency may be needed when rebuilding dependencies. This folder must remain mapped to persistent storage.
6. Restart the Homebridge container from Unraid.
7. Open Homebridge's web interface. Under **Plugins**, find **Homebridge Holman Local** and open **Settings**. Enter your name (for example, Garden Lights), device ID, reserved IPv4 address and local key.
8. Save and restart Homebridge again.
9. If the Homebridge bridge is already paired, find **Garden Lights** in Apple Home. It is an on/off Switch. If you have enabled a child bridge, pair that bridge using its QR code.
10. Test ON and OFF and confirm the actual lights follow. Close old TinyTuya/Python scripts or competing local clients first.

The connection log should say:

```text
Connected to Holman controller over the local LAN.
```

## Other Docker hosts

Use the same installation commands **inside the official Homebridge container**, with the archive copied to the host folder mapped to `/homebridge`. Other Docker images may use a different plugin directory; follow that image's documentation. Do not run the installation in your Docker host's unrelated Node environment.

## Other Homebridge installations

Open the terminal for the Node environment that runs Homebridge and copy the archive to that machine.

For a service-managed installation that stores plugins locally, use its actual plugin directory. For example, if your setup uses `/var/lib/homebridge`:

```sh
cd /var/lib/homebridge
npm install --save /absolute/path/homebridge-holman-local-1.0.1.tgz
```

Keep a locally referenced archive at a stable location. For an installation that actually uses global npm plugins:

```sh
npm install -g /absolute/path/homebridge-holman-local-1.0.1.tgz
```

Use elevated permissions only if your installation normally requires them. The global command is not the official Docker procedure. Restart, configure the accessory through the plugin Settings form and restart again as above.

## Manual configuration alternative

Add the object from `config.example.json` to your existing `accessories` array and substitute your own values. Do not overwrite your complete configuration or duplicate an accessory already created through the settings form. Enter the local key privately in Homebridge, never in a public issue or community post.

## Upgrade from the original 1.0.0 build

Version 1.0.1 removes personal defaults. Confirm that `deviceId` and `ip` are explicitly saved in your configuration before upgrading. Install the new archive with the same local/global method as the existing installation and restart. The alias remains `HolmanLocal` and the accessory remains a Switch. Keep its name/configuration consistent.

The original 1.0.0 installation was physically confirmed; this community packaging update has automated validation but not a separate physical retest report.

## Optional recovery check

After ON/OFF works, temporarily remove the controller's power and request a state change. Homebridge should report a communication failure. Restore power and allow up to about a minute plus connection time for automatic recovery. Confirm physical state and then test another command. Failed commands should not replay on reconnection.

## Removing the plugin

Remove its accessory configuration through Homebridge, then uninstall the plugin using the Homebridge Plugins page and restart. This does not unpair/reset the Holman controller itself.

## References

- [Official Homebridge Docker image](https://github.com/homebridge/docker-homebridge)
- [Homebridge on Unraid](https://github.com/homebridge/docker-homebridge/wiki/Homebridge-on-Unraid)
- [Unraid container management](https://docs.unraid.net/unraid-os/using-unraid-to/run-docker-containers/managing-and-customizing-containers/)
