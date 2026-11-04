import { defineConfig } from "vite";

export default defineConfig({
  // Relative, so the same build works at https://playmaker-demo.yamat47.me/ and under
  // https://yamat47.github.io/playmaker-demo/, whichever GitHub Pages serves it from.
  base: "./",
  // The dev server runs in a container, so it has to listen beyond the container's loopback.
  server: { host: true, strictPort: true },
  preview: { host: true },
});
