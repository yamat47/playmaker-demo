# Playmaker demo

The public demo of [`@yamat47/playmaker`](https://github.com/yamat47/playmaker), a TypeScript library for
creating and displaying American football play diagrams. The page is published at
https://playmaker-demo.yamat47.me/.

Open a play from the left rail, edit it on the field, and export it as a PNG. Your edits are kept in the
browser's local storage. The page is for desktop browsers with a mouse.

## Development

Everything runs in Docker; only Docker and `make` are needed on the host.

```sh
make setup   # build the image and install the dependencies
make up      # dev server at http://localhost:5174 (make down stops it)
make check   # typecheck, lint, and build, the same as CI
make help    # list the targets
```

`main` is built and published to GitHub Pages by `.github/workflows/deploy.yml`. The library is consumed
from npm; Dependabot opens a pull request for each of its releases.

The actions and the agent skills under `.claude/skills/` come from
[yamat47/github-toolkit](https://github.com/yamat47/github-toolkit).

## License

MIT
