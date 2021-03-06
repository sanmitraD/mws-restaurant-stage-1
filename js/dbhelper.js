if (typeof idb === 'undefined') {
  self.importScripts('idb.js');
}

var dbp;

/**
oi */
class DBHelper {
  constructor(){
    this.DBPromise = this.createDB();
    dbp=this.DBPromise;
  }

  static createDB()
  {
    return idb.open("restaurant",2, function(upgradeDb){
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants',{keyPath: "id"});
        case 1:
          const reviewsStore = upgradeDb.createObjectStore('reviews',{keyPath:"id"});
          reviewsStore.createIndex('reviews-by-restaurant-id','restaurant_id');
      }
    } );
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
/*
    const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
*/
  const port = 1337
  return `http://localhost:${port}/restaurants`;

}/*
  offlineCollect(){
    this.DBPromise.then(function(db) {
      var tx = db.transaction("restaurants","readonly");
      var store = tx.objectStore('restaurants');
      var restaurants = store.getAll();
      console.log(restaurants);
      tx.complete;
      return restaurants;
    });
  }*/
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    //offlineCollect();
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        //const restaurants = json.restaurants;
        const restaurants = json;

        this.DBPromise = this.createDB();
        dbp = this.DBPromise;
        this.DBPromise.then(function(db) {
          var tx = db.transaction("restaurants","readwrite");
          var store = tx.objectStore('restaurants');

          restaurants.forEach(function(restaurant) {
            store.put(restaurant);
          });
          tx.complete;
        });


        //console.log("JSON = ", json);
        //console.log("REstaurants =  ", restaurants);
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.onerror = () => {

        //const restaurants = json.restaurants;
        var restaurants;
        this.DBPromise = this.createDB();
        dbp = this.DBPromise;

        this.DBPromise.then(function(db) {
          var tx = db.transaction("restaurants","readonly");
          var store = tx.objectStore('restaurants');
          return store.getAll();
        }).then(function(value) {
          console.log(value);
          restaurants = value;
          console.log('collecting data from idb and sending');
          callback(null, restaurants);


        });

    };

    xhr.send();
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }

    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });


  }
  /*return promise of reviews*/

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   *Large restaurant image URL .
   */

  static imageUrlForRestaurantLarge(restaurant) {
    return (`/img/${restaurant.id}-1600_large_2x.jpg`);
  }

  /**
   *medium restaurant image URL .
   */

  static imageUrlForRestaurantMedium(restaurant) {
    return (`/img/${restaurant.id}-800_medium_1x.jpg`);
  }

  /**
   *Small restaurant image URL .
   */

  static imageUrlForRestaurantSmall(restaurant) {
    return (`/img/${restaurant.id}-400_small.jpg`);
  }

  /**
   *Information about photograph .
   */

  static aboutPhotograph(restaurant) {
    return (`${restaurant.about_photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */
  static getReviews(id) {
    return fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
    .then(function(res) {
      var jsonResponse =  res.json();
      return jsonResponse;
    }).then(function(reviews) {
      console.log(reviews);
      let dbp_new=dbp;
      console.log(dbp_new);
      dbp_new.then(function(db) {
        var tx = db.transaction("reviews","readwrite");
        var store = tx.objectStore('reviews');
        reviews.forEach(function(review) {
          store.put(review);
          console.log(review);
        });
        tx.complete;
      });

      return reviews;

    })
    .catch(function() {
      let dbp_new=dbp;
      return dbp_new.then(function(db) {
        var tx = db.transaction("reviews","readonly");
        var store = tx.objectStore('reviews');
        var index = store.index('reviews-by-restaurant-id');
        return index.getAll(id);
      }).then(function(reviews) {
        return reviews;
      });
    });
  }

  static updateOfflineComments(reviews) {
    let dbp_new=dbp;

    dbp_new.then(function(db) {
      var tx = db.transaction("reviews","readwrite");
      var store = tx.objectStore('reviews');
      reviews.forEach(function(review) {
        store.put(review);
        console.log(review);
      });
      tx.complete;
    });
    return reviews;
  }
  static addReview(review) {
    var saveOfflineReview = {
      name: 'offReview',
      data: review,
      object_type: 'review'
    };

    if(!navigator.onLine && (saveOfflineReview.name==='offReview')){
      console.log("we are offline");
      DBHelper.postWhenOnline(saveOfflineReview);
      return;
    }



    fetch('http://localhost:1337/reviews/',{
      method:'POST',
      body: JSON.stringify({
        'restaurant_id':parseInt(review.restaurant_id),
        'name':review.name,
        'rating': parseInt(review.rating),
        'comments': review.comments
      }),
      headers: new Headers({
        'Content-Type':'application/json'
      })
    });
  }
  static postWhenOnline(offReview){
    localStorage.setItem('data',JSON.stringify(offReview.data));

    window.addEventListener('online',(e) => {
      console.log('back to onLine');
      let data=JSON.parse(localStorage.getItem('data'));
      if(data !== null) {
        if(offReview.name == 'offReview'){
          DBHelper.addReview(offReview.data);
        }
        localStorage.removeItem('data');
      }
    });
  }

  static changeFavouriteValue(id, value){
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${value}`,{method:'PUT'})
    .then(function() {
      let dbp_new=dbp;
      dbp_new.then(function(db) {
        var tx = db.transaction("restaurants","readwrite");
        var store = tx.objectStore('restaurants');
        store.get(id).then(restaurant => {
          restaurant.is_favorite = value;
          store.put(restaurant);
        });
        });

      });

  }

}
