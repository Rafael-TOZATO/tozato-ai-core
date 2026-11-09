# Guia de Contribuição — Tozato Core AI

Agradecemos o interesse em contribuir com o **Tozato Core AI**. Para manter a integridade da arquitetura *Privacy-First* e *Offline-First*, siga as diretrizes abaixo:

## 1. Fluxo de Trabalho (Workflow)
1. Faça um `Fork` do repositório.
2. Crie uma branch para a sua funcionalidade: `git checkout -b feature/minha-feature`.
3. Garanta que todas as validações de QA e tipos em TypeScript estejam passando.
4. Envie os seus commits seguindo o padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
5. Abra um `Pull Request` detalhado referenciando a Issue correspondente.

## 2. Requisitos de Qualidade (Quality Gate)
- Todo o novo código em **TypeScript** deve conter tipagem rigorosa.
- Modificações na integração com a API do **Ollama** devem manter o fallback gracioso para Edge deployment.
- Mantenha a documentação atualizada caso altere rotas ou parâmetros de runtime.
- 
