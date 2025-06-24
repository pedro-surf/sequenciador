# Projeto: Agente Móvel com IPFS/IPNS (Versão com Checagem e Controle de Etapas)

## Objetivo  
Executar tarefas distribuídas em ordem controlada, garantindo que múltiplos nós executem agentes na sequência correta, com confirmação de execução antes do avanço.


## Componentes
- `agente-v1.js`: Coleta dados básicos do sistema
- `agente-v2.js`: Coleta dados adicionais (ex: uso de disco)
- `coordenador.js`: Publica o agente e consulta os nós, usando manifesto IPLD encadeado
- `executor.js`: Cada nó usa para executar o agente apontado pelo manifesto, publica resultado versionado
- `gerar_chave_ipns.js`: Gera e salva a chave IPNS para o nó
- `atualizar_ipns.js`: Script auxiliar para atualizar IPNS manualmente

## Fluxo
1. **Coordenador** consulta seu próprio IPNS, lê último manifesto IPLD e descobre a etapa atual.
2. Cada executor lê o manifesto atual, executa o agente e publica seu resultado versionado (com link ao manifesto).
3. O coordenador aguarda que todos os nós publiquem resultados com a etapa correspondente.
4. Quando todos respondem, ele publica o próximo agente e um novo manifesto IPLD, apontando para o anterior.

## Requisitos
- Node.js
- IPFS instalado e rodando em modo daemon (`ipfs daemon`)
- Configuração das chaves IPNS nos nós e coordenador

## Como executar

### 1. Gerar chave IPNS (1x por nó)
```bash
node gerar_chave_ipns.js
```

### 2. Publicar agente inicial (coordenador)
```bash
node coordenador.js
```

### 3. Executar nos nós participantes
```bash
node executor.js
```

### 4. (Opcional) Atualizar IPNS manualmente
```bash
node atualizar_ipns.js resultado.json
```

## Benefícios dessa abordagem
- Ordem garantida: Sequenciamento lógico com confirmação que todos os nós executaram antes de avançar

- Descentralização: Usa IPFS/IPNS sem REST, com conteúdo imutável e ponteiros mutáveis

- Eficiência: Executor evita repetir trabalho já feito