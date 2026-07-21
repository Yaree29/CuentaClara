// Configuración de Jest — SOLO para pruebas unitarias.
// Metro/Expo leen metro.config.js / babel.config.js, NO este archivo, por lo que
// esta config no afecta el empaquetado de la app. El preset de Babel se pasa
// inline en el transform (no se crea un babel.config.js en la raíz que pudiera
// interferir con el bundler de Expo).
module.exports = {
  testEnvironment: 'node',
  // Muestra el resultado de cada caso individualmente (equivalente a pytest -v).
  verbose: true,
  // Limita la búsqueda de pruebas a src/ (evita escanear node_modules y backend/).
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.js$': [
      'babel-jest',
      { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] },
    ],
  },
};
