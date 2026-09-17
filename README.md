# 🏛️ Guia Digital - Mostra STEAM

<p align="center">
  <a href="https://github.com/lucas-hochmann-rosa/steam-guide-web">
    <img src="https://img.shields.io/badge/GitHub-steam--guide--web-181717?style=for-the-badge&logo=github">
  </a>
  <a href="https://www.linkedin.com/in/lucas-hochmann-rosa">
    <img src="https://img.shields.io/badge/LinkedIn-Lucas_Hochmann_Rosa-0A66C2?style=for-the-badge&logo=linkedin">
  </a>
  <a href="#-tecnologias-utilizadas">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111">
  </a>
  <a href="#-tecnologias-utilizadas">
    <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-2ea44f?style=for-the-badge">
  </a>
</p>

<p align="center">🇧🇷 Português · <a href="README.en.md">🇺🇸 English</a></p>

> Guia interativo de visitação criado para a **Mostra STEAM 2026** da Escola SESI Chapecó.

---

## ⚡ Início

```bash
git clone https://github.com/lucas-hochmann-rosa/steam-guide-web.git
cd steam-guide-web
npm install
npm run dev
```

Para gerar e testar a versão de produção:

```bash
npm run build
npm start
```

---

## 📌 Visão Geral

O **Guia Digital** é uma aplicação interativa desenvolvida para orientar e engajar o público durante a Mostra STEAM 2026 da Escola SESI Chapecó. A experiência conduz o visitante por todo o circuito de salas temáticas, permite localizar espaços por meio de mapas interativos, escanear QR Codes nas entradas das salas e registrar avaliações e comentários em tempo real.

O projeto foi desenvolvido por **Lucas Hochmann Rosa**.

---

## ✨ Principais Funcionalidades

- Acompanhamento interativo do percurso de visitação com indicador percentual de progresso.
- Leitor de QR Code integrado à câmera do dispositivo para abertura direta da sala.
- Sistema estruturado de avaliações com rostinhos (emojis), comentários e sincronização em tempo real com o Google Planilhas.
- Arquitetura resiliente com armazenamento local (offline-first) e reenvio automático de avaliações pendentes.
- Mapa 2D do campus com marcadores clicáveis e detalhamento arquitetônico do Bloco F.
- Catálogo da equipe pedagógica com biografias, áreas de atuação e portfólios.
- Espaço dedicado à equipe de robótica West Sharks FTC #24823 e à temporada BIOBUZZ.
- Questionário de satisfação integrado com o Google Formulários.
- Suporte a Progressive Web App (PWA) e funcionamento offline via Service Worker.

---

## 🧭 Sumário

- [Arquitetura](#-arquitetura)
- [Mapa dos Módulos](#-mapa-dos-módulos)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Dinâmica da experiência](#-dinâmica-da-experiência)
- [Regras da construção do projeto](#-regras-da-construção-do-projeto)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração de Ambiente](#-configuração-de-ambiente)
- [Execução](#-execução)
- [Deploy](#-deploy)
- [Avisos](#-avisos)
- [Licença](#-licença)
- [Autor](#-autor)

---

## 🏗️ Arquitetura

```text
steam-guide-web/
├── api/
│   └── evaluations.js
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── eslint.config.js
├── public/
│   ├── assets/
│   │   ├── equipe-2026/
│   │   ├── equipe-guia/
│   │   ├── salas/
│   │   └── westsharks/
│   ├── favicon-sesi.png
│   ├── icon-sesi-192.png
│   ├── icon-sesi-512.png
│   ├── manifest.webmanifest
│   └── sw.js
└── src/
    ├── components/
    │   ├── BottomNav.jsx
    │   ├── CompletionModal.jsx
    │   ├── EvaluationsModal.jsx
    │   ├── Footer.jsx
    │   ├── Navbar.jsx
    │   ├── QRScannerModal.jsx
    │   ├── RoomDetailModal.jsx
    │   ├── TeacherModal.jsx
    │   └── WelcomeModal.jsx
    ├── data/
    │   ├── rooms.js
    │   └── team.js
    ├── services/
    │   └── evaluationStorage.js
    ├── utils/
    │   └── assetPath.js
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

---

## 🗺️ Mapa dos Módulos

| Arquivo | Função |
| ------ | ------ |
| `index.html` | Entrada HTML da aplicação e metadados da página. |
| `src/main.jsx` | Ponto de inicialização do React no elemento raiz. |
| `src/App.jsx` | Aplicação React, telas, estados e navegação do guia. |
| `src/styles.css` | Estilos visuais e identidade da Mostra STEAM. |
| `src/services/evaluationStorage.js` | Persistência local, cálculo de médias e exportação CSV/JSON. |
| `src/data/rooms.js` | Catálogo de salas, blocos escolares e equipe do guia. |
| `src/data/team.js` | Dados biográficos e áreas de atuação da equipe pedagógica. |
| `api/evaluations.js` | Serverless Function para deploy e sincronização na Vercel. |
| `public/` | Imagens, ícones PWA e Service Worker servidos diretamente. |
| `vite.config.js` | Configuração do Vite, incluindo base automática para GitHub Pages. |
| `vercel.json` | Configuração de build e saída para deploy na Vercel. |
| `.github/workflows/deploy-pages.yml` | Publicação automática no GitHub Pages a partir da branch `main`. |

---

## 🧰 Tecnologias utilizadas

**Interface:** React 19.

**Build:** Vite 7.

**Linguagem:** JavaScript com ES Modules.

**Ícones:** Lucide React e vetores SVG otimizados.

**Estilização:** CSS3 moderno com variáveis customizadas.

---

## 🎲 Dinâmica da experiência

A experiência começa com uma tela de identificação onde o visitante informa seu nome. Em seguida, a aplicação libera o circuito com as seguintes etapas:

| Etapa | Dinâmica | Objetivo |
| --- | --- | --- |
| Percurso | Lista interativa das salas com fotos e professores responsáveis. | Explorar todas as estações temáticas da Mostra. |
| Leitor QR | Câmera para leitura rápida de código nas portas das salas. | Abrir imediatamente a estação sem busca manual. |
| Avaliação | Atribuição de nota de 1 a 5 estrelas e comentário opcional. | Registrar a opinião dos visitantes sobre as salas. |
| Exportação | Download das avaliações em formatos CSV e JSON. | Permitir análise de dados e métricas do evento. |
| Mapa | Visualização 2D com pontos clicáveis e mapa do Bloco F. | Facilitar o deslocamento pelo campus escolar. |

---

## 📐 Regras da construção do projeto

- Identificadores, funções, estados e estrutura de arquivos ficam em inglês.
- Textos de interface e documentação ficam em português.
- Comentários no código ficam em português, reservados para decisões não óbvias - o "porquê", não o "o quê".
- A autoria de desenvolvimento é de **Lucas Hochmann Rosa**.
- O projeto mantém arquitetura profissional compatível tanto com a Vercel quanto com o GitHub Pages.

---

## ⚙️ Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

---

## 🚀 Instalação

```bash
npm install
```

---

## 🔐 Configuração de Ambiente

Este projeto não exige variáveis de ambiente para funcionamento básico local. Caso deseje conectar um webhook remoto para envio das avaliações, configure `VITE_EVALUATIONS_API_URL` ou `WEBHOOK_URL`.

---

## ▶️ Execução

Ambiente de desenvolvimento:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
npm start
```

---

## 🌐 Deploy

### Vercel

O arquivo `vercel.json` já define:

| Campo | Valor |
| --- | --- |
| Comando de build | `npm run build` |
| Diretório de saída | `dist` |
| Framework | `vite` |

### GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica a pasta `dist` quando houver push na branch `main`.

Endereço esperado após o deploy:

```text
https://lucas-hochmann-rosa.github.io/steam-guide-web/
```

No GitHub, a página deve usar **GitHub Actions** como origem do Pages.

---

## ⚠️ Avisos

Este projeto foi criado para um evento escolar e educacional. Logos e imagens institucionais aparecem no contexto do projeto da Mostra STEAM 2026 da Escola SESI Chapecó.

O diretório `dist/` é gerado pelo build e não deve ser versionado.

---

## 📄 Licença

Licenciado sob MIT. Sinta-se livre para usar, modificar e distribuir, mantendo o aviso de copyright e atribuindo crédito a **Lucas Hochmann Rosa**.

---

## 👨‍💻 Autor

**Lucas Hochmann Rosa**

- Repositório: <https://github.com/lucas-hochmann-rosa/steam-guide-web>
- GitHub: <https://github.com/lucas-hochmann-rosa>
- LinkedIn: <https://www.linkedin.com/in/lucas-hochmann-rosa>
