<p align="center">
  <img src="assets/banner.jpg" alt="Tozato - Core AI: transforme ideias em impacto" width="100%">
</p>

# Tozato Core AI

Hub Profissional de Engenharia de Software, QA Automotivo/Industrial, Governança de Dados e Inteligência Artificial Local.

<p align="center">
  <!-- MÁXIMO IMPACTO PROFISSIONAL & ENGAJAMENTO DE GOVERNANÇA -->
  <a href="https://github.com/Rafael-TOZATO/tozato-ai-core/commits/main"><img src="https://img.shields.io/github/last-commit/Rafael-TOZATO/tozato-ai-core?style=for-the-badge&logo=git&color=brightgreen" alt="Last Commit"></a>
  <a href="https://github.com/Rafael-TOZATO/tozato-ai-core/stargazers"><img src="https://img.shields.io/github/stars/Rafael-TOZATO/tozato-ai-core?style=for-the-badge&logo=github&color=gold" alt="GitHub Stars"></a>
  <a href="https://github.com/Rafael-TOZATO/tozato-ai-core/network/members"><img src="https://img.shields.io/github/forks/Rafael-TOZATO/tozato-ai-core?style=for-the-badge&logo=github&color=blue" alt="GitHub Forks"></a>
  <br>
  <!-- STACK ARQUITETURAL CORE -->
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.0-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://ollama.com/"><img src="https://img.shields.io/badge/Ollama-Offline_Inference-FF6F61?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama"></a>
  <a href="https://github.com/Rafael-TOZATO"><img src="https://img.shields.io/badge/QA_%26_Automation-Quality_Gate-2E8B57?style=for-the-badge&logo=githubactions&logoColor=white" alt="QA Automation"></a>
</p>

---

## 📌 Visão Geral & Arquitetura

O **Tozato Dev Hub** é uma plataforma distribuída que integra portfólio executivo, central de validações técnicas, métricas de qualidade e um assistente conversacional otimizado para engenharia de software e análise de dados.

Projetado sob os pilares *Privacy-First* e *Offline-First*, o ecossistema permite alternar entre uma interface web de alta disponibilidade (Edge Deployment via Vercel) e um pipeline de inferência 100% local executado via **Ollama API (v1)** com a família de modelos **Qwen3.5 9B**. Essa abordagem híbrida garante processamento autônomo, elimina custos por consumo de API comercial e assegura total conformidade e soberania sobre os dados.

---

## 📑 Dossiê Técnico & Documentação de Arquitetura

A documentação executiva completa do projeto — incluindo topologia de rede, testes de latência, consumo de VRAM e diretrizes de implantação em ambiente corporativo — está anexada diretamente ao repositório:

📄 **[Acessar Dossiê Técnico em PDF — Agente de Código Offline](./Dossie%20Tecnico%20-%20Agente%20de%20Codigo%20Offline%20%281%29.pdf)**

---

## 🚀 Guia de Implantação e Execução Offline

### Pré-requisitos de Hardware & Runtime
* **Ollama Runtime**: Instalação ativa no ambiente local.
* **Recursos de Memória**: Mínimo de 16 GB de RAM/VRAM (24 GB recomendado para processamento com janela de contexto estendida de 65.536 tokens).
* **Storage**: ~7.5 GB para o checkpoint do modelo `qwen3.5:9b`.

### 1. Servidor de Inferência Local (Ollama Endpoint)
Em um terminal dedicado, inicialize o modelo com parâmetros de contexto estendido e isolamento de nuvem:

```bash
ollama pull qwen3.5:9b
OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_CONTEXT_LENGTH=65536 ollama serve
```
---

## 🤝 Contribuição e Governança

Contribuições e relatos de bugs são bem-vindos para o aprimoramento contínuo da plataforma.

* **Reportar Bugs:** Abra uma [Issue de Bug](https://github.com/Rafael-TOZATO/tozato-ai-core/issues/new?template=bug_report.md) detalhando o comportamento esperado, Logs e ambiente de execução (Ollama / Vercel).
* **Sugestões de Features:** Abra uma [Issue de Melhoria](https://github.com/Rafael-TOZATO/tozato-ai-core/issues/new?template=feature_request.md).
* **Pull Requests:** Antes de enviar um PR, certifique-se de vincular a uma issue existente para validação do Quality Gate.

Para mais detalhes sobre os padrões de commits e arquitetura, consulte o nosso [Guia de Contribuição](./CONTRIBUTING.md).

---

## 💻 PROJETOS E PORTFÓLIOS
- **App Ecosystem:** [tozato-ai-core.vercel.app](https://tozato-ai-core.vercel.app)
- **H-Folio:** [h-folio-l0.vercel.app](https://h-folio-l0.vercel.app)

---

## 🐙 CÓDIGO E REPOSITÓRIOS
- **GitHub:** [github.com/Rafael-TOZATO](https://github.com/Rafael-TOZATO)

---

## ✍️ ARTIGOS E PUBLICAÇÕES
- **Medium:** [medium.com/@ornelas.tozato](https://medium.com/@ornelas.tozato)

---

## 📬 CONTATOS
- **E-mail:** [ornelas.tozato@gmail.com](mailto:ornelas.tozato@gmail.com)
- **LinkedIn:** [rafaeltozato81](https://www.linkedin.com/in/rafaeltozato81)
- **GitHub:** [Rafael-TOZATO](https://github.com/Rafael-TOZATO)
- **Dev Hub:** [tozato-ai-core.vercel.app](https://tozato-ai-core.vercel.app)

