import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Point Tailwind at our config by absolute path so it loads correctly even when
// the dev server's working directory isn't the client folder.
const dir = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [tailwindcss({ config: path.join(dir, 'tailwind.config.js') }), autoprefixer()],
};
