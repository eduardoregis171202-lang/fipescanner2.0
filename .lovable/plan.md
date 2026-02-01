
# 🚗 Plano de Melhorias - Fipe Scanner PWA

## Visão Geral
Refatorar completamente o app Fipe Scanner para ser um PWA funcional, corrigir todos os bugs identificados, melhorar visual e adicionar novas funcionalidades - tudo em um único arquivo HTML otimizado.

---

## Fase 1: Correção de Bugs Críticos

### 1.1 Corrigir lógica de reset de seleção
- Quando trocar tipo de veículo, resetar também modelo, ano e anos selecionados
- Evitar estados inconsistentes entre marca/modelo/ano

### 1.2 Tratamento de erros na API FIPE
- Adicionar try/catch com mensagens amigáveis ao usuário
- Mostrar toast/alerta quando API falhar
- Retry automático em caso de timeout

### 1.3 Corrigir chave localStorage
- Renomear para `detran_history` (histórico DETRAN)
- Criar `fipe_history` separado para consultas FIPE

### 1.4 Remover componente Icon não utilizado
- Limpar código morto
- Padronizar uso de `data-lucide` em todo app

### 1.5 Expandir tabela de placas
- Completar PLATE_RANGES para cobrir todas as UFs brasileiras
- Adicionar fallback quando placa não é detectada

---

## Fase 2: Implementação PWA (Single HTML)

### 2.1 Manifest inline via JavaScript
- Criar manifest.json dinamicamente usando Blob URL
- Injetar `<link rel="manifest">` no head

### 2.2 Service Worker inline
- Registrar Service Worker a partir de Blob
- Cache de arquivos CDN (Tailwind, React, Lucide)
- Cache de respostas da API FIPE para uso offline

### 2.3 Meta tags para PWA
- Apple touch icon (emoji ou SVG inline)
- Theme-color, viewport, description
- Status bar style para iOS

### 2.4 Funcionalidade offline
- Mostrar dados cacheados quando offline
- Indicador de status de conexão
- Histórico disponível offline

---

## Fase 3: Melhorias Visuais

### 3.1 Loading states aprimorados
- Skeleton loading nos selects enquanto carrega
- Animação suave na transição de resultados
- Spinner consistente em todas as áreas

### 3.2 Estados vazios
- Ilustração quando não há histórico
- Mensagem de boas-vindas na primeira consulta

### 3.3 Feedback visual
- Toast de sucesso ao copiar/compartilhar
- Toast de erro quando API falha
- Animação ao detectar UF automaticamente

### 3.4 Polimento do design
- Micro-interações nos botões
- Hover states mais refinados
- Gradientes e sombras mais suaves

---

## Fase 4: Novas Funcionalidades

### 4.1 Histórico de consultas FIPE
- Salvar últimas 10 consultas FIPE
- Acesso rápido para reconsultar
- Comparar preços de diferentes veículos

### 4.2 Botão de compartilhar resultado
- Web Share API para compartilhar valor FIPE
- Gerar imagem do resultado (canvas)
- Copiar valor para área de transferência

### 4.3 Modo escuro
- Toggle dark/light mode
- Respeitar preferência do sistema
- Salvar preferência no localStorage

### 4.4 Instalação do PWA
- Banner "Adicionar à tela inicial"
- Detectar se já está instalado
- Instruções para iOS/Android

### 4.5 Busca por código FIPE
- Campo para digitar código FIPE diretamente
- Consulta reversa do veículo

---

## Fase 5: Otimizações

### 5.1 Performance
- Debounce na digitação da placa
- Memoização de componentes pesados
- Lazy loading de dados

### 5.2 Acessibilidade
- Labels corretos em todos os campos
- Navegação por teclado
- Contraste adequado de cores

### 5.3 SEO e Open Graph
- Meta tags para compartilhamento social
- Título e descrição otimizados

---

## Entregável Final
Um único arquivo `index.html` contendo:
- App React completo com todas as funcionalidades
- PWA funcional instalável
- Service Worker inline para cache offline
- Design profissional e responsivo
- Sem dependências externas obrigatórias (CDNs como fallback)

O arquivo estará pronto para hospedar no **GitHub Pages** ou qualquer servidor estático.

