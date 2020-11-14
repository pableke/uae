
//initialize google maps
function initMap() {
	var CT = { lat: 37.62568269999999, lng: -0.9965839000000187 }; //default ct coords
	var p1, p2; //[from..to]

	var fields = $("#group-loc").inputs();
	var elo1 = fields[0]; //origen
	var elf1 = fields[1]; //fecha 1
	var elh1 = fields[2]; //hora 1
	var eld2 = fields[3]; //destino
	var elf2 = fields[4]; //fecha 2
	var elh2 = fields[5]; //hora 2
	var elmt = fields[6]; //medio de transporte (desp)

	function fnDesp(val) { return $("option[value='" + val + "']", elmt).text(); };
	function fnDist(val) { return val ? nfLatin(val/1000) : "-"; };

	var cfg = { types: ["geocode", "establishment"] }; //autocomplete config
	var map = new google.maps.Map($("#map")[0], { center: CT, zoom: 10, mapTypeId: "roadmap" }); //map instance
	var origen = new google.maps.places.Autocomplete(elo1, cfg); //Get the autocomplete input
	var destino = new google.maps.places.Autocomplete(eld2, cfg); //Get the autocomplete input
	var distance = new google.maps.DistanceMatrixService(); //Instantiate a distance matrix
	var gc = new google.maps.Geocoder(); //translating a human-readable address into a location on a map and reverse

	map.data.addGeoJson(ES_MUN_CT);
	map.data.setStyle({ strokeColor: "#ff3333", strokeWeight: 2 });
	/*map.data.loadGeoJson("https://storage.googleapis.com/mapsdevsite/json/states.jsn", { idPropertyName: "STATE" }, function(features) { //load externs repositories
		console.log("Logging the data features:");
		// note that there is no map.data.features property, but the callback returns the array of added features
		console.log(features);
		console.log("Using map.data.forEach:");
		map.data.forEach(function(feature) { console.log(feature); });
	});*/
	var polygon = new google.maps.Polygon(); //common Polygon instance
	function eachPolygons(geometry, callback) { //iterator over al polygons
		if (geometry instanceof google.maps.Polygon) {
			polygon.setPath(geometry.getPath());
			callback(polygon);
		}
		if (geometry instanceof google.maps.Data.Polygon) {
			polygon.setPath(geometry.getAt(0).getArray());
			ok = callback(polygon);
		}
		else if (geometry instanceof google.maps.Data.MultiPolygon) {
			geometry.getArray().forEach(function(dp) { //google.maps.Data.Polygon
				polygon.setPath(dp.getAt(0).getArray()); //set Array<LatLng>
				callback(polygon); //callback polygon with new coords
			});
		}
		else {
			geometry.getArray().forEach(function(g) {
				eachPolygons(g, callback);
			});
		}
	};
	function findPolygon(geometry, callback) { //iterator over al polygons
		var ok;
		if (geometry instanceof google.maps.Polygon) {
			polygon.setPath(geometry.getPath());
			ok = callback(polygon);
		}
		if (geometry instanceof google.maps.Data.Polygon) {
			polygon.setPath(geometry.getAt(0).getArray());
			ok = callback(polygon);
		}
		else if (geometry instanceof google.maps.Data.MultiPolygon) {
			ok = geometry.getArray().some(function(dp) { //google.maps.Data.Polygon
				polygon.setPath(dp.getAt(0).getArray()); //set Array<LatLng>
				return callback(polygon); //callback polygon with new coords
			});
		}
		else {
			ok = geometry.getArray().some(function(g) {
				return findPolygon(g, callback);
			});
		}
		return ok ? polygon : null;
	};
	function processPoints(geometry, callback) { //iterator over al points
		if (geometry instanceof google.maps.LatLng)
			callback(geometry);
		else if (geometry instanceof google.maps.Data.Point)
			callback(geometry.get());
		else {
			geometry.getArray().forEach(function(g) {
				processPoints(g, callback);
			});
		}
	};

	var inCt; //user location polygon
	var geomCt = map.data.getFeatureById("ct").getGeometry();
	gc.geocode({ "componentRestrictions": { "postalCode": "30366" }, region: "es" }, function(results, status) {
		if (status !== "OK") //has error?
			return errO1("Error al obtener la ciudad de origen: " + status + "!");
		var loc = results[0].geometry.location;
		inCt = findPolygon(geomCt, function(polygon) {
			return google.maps.geometry.poly.containsLocation(loc, polygon);
		});
	});

	//Specify only the data fields that are needed.
	origen.setFields(["address_component", "place_id", "geometry", "name", "formatted_address"]);
	destino.setFields(["address_component", "place_id", "geometry", "name", "formatted_address"]);

	//Set the bounds to the map's viewport
	origen.bindTo("bounds", map);
	destino.bindTo("bounds", map);

	//When the user selects an address from the drop-down
	function fnGeometry(place) { return place && place.geometry; } //check if the place has a geometry
	function setViewport(place) { fnGeometry(place) && map.fitBounds(place.geometry.viewport); } //If the place has a geometry => present it on a map.
	function fnCountry(place) { //get the country place
		let component = place.address_components.find((address_component) => { return (address_component.types.indexOf("country") > -1); });
		return component && component.short_name;
	}
	origen.addListener("place_changed", function() { p1 = origen.getPlace(); setViewport(p1); }); //Get the place details from autocomplete
	destino.addListener("place_changed", function() { p2 = destino.getPlace(); setViewport(p2); }); //Get the place details from autocomplete

	/*********************************************************************************************/
	/************************************ tBox.js ************************************************/
	/*********************************************************************************************/

	function adderr(txt) { return !fields.attr("required", false).mbError(txt); }
	function seterr(el, txt) { $(el).focus(); return adderr(txt); }
	function errO1(txt) { return seterr(elo1, txt); }
	function addRoute(route, dist) {
		route.dist = dist; //set distance
		tbRutas.add(route).list(); //refresh table
		//reinicialize inputs and messages
		fields.unrequired().first().focus().mbFlush();
		console.log(route);
		p1 = p2 = null;
	}

	var rutas = $("input#rutas"); //input hidden for rutas
	var tbRutas = { //config routes table
		types: { dt1: dpLatin, dt2: dpLatin },
		styles: { desp: fnDesp, dist: fnDist, dt1: dfLatin, dt2: dfLatin }, 
		data: JSON.read(rutas.val()) || [],
		noBodyText: '<p class="textc">No existen pernoctas para esta solicitud.</p>',
		beforePush: function(s) { s.dist = 0; s.fMin = null; s.fMax = null; },
		onPush: function(r, s) {
			s.dist += r.dist; s.loc2 = r.loc2;
			s.fMin = lt(r.dt1, nvl(s.fMin, r.dt1));
			s.fMax = gt(r.dt2, nvl(s.fMax, r.dt2));
			r.h1 = r.h1 || r.dt1.dfMinTime();
			r.h2 = r.h2 || r.dt2.dfMinTime();
		},
		onView: function(table) {
			rutas.val(JSON.stringify(tbRutas.data)); //serializo las rutas
			$("[name='remove']", table).click(function() {
				return confirm("\277Confirma que desea desasociar este trayecto?") && !tbRutas.extract(+$(this).attr("rel")).list();
			});
		}
	};

	var n = tbRutas.data.length;
	function fnGeocodeByCp(cp) {
		gc.geocode({ "componentRestrictions": { "postalCode": cp }, region: "es" }, function(results, status) {
			if (status !== "OK") //has error?
				return errO1("Error al obtener la ciudad de origen: " + status + "!");
			console.log("ct", inCt, findPolygon(geomCt, function(polygon) {
				return google.maps.geometry.poly.containsLocation(results[0].geometry.location, polygon);
			}));
		});
	};
	function fnGeocode(place, i) {
		gc.geocode({ placeId: place.pId1 }, function(results, status) {
			if (status !== "OK") //has error?
				return errO1("Error al obtener la ciudad de origen: " + status + "!");
//console.log(results);
			place.loc1 = results[0].formatted_address;
			//setViewport(results[0]); //results[0].geometry.viewport
			(++i < n) ? fnGeocode(tbRutas.data[i], i) : $("table#rutas").tBox(tbRutas);
		});
	};

	if (n > 0) { //routes to load?
		fnGeocodeByCp("30320"); //cp ct=30310, La union=30360, Madrid=28001, fuente alamo=30320
		google.maps.event.addListenerOnce(map, "bounds_changed", function() {
			fnGeocode(tbRutas.data[0], 0);
		});
	}
	else
		$("table#rutas").tBox(tbRutas);

	$("a#loc-info").click(function() { return !$("#loc-extra").toggleClass("hide"); });
	$("a#add-ruta").click(function() {
		if (!fields.clean().attr("required", true).validate())
			return adderr("Error en los campos del itinerario");
		if (!fnGeometry(p1) || !fnGeometry(p2)) //has selected place1 and place2?
			return errO1("No ha seleccionado correctamente la ciudad de origen o la ciudad de destino!");

		//prepare place data
		var route = { desp: +val(elmt) };
		route.dt1 = route.f1 + " " + route.h1;
		route.dt2 = route.f2 + " " + route.h2;
		route.f1 = val(elf1); route.h1 = val(elh1);
		route.f2 = val(elf2); route.h2 = val(elh2);
		var dt1 = dpLatin(route.dt1);
		var dt2 = dpLatin(route.dt2);

		//validate data
		if (p1.place_id == p2.place_id)
			return errO1("La ciudad de origen y destino deben de ser distintas!");
		if (!Date.valid(dt1) || !Date.valid(dt2))
			return seterr(elf1, "Fechas de salida o llegada no es v&aacute;lida!");
		if (dt1 >= sysdate)
			return seterr(elf1, "Las fechas del itinerario deben ser anteriores a " + dfLatin(sysdate) + "!");
		if (dt1 >= dt2)
			return seterr(elf1, "La fecha de llegada debe ser posterior a la de salida!");
		if (tbRutas.stats.fMax && (dt1 < tbRutas.stats.fMax))
			return seterr(elf1, "La fecha de salida debe ser posterior a: " + dfLatin(tbRutas.stats.fMax) + "!");

		//read data location from loc1 and loc2
		route.lat1 = p1.geometry.location.lat();
		route.lng1 = p1.geometry.location.lng();
		route.lat2 = p2.geometry.location.lat();
		route.lng2 = p2.geometry.location.lng();
		route.pais1 = fnCountry(p1);
		route.pais2 = fnCountry(p1);
		route.loc1 = val(elo1);
		route.loc2 = val(eld2);
		route.pId1 = p1.place_id;
		route.pId2 = p2.place_id;

		if (route.desp == 1) //calculate distance
			distance.getDistanceMatrix({
				origins: [p1.geometry.location],
				destinations: [p2.geometry.location],
				travelMode: "DRIVING"
			}, function(res, status) {
				if (status !== "OK")
					return errO1("The calculated distance fails due to " + status);
				var origins = res.originAddresses;
				var destinations = res.destinationAddresses;
				for (var i = 0; i < origins.length; i++) {
					var results = res.rows[i].elements;
					for (var j = 0; j < results.length; j++) {
						var element = results[j];
						addRoute(route, element.distance.value);
					}
				}
			});
		else
			addRoute(route, 0);
		return false;
	});
}
