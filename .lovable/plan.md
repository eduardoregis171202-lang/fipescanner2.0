

# Plano de Implementacao - Melhorias Completas do Fipe Scanner

## Resumo das Funcionalidades

Este plano implementa 5 funcionalidades avancadas para melhorar significativamente o app:

1. **Historico FIPE Visual** - Cards clicaveis com consultas anteriores
2. **Filtro de Busca nos Selects** - Campo de pesquisa nas listas de marca/modelo
3. **Comparativo de Veiculos** - Salvar e comparar ate 3 veiculos lado a lado
4. **Calculadora de Financiamento** - Simulacao de parcelas com juros
5. **Checklist de Documentos** - Guia interativo para compra de veiculos
6. **Modo Offline/PWA** - Service Worker e manifest para funcionamento offline

---

## 1. Historico FIPE Visual

### O que sera feito

Adicionar uma secao visual no FipeEvaluator mostrando as ultimas consultas FIPE como cards clicaveis, similar ao historico do DetranHub.

### Arquivo a modificar

**src/components/fipe/FipeHistory.tsx** (novo)

Componente que recebe o historico e permite:
- Ver ultimas 5 consultas em cards
- Clicar para recarregar os dados (pre-preencher marca/modelo/ano)
- Icone de lixeira para limpar historico

### Visual

```text
+------------------------------------------+
|  CONSULTAS RECENTES                      |
|  +------------------------------------+  |
|  | [FIAT]  Uno 1.0 2020              |  |
|  | R$ 32.500        12/01/25   [>]   |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | [VW]  Gol 1.6 2019                |  |
|  | R$ 45.800        11/01/25   [>]   |  |
|  +------------------------------------+  |
+------------------------------------------+
```

### Modificacoes no Index.tsx

- Passar callback para restaurar selecao quando clicar no historico
- Atualizar FipeEvaluator para aceitar valores iniciais

---

## 2. Filtro de Busca nos Selects

### O que sera feito

Substituir os selects nativos por um componente Combobox com campo de busca integrado, permitindo filtrar rapidamente entre centenas de opcoes.

### Arquivos a criar

**src/components/fipe/SearchableSelect.tsx** (novo)

Componente reutilizavel que:
- Mostra input de texto para filtrar
- Lista opcoes filtradas abaixo
- Funciona com teclado (setas, enter, esc)
- Destaca o texto correspondente a busca

### Visual

```text
+------------------------------------------+
|  MARCA                                   |
|  +------------------------------------+  |
|  | [🔍] Digite para filtrar...        |  |
|  +------------------------------------+  |
|  | FIAT                               |  |
|  | FORD                               |  |
|  | FERRARI                            |  |
|  +------------------------------------+  |
+------------------------------------------+
```

### Modificacoes no FipeEvaluator

- Substituir `<select>` nativo pelo novo SearchableSelect
- Manter compatibilidade com mesmos valores e callbacks

---

## 3. Comparativo de Veiculos

### O que sera feito

Permitir que o usuario salve veiculos em uma lista de comparacao e veja lado a lado ate 3 veiculos com seus valores FIPE.

### Arquivos a criar

**src/components/fipe/CompareList.tsx** (novo)

Card flutuante que mostra veiculos salvos para comparacao:
- Botao "Adicionar a Comparacao" apos resultado FIPE
- Limite de 3 veiculos
- Botao para abrir modal de comparacao

**src/components/fipe/CompareModal.tsx** (novo)

Modal em tela cheia mostrando:
- Tabela comparativa com marca, modelo, ano, valor
- Destaque visual para o mais barato
- Diferenca percentual entre eles

### Visual do Modal

```text
+------------------------------------------+
|  COMPARATIVO                      [X]    |
|  +----------+----------+----------+      |
|  | Uno 1.0  | Gol 1.6  | HB20     |      |
|  |   2020   |   2019   |   2021   |      |
|  +----------+----------+----------+      |
|  | 32.500   | 45.800   | 58.200   |      |
|  |   🏆     |  +41%    |  +79%    |      |
|  +----------+----------+----------+      |
+------------------------------------------+
```

### Modificacoes

- Index.tsx: Gerenciar estado de veiculos para comparar
- FipeEvaluator: Adicionar botao "Comparar" no card de resultado

---

## 4. Calculadora de Financiamento

### O que sera feito

Apos o resultado FIPE, mostrar uma calculadora que simula parcelas de financiamento.

**Aviso importante**: Sera exibido claramente que e uma simulacao aproximada, nao uma cotacao real de banco.

### Arquivo a criar

**src/components/fipe/FinancingCalculator.tsx** (novo)

Componente com:
- Slider ou input para entrada (% do valor)
- Slider para numero de parcelas (12, 24, 36, 48, 60)
- Taxa de juros fixa de 1.99% ao mes (media de mercado)
- Calculo com formula de juros compostos (Tabela Price)
- Aviso de simulacao aproximada

### Formula utilizada

```text
Parcela = VP * [(i * (1+i)^n) / ((1+i)^n - 1)]

VP = Valor a financiar (FIPE - entrada)
i = Taxa mensal (1.99% = 0.0199)
n = Numero de parcelas
```

### Visual

```text
+------------------------------------------+
|  SIMULADOR DE FINANCIAMENTO              |
|  +------------------------------------+  |
|  | Entrada: 20%         R$ 9.700      |  |
|  | [===============----] (slider)     |  |
|  +------------------------------------+  |
|  | Parcelas: 48x                      |  |
|  | [====================] (slider)    |  |
|  +------------------------------------+  |
|  |                                    |  |
|  |  48x de R$ 1.123,45                |  |
|  |  Total: R$ 53.925,60               |  |
|  |  Juros: R$ 15.125,60               |  |
|  |                                    |  |
|  +------------------------------------+  |
|  ⚠️ Simulacao aproximada. Consulte     |  |
|     seu banco para valores exatos.     |  |
+------------------------------------------+
```

### Modificacoes no FipeEvaluator

- Adicionar aba ou secao expansivel para o simulador
- Passar valor FIPE como prop

---

## 5. Checklist de Documentos

### O que sera feito

Na aba de Consultas (DetranHub), adicionar uma secao de checklist interativo com documentos necessarios para compra de veiculos.

### Arquivo a criar

**src/components/fipe/DocumentChecklist.tsx** (novo)

Componente com lista de itens verificaveis:
- Documento do veiculo (CRV/CRLV)
- Verificar debitos (IPVA, multas, licenciamento)
- Consultar restricoes (financiamento, roubo/furto)
- CNH do comprador e vendedor
- Reconhecer firma no cartorio
- Transferencia no DETRAN

Cada item tera:
- Checkbox interativo
- Descricao breve
- Link para mais informacoes (quando aplicavel)
- Progresso visual (X de Y concluidos)

### Visual

```text
+------------------------------------------+
|  CHECKLIST DE COMPRA           3/6 ✓     |
|  +------------------------------------+  |
|  | [✓] Documento do veiculo (CRLV)   |  |
|  | [✓] Verificar debitos IPVA/Multas |  |
|  | [✓] Consultar restricoes           |  |
|  | [ ] CNH comprador e vendedor       |  |
|  | [ ] Reconhecer firma cartorio      |  |
|  | [ ] Transferir no DETRAN           |  |
|  +------------------------------------+  |
+------------------------------------------+
```

### Modificacoes no DetranHub

- Adicionar secao do Checklist abaixo do historico
- Persistir estado no localStorage

---

## 6. Modo Offline / PWA

### O que sera feito

Transformar o app em um PWA completo com funcionamento offline para consultas ja realizadas.

### Arquivos a criar

**public/manifest.json** (novo)

```json
{
  "name": "Fipe Scanner",
  "short_name": "FipeScanner",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#6366F1",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**public/sw.js** (novo)

Service Worker com estrategia Cache First para assets e Network First para API, com fallback para cache.

### Modificacoes

- index.html: Adicionar link para manifest
- src/main.tsx: Registrar Service Worker
- Criar icones PWA em diferentes tamanhos

### Cache Strategy

- **Assets estaticos** (JS, CSS, imagens): Cache First
- **API FIPE**: Network First com fallback para cache
- **Historico**: Sempre disponivel offline via localStorage

---

## Ordem de Implementacao Sugerida

| Ordem | Funcionalidade | Complexidade | Arquivos |
|-------|----------------|--------------|----------|
| 1 | Filtro nos Selects | Media | 2 arquivos |
| 2 | Historico Visual | Baixa | 2 arquivos |
| 3 | Checklist Documentos | Baixa | 2 arquivos |
| 4 | Calculadora Financiamento | Media | 2 arquivos |
| 5 | Comparativo Veiculos | Alta | 3 arquivos |
| 6 | PWA/Offline | Media | 4 arquivos |

---

## Resumo de Arquivos

### Novos arquivos (10)
- src/components/fipe/SearchableSelect.tsx
- src/components/fipe/FipeHistory.tsx
- src/components/fipe/FinancingCalculator.tsx
- src/components/fipe/CompareList.tsx
- src/components/fipe/CompareModal.tsx
- src/components/fipe/DocumentChecklist.tsx
- public/manifest.json
- public/sw.js
- public/icon-192.png
- public/icon-512.png

### Arquivos a modificar (4)
- src/components/fipe/FipeEvaluator.tsx
- src/components/fipe/DetranHub.tsx
- src/pages/Index.tsx
- index.html

---

## Resultado Final

O usuario tera um app completo com:
1. Busca rapida com filtro em todas as listas
2. Historico visual de consultas clicavel
3. Comparacao lado a lado de ate 3 veiculos
4. Simulador de financiamento integrado
5. Checklist para nao esquecer nada na compra
6. Funcionamento offline para consultas salvas

