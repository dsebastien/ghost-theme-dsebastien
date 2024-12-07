# dSebastien.net Ghost Theme

The Ghost theme used for https://dsebastien.net.


## Development
The package.json file in the `src` directory is only for Ghost. Project dependencies and scripts should be defined in the root `package.json` file.

```bash
# install dependencies
yarn install

# run development server
yarn dev
```

Now you can edit `/assets/css/` files, which will be compiled to `/assets/built/` automatically.

The `zip` Gulp task packages the theme files into `dist/<theme-name>.zip`, which you can then upload to your site.

```bash
# create .zip file
yarn zip
```

Use `docker-composer up -d' to start Ghost locally with the theme.

Use `docker-compose down` to stop Ghost.


## SVG Icons

Source uses inline SVG icons, included via Handlebars partials. You can find all icons inside `/partials/icons`. To use an icon just include the name of the relevant file, eg. To include the SVG icon in `/partials/icons/rss.hbs` - use `{{> "icons/rss"}}`.

You can add your own SVG icons in the same manner.
