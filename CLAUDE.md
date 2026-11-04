# playmaker-demo

The public demo of [`@yamat47/playmaker`](https://github.com/yamat47/playmaker), an American football play
diagram editor, published to GitHub Pages at https://playmaker-demo.yamat47.me/. The audience is coaches:
the editor is the whole page, and developer information stays in the footer.

## Where the conventions live

- Follow the `writing-conventions` skill for comments, commits, and PRs, and the `typescript-idioms` skill for TypeScript.
  Everything written around code (documents, comments, commits, PRs) is in English
- Check Dependabot PRs with the `review-dependency-bump` skill, and skill update PRs with the `review-skill-update` skill
- In `.claude/skills/`, use the imported version as is for any skill whose frontmatter `metadata.github-repo` is github-toolkit.
  Do not edit it directly. Rules specific to this repository live in this file; when they conflict with a skill, this file wins
- The library's public API, data shape, and theme variables are documented in the library repository (`README.md` and
  `docs/design.md` of yamat47/playmaker). This site only consumes the npm package; do not work around the library here,
  change the library instead

## Layout

| Path | Contents |
|---|---|
| `index.html`, `src/` | The site. `main.ts` wires the page, `i18n.ts` holds the page strings in English and Japanese, `showcase.ts` holds the showcase plays as `PlayData`, `presets.ts` adapts the library presets to the left rail |
| `public/` | Files copied to the site root as is: `CNAME`, favicon, OG image |
| `docker/` | Development image and compose |
| `Makefile` | Entry point for development commands |

## Always run commands through make

Node and pnpm are not installed on the host. The toolchain exists only inside the Docker container, and the `Makefile`
invokes it with `docker compose -f docker/compose.yaml run`.
**Do not run `pnpm` `npm` `npx` `node` `tsc` `biome` `vite` directly on the host** (`permissions.deny` in `.claude/settings.json` rejects them).

| Goal | Command |
|---|---|
| Run every check CI runs | `make check` |
| Type check / lint / auto-fix | `make typecheck` / `make lint` / `make fix` |
| Build the site | `make build` (`dist/`) |
| Dev server | `make up` (http://localhost:5174) / `make logs` / `make down` |
| Add or update dependencies | `make pnpm ARGS="add -D <pkg>"` (the lockfile is also updated on the host) |
| First run, or after changing the Dockerfile | `make setup` |

- The dev server listens on 5174 on the host (5173 inside the container), so it does not collide with the library's playground
- `?lang=ja` opens the page in Japanese; the language button does the same and remembers the choice
- The library will stop shipping formation and play presets at some point. `src/presets.ts` is the only file that reads
  `FORMATION_PRESETS` and `PLAY_PRESETS`, so the data can move into this repository without touching the rest
- Dependabot opens a PR for every release of `@yamat47/playmaker` without the cooldown, so the demo follows the library
- The site has no test runner. It is verified by typecheck, lint, build, and a look at the page (`make up`); the library
  validates every diagram it receives, and the page modules are thin adapters around it
