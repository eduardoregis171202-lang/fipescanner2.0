

# Plano de Implementacao - Comparador de Precos e Atualizacao DETRAN

## Resumo

Este plano implementa duas funcionalidades solicitadas:
1. **Comparador de Preco de Anuncio** - Campo para inserir o preco do anuncio e comparar com o valor FIPE
2. **Atualizacao dos Links DETRAN** - Novos URLs conforme fornecidos pelo usuario

---

## Parte 1: Comparador de Preco de Anuncio

### O que sera feito

Apos o resultado FIPE aparecer, um novo campo permitira que o usuario digite o preco do anuncio. O app calculara automaticamente a diferenca e mostrara uma avaliacao visual:

- **Muito Abaixo** (verde): preco do anuncio ate 10% menor que FIPE
- **Preco Justo** (azul): preco do anuncio entre -10% e +5% do FIPE
- **Acima** (amarelo): preco do anuncio entre +5% e +15% do FIPE
- **Muito Acima** (vermelho): preco do anuncio mais de 15% acima do FIPE

### Visual do Comparador

```text
+------------------------------------------+
|  PRECO DO ANUNCIO                        |
|  +------------------------------------+  |
|  | R$ 45.000,00                       |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  [icone]  MUITO ABAIXO DA FIPE     |  |
|  |  Economia de R$ 3.500 (-7.2%)      |  |
|  +------------------------------------+  |
+------------------------------------------+
```

### Arquivos a modificar

**src/components/fipe/FipeEvaluator.tsx**
- Adicionar estado para `announcedPrice` (string formatada)
- Criar funcao `parsePrice` para converter "R$ 45.000" em numero
- Criar funcao `calculateDifference` para comparar valores
- Adicionar componente de input com mascara de moeda
- Adicionar card de resultado da comparacao com cores e icones

---

## Parte 2: Atualizacao dos Links DETRAN

### Novos URLs

Todos os 27 estados serao atualizados com os links fornecidos:

| UF | URL Atualizado |
|----|----------------|
| AC | https://www.detran.ac.gov.br/ |
| AL | https://www.detran.al.gov.br/servicos-veiculos/ |
| AM | https://www.detran.am.gov.br |
| AP | https://www.detran.ap.gov.br |
| BA | https://www.detran.ba.gov.br |
| CE | https://sistemas.detran.ce.gov.br/meudetran/ |
| DF | https://www.detran.df.gov.br |
| ES | https://www.detran.es.gov.br |
| GO | https://www.detran.go.gov.br |
| MA | https://www.detran.ma.gov.br |
| MG | https://www.detran.mg.gov.br |
| MS | https://www.detran.ms.gov.br |
| MT | https://www.detran.mt.gov.br |
| PA | https://www.detran.pa.gov.br |
| PB | https://www.detran.pb.gov.br |
| PE | https://www.detran.pe.gov.br |
| PI | https://www.detran.pi.gov.br |
| PR | https://www.detran.pr.gov.br |
| RJ | https://www.detran.rj.gov.br |
| RN | https://www.detran.rn.gov.br |
| RO | https://www.detran.ro.gov.br |
| RR | https://www.detran.rr.gov.br |
| RS | https://www.detran.rs.gov.br |
| SC | https://www.detran.sc.gov.br |
| SE | https://www.detran.se.gov.br |
| SP | https://www.detran.sp.gov.br |
| TO | https://www.detran.to.gov.br |

### Arquivo a modificar

**src/lib/constants.ts**
- Atualizar objeto `DETRAN_URLS` com todos os novos links

---

## Detalhes Tecnicos

### Logica de Comparacao de Preco

```text
diferenca = (precoAnuncio - valorFipe) / valorFipe * 100

Se diferenca <= -10%  -> MUITO ABAIXO (otimo negocio)
Se diferenca <= +5%   -> PRECO JUSTO
Se diferenca <= +15%  -> ACIMA
Se diferenca > +15%   -> MUITO ACIMA (evitar)
```

### Mascara de Moeda

O campo de preco tera formatacao automatica:
- Ao digitar "45000" mostra "R$ 45.000,00"
- Aceita apenas numeros
- Remove formatacao para calculos internos

### Cores e Icones por Resultado

| Avaliacao | Cor | Icone |
|-----------|-----|-------|
| Muito Abaixo | Verde (bg-green-500) | TrendingDown |
| Preco Justo | Azul (bg-blue-500) | CheckCircle |
| Acima | Amarelo (bg-yellow-500) | TrendingUp |
| Muito Acima | Vermelho (bg-red-500) | AlertTriangle |

---

## Resultado Final

O usuario podera:
1. Consultar valor FIPE normalmente
2. Digitar o preco do anuncio que encontrou
3. Ver instantaneamente se o preco esta bom ou ruim
4. Ter acesso aos links corretos dos DETRANs de cada estado

