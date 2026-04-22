// SoulSync Hardened Service Worker
// Este archivo se encarga de recibir los avisos incluso si la app está cerrada

self.addEventListener('push', (event) => {
  console.log('Push recibido:', event);
  let data = { title: 'SoulSync', body: 'Tienes un nuevo mensaje ❤️' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SoulSync', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: self.location.origin
    },
    actions: [
      { action: 'open', title: 'Responder' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = self.location.origin;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      // Si no, abrir una nueva
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// Forzar activación inmediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
