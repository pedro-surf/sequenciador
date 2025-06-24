const { create } = require('ipfs-http-client');
const fs = require('fs');

(async () => {
  const ipfs = create();

  const agente = fs.readFileSync("agente-v1.js");
  const result = await ipfs.add(agente);
  console.log("📦 Agente publicado em:", result.cid.toString());

  console.log("🔐 Atualizando IPNS do coordenador...");
  await ipfs.name.publish(`/ipfs/${result.cid.toString()}`, { key: 'coordenador-key' });

  // A seguir: você pode iterar sobre uma lista de IPNS dos nós e pegar resultados
  const nos = [
    '/ipns/QmNodeAKey',
    '/ipns/QmNodeBKey'
  ];

  for (const no of nos) {
    try {
      const res = await ipfs.name.resolve(no);
      console.log(`📥 Resultado de ${no}: ${res}`);
    } catch (err) {
      console.log(`⚠️ Erro ao consultar ${no}:`, err.message);
    }
  }
})();