(function() {
  var CURRENT_CACHES = {
  prefetch: 'com.interbiz.ptsdhelp'
};

self.addEventListener('install', function (event) {
  var urlsToPrefetch = [
    './'
  ];

  self.skipWaiting();

  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(function (cache) {
        return cache.addAll(urlsToPrefetch);
    })
  );
});

self.addEventListener('activate', function (event) {
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
      return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
              if (expectedCacheNames.indexOf(cacheName) === -1) {
                  return caches.delete(cacheName);
              }
          })
          );
    })
    );
});

self.addEventListener('fetch', function (event) {
  if (event.request.headers.get('range')) {
      var pos =
      Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
      event.respondWith(
        caches.open(CURRENT_CACHES.prefetch)
        .then(function (cache) {
            return cache.match(event.request.url);
        }).then(function (res) {
            if (!res) {
                return fetch(event.request)
                .then(res => {
                    return res.arrayBuffer();
                });
            }
            return res.arrayBuffer();
        }).then(function (ab) {
            return new Response(
              ab.slice(pos),
              {
                  status: 206,
                  statusText: 'Partial Content',
                  headers: [
                    // ['Content-Type', 'video/webm'],
                    ['Content-Range', 'bytes ' + pos + '-' +
                      (ab.byteLength - 1) + '/' + ab.byteLength]]
              });
        }));
  } else {
      event.respondWith(
      caches.match(event.request).then(function (response) {
          if (response) {
              return response;
          }
          return fetch(event.request).then(function (response) {
              if (event.request.url == 'http://tyzhn.github.io/pages/a.html') {
                  caches.open(CURRENT_CACHES.prefetch)
                          .then(cache => {
                              cache.add('http://tyzhn.github.io/small.mp4');
                          });
              }
              else if (event.request.url == 'http://tyzhn.github.io/pages/b.html') {
                  caches.open(CURRENT_CACHES.prefetch)
                          .then(cache => {
                              cache.add('http://tyzhn.github.io/vb.mp4');
                          });
              }
              else if (event.request.url == 'http://tyzhn.github.io/pages/b.html') {
                  caches.open(CURRENT_CACHES.prefetch)
                          .then(cache => {
                              cache.add('http://tyzhn.github.io/vc.mp4');
                          });
              }

              else {
                  console.log("Page not cached");
              }
              
              
         
              return caches.open(CURRENT_CACHES.prefetch)
                      .then(cache => {
                          cache.put(event.request.url, response.clone());
                          return response;
                      });

          }).catch(function (error) {
              console.error('Fetching failed:', error);
              throw error;
          });
      })
      );
  }
});
})();