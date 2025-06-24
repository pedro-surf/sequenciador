# Projeto: Agente Móvel com IPFS/IPNS (Versão com Checagem e Controle de Etapas)

## Objetivo  
Executar tarefas distribuídas em ordem controlada, garantindo que múltiplos nós executem agentes na sequência correta, com confirmação de execução antes do avanço.

## Componentes
- `agente-v1.js`: Coleta dados básicos do sistema  
- `agente-v2.js`: Coleta dados adicionais (ex: uso de disco)  
- `coordenador.js`: Publica agentes sequencialmente, checa resultados dos nós e só avança se todos concluírem  
- `executor.js`: Executa o agente atual publicado, publica resultado, evita reexecução repetida  
- `gerar_chave_ipns.js`: Gera e salva a chave IPNS para o nó
- `atualizar_ipns.js`: Atualiza manualmente IPNS com novo arquivo

## Arquitetura e Fluxo

1. **Coordenador** publica o agente da etapa atual no seu IPNS.  
2. Cada **nó executa o executor.js**, que:  
   - Consulta o IPNS do coordenador para saber qual agente executar  
   - Verifica se já executou essa versão (para evitar repetição)  
   - Executa o agente e publica o resultado no IPFS, atualizando seu próprio IPNS  
3. O **coordenador monitora** os IPNS dos nós, baixando os resultados e verificando a etapa executada.  
4. Quando **todos os nós confirmam execução da etapa atual**, o coordenador publica a próxima versão do agente, liberando a próxima etapa.  
5. O processo se repete até o fim das etapas.

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

### 4. Atualizar IPNS manualmente
```bash
node atualizar_ipns.js resultado.json
```

## Benefícios dessa abordagem
- Ordem garantida: Sequenciamento lógico com confirmação que todos os nós executaram antes de avançar

- Descentralização: Usa IPFS/IPNS sem REST, com conteúdo imutável e ponteiros mutáveis

- Eficiência: Executor evita repetir trabalho já feito