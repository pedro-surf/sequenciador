# Projeto: Agente Móvel com IPFS/IPNS

## Objetivo
Executar tarefas em uma ordem controlada entre nós distribuídos, usando um sequenciador móvel lógico (agente em múltiplas versões), garantindo a ordem mesmo em ambiente assíncrono, sem REST.

## Componentes
- `agente-v1.js`: Script executado pelos nós
- `coordenador.js`: Publica o agente e consulta os nós
- `executor.js`: Cada nó usa para executar o agente e publicar seu resultado
- `gerar_chave_ipns.js`: Gera e salva a chave IPNS para o nó

## Requisitos
- Node.js
- IPFS instalado e rodando em modo daemon (`ipfs daemon`)

## Passos

### 1. Gerar chave IPNS (1x por nó)
```bash
node gerar_chave_ipns.js
```

### 2. Publicar o agente (coordenador)
```bash
node coordenador.js
```

### 3. Executar nos nós participantes
```bash
node executor.js
```

## Observações
- O coordenador usa IPNS para apontar para o agente mais recente
- Cada nó mantém seu IPNS apontando para seu resultado
- O sistema garante que todos executem a mesma versão em sequência
*/
