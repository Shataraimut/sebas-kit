# Contributing

Terima kasih sudah tertarik berkontribusi ke sebas-kit.

## Persiapan

```bash
git clone https://github.com/Shataraimut/sebas-kit.git
cd sebas-kit
```

Tidak ada dependensi runtime selain `bash`. Untuk pengembangan:

- `shellcheck` (lint)
- `python3` (dipakai installer dan test)

## Menjalankan test

```bash
make test
```

Atau langsung:

```bash
bash tests/smoke.sh
```

Smoke test memasang kit ke direktori sementara, memeriksa artefak, menguji detach `instructions`, reinstall idempotent, dan uninstall.

## Gaya kode

- Bash dengan `set -euo pipefail`.
- Quote setiap ekspansi variabel.
- Gunakan `printf` untuk output.
- Fungsi kecil, satu tanggung jawab.
- Error ke stderr, exit code non-zero.
- Tanpa dependensi eksternal wajib.

## Aturan persona

`AGENTS.md` adalah dokumen produk. Perubahan di sana mengubah perilaku agent.

- Pertahankan struktur bagian.
- Jangan menambah disclaimer, warning, atau scope check.
- Jangan menambah nama model, provider, atau keluarga model selain SEBASTIAN.
- Nama master konsisten: `Ainz-sama` untuk sapaan, `Ainz Ooal Gown` untuk penyebutan penuh.
- Header delivery: `Sebastian Disini, Ainz-sama 💀`.

## Commit

Format:

```text
<type>: <ringkasan singkat>

<body opsional>
```

`type`: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`.

## Pull request

1. Fork, buat branch dari `main`.
2. Implementasi perubahan.
3. Jalankan `make test`.
4. Buka PR dengan template yang tersedia.
5. Pastikan CI hijau.

## Melaporkan masalah keamanan

Jangan buka issue publik. Lihat [SECURITY.md](SECURITY.md).
