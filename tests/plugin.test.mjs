// The parts of this repository that a pull request can check without Copilot and without kyte.
//
// check.sh proves the real thing — marketplace, install, connection — but it needs both programs
// on the machine. These checks need neither, so they run on every pull request and catch what
// actually goes wrong in a manifest: a path that points nowhere, a server line that no longer
// starts kyte, and the data folder drifting apart between that line and the prose.

import { test } from "node:test";
import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const readJson = (...parts) => JSON.parse(read(...parts));

const PLUGIN = join("plugins", "kyte");
const DB = "$HOME/.kyte/copilot";

test("the marketplace points at a plugin that is there", () => {
  const marketplace = readJson(".github", "plugin", "marketplace.json");
  assert.strictEqual(marketplace.name, "kyte-copilot");

  const entries = marketplace.plugins ?? [];
  assert.strictEqual(entries.length, 1, "one plugin, or the readme is wrong");

  const [entry] = entries;
  assert.strictEqual(entry.name, "kyte");
  assert.strictEqual(entry.source.repo, "Pirol-ai/kyte-copilot");
  assert.ok(
    existsSync(join(root, entry.source.path, "plugin.json")),
    `${entry.source.path} holds no plugin manifest`,
  );
});

test("the plugin manifest says what the marketplace says", () => {
  const manifest = readJson(PLUGIN, "plugin.json");
  const [entry] = readJson(".github", "plugin", "marketplace.json").plugins;

  assert.strictEqual(manifest.name, "kyte");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.strictEqual(manifest.version, entry.version, "two versions that have to be one");
  assert.strictEqual(manifest.description, entry.description);

  // Copilot reads a plugin's MCP servers only from the older manifest shape. Give the manifest an
  // Agent Plugins 1.0 $schema and the server is silently dropped: the plugin installs, the skill
  // arrives, and `copilot mcp list` says "No MCP servers configured". Checked by hand against
  // 0.0.414 — see the note in README.
  assert.ok(!manifest.$schema, "a $schema makes Copilot ignore the server");
  assert.strictEqual(manifest.mcpServers, "./.mcp.json", "the manifest has to name the file");
  assert.ok(existsSync(join(root, PLUGIN, ".mcp.json")), "and the file has to be there");
});

test("the server line starts kyte, in its own data folder", () => {
  const { mcpServers } = readJson(PLUGIN, ".mcp.json");
  const names = Object.keys(mcpServers);
  assert.deepStrictEqual(names, ["kyte"], "one server, called kyte");

  const server = mcpServers.kyte;
  assert.strictEqual(server.type, "local");
  assert.strictEqual(server.command, "/bin/sh");

  const line = (server.args ?? []).join(" ");
  assert.match(line, /\bmcp\b/, "it has to start the MCP server");
  assert.match(line, /KYTE_PROGRAM/, "the program has to be nameable");
  assert.match(line, /KYTE_COPILOT_DB/, "the data folder has to be nameable");
  assert.ok(line.includes(DB), `the default folder is ${DB}`);
});

test("the skill tells the person the same folder the server uses", () => {
  const skill = read(PLUGIN, "skills", "kyte", "SKILL.md");
  assert.ok(
    skill.includes("kyte login --db ~/.kyte/copilot"),
    "the skill sends people to a folder the server does not serve",
  );
  assert.ok(skill.includes("KYTE_COPILOT_DB"), "the skill names the wrong variable");
  assert.ok(!/\bCodex\b/.test(skill), "left over from the Codex plugin this was built from");
});

test("the readme's install lines are the ones that work", () => {
  const readme = read("README.md");
  assert.ok(readme.includes("copilot plugin marketplace add Pirol-ai/kyte-copilot"));
  assert.ok(readme.includes("copilot plugin install kyte@kyte-copilot"));
});
