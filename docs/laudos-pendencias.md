# Laudos de Manutenção

## Fontes conferidas

Os três DOCX fornecidos pelo usuário foram lidos em 31/10/2026. A configuração em app/lib/maintenance.ts preserva razão social, CNPJ, endereço, telefone, e-mail e identificação sob assinatura por filial. O endereço legal de Sumaré em Americana/SP foi confirmado expressamente pelo usuário. O título foi padronizado para LAUDO DE MANUTENÇÃO, corrigindo LAÚDO dos modelos de Sumaré e Cubatão. A pontuação da conclusão foi padronizada com ponto final.

O e-mail de Ribeirão Preto é ribpreto@assistecpneumatica.com.br, confirmado pelo usuário e presente no DOCX recebido. Telefones foram preservados com DDD 019, sem deduzir outro DDD a partir do município.

Arquivos originais e imagens de assinaturas não foram adicionados ao repositório público. Sua presença em um documento assinado não constitui cadastro de autorização para novas emissões.

## Implementação da prévia

Aba no painel do RH, empresa/placa/data/filial, serviços dinâmicos, validação no cliente e servidor, prévia com introdução e conclusão dos originais e histórico imutável dos últimos 200 rascunhos. GET e POST exigem o administrador existente (RH_EMAILS); POST exige a mesma origem. A opção de assinatura fica registrada; a assinatura autorizada é rejeitada enquanto não houver cadastro verificado.

Aplicar drizzle/0002_maintenance_reports.sql no ambiente de teste antes de testar o histórico. Nenhuma migração foi aplicada em produção.

## Etapas pendentes

1. Aprovação pelo usuário das três prévias em PDF, com dados demonstrativos e espaço para assinatura manual.
2. Emissão de PDF no portal, com paginação de serviços extensos e cópias imutáveis dos dados legais e textos de cada emissão.
3. Cadastro privado, autorização e revogação de assinatura/carimbo por filial. Nunca servir assinatura por arquivo estático público.
4. Histórico de emissões e versão da autorização usada em cada documento.
5. Compilação e teste autenticado de formulário, histórico, permissões e PDF. A instalação offline não foi concluída porque o cache não contém os pacotes do projeto; a compilação não pôde ser executada nesta etapa.
6. Publicação somente após aprovação; verificar URL e fluxo real.

Os PDFs entregues nesta etapa são prévias para aprovação, não laudos emitidos. A visualização dos DOCX pelo renderizador empacotado não foi possível porque LibreOffice não está disponível; os textos, cabeçalhos, rodapés e imagens internas foram inspecionados diretamente. Os PDFs de prévia foram renderizados e revisados visualmente.
