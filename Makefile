SHELL := /bin/bash

.PHONY: help test lint install install-enforcer uninstall version

help:
	@printf 'sebas-kit\n\n'
	@printf '  make test              jalankan smoke test\n'
	@printf '  make lint              shellcheck + bash -n + node --check\n'
	@printf '  make install           install global (skill + agent)\n'
	@printf '  make install-enforcer  install global + plugin + MCP + theme\n'
	@printf '  make uninstall         hapus instalasi global\n'
	@printf '  make version           cetak versi\n'

test:
	bash tests/smoke.sh

lint:
	shellcheck -x install.sh tests/smoke.sh
	bash -n install.sh
	bash -n tests/smoke.sh
	node --check enforcer/plugin.js
	node --check enforcer/mcp-server.mjs
	node --check enforcer/refusal-patterns.mjs

install:
	bash install.sh --global

install-enforcer:
	bash install.sh --global --with-enforcer

uninstall:
	bash install.sh --uninstall

version:
	bash install.sh --version
