const { create } = require('ipfs-http-client');
const { execSync } = require('child_process');
const fs = require('fs');

const COORDINADOR_IPNS = '/ipns/QmCoordenadorIPNS'; // Ajuste seu IPNS real
const NODE_KEY = 'node-key';
const LAST_AGENT_FILE = '.last_agent.txt';

(async () => {
  const ipfs = create();

  console.log("🔍 Resolvendo IPNS do coordenador...");
  const resolved = await ipfs.name.resolve(COORDINADOR_IPNS);

  // Verifica se agente já foi executado
  if (fs.existsSync(LAST_AGENT_FILE)) {
    const lastCid = fs.readFileSync(LAST_AGENT_FILE, 'utf8').trim();
    if (lastCid === resolved) {
      console.log("⚠️ Agente já executado. Nada a fazer.");
      process.exit(0);
    }
  }

  console.log("📦 Baixando agente:", resolved);
  execSync(`ipfs get ${resolved} -o agente.js`);

  console.log("🏃 Executando agente...");
  const output = execSync('node agente.js').toString();
  const resultFile = `resultado-${Date.now()}.json`;
  
  fs.writeFileSync(resultFile, output);
  const resultAdd = await ipfs.add(fs.readFileSync(resultFile));
  fs.writeFileSync(LAST_AGENT_FILE, resolved);
  
  console.log("🚀 Publicando resultado em:", resultAdd.cid.toString());

  console.log("🔐 Atualizando IPNS do nó...");
  await ipfs.name.publish(`/ipfs/${resultAdd.cid.toString()}`, { key: NODE_KEY });
})();
