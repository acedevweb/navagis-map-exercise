function initMap() {

	var data, map;
	var cebu = {
		lat: 10.3156992,
		lang: 123.8854366
	};

	function getjson(url, callback) {
		$.getJSON(url, function(response){
	        callback(response);
		});
	}

	function handleLocationError(browserHasGeolocation) {
	    window.alert(browserHasGeolocation ?
	                          'Error: The Geolocation service failed.' :
	                          'Error: Your browser doesn\'t support geolocation.');
	}

	getjson("data/ceburestaurants.json", function(response) {
		data = response;
	});

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 8,
		center: new google.maps.LatLng(cebu.lat, cebu.lang)
	});

	var infowindow = new google.maps.InfoWindow();
	var content;
	var service = new google.maps.places.PlacesService(map);
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);

	setTimeout(function(){
		var marker;
		var markers = [];

		for (var i = 0; i < data.results.length; i++) {

			marker = new google.maps.Marker({
				position: data.results[i].geometry.location,
				map: map,
			});

			content = '<div><div class="place-name"><strong>' + data.results[i].name + '</strong></div>' +
		                '<div class="place-info">Address: ' + data.results[i].vicinity + '<br>' +
		                'Specialty: ' + data.results[i].specialties + '<br>' +
		                'Visited <strong>' + data.results[i].visitors + '</strong> times.</div>' +
		                '<button class="get-directions" data-lat="' +  data.results[i].geometry.location.lat +
		                '" data-lng="' + data.results[i].geometry.location.lng + '">Get Directions</button>' +
		                ' </div>';

			google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
		        return function() {
		           infowindow.setContent(content);
		           infowindow.open(map,marker);
		        };
		    })(marker,content,infowindow));

			markers.push(marker);
		}

		var markerCluster = new MarkerClusterer(map, markers, { imagePath: 'img/'});

	}, 800);

	$(document).on("click", "button.get-directions", function(e) {

		var destinationLat = $(this).data("lat");
		var destinationLng = $(this).data("lng");

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
			var currentLocation = {
			  lat: position.coords.latitude,
			  lng: position.coords.longitude
			};

			directionsService.route({
				  origin: currentLocation.lat +',' + currentLocation.lng,
				  destination: destinationLat + ',' + destinationLng,
				  travelMode: 'DRIVING'
				}, function(response, status) {
				  if (status === 'OK') {
				    directionsDisplay.setDirections(response);
				  } else {
				    window.alert('Directions request failed due to ' + status);
				  }
				});

			}, function() {
					handleLocationError(true);
				});
			} else {
				// Browser doesn't support Geolocation
				handleLocationError(false);
			}
	});
}

