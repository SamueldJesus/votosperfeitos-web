# Pix Transparente via Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Processar R$47,00 por Pix no modal e entregar os PDFs somente após a Order ser acreditada.

**Architecture:** O Worker cria e consulta Orders do Mercado Pago; o frontend recebe dados seguros do Pix para exibir o QR Code; o webhook assinado valida a Order antes de enfileirar a entrega.

**Tech Stack:** Cloudflare Workers, D1, Queues, React, TypeScript, Vitest, Mercado Pago Orders API.

**Spec:** `docs/superpowers/specs/2026-09-15-pix-orders-design.md`

## Global Constraints

- Usar somente Pix, valor server-side de 4.700 centavos e o tópico webhook `order`.
- Preservar geração assíncrona, PDFs privados no R2 e envio por Resend.

---

### Task 1: API de Orders e persistência

**Files:**
- Modify: `src/worker/mercado-pago.ts`, `src/worker/orders.ts`, `src/worker/index.ts`, `src/worker/types.ts`
- Create: `migrations/0002_pix_orders.sql`
- Test: `tests/worker/checkout.test.ts`

- [ ] Escrever teste que exige `POST /v1/orders`, R$47,00, Pix, `X-Idempotency-Key` e dados QR.
- [ ] Rodar o teste e verificar falha por ainda usar Preferences.
- [ ] Implementar a criação de Order e atualizar o endpoint para responder `payment` com QR.
- [ ] Migrar D1 para armazenar a Order e aceitar preço positivo, preservando registros existentes.
- [ ] Rodar o teste novamente.

### Task 2: confirmação de Order

**Files:**
- Modify: `src/worker/webhook.ts`
- Test: `tests/worker/webhook.test.ts`

- [ ] Escrever teste que aceita somente Order `processed/accredited` em BRL por R$47,00.
- [ ] Rodar o teste e verificar falha por consultar `/v1/payments`.
- [ ] Consultar `/v1/orders/{id}`, validar dados e atualizar a Order local de forma atômica.
- [ ] Rodar o teste novamente.

### Task 3: tela de Pix

**Files:**
- Modify: `src/components/QuizModal.tsx`, `src/components/PricingSection.tsx`
- Test: `tests/components/QuizModal.test.tsx`

- [ ] Escrever teste que mostra o QR, código copia-e-cola e R$47,00 após a resposta de checkout.
- [ ] Rodar o teste e verificar falha por redirecionar para uma URL externa.
- [ ] Renderizar a tela de Pix e implementar a cópia do código.
- [ ] Rodar o teste novamente.

### Task 4: verificação e publicação

**Files:**
- Modify: `README.md`, `wrangler.toml`

- [ ] Rodar a suíte, checagem de tipos e build.
- [ ] Aplicar a migração D1, conectar o domínio ao Worker e publicar.
- [ ] Verificar a URL pública e registrar o procedimento de teste Pix.
