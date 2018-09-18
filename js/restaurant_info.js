let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

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
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurantLarge(restaurant);
  console.log(restaurant);
  console.log(restaurant.id);
  image.alt = about_images[restaurant.id];
  console.log(image.alt);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.setAttribute('aria-label',`cuisine-type: ${restaurant.cuisine_type}`);
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const reviewInfo = document.createElement('div');
  reviewInfo.setAttribute('class','review-info');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('class','reviewer-name');
  reviewInfo.appendChild(name);
  const date = document.createElement('p');
  date.setAttribute('class', 'review-date');
  date.innerHTML = review.date;
  reviewInfo.appendChild(date);
  reviewInfo.setAttribute('aria-label',`review by ${review.name} on ${review.date}`);
  li.appendChild(reviewInfo);
  const rating = document.createElement('p');
  rating.setAttribute('class', 'review-rating');

  rating.innerHTML = `Rating: ${review.rating}`;

  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.setAttribute('class', 'comments');

  comments.innerHTML = review.comments;

  li.appendChild(comments);
  li.setAttribute('tabindex','0');
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  //breadcrumb.a.setAttribute('aria-current','page');
  const li = document.createElement('li');
  //according to ARIA design patterns the element in a breadcrumb is an anchor element
  const anchor = document.createElement('a');
  anchor.href = '#';
  anchor.innerHTML = restaurant.name;
  anchor.setAttribute('aria-current','page');
  li.appendChild(anchor);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
