const { create } = require('ipfs-http-client');
const fs = require('fs');

const AGENTES = ['agente-v1.js', 'agente-v2.js']; // Suas versões disponíveis
const NOS = [
  { name: 'NoA', ipns: '/ipns/QmNodeAKey' },
  { name: 'NoB', ipns: '/ipns/QmNodeBKey' }
];

const COORD_KEY = 'coordenador-key';

(async () => {
  const ipfs = create();

  // Função para publicar agente no IPFS e atualizar IPNS
  async function publicarAgente(arquivo) {
    const agente = fs.readFileSync(arquivo);
    const result = await ipfs.add(agente);
    console.log(`📦 ${arquivo} publicado em:`, result.cid.toString());
    await ipfs.name.publish(`/ipfs/${result.cid.toString()}`, { key: COORD_KEY });
    return result.cid.toString();
  }

  // Função para buscar resultados dos nós
  async function buscarResultados() {
    const resultados = [];

    for (const no of NOS) {
      try {
        const resolved = await ipfs.name.resolve(no.ipns);
        // Obtem o conteúdo JSON do resultado
        const stream = ipfs.cat(resolved.replace('/ipfs/', ''));
        let data = '';
        for await (const chunk of stream) {
          data += chunk.toString();
        }
        const json = JSON.parse(data);
        resultados.push({ no: no.name, etapa: json.etapa, data: json.data });
        console.log(`📥 Resultado de ${no.name}: etapa ${json.etapa} em ${json.data}`);
      } catch (err) {
        console.log(`⚠️ Erro ao consultar ${no.name}:`, err.message);
      }
    }
    return resultados;
  }

  // Começa publicando agente v1
  let etapaAtual = 0;
  await publicarAgente(AGENTES[etapaAtual]);

  while (etapaAtual < AGENTES.length) {
    console.log(`⏳ Aguardando nós concluírem etapa ${etapaAtual + 1}...`);
    await new Promise(r => setTimeout(r, 10000)); // Espera 10s antes de checar

    const resultados = await buscarResultados();

    // Verifica se todos concluíram a etapa atual
    const todosConcluidos = resultados.length === NOS.length &&
      resultados.every(r => r.etapa === `v${etapaAtual + 1}`);

    if (todosConcluidos) {
      console.log(`✅ Todos concluíram etapa ${etapaAtual + 1}! Avançando...`);
      etapaAtual++;
      if (etapaAtual < AGENTES.length) {
        await publicarAgente(AGENTES[etapaAtual]);
      } else {
        console.log("🎉 Todas as etapas concluídas!");
      }
    } else {
      console.log("⏳ Ainda esperando todos os nós concluírem...");
    }
  }
})();
