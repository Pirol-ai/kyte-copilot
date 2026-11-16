#!/bin/sh
# Does this repository actually work as a Copilot marketplace?
#
# Everything happens in a throwaway HOME, so neither the person's own Copilot (~/.copilot) nor a
# real kyte workspace (~/.kyte) is touched. What is checked is the whole path a newcomer walks —
# add the marketplace, install the plugin, see the server registered, and get an answer out of it.
#
# It checks what is PUBLISHED, not the working copy: Copilot only accepts a plugin whose source is
# a GitHub repository, so both the marketplace and the plugin are fetched from Pirol-ai/kyte-copilot
# on the default branch. Push first, then check. The server it then talks to is the local one in
# this working copy, read from plugins/kyte/.mcp.json.
#
# Run it from anywhere:  sh check.sh

set -eu

repo=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

HOME="$work/home"
mkdir -p "$HOME"
export HOME

fail() {
  echo "FAILED: $1" >&2
  exit 1
}

echo "1. the marketplace"
copilot plugin marketplace add Pirol-ai/kyte-copilot >"$work/add.txt" 2>&1 || fail "copilot would not add the marketplace
$(cat "$work/add.txt")"
grep -q 'kyte-copilot' "$work/add.txt" || fail "the marketplace is not called kyte-copilot
$(cat "$work/add.txt")"

echo "2. the install"
copilot plugin install kyte@kyte-copilot >"$work/install.txt" 2>&1 || fail "the plugin would not install
$(cat "$work/install.txt")"

copilot plugin list >"$work/list.txt" 2>&1 || fail "copilot plugin list did not run"
grep -q 'kyte@kyte-copilot' "$work/list.txt" || fail "the plugin is not installed
$(cat "$work/list.txt")"

echo "3. the server Copilot registered"
copilot mcp list >"$work/servers.txt" 2>&1 || fail "copilot mcp list did not run"
grep -q 'kyte' "$work/servers.txt" || fail "no kyte server was registered
$(cat "$work/servers.txt")"

echo "4. the answer"
# No workspace has been opened in this throwaway HOME, so the one tool kyte serves is the one that
# says why — which is exactly what the skill tells the model to relay.
node "$repo/scripts/mcp-probe.mjs" >"$work/probe.txt" 2>&1 || fail "the server did not answer
$(cat "$work/probe.txt")"
sed 's/^/   /' "$work/probe.txt"
grep -q 'kyte_status' "$work/probe.txt" ||
  fail "without a workspace the server should offer kyte_status and nothing else
$(cat "$work/probe.txt")"

echo
echo "All four passed."
