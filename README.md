# Agenda & Reuniões — PWA (GitHub Pages SAFE)

Este pacote já está pronto para o Pages sem edição manual. O workflow:
- roda `npm install` (não exige package-lock);
- define automaticamente `VITE_GH_PAGES_BASE=/<nome-do-repo>/`;
- builda e publica o `dist/`.

**Publicar**
1. Crie um repositório (ex.: `impettus-agenda`).
2. Faça upload destes arquivos na branch `main`.
3. Em **Settings → Pages**, selecione **GitHub Actions**.
4. Abra a aba **Actions** e confirme o job verde. A URL final aparece como `page_url`.
