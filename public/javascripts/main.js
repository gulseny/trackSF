$(document).ready(function(){

	//add containing svg to the page
	var width = 3000;
	var height = 1800;
	var svg = d3.select('.map')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'map');

	//add map to the svg container
	d3.json('/assets/streets.json', function(error, json){
		if(error) {
			console.log('error loading map');
		} else {
			console.log('map load: successful');
			var projection = d3.geo.mercator().scale(650000).center(d3.geo.centroid(json)).translate([width/3, height/2]);
			var path = d3.geo.path().projection(projection);
			svg.selectAll('path')
               .data(json.features)
               .enter()
               .append('path')
               .attr('d', path)
               .attr('stroke', 'black')
               .attr('stroke-width', '0.5px');

			//storage objects for routes and vehicles
			var routes = {};
			var routesList = [];
            var vehicleIds = [];
            var vehicles = [];
            var selectedRoutes = [];

            //obtain sf-muni routes data and populate routes object
			var getRoutes = function(){
				$.ajax({
					url: "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni",
					type: "GET",
					dataType: 'xml',
					success: function(data){
						console.log('successfully retrieved routes data');
						populateRoutes(data);
						populateDropDown();
						getLocations();
						setInterval(function(){ getLocations();}, 15000);
					},
					error: function(error){
						console.log('error retrieving routes data', error);
					}
				});
			};

			var populateRoutes = function(data){
				console.log('populatedRoutes data: ', data);
				$(data).find('route').each(function(){
					var route = $(this).attr('tag');
					var title = $(this).attr('title');
					routes[route] = {
						title: title,
						tag: route
					};
					routesList.push(route);
				});

				var colors = d3.scale.category20();
				
				for(var route in routes){
					console.log(routes[route]);
					//assign vehicle type to each route
					if(routes[route].tag === '59' || routes[route].tag === '60' || routes[route].tag === '61'){
						routes[route].type = 'cable';
					} else if(routes[route].tag === 'F' || routes[route].tag === 'J' || routes[route].tag === 'KT' || routes[route].tag === 'L' ||
						routes[route].tag === 'M' || routes[route].tag === 'N' || routes[route].tag === 'NX') {
						routes[route].type = 'train';
					} else {
						routes[route].type = 'bus';
					}
					//assign color to each route
					var random = Math.floor(Math.random() * 20);
					routes[route].color = colors(random);
				}
				console.log('routes populated: ', routes);
			};

			var populateDropDown = function(){
				var $list = $('.list');
				$list.append('<select class="selectpicker" multiple title="please select your routes" data-live-search=true data-style="btn-success"></select>');

				var $select = $('select');

				$select.append('<optgroup class="cables" label="cable cars">' + '</optgroup>');
				$select.append('<optgroup class="trains" label="trains">' + '</optgroup>');
				$select.append('<optgroup class="busses" label="busses">' + '</optgroup>');
				var $cables = $('.cables');
				var $trains = $('.trains');
				var $busses = $('.busses');

				var type = 0;
				for(var i = 0; i < routesList.length; i++){
					console.log(routes[routesList[i]]);
					if(routes[routesList[i]].type === 'cable'){
						type = $cables;
					} else if(routes[routesList[i]].type === 'train'){
						type = $trains;
					} else {
						type = $busses;
					}
					type.append('<option>' + routes[routesList[i]].title + '</option>');					
				}

				//enable bootstrap-select
				$select.selectpicker();

				//add event listener for filtering
				var $selection = $('.selectpicker');
				$selection.on('change', filterVehicles);
				console.log('drop down populated');
			};

			var filterVehicles = function(){
				// var selectedOptions = $('.selectpicker option:selected');
				// for(var i = 0; i < selectedOptions.length; i++){
				// 	selectedRoutes.push(selectedOptions[i].className);
				// }
			};

            //get vehicle locations from the server
			var getLocations = function() {
				var url = 'http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni';
				var time = Math.round(new Date().getTime()/1000);
				var route = [1, "N", "J"];

				for(var i = 0; i < route.length; i++){
					$.ajax({
						url: url + "&t=" + time,
						type: "GET",
						dataType: 'xml',
						success: function(data){
							console.log('successfully retrieved vehicle locations data: ', data);
							var vehicleInfo = getVehicleInfo(data);
							showVehicles(vehicleInfo);
						},
						error: function(error){
							console.log('error retrieving data', error);
						}
					});
				}
			};

			var locationsCall = function(){};

			//parse xml response to populate vehicle locations data
            var getVehicleInfo = function(data){
                console.log('get vehicle info returned data: ', data);
                $(data).find('vehicle').each(function(){
                    var route = $(this).attr('routeTag');
                    var id = $(this).attr('id');
                    var index = vehicleIds.indexOf(id);

                    if(index === -1){
                        vehicleIds.push(id);
                        var aVehicle = {
                            id: id,
                            route: route,
                            dir: $(this).attr('dirTag'),
                            lon: $(this).attr('lon'),
                            lat: $(this).attr('lat'),
                            color: routes[route].color
                        };
                        vehicles.push(aVehicle);
                    } else {
                        vehicles[index].route = $(this).attr('routeTag');
                        vehicles[index].dir = $(this).attr('dirTag');
                        vehicles[index].lon = $(this).attr('lon');
                        vehicles[index].lat = $(this).attr('lat');
                    }
                });
                console.log('vehicle data populated: ', vehicles);              
                return vehicles;
            };

            //display vehicles on the map
            var showVehicles = function(data){
                var vehicles = svg.selectAll('circle')
                   .data(data);

                vehicles.transition().ease('linear').duration(3000)
                    .attr('cx', function(d){return projection([d.lon, d.lat])[0];})
                    .attr('cy', function(d){return projection([d.lon, d.lat])[1];});

                vehicles.enter().append('circle')
                   .attr('cx', function(d){return projection([d.lon, d.lat])[0];})
                   .attr('cy', function(d){return projection([d.lon, d.lat])[1];})
                   .attr('r', 10)
                   .attr('fill', function(d){ return d.color;})
                   .attr('class', function(d){ return d.route + ' unfiltered';})
                   .attr('stroke', 'black');

                vehicles.exit().remove();

                vehicles = svg.selectAll('text')
                   .data(data);

                vehicles.transition().ease('linear').duration(3000)
                   .attr('x', function(d){return projection([d.lon, d.lat])[0];})
                   .attr('y', function(d){return projection([d.lon, d.lat])[1]+3;});

                vehicles.enter().append('text')
                   .text(function(d){return d.route;})
                   .attr('x', function(d){return projection([d.lon, d.lat])[0];})
                   .attr('y', function(d){return projection([d.lon, d.lat])[1]+3;})
                   .attr('font-size', '9px')
                   .attr('text-anchor', 'middle');

                console.log('vehicles displayed on the map');
            };

            //initial call to get routes populated
            getRoutes();

            //initial call to display vehicles
            // getLocations();

            //update vehicle locations periodically
            // setInterval(function(){
            //     getLocations();
            // }, 11000);
        }
	});


});
