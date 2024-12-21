import path from 'path';
//import vitePluginRequire from "vite-plugin-require";

export default {
  plugins: [
 //   vitePluginRequire()
  ],
  root: './assets',  // Le répertoire où se trouvent vos fichiers JS/TS/CSS
  build: {
    manifest: true,
    //commonjsOptions: { transformMixedEsModules: true },
    outDir: path.resolve(__dirname, 'assets/js/build'),  // Le répertoire où seront compilés les fichiers
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'assets/js/app.js'),  // Point d'entrée principal
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
  },
};