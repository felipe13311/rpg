# Além das Muralhas — ficha de personagem

Uma ficha pronta para o RPG da mesa: a pessoa abre o site, distribui pontos e joga. Não há editor de código, fórmula para decorar ou conta para criar.

## O que ela faz

- Preenche nome, duas idades opcionais, altura, aniversário e nível.
- Limita automaticamente os 6 pontos de atributos (máximo 2 por atributo).
- Limita automaticamente os 11 pontos de perícia (máximo 3 por perícia).
- Calcula Vida, PE, Sanidade, Defesa e Esquiva.
- Rola um d100 para DMT e deixa o mestre registrar a velocidade final.
- Permite reduzir/recuperar Vida, PE e Sanidade durante a sessão.
- Explica o uso de cada perícia ao clicar no `?`.
- Salva no próprio navegador e baixa backup da ficha em JSON.

## Regras calculadas

| Valor | Cálculo |
| --- | --- |
| Vida máxima | `10 + Fortitude × 2` |
| PE máximo | `5 + Nível` |
| Sanidade máxima | `4 + Intelecto` |
| Defesa | `5 + Fortitude` |
| Esquiva | `5 + Reflexo` |
| Resistência | bônus de armadura definido pelo mestre |

Modificações por altura e a conversão do dado de DMT para km/h ficam fora dos cálculos porque dependem da tabela usada pelo mestre. A tela deixa esses espaços claros sem inventar regra.

## Rodar localmente

Abra `index.html` no navegador. Se preferir um servidor local:

```powershell
python -m http.server 4173
```

Depois, abra `http://localhost:4173`.

## Publicar na Vercel

1. Envie estes arquivos para um repositório GitHub.
2. Acesse [vercel.com/new](https://vercel.com/new).
3. Importe o repositório.
4. Clique em **Deploy**.

É um site estático, portanto não precisa de build ou variáveis de ambiente.

