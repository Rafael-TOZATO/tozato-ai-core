<p align="center">
  <img src="assets/banner.jpg" alt="Banner do TozatoCode-AI" width="100%">
</p>

# Tozato Dev Hub

Hub profissional de engenharia de software, QA, dados e inteligência artificial local.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Ollama-offline-111111?logo=ollama&logoColor=white" alt="Ollama offline">
  <img src="https://img.shields.io/badge/Qwen3.5-9B-7C3AED" alt="Qwen3.5 9B">
  <img src="https://img.shields.io/badge/Vercel-deploy-000000?logo=vercel&logoColor=white" alt="Vercel">
</p>

## Visão geral

O Tozato Dev Hub reúne portfólio, certificações, projetos e um assistente de engenharia de software. A interface pública é compatível com execução local usando Ollama e Qwen3.5 9B, sem depender de APIs comerciais.

## Execução 100% offline

Requisitos: Ollama instalado, aproximadamente 7,5 GB livres para o modelo e 16 GB de RAM (24 GB ou mais recomendado para contexto estendido).

```bash
ollama pull qwen3.5:9b
OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_CONTEXT_LENGTH=65536 ollama serve
```

Em outro terminal:

```bash
pnpm install
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1 pnpm dev
```

O endpoint usado pelo assistente é `http://127.0.0.1:11434/v1`, com o modelo `qwen3.5:9b` e contexto de até 65.536 tokens. O código não inclui chaves ou arquivos `.env` no commit.

## Dossiê técnico

A arquitetura completa, os requisitos de hardware, benchmarks e o guia de implantação estão em [Dossiê Técnico — Agente de Código Offline](docs/Dossie-Tecnico-Agente-Codigo-Offline.pdf).

## Canais oficiais

- [GitHub](https://github.com/Rafael-TOZATO)
- [LinkedIn](https://linkedin.com/in/rafaeltozato81)
- [Medium](https://medium.com/@ornelas.tozato)
- [Tozato Dev Hub](https://tozato-dev-hub.vercel.app)

## Licença

Projeto pessoal de portfólio de Rafael Ornelas Tozato.
