//add the map to the page
var width = 1500;
var height = 1000;

var svg = d3.select('body')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'map');


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
	}
});

