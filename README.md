# kyte for GitHub Copilot

**kyte** is the company OS by [Pirol Labs](https://pirol.ai): customers, contacts, deals, projects,
hours, invoices, goals, people and the company's documents, in one workspace. This repository is a
Copilot marketplace with one plugin in it, which serves that workspace to Copilot — ask which
projects still have unbilled hours, book three hours on an implementation, look up who is out next
week.

Copilot works **as you**: it sees exactly what your role in kyte may see and changes only what your
role may change.

## What you need

The **kyte command line**, installed and signed in once:

1. Install it — macOS and Linux: `curl -fsSL https://updates.pirol.ai/cli/install.sh | sh`
2. Sign in for this plugin's own folder: `kyte login --db ~/.kyte/copilot`

The folder is this connection's own copy of the workspace, kept apart from any kyte session you
run in a terminal, so the two never compete for one database.

## Install

```
copilot plugin marketplace add Pirol-ai/kyte-copilot
copilot plugin install kyte@kyte-copilot
```

Then start a new Copilot session: the server is started at session start, so a running session
does not pick it up. `copilot mcp list` says whether it came up.

## Use it

Ask in plain words: *"Which projects for Meyer GmbH still have unbilled hours?"*, *"Book three
hours on the Northwind implementation for today"*, *"Who is out next week?"*. Copilot looks things
up with the kyte tools before it answers and says afterwards what it changed.

## Settings

Two variables, for the cases where the defaults do not fit. Set them where your shell sets
variables, or under `env` in `~/.copilot/mcp-config.json`.

- `KYTE_PROGRAM` — the kyte program, if it is installed somewhere the installer does not put it.
  The installer's own place is `~/.local/bin/kyte`.
- `KYTE_COPILOT_DB` — another data folder than `~/.kyte/copilot`.

## Where it works

macOS and Linux. The server is started through `/bin/sh`, because the command line is handed to
the program without a shell and `~` would arrive as a folder literally named `~`. On Windows, add
the server by hand in `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "kyte": {
      "type": "local",
      "command": "%LOCALAPPDATA%\\Programs\\kyte\\kyte.exe",
      "args": ["mcp", "--db", "C:\\Users\\<you>\\.kyte\\copilot"],
      "tools": ["*"]
    }
  }
}
```

## What it runs, sends and stores

- **Runs:** the `kyte` program on your own computer, as `kyte mcp`, in its own data folder.
- **Sends:** what Copilot reads through these tools goes to Copilot's model, as with any tool you
  use there. kyte itself keeps your workspace in step with **your company's kyte team server**, run
  by your company itself or by Pirol on its behalf in German data centres. This plugin sends
  nothing anywhere else.
- **Stores:** an encrypted local copy of your workspace in the data folder. Every change Copilot
  makes is recorded in kyte as made by an agent on your behalf.
- **Never:** builds apps or extensions, runs commands, or reads your files — only the data tools of
  your kyte workspace exist for it.

## Checking it

`sh check.sh` walks the whole path in a throwaway `HOME`, so neither your Copilot nor your
workspace is touched: it adds the marketplace, installs the plugin, looks at the server Copilot
registered, and talks to that server. It needs `copilot`, `node` and `kyte` on the machine.
`node --test tests/*.test.mjs` checks the manifests alone and runs on every pull request.

## Support

Questions and problems:
[github.com/Pirol-ai/kyte-copilot/issues](https://github.com/Pirol-ai/kyte-copilot/issues).
Documentation: [kyte.pirol.ai/docs/en/mcp/](https://kyte.pirol.ai/docs/en/mcp/) ·
Privacy: [pirol.ai/privacy](https://pirol.ai/privacy) · Terms: [pirol.ai/terms](https://pirol.ai/terms)

## License

MIT — see [LICENSE](LICENSE). The licence covers this plugin; the kyte program it starts is
licensed separately.
