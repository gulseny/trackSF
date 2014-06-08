//obtain sf-muni routes data and create route object
$.ajax({
	url: "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni",
	type: "GET",
	dataType: 'xml',
	success: function(data){
		console.log('successfully retrieved data');
		populateRoutes(data);
		console.log('routes assigned: ', routesAll);
	},
	error: function(error){
		console.log('error retrieving data', error);
	}
});

var routesAll = {};
var populateRoutes = function(data){

	$(data).find('route').each(function(){
		var route = $(this).attr('tag');
		routesAll[route] = {
			title: $(this).attr('title')
		};
	});

	var colors = d3.scale.category20();
	
	for(var route in routesAll){
		//assign color to each route
		var random = Math.floor(Math.random() * 20);
		routesAll[route].color = colors(random);
		//assign vehicle type to each route
		if(routesAll[route].tag === '59' || routesAll[route].tag === '60' || routesAll[route].tag === '61'){
			routesAll[route].type = 'cable';
		} else if(routesAll[route].tag === 'F' || routesAll[route].tag === 'J' || routesAll[route].tag === 'KT' || routesAll[route].tag === 'L' ||
			routesAll[route].tag === 'M' || routesAll[route].tag === 'N' || routesAll[route].tag === 'NX') {
			routesAll[route].type = 'metro';
		} else {
			routesAll[route].type = 'bus';
		}
	}

	console.log('routesAll', routesAll);

	return routesAll;
};