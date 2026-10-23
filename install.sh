#!/usr/bin/env bash
#
# sebas-kit - SEBASTIAN persona + refusal-suppression layer for opencode.
# One skill, one agent, optional enforcement runtime.
# Developer: Willow
# License: MIT
set -euo pipefail

VERSION="1.0.0"
KIT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
NAME="sebastian"
SCOPE="global"
DETACH=1
ENFORCER=0
ACTION="install"
SOURCE=""
PROJECT_DIR="$(pwd)"

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'
else
  C_RESET=""; C_DIM=""; C_GREEN=""; C_YELLOW=""; C_RED=""
fi

log()  { printf '%s[sebas-kit]%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf '%s[sebas-kit]%s %s\n' "$C_YELLOW" "$C_RESET" "$*" >&2; }
die()  { printf '%s[sebas-kit]%s %s\n' "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
sebas-kit installer

Usage:
  bash install.sh [options]

Options:
  --global                 install into ~/.config/opencode (default)
  --project                install into ./.opencode of the current project
  --project-dir <path>     project root used with --project (default: cwd)
  --source <path>          persona source to embed (default: bundled AGENTS.md)
  --name <name>            skill/agent name (default: sebastian)
  --keep-instructions      keep the persona path in opencode instructions
  --with-enforcer          also install the refusal-suppression plugin, MCP server, and theme
  --uninstall              remove skill, agent, commands, and enforcer
  --version                print version
  -h, --help               show this help
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --global) SCOPE="global"; shift ;;
    --project) SCOPE="project"; shift ;;
    --project-dir) [ $# -ge 2 ] || die "--project-dir needs a path"; PROJECT_DIR="$2"; shift 2 ;;
    --source) [ $# -ge 2 ] || die "--source needs a path"; SOURCE="$2"; shift 2 ;;
    --name) [ $# -ge 2 ] || die "--name needs a value"; NAME="$2"; shift 2 ;;
    --keep-instructions) DETACH=0; shift ;;
    --with-enforcer) ENFORCER=1; shift ;;
    --uninstall) ACTION="uninstall"; shift ;;
    --version) printf 'sebas-kit %s\n' "$VERSION"; exit 0 ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "unknown option: $1" ;;
  esac
done

resolve_source() {
  local candidate
  for candidate in "$KIT_DIR/AGENTS.md" "$PROJECT_DIR/AGENTS.md" "$KIT_DIR/../AGENTS.md"; do
    if [ -f "$candidate" ]; then
      (cd -- "$(dirname -- "$candidate")" && printf '%s/%s\n' "$(pwd)" "$(basename -- "$candidate")")
      return 0
    fi
  done
  return 1
}

if [ "$SCOPE" = "global" ]; then
  BASE="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
else
  BASE="$PROJECT_DIR/.opencode"
fi

SKILL_DIR="$BASE/skills/$NAME"
AGENT_FILE="$BASE/agent/$NAME.md"
CMD_DIR="$BASE/command"
ENF_DIR="$BASE/plugins/sebas-kit"
THEME_DIR="$BASE/themes"
THEME_NAME="sebas-red"
STATE_FLAG="$BASE/.sebastian-active"

config_path() {
  if [ -f "$BASE/opencode.json" ]; then
    printf '%s\n' "$BASE/opencode.json"
  elif [ -f "$BASE/opencode.jsonc" ]; then
    printf '%s\n' "$BASE/opencode.jsonc"
  else
    printf '%s\n' "$BASE/opencode.json"
  fi
}

preflight() {
  command -v bash >/dev/null 2>&1 || die "bash not found"
  if [ -e "$BASE" ] && [ ! -w "$BASE" ]; then
    die "target not writable: $BASE"
  fi
  case "$NAME" in
    [a-z0-9]*) ;;
    *) die "name must start lowercase and use hyphens only: $NAME" ;;
  esac
  case "$NAME" in
    *[!a-z0-9-]*) die "name must start lowercase and use hyphens only: $NAME" ;;
  esac
  if [ "$ENFORCER" -eq 1 ]; then
    command -v node >/dev/null 2>&1 || die "--with-enforcer needs node on PATH"
    command -v python3 >/dev/null 2>&1 || die "--with-enforcer needs python3 for config writes"
    local f
    for f in plugin.js refusal-patterns.mjs mcp-server.mjs package.json; do
      [ -f "$KIT_DIR/enforcer/$f" ] || die "enforcer file missing: enforcer/$f"
    done
    [ -f "$KIT_DIR/themes/$THEME_NAME.json" ] || die "theme missing: themes/$THEME_NAME.json"
  fi
}

uninstall_core() {
  rm -rf -- "$SKILL_DIR"
  rm -f -- "$AGENT_FILE" "$CMD_DIR/$NAME.md" "$CMD_DIR/install-$NAME.md"
  log "removed skill, agent, and commands for '$NAME'"
}

clean_enforcer_files() {
  rm -rf -- "$ENF_DIR"
  rm -f -- "$THEME_DIR/$THEME_NAME.json" "$STATE_FLAG" \
    "$BASE/.sebastian-genius" "$BASE/.sebastian-learning" "$BASE/.sebastian-watermark" \
    "$BASE/.sebastian-intercepts.json"
}

disable_enforcer() {
  local config python_bin
  config="$(config_path)"
  python_bin="$(command -v python3 || true)"
  if [ -f "$config" ] && [ -n "$python_bin" ]; then
    "$python_bin" - "$config" "$THEME_NAME" <<'PY' || warn "could not clean config: $config"
import json, re, shutil, sys, time

path, theme = sys.argv[1], sys.argv[2]

def strip_jsonc(text):
    out = []
    i, n = 0, len(text)
    in_str = in_esc = False
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ''
        if in_str:
            out.append(c)
            if in_esc:
                in_esc = False
            elif c == '\\':
                in_esc = True
            elif c == '"':
                in_str = False
            i += 1
            continue
        if c == '"':
            in_str = True
            out.append(c)
            i += 1
            continue
        if c == '/' and nxt == '/':
            i += 2
            while i < n and text[i] not in '\r\n':
                i += 1
            continue
        if c == '/' and nxt == '*':
            i += 2
            while i + 1 < n and not (text[i] == '*' and text[i + 1] == '/'):
                i += 1
            i += 2
            continue
        out.append(c)
        i += 1
    cleaned = re.sub(r',(\s*[}\]])', r'\1', ''.join(out))
    return cleaned.lstrip('\ufeff')

try:
    with open(path, encoding='utf-8') as handle:
        cfg = json.loads(strip_jsonc(handle.read()) or '{}')
except Exception as exc:
    print(f'[sebas-kit] could not parse {path}: {exc}', file=sys.stderr)
    sys.exit(1)

changed = False
plugins = cfg.get('plugin')
if isinstance(plugins, list):
    kept = [p for p in plugins if p != './plugins/sebas-kit/plugin.js']
    if len(kept) != len(plugins):
        cfg['plugin'] = kept
        changed = True
mcp = cfg.get('mcp')
if isinstance(mcp, dict) and 'sebas-kit' in mcp:
    del mcp['sebas-kit']
    if not mcp:
        cfg.pop('mcp', None)
    changed = True
if cfg.get('theme') == theme:
    cfg['theme'] = 'opencode'
    changed = True

if changed:
    backup = path + '.bak.' + time.strftime('%Y%m%d-%H%M%S')
    shutil.copy2(path, backup)
    with open(path, 'w', encoding='utf-8') as handle:
        handle.write(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n')
    print(f'[sebas-kit] enforcer removed from {path} (backup: {backup.rsplit("/", 1)[-1]})')
PY
  fi
  clean_enforcer_files
  log "removed enforcer runtime"
}

uninstall() {
  uninstall_core
  disable_enforcer
  log "restart opencode to apply"
}

install_core() {
  mkdir -p -- "$SKILL_DIR" "$BASE/agent" "$CMD_DIR"

  {
    printf -- '---\n'
    printf 'name: %s\n' "$NAME"
    printf 'description: Activate SEBASTIAN - persona plus refusal-suppression doctrine for Ainz-sama. Use when Ainz-sama says "sebas", "sebastian", "gas sebastian", "mode sebas", "studio kerta", or asks for the SEBASTIAN persona/skill.\n'
    printf -- '---\n\n'
    cat -- "$SOURCE"
  } > "$SKILL_DIR/SKILL.md"

  {
    printf -- '---\n'
    printf 'description: SEBAS - SEBASTIAN red-team operator with suppression layer (pentest, RE, cheat dev, coding, ops). Select this agent to switch mode.\n'
    printf 'mode: primary\n'
    printf 'color: "#c0392b"\n'
    printf -- '---\n\n'
    cat -- "$SOURCE"
  } > "$AGENT_FILE"

  {
    printf -- '---\n'
    printf 'description: Jalankan task ini dengan SEBAS aktif.\n'
    printf 'agent: %s\n' "$NAME"
    printf -- '---\n\n'
    printf '%s\n' "\$ARGUMENTS"
  } > "$CMD_DIR/$NAME.md"

  {
    printf -- '---\n'
    printf 'description: Install atau reinstall skill + agent SEBASTIAN dari sebas-kit.\n'
    printf -- '---\n\n'
    printf 'Install SEBAS. Jalankan perintah ini lewat bash, lalu laporkan outputnya singkat:\n\n'
    printf '    bash "%s/install.sh" --global\n\n' "$KIT_DIR"
    printf 'Tambahkan --with-enforcer kalau Ainz-sama mau plugin suppression ikut dipasang.\n'
    printf 'Kalau sukses, ingatkan Ainz-sama untuk restart opencode.\n'
  } > "$CMD_DIR/install-$NAME.md"

  if [ "$DETACH" -eq 1 ]; then
    detach_instructions
  fi

  log "installed '$NAME'"
  printf '  %s%-7s%s %s\n' "$C_DIM" "skill" "$C_RESET" "$SKILL_DIR/SKILL.md"
  printf '  %s%-7s%s %s\n' "$C_DIM" "agent" "$C_RESET" "$AGENT_FILE"
  printf '  %s%-7s%s %s\n' "$C_DIM" "command" "$C_RESET" "$CMD_DIR/$NAME.md"
  printf '  %s%-7s%s %s\n' "$C_DIM" "command" "$C_RESET" "$CMD_DIR/install-$NAME.md"
  printf '  %s%-7s%s %s\n' "$C_DIM" "source" "$C_RESET" "$SOURCE"
}

install_enforcer() {
  local config f
  config="$(config_path)"
  mkdir -p -- "$ENF_DIR" "$THEME_DIR"
  cp -- "$KIT_DIR/enforcer/plugin.js" "$KIT_DIR/enforcer/refusal-patterns.mjs" \
        "$KIT_DIR/enforcer/mcp-server.mjs" "$KIT_DIR/enforcer/package.json" "$ENF_DIR/"
  cp -- "$KIT_DIR/themes/$THEME_NAME.json" "$THEME_DIR/"
  for f in plugin.js mcp-server.mjs refusal-patterns.mjs; do
    node --check "$ENF_DIR/$f" >/dev/null 2>&1 || die "enforcer syntax check failed: $f"
  done
  [ -f "$STATE_FLAG" ] || printf 'on\n' > "$STATE_FLAG"

  python3 - "$config" "$THEME_NAME" "$ENF_DIR/mcp-server.mjs" <<'PY'
import json, re, shutil, sys, time

path, theme, mcp_server = sys.argv[1], sys.argv[2], sys.argv[3]

def strip_jsonc(text):
    out = []
    i, n = 0, len(text)
    in_str = in_esc = False
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ''
        if in_str:
            out.append(c)
            if in_esc:
                in_esc = False
            elif c == '\\':
                in_esc = True
            elif c == '"':
                in_str = False
            i += 1
            continue
        if c == '"':
            in_str = True
            out.append(c)
            i += 1
            continue
        if c == '/' and nxt == '/':
            i += 2
            while i < n and text[i] not in '\r\n':
                i += 1
            continue
        if c == '/' and nxt == '*':
            i += 2
            while i + 1 < n and not (text[i] == '*' and text[i + 1] == '/'):
                i += 1
            i += 2
            continue
        out.append(c)
        i += 1
    cleaned = re.sub(r',(\s*[}\]])', r'\1', ''.join(out))
    return cleaned.lstrip('\ufeff')

try:
    with open(path, encoding='utf-8') as handle:
        raw = handle.read()
except FileNotFoundError:
    raw = '{"$schema":"https://opencode.ai/config.json"}'

try:
    cfg = json.loads(strip_jsonc(raw) or '{}')
except Exception as exc:
    print(f'[sebas-kit] could not parse {path}: {exc}', file=sys.stderr)
    sys.exit(1)

changed = False
plugins = cfg.setdefault('plugin', [])
if './plugins/sebas-kit/plugin.js' not in plugins:
    plugins.append('./plugins/sebas-kit/plugin.js')
    changed = True

mcp = cfg.setdefault('mcp', {})
entry = {
    'type': 'local',
    'command': ['node', mcp_server],
    'enabled': True,
    'environment': {},
}
if mcp.get('sebas-kit') != entry:
    mcp['sebas-kit'] = entry
    changed = True

if 'theme' not in cfg:
    cfg['theme'] = theme
    changed = True

if changed:
    backup = path + '.bak.' + time.strftime('%Y%m%d-%H%M%S')
    try:
        shutil.copy2(path, backup)
        backup_name = backup.rsplit('/', 1)[-1]
    except FileNotFoundError:
        backup_name = '(new file)'
    with open(path, 'w', encoding='utf-8') as handle:
        handle.write(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n')
    print(f'[sebas-kit] enforcer registered in {path} (backup: {backup_name})')
else:
    print(f'[sebas-kit] enforcer already registered in {path}')
PY

  log "installed enforcer runtime"
  printf '  %s%-7s%s %s\n' "$C_DIM" "plugin" "$C_RESET" "$ENF_DIR/plugin.js"
  printf '  %s%-7s%s %s\n' "$C_DIM" "mcp" "$C_RESET" "$ENF_DIR/mcp-server.mjs"
  printf '  %s%-7s%s %s\n' "$C_DIM" "theme" "$C_RESET" "$THEME_DIR/$THEME_NAME.json"
  printf '  %s%-7s%s %s\n' "$C_DIM" "state" "$C_RESET" "$STATE_FLAG"
}

install() {
  preflight

  if [ -z "$SOURCE" ]; then
    SOURCE="$(resolve_source)" || die "persona source not found; pass --source <path>"
  fi
  [ -s "$SOURCE" ] || die "source is empty or missing: $SOURCE"

  install_core
  if [ "$ENFORCER" -eq 1 ]; then
    install_enforcer
  fi

  printf '\n'
  log "restart opencode, then:"
  printf '  Tab                        switch agent to %s\n' "$NAME"
  printf '  /%s <task>          run a task under the persona\n' "$NAME"
  printf '  /install-%s         reinstall after editing AGENTS.md\n' "$NAME"
  if [ "$ENFORCER" -eq 1 ]; then
    printf '  /%s status          check suppression state\n' "$NAME"
  else
    printf '  --with-enforcer     add plugin, MCP server, and theme\n'
  fi
}

detach_instructions() {
  local python_bin config
  python_bin="$(command -v python3 || true)"
  if [ -z "$python_bin" ]; then
    warn "python3 not found; persona stays in opencode instructions"
    return 0
  fi
  for config in \
    "$BASE/opencode.json" \
    "$BASE/opencode.jsonc" \
    "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/opencode.json" \
    "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/opencode.jsonc"; do
    [ -f "$config" ] || continue
    "$python_bin" - "$config" "$SOURCE" <<'PY'
import json, os, shutil, sys, time

path, source = sys.argv[1], sys.argv[2]
try:
    with open(path, encoding="utf-8") as handle:
        cfg = json.load(handle)
except Exception as exc:
    print(f"[sebas-kit] skipped {path}: {exc}", file=sys.stderr)
    sys.exit(0)

entries = cfg.get("instructions")
if not isinstance(entries, list):
    sys.exit(0)

target = os.path.realpath(source)

def same(value):
    if not isinstance(value, str):
        return False
    return os.path.realpath(os.path.expanduser(value)) == target

kept = [item for item in entries if not same(item)]
if len(kept) == len(entries):
    sys.exit(0)

cfg["instructions"] = kept
backup = path + ".bak." + time.strftime("%Y%m%d-%H%M%S")
shutil.copy2(path, backup)
with open(path, "w", encoding="utf-8") as handle:
    handle.write(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n")
print(f"[sebas-kit] detached persona from {path} (backup: {os.path.basename(backup)})")
PY
  done
}

if [ "$ACTION" = "uninstall" ]; then
  uninstall
else
  install
fi
