# Laudos de Manutenção

## Funcionalidade implementada

A aba Laudos de Manutenção fica no painel /rh. Possui filial, empresa, placa, data, serviços com adicionar/remover, prévia, rascunhos, emissão e download do PDF original no histórico. O layout foi aprovado pelo usuário em 31/10/2026.

Os três DOCX foram conferidos. O rodapé de Sumaré foi mantido com endereço legal em Americana/SP conforme confirmação expressa. Ribeirão Preto utiliza ribpreto@assistecpneumatica.com.br. Nenhuma assinatura dos modelos foi incorporada automaticamente.

A emissão guarda cópia dos dados legais, textos fixos, serviços, versão do modelo, responsável e data; no modo autorizado também guarda a versão da autorização usada. O PDF gerado fica preservado em D1 em base64, com SHA-256, sem regeneração no download. Não há exclusão ou alteração de laudos emitidos. O identificador da tentativa evita duplicar emissões após uma falha de rede. O histórico lista os últimos 200 registros.

A emissão é restrita aos administradores já definidos por RH_EMAILS. Toda alteração exige a mesma origem. Os arquivos de assinatura e PDFs não são publicados em public/ nem retornados no resumo do histórico. O download do PDF original e a imagem para prévia exigem autenticação administrativa e usam Cache-Control private, no-store.

## Assinatura autorizada

Em Gerenciar assinatura/carimbo, o administrador seleciona a filial, envia PNG ou JPEG até 500 KB, confere a imagem e confirma expressamente possuir autorização. O servidor registra identidade, data e filial e valida a imagem. Apenas uma autorização pode ficar ativa por filial. Para substituir, revogar a atual e cadastrar outra. A autorização pode ser revogada a qualquer momento para novas emissões; PDFs históricos permanecem inalterados. A emissão verifica filial e revogação novamente no comando que grava o registro, prevenindo uso de autorização revogada durante a geração.

## Preparação e validação pendentes

1. Instalar dependências com o lockfile atualizado, compilar o projeto e executar os testes de integração antes de publicar.
2. Aplicar as migrações 0002 e 0003 no ambiente de teste; conferir o fluxo autenticado e o PDF por filial. A migração de produção deve preservar os dados existentes.
3. Publicar no Site existente appgprj_6adbbad09d708191ad9ab152e764215f, preservando público e acesso administrativo; verificar a URL e o fluxo real.

Nenhuma migração foi aplicada em produção e esta alteração não foi publicada. O ambiente impediu o download das dependências; a solicitação de acesso adicional foi rejeitada automaticamente. A compilação e os testes de integração completos continuam pendentes.

## Testes

- node --experimental-strip-types --test tests/maintenance.test.mjs tests/maintenance-pdf.test.mjs tests/maintenance-storage.test.mjs
- Após compilar: node tests/maintenance.integration.mjs
- Regressão de recrutamento após compilar: node tests/recruitment.integration.mjs

Nove testes locais passaram: validação dos campos, datas e placas, rejeição de assinatura não cadastrada, PDF A4 nas três filiais, paginação extensa, imagem PNG, bloqueio por filial/revogação e preservação de candidatura anterior nas migrações. Um PDF real de teste com 18 serviços foi renderizado em duas páginas, com todos os serviços e os rodapés conferidos. Os testes de integração de rotas autenticadas estão escritos, mas não foram executados sem a compilação.

A dependência pdf-lib 1.17.1 e suas entradas de integridade foram adicionadas a partir do lockfile do runtime local disponível. O gerenciador de pacotes precisa validar o lockfile no ambiente de compilação.
