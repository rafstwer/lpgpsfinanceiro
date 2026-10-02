# Landing Page — GPS Financeiro

Página estática (HTML/CSS puro, sem build) para divulgar o aplicativo e convidar a pessoa a
usá-lo. Aponta para **https://gps-financeiro.rafstwer.workers.dev/** via botões e QR Codes.

## Estrutura

```
index.html        # página única (hero, objetivos, funcionalidades, como funciona, privacidade, CTA)
css/styles.css    # tema escuro com os mesmos tokens do app (src/constants/theme.ts)
assets/icon.png   # ícone do app (favicon e marca)
assets/qr-app.svg # QR Code para o app (gerado com: npx qrcode -t svg ...)
```

## Publicar no Cloudflare (Pages)

Opção A — upload direto (mais rápido):

1. Painel Cloudflare → **Workers & Pages** → **Create** → aba **Pages** → **Upload assets**.
2. Nome do projeto (ex.: `gps-financeiro-landing`) → arraste esta pasta → **Deploy site**.
3. Fica no ar em `https://gps-financeiro-landing.pages.dev`.

Opção B — via Git:

1. Criar repositório para esta pasta (ex.: `rafstwer/gps-landing`) e dar push.
2. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → escolher o repositório.
3. Build command: *(nenhuma — site estático)*; Output directory: `/`.
4. A cada push em `main` a página é publicada automaticamente.

## Depois do deploy

- Trocar os `href` dos QR/botões, se quiser um domínio próprio (hoje apontam para o app web).
- Registrar a URL nova em `docs/GPS_Financeiro_Documentacao.docx` (rodar `python scripts/gen_docs.py`
  no repositório do app) conforme a regra do AGENTS.md.

## Ícones das lojas

Google Play e App Store são **simulação** (os apps nativos ainda não foram publicados): os
badges levam ao app web e a nota no rodapé explica isso. Ao publicar de verdade, basta trocar
os `href` pelos links das lojas.
