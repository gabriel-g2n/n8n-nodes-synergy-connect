# Synergy Connect — API Reference

Base URL: `https://synergyconnect.com.br/api/v1`

A API do Synergy Connect é um proxy autenticado para a WhatsApp Business Cloud API (Meta Graph API v22.0). Todas as chamadas de envio de mensagens, mídia e templates são encaminhadas diretamente ao Meta, então o formato de request/response segue a [documentação oficial do WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).

---

## Autenticacao

Todas as rotas exigem uma API key. Envie de uma das duas formas:

| Metodo | Header |
|--------|--------|
| Header dedicado | `x-api-key: sk_sua_chave_aqui` |
| Bearer token | `Authorization: Bearer sk_sua_chave_aqui` |

A API key esta vinculada a uma **instancia** especifica. Os valores de `phoneNumberId` e `wabaId` sao determinados pela instancia da chave.

### Erros de autenticacao

| Status | Codigo | Mensagem |
|--------|--------|----------|
| 401 | 190 | `API key is required` — chave nao enviada |
| 401 | 190 | `Invalid API key` — chave invalida ou expirada |
| 403 | 100 | `API key has no instance configured` — chave sem instancia |
| 404 | 100 | `Instance not found` — instancia nao existe |
| 403 | 100 | `Instance is not active` — instancia desativada |
| 400 | 100 | `Instance is not configured` — instancia sem token Meta ou phone number |

Formato do erro:
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "OAuthException",
    "code": 190
  }
}
```

---

## 1. Enviar Mensagem

Envia uma mensagem WhatsApp para um destinatario. O body segue exatamente o formato da [WhatsApp Cloud API — Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages).

```
POST /api/v1/{phoneNumberId}/messages
```

### Parametros de URL

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `phoneNumberId` | string | ID do numero de telefone da instancia (fornecido no painel) |

> O `phoneNumberId` deve corresponder ao da instancia vinculada a API key, caso contrario retorna 403.

### Headers

```
x-api-key: sk_sua_chave
Content-Type: application/json
```

### Exemplos de Body

#### Mensagem de texto

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "text",
  "text": {
    "body": "Ola! Esta e uma mensagem de teste."
  }
}
```

#### Mensagem de imagem (por URL)

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "image",
  "image": {
    "link": "https://exemplo.com/imagem.jpg",
    "caption": "Legenda da imagem"
  }
}
```

#### Mensagem de imagem (por media ID)

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "image",
  "image": {
    "id": "media_id_retornado_pelo_upload",
    "caption": "Legenda da imagem"
  }
}
```

#### Mensagem de documento

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "document",
  "document": {
    "link": "https://exemplo.com/arquivo.pdf",
    "caption": "Relatorio mensal",
    "filename": "relatorio.pdf"
  }
}
```

#### Mensagem de audio

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "audio",
  "audio": {
    "link": "https://exemplo.com/audio.mp3"
  }
}
```

#### Mensagem de video

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "video",
  "video": {
    "link": "https://exemplo.com/video.mp4",
    "caption": "Assista ao video"
  }
}
```

#### Mensagem de localizacao

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "location",
  "location": {
    "latitude": "-23.5505",
    "longitude": "-46.6333",
    "name": "Sao Paulo",
    "address": "Av. Paulista, 1000"
  }
}
```

#### Mensagem de contato

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "contacts",
  "contacts": [
    {
      "name": {
        "formatted_name": "Joao Silva",
        "first_name": "Joao",
        "last_name": "Silva"
      },
      "phones": [
        {
          "phone": "+5511988888888",
          "type": "CELL"
        }
      ]
    }
  ]
}
```

#### Envio de template

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "pt_BR"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Joao"
          }
        ]
      }
    ]
  }
}
```

#### Mensagem interativa (botoes)

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "Escolha uma opcao:"
    },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn_1", "title": "Opcao 1" } },
        { "type": "reply", "reply": { "id": "btn_2", "title": "Opcao 2" } }
      ]
    }
  }
}
```

#### Mensagem interativa (lista)

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": {
      "text": "Selecione um item:"
    },
    "action": {
      "button": "Ver opcoes",
      "sections": [
        {
          "title": "Categoria",
          "rows": [
            { "id": "item_1", "title": "Item 1", "description": "Descricao do item 1" },
            { "id": "item_2", "title": "Item 2", "description": "Descricao do item 2" }
          ]
        }
      ]
    }
  }
}
```

#### Reacao a mensagem

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "reaction",
  "reaction": {
    "message_id": "wamid.xxxxxxxxxxxx",
    "emoji": "\ud83d\udc4d"
  }
}
```

#### Responder mensagem (quote)

Qualquer tipo de mensagem pode incluir `context` para responder a uma mensagem especifica:

```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "text",
  "context": {
    "message_id": "wamid.xxxxxxxxxxxx"
  },
  "text": {
    "body": "Esta e uma resposta a mensagem anterior."
  }
}
```

### Response (sucesso — 200)

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "5511999999999",
      "wa_id": "5511999999999"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgNNTUxMTk5OTk5OTk5FQIAERgSMDVBN0Y4..."
    }
  ]
}
```

### Erros

| Status | Causa |
|--------|-------|
| 403 | `phoneNumberId` nao corresponde a instancia da API key |
| 400+ | Erros do Meta (numero invalido, template nao aprovado, etc.) — repassados diretamente |

---

## 2. Configurar Webhook

Configura uma URL de webhook para receber eventos da instancia. Se a URL ja esta cadastrada, atualiza a configuracao existente (upsert por URL).

```
PUT /api/v1/webhooks
```

### Headers

```
x-api-key: sk_sua_chave
Content-Type: application/json
```

### Body

```json
{
  "url": "https://seu-servidor.com/webhook",
  "name": "Webhook de producao",
  "headers": {
    "Authorization": "Bearer seu_token_secreto",
    "X-Custom-Header": "valor"
  },
  "enabled": true
}
```

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `url` | string | Sim | URL destino do webhook (deve ser HTTPS valido) |
| `name` | string | Sim | Nome identificador do webhook |
| `headers` | object | Nao | Headers customizados enviados em cada chamada (default: `{}`) |
| `enabled` | boolean | Nao | Ativar/desativar o webhook (default: `true`) |

### Response (criado — 201)

```json
{
  "webhook": {
    "id": "uuid-do-webhook",
    "instanceId": "uuid-da-instancia",
    "name": "Webhook de producao",
    "url": "https://seu-servidor.com/webhook",
    "headers": {
      "Authorization": "Bearer seu_token_secreto",
      "X-Custom-Header": "valor"
    },
    "enabled": true,
    "createdAt": "2026-03-09T12:00:00.000Z",
    "updatedAt": "2026-03-09T12:00:00.000Z"
  }
}
```

- Retorna **201** quando cria um novo webhook
- Retorna **200** quando atualiza um webhook existente (mesma URL)

### Payload recebido pelo webhook

Quando um evento ocorre (mensagem recebida, status de entrega, etc.), o webhook recebe o payload **identico** ao formato do [Meta Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components):

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": { "name": "Joao" },
                "wa_id": "5511888888888"
              }
            ],
            "messages": [
              {
                "from": "5511888888888",
                "id": "wamid.xxx",
                "timestamp": "1709985600",
                "type": "text",
                "text": { "body": "Ola!" }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Tipos de evento** (campo `field`):
- `messages` — mensagens recebidas e atualizacoes de status (sent, delivered, read, failed)
- `message_template_status_update` — mudancas de status de templates

O webhook recebe um POST com os headers customizados configurados + `Content-Type: application/json`.

---

## 3. Listar Templates

Lista os templates de mensagem do WhatsApp Business Account (WABA).

```
GET /api/v1/{wabaId}/message_templates
```

### Parametros de URL

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `wabaId` | string | ID do WhatsApp Business Account da instancia |

> O `wabaId` deve corresponder ao da instancia vinculada a API key.

### Query Parameters (opcionais)

Suporta todos os parametros da [API Meta](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates):

| Parametro | Descricao |
|-----------|-----------|
| `limit` | Quantidade de resultados por pagina |
| `status` | Filtrar por status: `APPROVED`, `PENDING`, `REJECTED` |
| `name` | Filtrar por nome do template |

### Response (200)

```json
{
  "data": [
    {
      "name": "hello_world",
      "status": "APPROVED",
      "category": "MARKETING",
      "language": "pt_BR",
      "id": "123456789",
      "components": [
        {
          "type": "BODY",
          "text": "Ola {{1}}, bem-vindo!"
        }
      ]
    }
  ],
  "paging": {
    "cursors": {
      "before": "xxx",
      "after": "yyy"
    }
  }
}
```

---

## 4. Criar Template

Cria um novo template de mensagem.

```
POST /api/v1/{wabaId}/message_templates
```

### Body

Segue o formato da [API Meta — Create Message Template](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates#criar-modelos):

```json
{
  "name": "meu_template",
  "language": "pt_BR",
  "category": "MARKETING",
  "components": [
    {
      "type": "BODY",
      "text": "Ola {{1}}, sua compra #{{2}} foi confirmada!"
    }
  ]
}
```

### Response (200)

```json
{
  "id": "123456789",
  "status": "PENDING",
  "category": "MARKETING"
}
```

---

## 5. Deletar Template

```
DELETE /api/v1/{wabaId}/message_templates?name=nome_do_template
```

### Query Parameters

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `name` | string | Sim | Nome do template a deletar |

### Response (200)

```json
{
  "success": true
}
```

---

## 6. Consultar Template por ID

```
GET /api/v1/templates/{templateId}
```

### Response (200)

Retorna o template completo no formato Meta.

---

## 7. Editar Template por ID

```
POST /api/v1/templates/{templateId}
```

### Body

Campos a atualizar (mesmo formato da criacao, apenas os `components` que deseja alterar).

---

## 8. Upload de Midia

Faz upload de um arquivo de midia para uso em mensagens.

```
POST /api/v1/{phoneNumberId}/media
```

### Headers

```
x-api-key: sk_sua_chave
Content-Type: multipart/form-data
```

### Body (multipart/form-data)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `messaging_product` | string | Sempre `"whatsapp"` |
| `file` | binary | Arquivo de midia |
| `type` | string | MIME type (ex: `image/jpeg`, `application/pdf`) |

### Response (200)

```json
{
  "id": "media_id_123456"
}
```

O `id` retornado pode ser usado no campo `image.id`, `document.id`, etc. ao enviar mensagens.

---

## 9. Consultar Midia

Obtem os metadados e URL de download de uma midia.

```
GET /api/v1/{mediaId}
```

### Response (200)

```json
{
  "id": "media_id_123456",
  "messaging_product": "whatsapp",
  "url": "https://synergyconnect.com.br/api/v1/media/download?url=...",
  "mime_type": "image/jpeg",
  "sha256": "abc123...",
  "file_size": 12345
}
```

> A `url` retornada ja aponta para o proxy do Synergy Connect (nao para o Meta diretamente), permitindo download sem autenticacao Meta adicional.

---

## 10. Download de Midia

Faz download do arquivo binario de uma midia.

```
GET /api/v1/media/download?url={meta_media_url}
```

### Query Parameters

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `url` | string | URL original da midia Meta (obtida via consulta de midia) |

### Response

Retorna o arquivo binario com os headers:
- `Content-Type`: tipo MIME do arquivo
- `Content-Length`: tamanho em bytes

> **Fluxo recomendado**: primeiro chame `GET /api/v1/{mediaId}` para obter a URL, depois use a URL retornada para download.

---

## 11. Deletar Midia

```
DELETE /api/v1/{mediaId}
```

### Response (200)

```json
{
  "success": true
}
```

---

## Resumo dos Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/{phoneNumberId}/messages` | Enviar mensagem |
| PUT | `/api/v1/webhooks` | Configurar webhook (upsert por URL) |
| GET | `/api/v1/{wabaId}/message_templates` | Listar templates |
| POST | `/api/v1/{wabaId}/message_templates` | Criar template |
| DELETE | `/api/v1/{wabaId}/message_templates?name=...` | Deletar template |
| GET | `/api/v1/templates/{templateId}` | Consultar template por ID |
| POST | `/api/v1/templates/{templateId}` | Editar template |
| POST | `/api/v1/{phoneNumberId}/media` | Upload de midia |
| GET | `/api/v1/{mediaId}` | Consultar midia |
| GET | `/api/v1/media/download?url=...` | Download de midia |
| DELETE | `/api/v1/{mediaId}` | Deletar midia |

---

## Informacoes para o n8n Node

### Credenciais

O node deve solicitar:
- **API Key** (string, prefixo `sk_`)
- **Phone Number ID** (string) — necessario para envio de mensagens e upload de midia
- **WABA ID** (string) — necessario para operacoes de templates

### Operacoes sugeridas para o node

1. **Enviar Mensagem** — com sub-opcoes para tipo (text, image, document, audio, video, location, contacts, template, interactive)
2. **Configurar Webhook** — upsert da URL de destino
3. **Listar Templates** — com filtros opcionais
4. **Criar Template**
5. **Upload de Midia** — retorna media ID para uso em mensagens
6. **Trigger (Webhook)** — node trigger que recebe eventos do webhook configurado

### Trigger via Webhook

Para o node trigger do n8n:
1. O node gera uma URL de webhook do n8n (ex: `https://n8n.exemplo.com/webhook/xxx`)
2. Usa `PUT /api/v1/webhooks` para registrar essa URL no Synergy Connect
3. O Synergy Connect envia POST para essa URL sempre que ha um evento
4. O payload segue o formato Meta Webhooks documentado na secao 2
