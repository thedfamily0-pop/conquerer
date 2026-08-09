import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets work on GitHub Pages project sites and custom domains.
export default defineConfig({ base: './', plugins: [react()] });
