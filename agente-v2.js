const os = require('os');
const fs = require('fs');

function coletarDadosDisco() {
  const disco = fs.statSync('.');
  return {
    etapa: 'v2',
    hostname: os.hostname(),
    plataforma: os.platform(),
    espacoUsado: disco.blocks || 'N/A',
    espacoDisponivel: disco.blksize || 'N/A',
    data: new Date().toISOString()
  };
}

if (require.main === module) {
  const dados = coletarDadosDisco();
  console.log(JSON.stringify(dados, null, 2));
}

module.exports = coletarDadosDisco;