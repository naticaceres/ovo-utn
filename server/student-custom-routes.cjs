// Custom routes for json-server to provide student aptitudes and last career endpoints
module.exports = (req, res, next) => {
  const fs = require('fs');
  const path = require('path');
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json')));

  // GET /api/students/:id/aptitudes
  if (
    req.method === 'GET' &&
    req.path.match(/^\/api\/students\/(\d+)\/aptitudes$/)
  ) {
    const userId = Number(req.path.match(/\d+/)[0]);
    // Simulación: sumar respuestas por dimensión y devolver ejemplo
    const aptitudes = [
      { label: 'Administrativas', value: 75 },
      { label: 'Humanísticas', value: 60 },
      { label: 'Artísticas', value: 45 },
      { label: 'Salud', value: 65 },
      { label: 'Ingeniería', value: 80 },
      { label: 'Defensa', value: 35 },
      { label: 'Agrarias', value: 50 },
    ];
    res.json(aptitudes);
    return;
  }

  // GET /api/students/:id/lastCareer
  if (
    req.method === 'GET' &&
    req.path.match(/^\/api\/students\/(\d+)\/lastCareer$/)
  ) {
    // Simulación: devolver la última carrera marcada como "Me interesa"
    res.json('Ingeniería en Sistemas');
    return;
  }

  next();
};
