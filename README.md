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

## Gestão de vagas e formulários

No painel `/rh`, a aba **Formulários** permite criar perguntas profissionais com resposta curta, longa, escolha única, múltipla escolha e número. Os dados básicos do candidato são mantidos em todos os cadastros. Publicar um formulário libera seu link `/formularios/{id}` e permite vinculá-lo a vagas abertas. Arquivar ou voltar a rascunho suspende novas inscrições associadas.

A aba **Vagas** aceita qualquer cargo, unidade/local, descrição, requisitos, jornada, contratação, quantidade de posições e data-limite. A data-limite vale até o final do dia no fuso America/Sao_Paulo. Vagas abertas aparecem no portal e têm link `/vagas/{id}`. Rascunhos e vagas encerradas não aceitam novas inscrições.

A aba **Análises** mostra distribuições de cargo, unidade, experiência, disponibilidade, etapa e cidade, recebimentos por mês e respostas estruturadas dos formulários. Os filtros também se aplicam à lista e ao CSV. Contatos únicos contam e-mails distintos; candidaturas contam inscrições. Não há ranqueamento ou decisão automática de contratação.

Os dados de cargo/unidade da vaga são conferidos no servidor. Respostas são salvas com o texto e o tipo da pergunta na data da candidatura, preservando o histórico após edições do formulário. Versões antigas de formulários e edições concorrentes são rejeitadas.

## Verificação

Após o build, execute `node tests/recruitment.integration.mjs`. O teste usa D1 efêmero local, cabeçalhos de identidade sintéticos e consulta externa de metadados desativada; não usa candidatos ou segredos de produção. Inclui preservação de cadastros anteriores, autorização, publicação, encerramento, validação de respostas e histórico de formulários.
