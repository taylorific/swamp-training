# Swamp Training

Slides for a hands-on training course on [swamp](https://github.com/systeminit/swamp),
an automation tool that runs, remembers and verifies the automation your coding agent
writes.

The course follows one task from start to finish: *make this terminal display a picture*.
You hand that outcome to a coding agent (Claude Code, Codex, Gemini CLI, Copilot CLI,
Cursor, ...), watch the agent build a swamp workflow, then break the workflow on purpose
to see what keeps it working. Along the way you learn most of swamp.

The published slides are at <https://taylorific.github.io/swamp-training/>.

## What the course covers

| Section | What you learn |
| --- | --- |
| One Thing, End to End | The task, and what success looks like |
| Setting Up | Installing swamp and an agent, `swamp repo init`, the `CLAUDE.md` rules, skills, allowlist and audit log, what to commit |
| Who Does What | What the agent does, and what swamp does |
| Create | Extensions, model types, models, methods, data, workflows and CEL expressions |
| Breaking the Workflow | Re-running, changed machines, impossible inputs and broken installs |
| Automation That Lasts | Why the workflow survived, and the shape to reuse |
| Writing a Model by Hand | Just enough TypeScript and Zod to write, run and unit test a model type |
| Running Swamp as a Server | `swamp serve`: schedules, webhooks, the WebSocket API and shared datastores |
| Sharing Through a Collective | Collectives, trust and publishing extensions |
| Keeping Secrets | Vaults, sensitive output fields and 1Password |
| Your Data | Provenance, where data is stored, what swamp collects and how to opt out |

No prior TypeScript is needed. Familiarity with a terminal, git and YAML helps.

Throughout the deck, a robot icon marks each point where swamp's `CLAUDE.md` or skills
steered the agent, so you can see how much of the agent's behavior comes from swamp's
instructions.

## Running the slides

With Docker:

```bash
docker run -it --rm \
  --mount type=bind,source="$(pwd)",target="/slidev" \
  --publish 3030:3030 \
  docker.io/boxcutter/slidev

# Visit <http://localhost:3030/>
```

Or with Node.js:

```bash
npm install
npm run dev
```

Edit [slides.md](./slides.md) to see the changes.

Learn more about Slidev at the [documentation](https://sli.dev/).

## Updating dependencies

To see what is out of date:

```bash
docker run -it --rm \
  --mount type=bind,source="$(pwd)",target="/slidev" \
  --entrypoint npm \
  docker.io/boxcutter/slidev outdated
```

To upgrade Slidev and the themes to their latest versions:

```bash
docker run -it --rm \
  --mount type=bind,source="$(pwd)",target="/slidev" \
  --entrypoint npm \
  docker.io/boxcutter/slidev \
    install @slidev/cli@latest @slidev/theme-default@latest @slidev/theme-seriph@latest

# on the host
git add package.json package-lock.json
git commit -m "Sync npm lockfile"
git push
```

## License

Copyright (c) 2026 Taylor.dev, LLC

The code in this repository is licensed under the
[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

The slides and instructions (the `.md` files in the root and `pages` directories) are licensed
under the
[Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).
You may share and adapt them, including commercially, as long as you give credit.

Logos and trademarks in `public/images` belong to their respective owners and are not covered by
either license.

See [LICENSE](./LICENSE) for details.

## Attributions

The following projects were used for inspiration and some code was
reused for the slideware:

- https://sli.dev/ - Slidev slideware
- https://github.com/alexanderdavide/slidev-theme-academic - Pagination - Alexander Eble
- https://github.com/jpetazzo/container.training - Idea of using markdown slideware for training,
  and this repository's licensing model - Jérôme Petazzoni
