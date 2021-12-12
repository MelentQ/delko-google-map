window.addEventListener('load', () => {
  
})

function initMap() {
  const mapContainer = document.querySelector('.d-map');
  if (!mapContainer) return;
  const map = mapContainer.querySelector('#js-yandex-map');
  if (!map) return;

  const deviceWidth = document.documentElement.clientWidth;
  let mapCenter = {lat: Number(mapContainer.dataset.initialLongitude), lng: Number(mapContainer.dataset.initialLatitude)};
  let mapZoom = Number(mapContainer.dataset.initialZoom);

  if (deviceWidth <= 1024) {
    mapCenter = {lat: Number(mapContainer.dataset.tabletInitialLongitude), lng: Number(mapContainer.dataset.tabletInitialLatitude)};
    mapZoom = Number(mapContainer.dataset.tabletInitialZoom);
  }
  if (deviceWidth <= 576) {
    mapCenter = {lat: Number(mapContainer.dataset.mobileInitialLongitude), lng: Number(mapContainer.dataset.mobileInitialLatitude)};
    mapZoom = Number(mapContainer.dataset.mobileInitialZoom);
  }

  const tekoMap = new google.maps.Map(map, {
    center: mapCenter,
    zoom: mapZoom,
    disableDefaultUI: true,
    styles: [{
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#EFF7F7"
      }]
    }, {
      "featureType": "water",
      "stylers": [{
        "color": "#C5E5F7"
      }]
    }, {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{
        "visibility": "on"
      }, {
        "color": "#FFD181"
      }]
    }, {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{
        "visibility": "on"
      }, {
        "color": "#FFD181"
      }]
    }]
  });

  _getData(mapContainer, tekoMap);

  _renderRussiaPolygon(tekoMap);
}

function _getData(mapContainer, map) {
  const url = mapContainer.dataset.url;

  fetch(url)
    .then(res => {
      return res.json()
    })
    .then(data => {
      const listContainer = document.querySelector('#js-map-list-container');
      const mobileListContainer = document.querySelector('#js-mobile-map-list-container');

      data.groups.forEach(group => {
        const count = group.count || group.places.length;
        _renderGroupItem(listContainer, {
          image: group.groupIcon,
          count: count,
          text: group.groupLabel
        });
        _renderGroupItem(mobileListContainer, {
          image: group.groupIcon,
          count: count,
          text: group.groupLabel
        });
        
        group.places.forEach(place => {
          _addPlace(map, {
            coords: place.coords,
            image: group.groupIcon
          });
        })
      })
    })
    .catch(err => {
      console.warn(err);
    })
}

function _addPlace(map, {coords, image}) {
  const markerCenter = new google.maps.LatLng(coords[0], coords[1]);

  const icon = {
    url: image,
    scaledSize: new google.maps.Size(12, 17),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(6, 17)
};

  const marker = new google.maps.Marker({
    position: markerCenter,
    map: map,
    icon: icon
  });
}

function _renderGroupItem(container, {image, count, text}) {
  const itemHTML =`
    <li class="d-map__place place">
      <div class="place__image-wrapper">
        <img src="${image}" alt="${text}">
      </div>
      <div class="place__description">
        <h3>${count}</h3>
        <p>${text}</p>
      </div>
    </li>`;

  container.innerHTML += itemHTML;
}

function _renderRussiaPolygon(map) {
  fetch('https://nominatim.openstreetmap.org/details.php?osmtype=R&osmid=60189&class=boundary&addressdetails=1&hierarchy=0&group_hierarchy=1&format=json&polygon_geojson=1')
  .then(res => res.json())
  .then(data => {

    // ---

    res = data.geometry.coordinates.map(group => {
      return group.map(innerGroup => {
        return innerGroup.map(coords => {
          const newCoords = {lat: coords[1], lng: coords[0]};
          return newCoords
        })
      })
    });

    // ---

    res.forEach(partCoords => {
      const russianBorders = new google.maps.Polygon({
        paths: partCoords,
        strokeColor: "#B6B0FC",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: "#fff",
        fillOpacity: 0.5,
      });
    
      russianBorders.setMap(map);
    })
  })
  .catch(err => {
    console.warn(err);
  })
}