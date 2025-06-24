const { create } = require('ipfs-http-client');
const fs = require('fs');

(async () => {
  const ipfs = create();
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Forneça o caminho do arquivo como argumento.");
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath);
  const { cid } = await ipfs.add(fileContent);
  console.log("📦 Arquivo publicado em:", cid.toString());

  await ipfs.name.publish(`/ipfs/${cid.toString()}`, { key: 'node-key' });
  console.log("🔐 IPNS atualizado com sucesso.");
})();