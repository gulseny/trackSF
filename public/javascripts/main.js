$(document).ready(function(){

	//add containing svg to the page
	var width = 2000;
	var height = 2000;

	var svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'map');


	//add map to the svg container
	d3.json('/assets/streets.json', function(error, json){
		if(error) {
			console.log('error loading map');
		} else {
			console.log('success');
			var projection = d3.geo.mercator().scale(500000).center(d3.geo.centroid(json)).translate([width/3, height/3]);
			var path = d3.geo.path().projection(projection);
			svg.selectAll('path')
               .data(json.features)
               .enter()
               .append('path')
               .attr('d', path)
               .attr('stroke', 'black')
               .attr('stroke-width', '0.5px');

            //get vehicle locations from the server
			var getLocations = function() {
				var url = 'http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni';
				var time = Math.round(new Date().getTime()/1000);
				var route = [1];

				for(var i = 0; i < route.length; i++){
					$.ajax({
						url: url + "&t=" + time,
						type: "GET",
						dataType: 'xml',
						success: function(data){
							console.log('successfully retrieved data');
							var vehicleInfo = getVehicleInfo(data);
							showVehicles(vehicleInfo);
						},
						error: function(error){
							console.log('error retrieving data', error);
						}
					});
				}


			};

			//storage objects for vehicle
            var vehicleIds = [];
            var vehicles = [];

			//parse vehicle locations data
            var getVehicleInfo = function(data){
                console.log('returned data: ', data);

                $(data).find('vehicle').each(function(){

                    //assign color to the route of the vehicle
                    var route = $(this).attr('routeTag');

                    // populate/update storage objects based on returned data
                    var id = $(this).attr('id');

                    var index = vehicleIds.indexOf(id);
                    if(index === -1){
                    	console.log('creating vehicle object')
                        vehicleIds.push(id);
                        var aVehicle = {
                            id: id,
                            route: route,
                            dir: $(this).attr('dirTag'),
                            lon: $(this).attr('lon'),
                            lat: $(this).attr('lat'),
                            color: routesAll[route].color
                        };
                        vehicles.push(aVehicle);
                    } else {
                        console.log('updating vehicles object for ', vehicles[index].id, ' ', vehicles[index].lon === $(this).attr('lon'), ' ', vehicles[index].lat === $(this).attr('lat'));
                        vehicles[index].route = $(this).attr('routeTag');
                        vehicles[index].dir = $(this).attr('dirTag');
                        vehicles[index].lon = $(this).attr('lon');
                        vehicles[index].lat = $(this).attr('lat');
                    }
                });
                
                console.log('vehicles: ', vehicles);
                return vehicles;
            };

            //display vehicles on the map
            var showVehicles = function(data){
                var vehicles = svg.selectAll('circle')
                   .data(data);

                vehicles.transition().ease('linear').duration(5000)
                    .attr('cx', function(d){return projection([d.lon, d.lat])[0];})
                    .attr('cy', function(d){return projection([d.lon, d.lat])[1];});

                vehicles.enter().append('circle')
                   .attr('cx', function(d){return projection([d.lon, d.lat])[0];})
                   .attr('cy', function(d){return projection([d.lon, d.lat])[1];})
                   .attr('r', 10)
                   .attr('fill', function(d){ return d.color;})
                   .attr('stroke', 'black');

                vehicles.exit().remove();

                vehicles = svg.selectAll('text')
                   .data(data);

                vehicles.transition().ease('linear').duration(5000)
                   .attr('x', function(d){return projection([d.lon, d.lat])[0];})
                   .attr('y', function(d){return projection([d.lon, d.lat])[1];});

                vehicles.enter().append('text')
                   .text(function(d){return d.route;})
                   .attr('x', function(d){return projection([d.lon, d.lat])[0];})
                   .attr('y', function(d){return projection([d.lon, d.lat])[1];})
                   .attr('font-size', '9px')
                   .attr('text-anchor', 'middle');
            };

            //initial call to display vehicles
            getLocations();

            // setTimeout(function(){
            //     getLocations();
            // }, 11000);
            // setTimeout(function(){
            // 	getLocations();
            // }, 22000);
            // setTimeout(function(){
            // 	getLocations();
            // }, 33000);
            // setTimeout(function(){
            // 	getLocations();
            // }, 44000);

            //update vehicle locations periodically
            // setInterval(function(){
            //     getLocations();
            // }, 11000);
        }
	});


});
