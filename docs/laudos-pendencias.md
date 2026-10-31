# Laudos de Manutenção — implementação preliminar

Base: commit 6a2313e6e4d950b1532b0ea026734ff90fd303d9.

Implementado localmente: aba no painel do RH, empresa/placa/data/filial, serviços dinâmicos, validação no cliente e servidor, prévia de rascunho e histórico imutável dos últimos 200 rascunhos. Os endpoints exigem o administrador existente (`RH_EMAILS`); POST exige a mesma origem. A opção de assinatura fica registrada; a assinatura autorizada é rejeitada enquanto não houver cadastro verificado. Nenhuma imagem de assinatura foi reutilizada.

Aplicar a migração `drizzle/0002_maintenance_reports.sql` no ambiente de teste antes de testar o histórico. Não foi aplicada em produção.

## Fontes faltantes

Os três DOCX de Sumaré, Cubatão e Ribeirão Preto não foram disponibilizados no histórico recuperado nem neste projeto. Não presumir CNPJ, razão social, endereço, telefone, e-mails restantes ou textos fixos. O único e-mail confirmado é `ribpreto@assistecpneumatica.com.br`.

## Necessário antes de concluir

1. Recuperar os DOCX, conferir os dados por filial e transcrever os textos fixos.
2. Apresentar o layout fiel aos modelos para aprovação.
3. Definir quem pode emitir e autorizar assinaturas por filial; implementar autorização no servidor e armazenamento privado dos arquivos autorizados.
4. Implementar PDF com paginação para serviços extensos, preservando o conteúdo integral, os dados legais e a versão da autorização em cada emissão.
5. Completar histórico de emissões com cópias imutáveis do cadastro e do documento.
6. Executar compilação e teste real autenticado de formulário, histórico, permissões e PDF.
7. Publicar somente após aprovação e verificar URL e fluxo real.

A prévia atual é estrutural e não serve como laudo emitido. Nenhuma publicação foi realizada.
