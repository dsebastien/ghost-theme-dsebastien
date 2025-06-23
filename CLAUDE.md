# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom Ghost theme for dsebastien.net, built with TailwindCSS (v4+), Handlebars templates, and Gulp. The theme focuses on knowledge management content with comprehensive customization options.

## Development Commands

```bash
# Install dependencies
yarn install

# Development with live reload (TailwindCSS + Gulp)
yarn dev

# Start Ghost locally with theme
yarn serve

# Build and package theme for Ghost upload
yarn zip

# Test theme with Ghost's validation tool
yarn test

# Run tests in CI mode (strict validation)
yarn test:ci
```

## Architecture

### Template System
- **Base template**: `src/default.hbs` - Master layout with SEO, analytics, and meta configuration
- **Page types**: `index.hbs` (homepage), `post.hbs`, `page.hbs`, `home.hbs` (custom landing)
- **Components**: Located in `src/partials/components/` (navigation, footer, sidebar, post-list)
- **Icons**: SVG partials in `src/partials/icons/` - use `{{> "icons/name"}}`
- **Typography**: Font loading system in `src/partials/typography/`

### Styling
- **TailwindCSS v4.0 beta**: Main styling framework with custom configuration
- **CSS Variables**: Theming system in `src/assets/css/screen.css`
- **Fonts**: Inter (sans), EB Garamond (serif), JetBrains Mono (mono)
- **Build**: TailwindCSS CLI compiles to `src/assets/built/screen.css`

### JavaScript
- **Entry point**: `src/assets/js/main.js` coordinates all scripts
- **Features**: Dropdown navigation, infinite scroll pagination, PhotoSwipe lightbox
- **Libraries**: PhotoSwipe, Reframe.js, ImagesLoaded

### Configuration
- **Theme settings**: Defined in `src/package.json` config section
- **Routing**: `configuration/routes.yaml` for custom page routing
- **Redirects**: `configuration/redirects.yaml` for URL redirects

## Build Process

1. **Development**: `yarn dev` runs TailwindCSS watch + Gulp live reload
2. **Production**: `yarn zip` builds minified CSS + creates distribution package
3. **Testing**: `yarn test` validates theme against Ghost requirements

## Key Customizations

- **Member system**: Integrated Ghost membership with conditional content
- **Analytics**: Plausible integration with custom event tracking
- **SEO**: Comprehensive meta tags, structured data, Open Graph
- **Monetization**: EthicalAds integration
- **Community**: Circle.so widget integration

## File Structure

- `src/` - All theme source files
- `src/assets/built/` - Generated CSS/JS (git ignored)
- `dist/` - Theme packages for Ghost upload
- `configuration/` - Ghost routing and redirect rules

## Important Notes

- Two package.json files: root (dev dependencies) and src/ (Ghost theme config)
- TailwindCSS v4+ requires specific CLI usage patterns
- Ghost theme validation is strict - use `yarn test` before deployment
- Docker Compose available for local Ghost development
