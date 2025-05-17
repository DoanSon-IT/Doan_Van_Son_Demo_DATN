import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// Kiểm tra môi trường
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        strictPort: true,
        historyFallback: true,
        // Chỉ sử dụng proxy trong môi trường development
        ...(isDev && {
            proxy: {
                "/api": {
                    target: "http://localhost:8080",
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log('Sending Request:', {
                                method: req.method,
                                url: req.url,
                                target: proxyReq.path
                            });
                        });
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            console.log('Received Response:', {
                                statusCode: proxyRes.statusCode,
                                url: req.url,
                                headers: proxyRes.headers
                            });
                        });
                    },
                },
            },
        }),
    },
    optimizeDeps: {
        include: ["@tsparticles/react", "@tsparticles/slim"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    // Thêm cấu hình build
    build: {
        outDir: 'dist',
        sourcemap: false,
        // Tối ưu hóa chunk
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },
});
