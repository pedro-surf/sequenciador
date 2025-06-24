
const { create } = require('ipfs-http-client');
const { execSync } = require('child_process');
const fs = require('fs');

const COORDINADOR_IPNS = '/ipns/QmCoordenadorIPNS'; // Substituir pelo IPNS real
const NODE_KEY = 'node-key';

(async () => {
  const ipfs = create();

  console.log("🔍 Resolvendo IPNS do coordenador...");
  const resolved = await ipfs.name.resolve(COORDINADOR_IPNS);

  console.log("📦 Baixando agente:", resolved);
  execSync(`ipfs get ${resolved} -o agente.js`);

  console.log("🏃 Executando agente...");
  const output = execSync('node agente.js').toString();
  const resultFile = `resultado-${Date.now()}.json`;

  fs.writeFileSync(resultFile, output);
  const resultAdd = await ipfs.add(fs.readFileSync(resultFile));

  console.log("🚀 Publicando resultado em:", resultAdd.cid.toString());

  console.log("🔐 Atualizando IPNS do nó...");
  await ipfs.name.publish(`/ipfs/${resultAdd.cid.toString()}`, { key: NODE_KEY });
})();