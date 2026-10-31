# Laudos de Manutenção

## Funcionalidade implementada

A aba Laudos de Manutenção fica no painel /rh. Possui filial, empresa, placa, data, serviços com adicionar/remover, prévia, rascunhos, emissão e download do PDF original no histórico. O layout foi aprovado pelo usuário em 31/10/2026.

Os três DOCX foram conferidos. O rodapé de Sumaré foi mantido com endereço legal em Americana/SP conforme confirmação expressa. Ribeirão Preto utiliza ribpreto@assistecpneumatica.com.br. Nenhuma assinatura dos modelos foi incorporada automaticamente.

A emissão guarda cópia dos dados legais, textos fixos, serviços, versão do modelo, responsável e data; no modo autorizado também guarda a versão da autorização usada. O PDF gerado fica preservado em D1 em base64, com SHA-256, sem regeneração no download. Não há exclusão ou alteração de laudos emitidos. O identificador da tentativa evita duplicar emissões após uma falha de rede. O histórico lista os últimos 200 registros.

A emissão é restrita aos administradores já definidos por RH_EMAILS. Toda alteração exige a mesma origem. Os arquivos de assinatura e PDFs não são publicados em public/ nem retornados no resumo do histórico. O download do PDF original e a imagem para prévia exigem autenticação administrativa e usam Cache-Control private, no-store.

## Assinatura autorizada

Em Gerenciar assinatura/carimbo, o administrador seleciona a filial, envia PNG ou JPEG até 500 KB, confere a imagem e confirma expressamente possuir autorização. O servidor registra identidade, data e filial e valida a imagem. Apenas uma autorização pode ficar ativa por filial. Para substituir, revogar a atual e cadastrar outra. A autorização pode ser revogada a qualquer momento para novas emissões; PDFs históricos permanecem inalterados. A emissão verifica filial e revogação novamente no comando que grava o registro, prevenindo uso de autorização revogada durante a geração.

## Validação na nuvem — 31/10/2026

- Instalação pelo helper Sites concluída: lockfile validado, cinco pacotes baixados.
- Compilação de produção concluída, incluindo todas as rotas de laudos.
- Checagem TypeScript completa concluída após corrigir tipos de respostas JSON e cadastro de assinatura.
- Nove testes unitários/PDF/armazenamento passaram.
- Integração de manutenção passou em D1 isolado: rascunho, emissão, download, idempotência, histórico, autorização por filial, revogação e preservação do PDF anterior.
- Regressão de recrutamento: 34 verificações passaram em D1 isolado, incluindo preservação de candidatura anterior.
- Snapshots das migrações 0002/0003 completos; índice parcial de autorização ativa declarado no schema. Drizzle confirma que não há divergência de schema.
- A prévia iniciou em http://terminal.local:4173/, mas o navegador da nuvem retornou ERR_CONNECTION_REFUSED. A verificação visual interativa local permanece indisponível por roteamento da prévia.

## Publicação concluída

Versão 5 publicada em 31/10/2026 no Site existente. Implantação appgdep_6ae65770993c819181b5214375f51199 retornou succeeded. Fonte Sites: 9158f066d6d84b93f0441b3fbc4ed114e2d724ae.

A primeira tentativa foi interrompida por uma migração temporária duplicada no artefato anterior. O pacote foi recompilado da fonte limpa, com apenas 0000 a 0003, e as integrações passaram novamente. Nenhuma migração aplicada foi editada. A leitura de produção confirmou as novas tabelas e as 13 colunas de maintenance_reports; nenhum dado fictício foi gravado em produção.

https://vagas.assistecpneumatica.com.br/rh foi aberto após a implantação e respondeu com a tela de acesso restrito. Não há sessão ChatGPT no navegador da nuvem para verificar o fluxo administrativo em produção. Criar, prévia, emissão, download, histórico e autorizações foram validados por integração em banco isolado; a conferência visual autenticada continua pendente.

## Comandos de validação

- node node_modules/typescript/bin/tsc --noEmit
- node --experimental-strip-types --test tests/maintenance.test.mjs tests/maintenance-pdf.test.mjs tests/maintenance-storage.test.mjs
- node tests/maintenance.integration.mjs
- node tests/recruitment.integration.mjs
