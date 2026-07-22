// AI Meeting Copilot - 簡易Service Worker
// 目的：ホーム画面追加(PWA化)の要件を満たすための最小実装。
// 音声認識・Claude API呼び出しは常にオンライン前提のため、
// ここではアプリの「殻」(index.html等)だけを簡易キャッシュし、
// 完全なオフライン動作は保証しない。

const CACHE_NAME = 'ai-meeting-copilot-v1';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}) // 一部キャッシュに失敗しても致命的にしない
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Claude API等の外部通信はキャッシュ対象外（そのままネットワークへ）
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
