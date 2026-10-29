<p align="center">
  <img src="assets/banner.jpg" alt="Banner do TozatoCode-AI" width="100%">
</p>

# Tozato Dev Hub

Hub profissional de engenharia de software, QA, dados e inteligência artificial local.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Ollama-offline-111111?logo=ollama&logoColor=white" alt="Ollama offline">
  <img src="https://img.shields.io/badge/Qwen3.5-9B-7C3AED" alt="Qwen3.5 9B">
  <img src="https://img.shields.io/badge/Vercel-deploy-000000?logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/QA_%26_Testing-Automated-00599C?logo=jest&logoColor=white" alt="QA Automation">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT">
</p>

## Visão geral

O Tozato Dev Hub reúne portfólio, certificações, projetos e um assistente de engenharia de software. A interface pública é compatível com execução local usando Ollama e Qwen3.5 9B, sem depender de APIs comerciais.

## Execução 100% offline

Requisitos: Ollama instalado, aproximadamente 7,5 GB livres para o modelo e 16 GB de RAM (24 GB ou mais recomendado para contexto estendido).

```bash
ollama pull qwen3.5:9b
OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_CONTEXT_LENGTH=65536 ollama serve
