const { create } = require('ipfs-http-client');
const fs = require('fs');

const AGENTES = ['agente-v1.js', 'agente-v2.js'];
const NOS = [
  { name: 'NoA', ipns: '/ipns/QmNodeAKey' },
  { name: 'NoB', ipns: '/ipns/QmNodeBKey' }
];
const COORD_KEY = 'coordenador-key';
const COORD_IPNS = '/ipns/QmCoordenadorIPNS';

(async () => {
  const ipfs = create();

  // Tenta recuperar último manifesto
  let etapaAtual = 0;
  let cidAnterior = null;

  try {
    const resolved = await ipfs.name.resolve(COORD_IPNS);
    const stream = ipfs.cat(resolved.replace('/ipfs/', ''));
    let data = '';
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    const manifestoAnterior = JSON.parse(data);
    const etapaNum = parseInt(manifestoAnterior.etapa.replace('v', ''));
    etapaAtual = etapaNum;
    cidAnterior = manifestoAnterior.cid;
    console.log(`🔁 Retomando do manifesto v${etapaNum}`);
  } catch (e) {
    console.log("📄 Nenhum manifesto anterior encontrado. Começando do zero.");
  }

  while (etapaAtual < AGENTES.length) {
    console.log(`🚦 Etapa atual: v${etapaAtual + 1}`);

    // Aguarda execução dos nós
    const resultados = [];
    for (const no of NOS) {
      try {
        const res = await ipfs.name.resolve(no.ipns);
        const stream = ipfs.cat(res.replace('/ipfs/', ''));
        let data = '';
        for await (const chunk of stream) {
          data += chunk.toString();
        }
        const json = JSON.parse(data);
        resultados.push({ no: no.name, etapa: json.etapa, manifesto: json.manifesto });
      } catch (e) {
        console.log(`⚠️ ${no.name} não respondeu:`, e.message);
      }
    }

    const todosOK = resultados.length === NOS.length && resultados.every(r => r.etapa === `v${etapaAtual + 1}`);
    if (!todosOK) {
      console.log("⏳ Aguardando nós terminarem a etapa...");
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    // Publica próximo agente e manifesto IPLD
    const agente = fs.readFileSync(AGENTES[etapaAtual]);
    const agenteResult = await ipfs.add(agente);
    const manifesto = {
      etapa: `v${etapaAtual + 1}`,
      cid: { "/": agenteResult.cid.toString() },
      anterior: cidAnterior,
      data: new Date().toISOString()
    };

    const { cid: cidManifesto } = await ipfs.add(JSON.stringify(manifesto));
    await ipfs.name.publish(`/ipfs/${cidManifesto}`, { key: COORD_KEY });

    console.log("✅ Novo manifesto publicado:", cidManifesto.toString());
    etapaAtual++;
    cidAnterior = { "/": agenteResult.cid.toString() };
  }
})();
