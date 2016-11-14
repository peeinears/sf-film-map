SF Film Locations Map
=====================

## Description

An interactive web map of the locations various movies and TV shows were shot in San Francisco.

## Problem

Use [these data from SF Open Data](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am) to show on a map where movies have been filmed in San Francisco. The user should be able to filter the view using autocompletion search.

## Solution

### Overview

- A script fetches, geocodes and reformats the SF Open Data as GeoJSON prior to deploy
- A website serves static HTML/CSS/JS, as well as the GeoJSON data
- The front-end loads the geocoded data and displays it on a MapBox map
- Filtering and autocompletion are implemented entirely on the front-end using the loaded data

### Discussion

Unfortunately, SF Open Data's dataset does not provide geocoded location coordinates, so we have to geocode each location ourselves. I decided to geocode all the data up front. Geocoding on the fly would be expensive, and unless you cache geocode results you would likely end up geocoding the same locations multiple times. Also, geocoding up front allows us to show all of the data on the map at once.

The geocoded data is reformatted and saved as [GeoJSON](http://geojson.org/), a standard used by several mapping services.

Because our dataset is relatively small (~1500 records, 635kb ungzipped), we can load the entire dataset on the client without much cost. If we have all of the data available on the client, going back to the server for any data (e.g. for autocompletion or filtering) would be superfluous. And so, the Node/Express backend here is rather uninteresting (and unnecessary). In production I would host this project as a static website (e.g. on S3).

Static websites offer uncomparable, easy scalability and performance. 

### Tradeoffs & Drawbacks

- Updates to the SF Open Data dataset will not be reflected until the data fetcher is run again. Data fetching could be implemented as a scheduled job in order to stay up-to-date.
- If the dataset becomes much larger, loading all of the data in the client might no longer be the best approach.

## Usage

#### Requirements

- Node v6.x.x
- MapBox API key

#### Installation

```
npm install
```

Update .env file with your MapBox API key.

#### Fetch data

```
node fetch-and-geocode-data.js
```

Saves to public/data.geojson.

#### Run

```
node app.js
```

Just serves static content.

## TODO

- Organize front-end JavaScript code in app.js
- Handle MapBox geocoding API rate limiting in the data fetcher
- Make autocomplete support richer interaction (e.g. keyboard interaction)
- Write tests!
