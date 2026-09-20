// Metro no busca fuera de la carpeta de la app por su cuenta. En un monorepo hay
// que decirle que packages/db también es código del proyecto, o al importarlo
// falla la resolución sin explicar por qué.
const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const raizDelProyecto = __dirname;
const raizDelMonorepo = path.resolve(raizDelProyecto, '../..');

const config = getDefaultConfig(raizDelProyecto);

config.watchFolders = [raizDelMonorepo];
config.resolver.nodeModulesPaths = [
  path.resolve(raizDelProyecto, 'node_modules'),
  path.resolve(raizDelMonorepo, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
