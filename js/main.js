let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoic2FubWl0cmEiLCJhIjoiY2pqNzEyNmplMHM3MTNxcWh1ZmVnODVubiJ9.2ig5sNwezvxGbuje43lOMQ',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}



/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  about_images = {
    "1": "A restaurant with grandiloquent lights and a royal ware of furniture with a lot of people with enjoyment",
    "2": "A delicous and apertive pizza, which you shouldn't miss.",
    "3": "a modern and classical wooden furniture with Korean nativity",
    "4": "a restaurant with a great lighting at the corner of junction",
    "5": "a restaurant with a lot of pizza fans",
    "6": "A restaurant with a large variation between it's outlook and it's food taste.",
    "7": "A restaurant with a classic look with glass walls",
    "8": "a Dutch restaurant with a beautiful tree infront of it",
    "9": "An asian restaurant with a lot of tech freqs.",
    "10": "A restaurant with a white furniture."
  }

  const li = document.createElement('li');

  const medium = DBHelper.imageUrlForRestaurantMedium(restaurant);
  const small = DBHelper.imageUrlForRestaurantSmall(restaurant);

  const picture = document.createElement('picture');

  const source1 = document.createElement('source');
  source1.media='(max-width: 600px)';
  source1.srcset = `${small} 1x, ${medium} 2x`;
  source1.type = `image/jpeg`;

  const source2 = document.createElement('source');
  source2.media='(min-width: 601px)';
  source2.srcset = `${small}`;
  source2.type = `image/jpeg`;

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurantMedium(restaurant);
  image.alt = about_images[restaurant.id];
  picture.append(source1)
  picture.append(source2)
  picture.append(image)
  li.append(picture);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label',`${restaurant.name} of cuisine type ${restaurant.cuisine_type} in ${restaurant.neighborhood} neighborhood. For more details click on this`);
  li.append(more);

  const favourite = document.createElement('button');
  if(restaurant.is_favorite){
  favourite.setAttribute('aria-label',`remove this restaurant as favourite`);
  favourite.innerHTML = 'remove favourite';
  favourite.classList.add("fav");
  }
  else {
    favourite.setAttribute('aria-label',`make this restaurant as favourite`);
    favourite.innerHTML = 'add to favourite';
    favourite.classList.add("not-fav");

  }

  console.log(restaurant.is_favorite);

  favourite.onclick = function() {
    const afterClickValue = !restaurant.is_favorite;
    restaurant.is_favorite = !restaurant.is_favorite;
    DBHelper.changeFavouriteValue(restaurant.id, afterClickValue);
    if(restaurant.is_favorite){
    favourite.innerHTML = 'remove favourite';
    favourite.setAttribute('aria-label',`remove this restaurant as favourite`);

    favourite.classList.toggle('not-fav');
    favourite.classList.toggle('fav');
    }
    else {
      favourite.setAttribute('aria-label',`make this restaurant as favourite`);
      favourite.innerHTML = 'add to favourite';
      favourite.classList.toggle('not-fav');
      favourite.classList.toggle('fav');
    }

  }

  li.append(favourite);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
