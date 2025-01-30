import { offlineFallback, warmStrategyCache } from 'workbox-recipes';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute, Route } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Configurando o cache
const pageCache = new CacheFirst({
    cacheName: 'pwa-cam',
    plugins: [
        new CacheableResponsePlugin({
            statuses: [0, 200],
        }),
        new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60, // Expira após 30 dias
        }),
    ],
});

// Indicando o cache de página
warmStrategyCache({
    urls: ['/index.html', '/'],
    strategy: pageCache,
});

// Registrando a rota para navegação
registerRoute(
    ({ request }) => request.mode === 'navigate',
    pageCache
);
registerRoute(
    // Configurando cache de assets
    ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
    new StaleWhileRevalidate({
        cacheName: 'asset-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

offlineFallback({
    // Configurando offline fallback
    pageFallback: '/offline.html',
});

const imageRoute = new Route(({ request }) => {
    return request.destination === 'image';
}, new CacheFirst({
    cacheName: 'images',
    plugins: [
        new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24 * 30, // Expira em 30 dias
        }),
    ],
}));

registerRoute(imageRoute);
