# Portal de Recrutamento ASSISTEC

Aplicação Vinext em Cloudflare Workers, banco D1 e autenticação ChatGPT fornecida por Sites.

- `/`: formulário público para mecânicos e borracheiros de pesados.
- `/rh`: painel privado. O servidor exige identidade autenticada e e-mail autorizado em `RH_EMAILS`.
- `/api/candidaturas`: somente inclusão pública, com validação, controle de origem e limite por IP/hora.
- `/api/rh`: consulta e alterações exigem autorização no servidor.
- `/privacidade`: aviso e canal para solicitações de dados.

## Configuração

`RH_EMAILS`: lista de e-mails separados por vírgula, configurada somente nas variáveis de execução da hospedagem. Nunca incluir dados de candidatos ou segredos no repositório.

Use `npm run db:generate` para gerar migrações após editar `db/schema.ts`. A publicação aplica as migrações na hospedagem Sites. Para desenvolvimento, siga o README do starter e os scripts do projeto.

O envio não exige conta. O RH usa a conta ChatGPT do e-mail autorizado. Não há senha própria deste portal. O RH pode excluir candidaturas e manter anotações privadas.
