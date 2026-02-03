# Plano de Conversão: React → HTML Único

## Objetivo
Converter o aplicativo Fipe Scanner de React/Vite para um único arquivo `index.html` que funcione sem build, diretamente em GitHub Pages.

## Status: ✅ Implementado

O arquivo `docs/index.html` contém o aplicativo completo (~100KB).

---

## Arquitetura Final

### Arquivo Único
- `docs/index.html` - Aplicativo completo

### Tecnologias Utilizadas
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos inline (variáveis CSS, flexbox, grid)
- **Vanilla JavaScript** - Lógica sem dependências
- **Chart.js (CDN)** - Gráficos de evolução de preço
- **PWA Inline** - Manifest e Service Worker via Blob URLs

---

## Funcionalidades Mantidas

### ✅ Consulta FIPE
- Seleção de tipo de veículo (carros, motos, caminhões)
- Selects encadeados (marca → modelo → ano)
- Exibição do resultado com valor, código FIPE, referência
- Copiar e compartilhar resultado
- Histórico de consultas (localStorage)

### ✅ Gráfico de Evolução de Preço
- Chart.js via CDN
- Simulação de 12 meses de histórico
- Indicador de tendência (alta/baixa/estável)
- Toggle expandir/colapsar

### ✅ Comparador de Preços
- Input de preço de anúncio
- Cálculo de diferença vs FIPE
- Classificação (muito abaixo, justo, acima, muito acima)

### ✅ Simulador de Financiamento
- Slider de entrada (0-90%)
- Seleção de parcelas (12, 24, 36, 48, 60)
- Cálculo Tabela Price (1.99% a.m.)
- Exibição de parcela, total e juros

### ✅ Detran Hub
- Input de placa (formato Mercosul)
- Detecção automática de UF
- Links para portais DETRAN
- Histórico de consultas

### ✅ Checklist de Compra
- 6 itens de verificação
- Progresso visual
- Persistência em localStorage

### ✅ Comparação de Veículos
- Até 3 veículos simultâneos
- Modal de comparação
- Cálculo de diferenças

### ✅ PWA
- Manifest inline via Blob URL
- Service Worker inline via Blob URL
- Instalável em dispositivos móveis
- Cache offline

### ✅ Dark/Light Mode
- Toggle no header
- Persistência em localStorage
- Variáveis CSS para temas

---

## Mapeamento de Componentes

| React | Vanilla JS |
|-------|-----------|
| useState | Variáveis + funções |
| useEffect | Event listeners + init |
| useMemo | Funções com cache simples |
| useCallback | Funções regulares |
| React Query | fetch nativo |
| Recharts | Chart.js CDN |
| Radix UI | HTML/CSS customizado |
| Tailwind | CSS Variables + Classes |
| localStorage hooks | localStorage direto |

---

## Deploy no GitHub Pages

1. Vá em Settings → Pages no repositório
2. Selecione Source: "Deploy from a branch"
3. Selecione Branch: main, Folder: /docs
4. Acesse via `https://usuario.github.io/repositorio/`

---

## Próximos Passos (Opcionais)

- [ ] Minificar CSS/JS inline para reduzir tamanho
- [ ] Adicionar ícones SVG inline
- [ ] Implementar notificações push
- [ ] Adicionar mais animações
