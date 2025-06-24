const os = require('os');

function coletarDados() {
  return {
    hostname: os.hostname(),
    plataforma: os.platform(),
    uptime: os.uptime(),
    cpus: os.cpus().length,
    carga: os.loadavg(),
    totalMem: os.totalmem(),
    livreMem: os.freemem(),
    data: new Date().toISOString()
  };
}

if (require.main === module) {
  const dados = coletarDados();
  console.log(JSON.stringify(dados, null, 2));
}

module.exports = coletarDados;