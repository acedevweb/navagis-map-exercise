function initMap() {
	//infoBox plugin
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = "js/infobox.js";
	$("head").append(s);

	var data, map;
	var cebuLatLng = new google.maps.LatLng(10.3226903, 123.8975747);
	var circleCenter = new google.maps.LatLng(10.590268, 124.375957);

	function handleLocationError(browserHasGeolocation) {
	    window.alert(browserHasGeolocation ?
	                          'Error: The Geolocation service failed.' :
	                          'Error: Your browser doesn\'t support geolocation.');
	}

	function loadMap(type) {
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 8,
			center: cebuLatLng
		});

		var infowindow = new google.maps.InfoWindow();
		var request = {
			    location: cebuLatLng,
			    radius: '1000',
			    query: type
			 };
		function getResponse(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				data = results;
				console.log(data);
			}
		}
		var placesService = new google.maps.places.PlacesService(map);
			placesService.textSearch(request, getResponse);
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();
			directionsDisplay.setMap(map);

		var circle = new google.maps.Circle({
		    map: map,
		    center: circleCenter,
		    radius: 20000,
		    fillColor: '#2967de',
		    strokeColor: '#FFFFFF',
		    strokeWeight: 1,
		    fillOpacity: 1,
		  });

		setTimeout(function(){
			var marker;
			var markers = [];

			for (var i = 0; i < data.length; i++) {
				marker = new google.maps.Marker({
					position: data[i].geometry.location,
					map: map,
					visited: 0
				});

				google.maps.event.addListener(marker,'click', (function(marker,data,infowindow){
			        return function() {
						   this.visited++;
						   var content = '<div><div class="place-name"><strong>' + data.name + '</strong></div>' +
				                '<div class="place-info">Address: ' + data.formatted_address + '<br>' +
				                'Visited <strong>' + this.visited + '</strong>' + (this.visited > 1 ? ' times.' : ' time.') + '</div>' +
				                '<button class="get-directions" data-lat="' +  data.geometry.location.lat() +
				                '" data-lng="' + data.geometry.location.lng() + '">Get Directions</button>' +
				                ' </div>';
				           infowindow.setContent(content);
				           infowindow.open(map,marker);
				        };
				    })(marker,data[i],infowindow));

				markers.push(marker);
			}

			var markerCluster = new MarkerClusterer(map, markers, { imagePath: 'img/'});

			var labelOptions = {
				content: data.length,
				boxStyle: {
				  border: "none",
				  textAlign: "center",
				  fontSize: "18px",
				  width: "50px",
				  color: '#fff'
				},
				disableAutoPan: true,
				pixelOffset: new google.maps.Size(-25, -10),
				position: circleCenter,
				closeBoxURL: "",
				isHidden: false,
				pane: "floatPane",
				enableEventPropagation: true
				};

				var circleLabel = new InfoBox(labelOptions);
				circleLabel.open(map);

			}, 1300);

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
	}// end loadMap

	loadMap('restaurant, pizza');

	$(document).on("change", "#resto-types", function(e) {
		loadMap($('#resto-types').val());
	});
} // end initMap
