mapboxgl.accessToken = 'pk.eyJ1IjoicGVlaW5lYXJzIiwiYSI6ImNpdmZ1YzgzMDAweHMydGx2a3EyemphNXIifQ.A7yCz3mLve1I5KsPsRNO7g';

// in it mapbox map
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
  center: [-122.4194, 37.7749], // starting position
  zoom: 12 // starting zoom
});

// load data and add markers
map.on('load', function () {
  map.addSource('locations', { type: 'geojson', data: '/data.geojson' });
  map.addLayer({
    "id": "points",
    "type": "symbol",
    "source": "locations",
    "layout": {
      "icon-image": "cinema-15",
      "text-field": "{title}",
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 0.5],
      "text-anchor": "top",
      "text-size": 10
    }
  });
});

// light autocomplete component
// initiliaze with <input> element
function Autocomplete(input) {
  var self = this;
  var el;

  self.init = function () {
    el = document.createElement('ul');
    el.className = 'autocomplete';
    el.style.position = 'absolute';
    el.style.left = input.offsetLeft + 'px';
    el.style.top = input.offsetTop + input.offsetHeight + 'px';
    el.style.width = input.offsetWidth + 'px';
    el.addEventListener('mouseup', function (e) {
      input.value = e.target.innerHTML;
      input.dispatchEvent(new Event('input'));
    });
    document.body.appendChild(el);
  };

  self.setSuggestions = function (suggestions) {
    if (suggestions.length) {
      el.innerHTML = '<li>' + suggestions.join('</li><li>') + '</li>';
    } else {
      self.clearSuggestions();
    }
  };

  self.clearSuggestions = function () {
    el.innerHTML = '';
  };

  self.init();
}

var filterInput = document.getElementById('filter-input');
var autocomplete = new Autocomplete(filterInput);

// when input changes, filter visible markers on map and populate autocomplete suggestions
filterInput.addEventListener('input', function (e) {
  var value = normalize(e.target.value);

  // when input is empty, hide autocomplete and reset map
  if (!value.length) {
    autocomplete.clearSuggestions();
    map.setFilter('points', ['all']);
    return;
  }

  // find matching locations by title
  var filtered = map.querySourceFeatures('locations', { sourceLayer: 'points' }).filter(function (feature) {
    var title = normalize(feature.properties.title);
    return title.indexOf(value) > -1;
  });

  // reduce to titles, dedupe and sort
  var titles = filtered.map(function (feature) {
    return feature.properties.title;
  }).filter(function (value, index, self) {
    return self.indexOf(value) === index;
  }).sort();

  // filter visible map markers
  map.setFilter('points', ['in', 'title'].concat(titles));

  // update autocomplete suggestions
  if (titles.length === 1 && normalize(titles[0]) === normalize(value)) {
    autocomplete.clearSuggestions();
  } else {
    autocomplete.setSuggestions(titles.slice(0, 5));
  }
});

// common normalization code for comparing input to titles
function normalize(string) {
  return string.trim().toLowerCase();
}
