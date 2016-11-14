// load mapbox api key from .env
require('dotenv').config();

const request = require('request');
const fs = require('fs');
const querystring = require('querystring');
const MapboxClient = require('mapbox');

// TODO: paging ... makes assumption that dataset is smaller than 5000 rows
// TODO: account for rate limiting

class DataFetcher {
  constructor(params = {}) {
    this.mapbox = new MapboxClient(process.env.MAPBOX_API_KEY);
    this.params = params;
  }

  get dataUrl() {
    return "https://data.sfgov.org/resource/wwmu-gmzc.json?" + querystring.stringify(this.params);
  }

  fetch() {
    this.fetchFilmData().then((json) => {
      return this.geocodeLocations(json);
    }).then((features) => {
      return this.writeDataToFile(features);
    }, (error) => {
      console.log(error);
    });
  }

  fetchFilmData() {
    return new Promise((resolve, reject) => {
      request(this.dataUrl, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error('sfgov.org responded ' + response.statusCode));
        }
      });
    });
  }

  geocodeLocations(json) {
    const promises = [];
    json.forEach((entry) => {
      // don't fetch empty locations
      if (!entry.locations) return;
      promises.push(this.geocodeLocation(entry.locations).then((geometry) => {
        if (!geometry) return;
        return {
          type: 'Feature',
          properties: entry,
          geometry: geometry
        };
      }));
    });
    return Promise.all(promises);
  }

  writeDataToFile(features) {
    fs.writeFileSync('./public/data.geojson', JSON.stringify({
      type: 'FeatureCollection',
      features: features.filter(feature => !!feature) // filter out nulls
    }));
  }

  geocodeLocation(loc) {
    return new Promise((resolve, reject) => {
      const query = loc.replace(';', ',');
      this.mapbox.geocodeForward(query, {
        bbox: [-123.0137, 37.6040, -122.3549, 37.8324] // san francisco
      }, (err, results, res) => {
        if (err) {
          console.log('Geocoding error:', err);
          resolve(); // continue anyway
        } else if (results && results.features && results.features[0] && results.features[0].geometry) {
          resolve(results.features[0].geometry);
        } else {
          console.log('Missing geocoded data:', results);
          resolve(); // continue anyway
        }
      });
    });
  }
}

let fetcher = new DataFetcher({ $limit: 5000 });
fetcher.fetch();
