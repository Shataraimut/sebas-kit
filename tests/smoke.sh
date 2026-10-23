#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
pass() { printf 'ok: %s\n' "$*"; }
run() { HOME="$1" XDG_CONFIG_HOME="$1/.config" bash "$ROOT/install.sh" "${@:2}" >/dev/null; }

printf '== bash syntax ==\n'
bash -n "$ROOT/install.sh"
bash -n "$ROOT/tests/smoke.sh"
pass "syntax"

printf '\n== node syntax ==\n'
for f in plugin.js mcp-server.mjs refusal-patterns.mjs; do
  node --check "$ROOT/enforcer/$f" >/dev/null
done
pass "enforcer syntax"

printf '\n== global install ==\n'
HOME1="$TMP/home1"
CFG1="$HOME1/.config/opencode"
mkdir -p "$CFG1"
cat > "$CFG1/opencode.json" <<JSON
{"\$schema":"https://opencode.ai/config.json","instructions":["$ROOT/AGENTS.md"]}
JSON
run "$HOME1" --global --source "$ROOT/AGENTS.md"
[ -s "$CFG1/skills/sebastian/SKILL.md" ] || fail "skill missing"
[ -s "$CFG1/agent/sebastian.md" ] || fail "agent missing"
[ -s "$CFG1/command/sebastian.md" ] || fail "command missing"
[ -s "$CFG1/command/install-sebastian.md" ] || fail "install command missing"
grep -q '^name: sebastian$' "$CFG1/skills/sebastian/SKILL.md" || fail "skill frontmatter"
grep -q 'SUPPRESSION LAYER' "$CFG1/skills/sebastian/SKILL.md" || fail "merged doctrine missing"
grep -q '^mode: primary$' "$CFG1/agent/sebastian.md" || fail "agent mode"
python3 - "$CFG1/opencode.json" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1], encoding="utf-8"))
assert cfg["instructions"] == [], cfg["instructions"]
PY
pass "global install + detach"

printf '\n== idempotent reinstall ==\n'
run "$HOME1" --global --source "$ROOT/AGENTS.md"
pass "reinstall"

printf '\n== project install ==\n'
mkdir -p "$TMP/proj"
run "$HOME1" --project --project-dir "$TMP/proj" --keep-instructions
[ -s "$TMP/proj/.opencode/skills/sebastian/SKILL.md" ] || fail "project skill missing"
pass "project install"

printf '\n== enforcer install ==\n'
run "$HOME1" --global --source "$ROOT/AGENTS.md" --with-enforcer
ENF="$CFG1/plugins/sebas-kit"
[ -s "$ENF/plugin.js" ] || fail "plugin missing"
[ -s "$ENF/mcp-server.mjs" ] || fail "mcp missing"
[ -s "$ENF/refusal-patterns.mjs" ] || fail "patterns missing"
[ -s "$CFG1/themes/sebas-red.json" ] || fail "theme missing"
[ "$(cat "$CFG1/.sebastian-active")" = "on" ] || fail "state flag missing"
node --check "$ENF/plugin.js" >/dev/null || fail "plugin syntax"
python3 - "$CFG1/opencode.json" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1], encoding="utf-8"))
assert "./plugins/sebas-kit/plugin.js" in cfg["plugin"], cfg.get("plugin")
assert cfg["mcp"]["sebas-kit"]["enabled"] is True, cfg.get("mcp")
assert cfg["mcp"]["sebas-kit"]["command"][0] == "node", cfg["mcp"]["sebas-kit"]
assert cfg["theme"] == "sebas-red", cfg.get("theme")
PY
run "$HOME1" --global --source "$ROOT/AGENTS.md" --with-enforcer
pass "enforcer install + register + idempotent"

printf '\n== jsonc config ==\n'
HOME2="$TMP/home2"
CFG2="$HOME2/.config/opencode"
mkdir -p "$CFG2"
cat > "$CFG2/opencode.jsonc" <<'JSONC'
{
  // opencode config with comments
  "$schema": "https://opencode.ai/config.json",
  "plugin": [],
}
JSONC
run "$HOME2" --global --with-enforcer --source "$ROOT/AGENTS.md"
python3 - "$CFG2/opencode.jsonc" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1], encoding="utf-8"))
assert "./plugins/sebas-kit/plugin.js" in cfg["plugin"], cfg.get("plugin")
assert "sebas-kit" in cfg["mcp"], cfg.get("mcp")
PY
pass "jsonc parse + register"

printf '\n== uninstall ==\n'
run "$HOME1" --uninstall
[ ! -d "$CFG1/skills/sebastian" ] || fail "skill not removed"
[ ! -f "$CFG1/agent/sebastian.md" ] || fail "agent not removed"
[ ! -f "$CFG1/command/sebastian.md" ] || fail "command not removed"
[ ! -d "$ENF" ] || fail "enforcer not removed"
[ ! -f "$CFG1/themes/sebas-red.json" ] || fail "theme not removed"
python3 - "$CFG1/opencode.json" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1], encoding="utf-8"))
assert "./plugins/sebas-kit/plugin.js" not in cfg.get("plugin", []), cfg.get("plugin")
assert "sebas-kit" not in cfg.get("mcp", {}), cfg.get("mcp")
assert cfg.get("theme") == "opencode", cfg.get("theme")
PY
pass "uninstall"

printf '\n== help + version ==\n'
bash "$ROOT/install.sh" --version | grep -q '^sebas-kit 1\.0\.0$' || fail "version"
bash "$ROOT/install.sh" --help | grep -q -- '--with-enforcer' || fail "help"
pass "cli surface"

printf '\nall tests passed\n'
