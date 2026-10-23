# Security Policy

## Cakupan

Proyek ini adalah installer konfigurasi. Permukaan serangan utamanya:

- penulisan file ke direktori config opencode;
- modifikasi `opencode.json` (detach `instructions`);
- eksekusi `python3` untuk parsing JSON;
- enforcer opsional menjalankan `node` untuk plugin dan MCP server, membaca teks
  assistant, dan menulis state ke direktori config.

## Pelaporan

Jangan buka issue publik untuk masalah keamanan.

Gunakan GitHub Security Advisory:

```text
https://github.com/Shataraimut/sebas-kit/security/advisories/new
```

Sertakan:

- deskripsi masalah dan dampak;
- langkah reproduksi;
- versi (`bash install.sh --version`) dan lingkungan;
- saran perbaikan bila ada.

Target respons awal: 72 jam.

## Praktik aman

- Installer tidak meminta kredensial.
- Installer tidak melakukan request jaringan.
- Installer tidak menulis di luar direktori config yang dipilih.
- Setiap modifikasi JSON membuat backup `.bak.<timestamp>`.
- Tinjau `install.sh` sebelum menjalankan dari sumber yang tidak dikenal.

## Versi yang didukung

Rilis terbaru pada branch `main`.
