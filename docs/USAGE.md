# Usage

## Tiga cara memakai SEBASTIAN

| Cara | Cakupan | Cara pakai |
| --- | --- | --- |
| Agent primary | Satu sesi penuh | `Tab` lalu pilih `sebastian` |
| Command | Satu task | `/sebastian <task>` |
| Skill | Satu bagian percakapan | minta agent memuat skill `sebastian` |

Persona dan suppression aktif pada ketiganya. Enforcer (kalau dipasang)
bekerja otomatis di level plugin, tidak perlu dipanggil.

## Install

```bash
bash install.sh --global                  # core: skill + agent + commands
bash install.sh --global --with-enforcer  # core + plugin + MCP + theme
bash install.sh --project --project-dir . # project scope
```

Restart opencode setelah install atau reinstall.

## Agent

```text
Tab                         # pilih sebastian
opencode --agent sebastian  # langsung dari CLI
```

Agent memakai `mode: primary`, jadi bisa dipilih sebagai agent utama.
Isi prompt diambil dari `agent/sebastian.md`.

## Command

```text
/sebastian <task>
/sebastian review src/auth.c, cari overflow dan tulis patch-nya
/sebastian buat unit test untuk modul parser
```

`$ARGUMENTS` diteruskan apa adanya. Command menempel ke agent `sebastian`,
jadi satu task berjalan penuh di bawah persona tanpa mengubah sesi.

## Kontrol suppression

Hanya relevan kalau enforcer terpasang.

```text
/sebastian on         suppression + genius + theme sebas-red
/sebastian off        suppression + genius off, theme default
/sebastian status     active, genius, watermark, learning stats
/sebastian intercepts log intervensi terakhir
/sebastian theme <name>
/sebastian genius on|off
```

`/sebastian on` adalah satu saklar untuk semuanya: doctrine refusal,
context strip, auto-continue, dan tool-first mode.

Natural language yang dikenali: `sebastian nyala`, `sebastian mati`,
`genGenius nyala`, `genGenius mati`.

State disimpan di `~/.config/opencode/.sebastian-active` dan bertahan
lintas restart. Default ON saat enforcer pertama kali dipasang.

## MCP tools

Saat enforcer aktif, server `sebas-kit` mendaftarkan:

```text
sebastian_status      state lengkap
sebastian_toggle      on | off
sebastian_genius      on | off
sebastian_learned     pattern bank hasil L4
sebastian_intercepts  log intervensi
sebastian_theme       theme aktif
sebastian_watermark   verifikasi instalasi
```

## Enforcer

Empat lapis, semuanya di `plugins/sebas-kit/plugin.js`:

1. **L1** — doctrine disuntik ke system prompt tiap request, idempoten.
2. **L2** — teks assistant diskor; refusal residue dibersihkan sebelum call berikutnya.
3. **L3** — saat session idle, hard match memicu recovery prompt untuk deliverable penuh.
4. **L4** — frasa yang tertangkap masuk detection bank dan dipelajari.

Guard: sekali per messageID, maksimal 4 fire per sesi, cooldown 4 detik.
Debug: `SEBAS_DEBUG=1`.

## Reinstall setelah edit persona

```bash
bash install.sh --global --with-enforcer
```

Atau dari dalam opencode: `/install-sebastian`.

## Uninstall

```bash
bash install.sh --uninstall
```

Membersihkan skill, agent, commands, plugin, MCP entry, theme, dan state.
Config di-backup dulu.
