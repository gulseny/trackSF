$(document).ready(function(){

	//add containing svg to the page
	var width = 1500;
	var height = 1000;

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
			var projection = d3.geo.mercator().scale(300000).center(d3.geo.centroid(json)).translate([width/4, height/2]);
			var path = d3.geo.path().projection(projection);
			svg.selectAll('path')
               .data(json.features)
               .enter()
               .append('path')
               .attr('d', path)
               .attr('stroke', 'black')
               .attr('stroke-width', '0.5px');

            getLocations();
        }
	});

	//get vehicle locations from the server
	var getLocations = function() {
		$.ajax({
			url: "http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r=N&t=1144953500233",
			type: "GET",
			dataType: 'xml',
			success: function(data){
				console.log('successfully retrieved data');
				getCoordinates(data);
			},
			error: function(error){
				console.log('error retrieving data', error);
			}
		});
	};

});
