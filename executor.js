const { create } = require('ipfs-http-client');
const { execSync } = require('child_process');
const fs = require('fs');

const COORDINADOR_IPNS = '/ipns/QmCoordenadorIPNS'; // Substituir pelo IPNS real
const NODE_KEY = 'node-key';
const LAST_AGENT_FILE = '.last_agent.txt';

(async () => {
  const ipfs = create();

  console.log("🔍 Resolvendo IPNS do coordenador...");
  const resolved = await ipfs.name.resolve(COORDINADOR_IPNS);
  const manifestStream = ipfs.cat(resolved.replace('/ipfs/', ''));
  let manifestRaw = '';
  for await (const chunk of manifestStream) {
    manifestRaw += chunk.toString();
  }
  const manifest = JSON.parse(manifestRaw);
  const agenteCid = manifest.cid['/'];

  // Verifica se agente já foi executado
  if (fs.existsSync(LAST_AGENT_FILE)) {
    const lastCid = fs.readFileSync(LAST_AGENT_FILE, 'utf8').trim();
    if (lastCid === agenteCid) {
      console.log("⚠️ Agente já executado. Nada a fazer.");
      process.exit(0);
    }
  }

  console.log("📦 Baixando agente:", agenteCid);
  execSync(`ipfs get ${agenteCid} -o agente.js`);

  console.log("🏃 Executando agente...");
  const rawOutput = execSync('node agente.js').toString();
  const output = JSON.parse(rawOutput);

  // Monta resultado versionado
  const resultadoFinal = {
    etapa: output.etapa,
    hostname: output.hostname,
    manifesto: resolved.replace('/ipfs/', ''),
    resultado: output,
    dataExecucao: new Date().toISOString()
  };

  const resultFile = `resultado-${Date.now()}.json`;
  fs.writeFileSync(resultFile, JSON.stringify(resultadoFinal, null, 2));

  const resultAdd = await ipfs.add(fs.readFileSync(resultFile));
  fs.writeFileSync(LAST_AGENT_FILE, agenteCid);

  console.log("🚀 Publicando resultado em:", resultAdd.cid.toString());

  console.log("🔐 Atualizando IPNS do nó...");
  await ipfs.name.publish(`/ipfs/${resultAdd.cid.toString()}`, { key: NODE_KEY });
})();
