var CACHE_NAME = 'restaurant-reviews-cache-v1';
var urlsToBeCached = [
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/css/responsive.css',
  '/css/responsive_restaurant.css',
  '/data/restaurants.json',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js'
];

//cacheing the files and installing the serviceWorker
self.addEventListener('install',function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(urlsToBeCached);
      console.log("cache opened and all are added to cache");
    })
  );
});

//Fetching the data from cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
