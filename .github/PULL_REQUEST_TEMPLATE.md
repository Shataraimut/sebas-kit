## Ringkasan

<!-- Satu paragraf: apa yang berubah dan kenapa. -->

## Jenis perubahan

- [ ] Perbaikan bug
- [ ] Fitur baru
- [ ] Perubahan dokumentasi
- [ ] Refactor
- [ ] CI / tooling

## Cara menguji

```bash
make test
```

<!-- Jelaskan langkah manual bila ada. -->

## Checklist

- [ ] `shellcheck -x install.sh tests/smoke.sh` bersih
- [ ] `bash -n install.sh` lolos
- [ ] `make test` lolos
- [ ] Dokumentasi diperbarui bila perilaku berubah
- [ ] `CHANGELOG.md` diperbarui bila perlu

## Catatan tambahan

<!-- Breaking change, migrasi, atau hal yang perlu diketahui reviewer. -->
