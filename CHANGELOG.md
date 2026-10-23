# Changelog

Semua perubahan penting dicatat di sini. Format mengikuti Keep a Changelog;
versi mengikuti Semantic Versioning.

## [1.0.0] - 2026-10-23

### Added

- Skill `sebastian` yang menggabungkan persona SEBASTIAN dengan suppression
  doctrine dalam satu sumber (`AGENTS.md`).
- Agent primary `sebastian`, command `/sebastian`, dan `/install-sebastian`.
- Installer idempoten dengan scope global dan project, `--source`, dan
  `--keep-instructions`.
- Enforcer opsional (`--with-enforcer`): plugin 4 lapis, MCP server dengan
  7 tools, dan theme `sebas-red`.
- Command `/sebastian on` menyalakan suppression dan genius sekaligus.
- Backup config bertimestamp untuk setiap perubahan plugin, MCP, dan theme.
- Smoke test end-to-end, CI, dokumentasi, serta template issue/PR.

### Changed

- Nama skill, agent, command, state file, dan MCP tools memakai `sebastian`.
- Developer dan pemelihara: Willow.

### Removed

- Branding lama dan agent bawaan runtime upstream.
