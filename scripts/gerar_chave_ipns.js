const { create } = require('ipfs-http-client');
const fs = require('fs');

(async () => {
  const ipfs = create();
  const { id } = await ipfs.key.gen("node-key", { type: 'ed25519' });

  fs.writeFileSync("node_key_id.txt", id);
  console.log("Chave IPNS gerada:", id);
})();