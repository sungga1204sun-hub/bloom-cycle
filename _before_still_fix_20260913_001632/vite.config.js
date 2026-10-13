import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lamp: resolve(__dirname, 'lamp.html'),
        tray: resolve(__dirname, 'tray.html'),
        still: resolve(__dirname, 'still.html')
      }
    }
  }
});
