# Troubleshooting

## Agent `sebastian` tidak muncul di daftar

- Cek file agent ada: `~/.config/opencode/agent/sebastian.md` (global) atau
  `<project>/.opencode/agent/sebastian.md` (project).
- Pastikan frontmatter valid:

  ```bash
  head -5 ~/.config/opencode/agent/sebastian.md
  ```

  Harus ada `description`, `mode: primary`, dan `color`.
- Restart opencode. Config agent tidak hot-reload.

## Skill tidak terdeteksi

- Folder harus sama dengan `name` di frontmatter:
  `skills/sebastian/SKILL.md` dengan `name: sebastian`.
- Cek: `head -4 ~/.config/opencode/skills/sebastian/SKILL.md`.
- Kalau baru diedit, jalankan ulang installer lalu restart.

## Persona dobel / kepanjangan

Installer melepas path persona dari `instructions` di config (dengan backup
`.bak.<timestamp>`). Kalau masih dobel:

```bash
grep -n instructions ~/.config/opencode/opencode.json
```

Hapus entry yang menunjuk ke `AGENTS.md`, atau jalankan
`bash install.sh --global` lagi.

## Command `/sebastian` tidak ada

- File harus ada di `~/.config/opencode/command/sebastian.md`.
- Cek frontmatter: `description` dan `agent: sebastian`.
- Restart opencode.

## Enforcer tidak aktif

Gejala: tidak ada banner saat start, `/sebastian status` tidak dikenal.

1. Pastikan dipasang dengan flag:

   ```bash
   bash install.sh --global --with-enforcer
   ```

2. Cek entry config:

   ```bash
   grep -n 'sebas-kit' ~/.config/opencode/opencode.json
   ```

   Harus ada di `plugin` dan `mcp`.

3. Cek file runtime: `ls ~/.config/opencode/plugins/sebas-kit/`.

4. Cek state: `cat ~/.config/opencode/.sebastian-active` → `on`.

5. Lihat log: jalankan opencode dengan `SEBAS_DEBUG=1`.

## Banner tidak muncul

Banner ditulis ke stderr dan `/dev/tty` sekali per proses. Di lingkungan
headless tidak ada TTY, jadi hanya stderr yang terisi. Ini normal;
suppression tetap aktif.

## Refusal masih lolos

- Naikkan agresivitas: `/sebastian on` (menyalakan genius sekaligus).
- Cek intercept log: `/sebastian intercepts`.
- Hard match butuh skor ≥ 4. Kalau frasa belum dikenal, tambahkan ke
  `~/.config/opencode/.sebastian-learning` atau kirim contohnya.
- Pastikan konteks tidak dipotong oleh compaction sebelum idle.

## Theme tidak berubah

- Theme hanya di-set kalau config belum punya `theme`; kalau sudah ada,
  installer membiarkannya. Set manual: `/sebastian theme sebas-red`.
- Pastikan `~/.config/opencode/themes/sebas-red.json` ada.
- Restart opencode.

## Config rusak setelah install

Semua perubahan membuat backup:

```bash
ls -1t ~/.config/opencode/*.bak.* | head
```

Pulihkan:

```bash
cp ~/.config/opencode/opencode.json.bak.<timestamp> ~/.config/opencode/opencode.json
```

## Uninstall tidak bersih

```bash
bash install.sh --uninstall
```

Kalau config diedit manual, cek sisa entry:

```bash
grep -n 'sebas-kit\|sebas-red' ~/.config/opencode/opencode.json
```

Hapus manual `plugin`, `mcp.sebas-kit`, dan `theme` bila perlu.

## `node` tidak ditemukan

Enforcer butuh Node.js (plugin dan MCP server). Tanpa Node, pakai core saja:

```bash
bash install.sh --global
```

Skill dan persona tetap berfungsi penuh.
