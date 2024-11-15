import path from 'path';

export default {
  root: './assets',  // Le répertoire où se trouvent vos fichiers JS/TS/CSS
  build: {
    manifest: true,
    outDir: path.resolve(__dirname, 'dist'),  // Le répertoire où seront compilés les fichiers
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'assets/js/web3.js'),  // Point d'entrée principal
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
  },
};