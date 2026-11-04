import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

// Sem a URL da API, o site publicado chamaria o localhost de cada visitante.
// Fica em buildStart porque o svelte-check também carrega este arquivo.
const exigirUrlDaApi = (): Plugin => {
    let env: Record<string, string> = {};
    return {
        name: 'exigir-url-da-api',
        apply: 'build',
        configResolved(config) { env = config.env; },
        buildStart() {
            if (!env.VITE_API_BASE && !env.VITE_API_URL) {
                this.error('Defina VITE_API_BASE antes do build (veja .env.example).');
            }
        },
    };
};

export default defineConfig({ plugins: [exigirUrlDaApi(), tailwindcss(), sveltekit()] });
