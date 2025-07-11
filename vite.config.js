import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // These are usually overridden in your custom server, but you can set defaults here if needed
    // middlewareMode: true, // Not needed here, set in your custom server
  },
  // You can add more config as needed (e.g., alias, build options)
});