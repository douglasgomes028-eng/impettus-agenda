# Agenda & Reuniões — PWA (GitHub Pages FIX)

Este pacote já está configurado para GitHub Pages sem precisar editar o `vite.config.ts` manualmente.
O workflow seta `VITE_GH_PAGES_BASE=/<nome-do-repo>/` automaticamente.

**Publicar**
1. Crie um repositório no GitHub (ex.: `impettus-agenda`).
2. Suba estes arquivos para a branch `main`.
3. Em **Settings → Pages**, selecione **GitHub Actions**.
4. Após o push, aguarde o deploy: `https://SEU_USUARIO.github.io/<nome-do-repo>/`

**Dev**
```bash
npm ci
npm run dev
```
