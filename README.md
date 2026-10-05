# Landing Page — GPS Financeiro

Página estática (HTML/CSS/JS puro, sem build) para divulgar o aplicativo e convidar a pessoa a
usá-lo. Aponta para **https://gps-financeiro.rafstwer.workers.dev/** via botões e QR Codes.
Está no ar em **https://lpgpsfinanceiro.rafstwer.workers.dev/**.

## Estrutura

```
index.html          # página única (hero, objetivos, funcionalidades, telas, como funciona, privacidade, CTA)
css/styles.css      # tema claro com os mesmos tokens do app (src/constants/theme.ts)
css/movimento.css   # as animações de rolagem (reveal, cabeçalho, barra de leitura, paralaxe)
js/movimento.js     # o que dispara e mede o movimento (IntersectionObserver + rAF)
assets/icon.png     # ícone do app (favicon e marca)
assets/qr-app.svg   # QR Code para o app (gerado com: npx qrcode -t svg ...)
assets/telas/*.webp # prints reais do app, gerados por script (ver abaixo)
```

## Movimento na rolagem

Quatro efeitos, todos em `js/movimento.js` + `css/movimento.css`: entrada por revelação
(escalonada por filho), sombra no cabeçalho ao rolar, barra de leitura no topo e paralaxe no
celular do hero (só no desktop).

Duas regras que o código respeita e que **não se pode quebrar**:

1. **Sem JavaScript a página aparece inteira.** A classe `js` no `<html>` só é adicionada pelo
   script, e é ela que habilita o estado invisível no CSS. Esconder no CSS e esperar o JS para
   mostrar transformaria uma falha de carregamento em página branca.
2. **`prefers-reduced-motion: reduce` desliga tudo** — nada é marcado, nada some, sem transição.

Os blocos animados são marcados pelo próprio script (atributo `data-anima`), e não no HTML: a
lista do que se move fica num lugar só.

## Prints do app

Os prints em `assets/telas/` são **gerados**, não tirados à mão. Na raiz do repositório do app:

```bash
node scripts/prints-landing.mjs http://localhost:8081
```

O script navega pelo app de verdade (cria duas rotas no caminho de 5 passos), fotografa cada
tela e converte para WebP. Ele **não grava um print que não seja a tela pedida**: cada foto
declara o texto que só aparece naquela tela, e sem esse texto o arquivo não é escrito e o
script sai com erro. Foi assim que oito prints viraram a mesma imagem e outros oito foram
publicados com a tela preta — o script antigo só checava se existia texto na tela, e uma tela
errada tem texto.

## Publicar

O `wrangler.jsonc` já aponta para **Cloudflare Workers com Assets estáticos** (`assets.directory: "."`),
que é o que está no ar. Para publicar na mão:

```bash
npx wrangler deploy
```

Na prática o fluxo é pelo Git: a cada push em `main` o Cloudflare constrói e publica.

## Depois do deploy

- Trocar os `href` dos QR/botões, se quiser um domínio próprio (hoje apontam para o app web).
- Registrar a URL nova em `docs/GPS_Financeiro_Documentacao.docx` (rodar `python scripts/gen_docs.py`
  no repositório do app) conforme a regra do AGENTS.md.

## Ícones das lojas

Google Play e App Store são **simulação** (os apps nativos ainda não foram publicados): os
badges levam ao app web e a nota no rodapé explica isso. Ao publicar de verdade, basta trocar
os `href` pelos links das lojas.
