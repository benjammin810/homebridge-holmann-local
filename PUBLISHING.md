# Publish this project as benjammin810

The prepared package points to `https://github.com/benjammin810/homebridge-holmann-local`. The public repository has been created. The prepared bundle still needs to be uploaded and a release published. The repository spelling has two n characters in holmann; the npm package name intentionally remains homebridge-holman-local.

## 1. Create the GitHub repository

Open https://github.com/new while signed in as **benjammin810**.

- Repository name: `homebridge-holmann-local`
- Description: `Local Apple Home on/off control for Holman CLXW60 garden lights through Homebridge. No Tuya cloud dependency during normal operation.`
- Visibility: **Public**
- Do not add an initial README, licence or .gitignore; the source bundle already includes them.

Click **Create repository**. Keep Issues enabled so users can report bugs.

## 2. Upload the source

1. Extract `homebridge-holman-local-1.0.1-source.zip` on your computer.
2. Open the resulting `homebridge-holman-local` folder.
3. On the empty GitHub repository page, choose **uploading an existing file**. For a repository that already has files, use **Add file → Upload files**.
4. Drag the folder's **contents** into the upload area. Do not upload the ZIP itself or nest the containing folder: `package.json`, `README.md`, `src/`, `dist/` and `test/` should appear at the repository root.
5. Include `.gitignore`. On macOS, press Command–Shift–period in Finder to show hidden files before selecting the contents. If GitHub's uploader skips it, add a file named `.gitignore` through **Add file → Create new file** and copy its contents from the bundle.
6. Commit the files with a message such as `Initial community release v1.0.1`.

The `dist` folder contains the built plugin and is intentionally included. There should be no `node_modules`, real local key, personal device ID, private configuration or original private 1.0.0 archive in the public repository.

## 3. Create the downloadable release

1. In the repository, open **Releases → Create a new release** (or **Draft a new release**).
2. Create tag **v1.0.1**, targeting the branch where you uploaded the files, usually `main`.
3. Set the title to **v1.0.1 — First community release**.
4. Copy the contents of `RELEASE-NOTES.md` into the description.
5. Attach **homebridge-holman-local-1.0.1.tgz** as a release asset. Also attach `SHA256SUMS.txt` and optionally the separately supplied source ZIP.
6. Publish the release once you are happy with the source and description.

Share the repository and Releases links from `COMMUNITY-POST.md` after the repository and release are live. The community post is a draft for you to publish; nothing has been posted on your behalf.

## 4. npm publication can come later

GitHub is enough for sharing source and downloadable releases. To make normal installation by package name possible, you will also need an npm account and permission to publish the package name. Availability of `homebridge-holman-local` on npm has not been checked or reserved.

Before publishing, check name availability, confirm metadata/links, follow npm's current authentication requirements, and review the archive with `npm publish --dry-run ./homebridge-holman-local-1.0.1.tgz`. Then, when ready, publish that exact reviewed archive with `npm publish ./homebridge-holman-local-1.0.1.tgz`. Sign in privately; never put npm tokens in source or messages.

If the name is taken, choose another name and update package metadata and Homebridge registration consistently, then rebuild and test. Do not claim the package is searchable in Homebridge until npm publication is complete and indexing is confirmed.

## Homebridge verification is separate

This release is a static accessory plugin. Homebridge's currently documented verification requirements call for a dynamic platform plugin, among other criteria. Do not add a verified badge or submit this unchanged build as meeting those requirements. Community sharing and npm publication are separate from verification. A future platform conversion needs its own implementation and migration testing.

## References

- https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
- https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/
- https://github.com/homebridge/homebridge/wiki/Verified-Plugins
