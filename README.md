# Agenda & Reuniões — PWA (GitHub Pages ready)

**Como usar**

1. Crie um repositório no GitHub (ex.: `impettus-agenda`).
2. Suba todos os arquivos deste ZIP para a branch `main`.
3. Abra **Settings → Pages** e escolha **GitHub Actions** como fonte (o workflow deste repo já faz o deploy).
4. **Atenção:** edite o **nome do repositório** em:
   - `vite.config.ts`: `const repoBase = '/SEU-REPO/'` (ou defina variável `VITE_GH_PAGES_BASE` no workflow).
   - `index.html`: caminhos `/YOUR-REPO-NAME/` → substitua por `/<nome-do-repo>/`.
   - `src/main.jsx`: mude `base` para `/<nome-do-repo>/`.

Após o primeiro push em `main`, o GitHub Pages publicará em:
`https://SEU_USUARIO.github.io/SEU-REPO/`

## Desenvolvimento
```bash
npm ci
npm run dev
```

## Build
```bash
npm run build
```

## Notas
- O app é PWA simples (manifest + service worker básico). Para produção, considere `vite-plugin-pwa`.
- Integração **Microsoft Teams** está stubbada; implemente no backend (Microsoft Graph API) e preencha o link.
