//obtain sf-muni routes data and create route object
$.ajax({
	url: "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni",
	type: "GET",
	dataType: 'xml',
	success: function(data){
		console.log('successfully retrieved data');
		populateRoutes(data);
		populateDropDown();
		console.log('routes assigned: ', routesAll);
	},
	error: function(error){
		console.log('error retrieving data', error);
	}
});

var routesAll = {};
var routesList = [];

var populateRoutes = function(data){

	$(data).find('route').each(function(){
		var route = $(this).attr('tag');
		var title = $(this).attr('title');
		routesAll[route] = {
			title: title
		};

		routesList.push(title);
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
	console.log('routesList', routesList, routesList.length);

	return routesAll;
};

var populateDropDown = function(){
	var $list = $('.list');
	$list.append('<select class="selectpicker" multiple title="trains" data-live-search=true></select>');

	var $select = $('select');

	$select.append('<optgroup class="cables" label="cable cars">' + '</optgroup>');
	var $cables = $('.cables');
	for(var k = 78; k < 81; k++){
		$cables.append('<option>' + routesList[k] + '</option>');
	}

	$select.append('<optgroup class="trains" label="trains">' + '</optgroup>');
	var $trains = $('.trains');
	for(var i = 0; i < 7; i++){
		$trains.append('<option>' + routesList[i] + '</option>');
	}

	$select.append('<optgroup class="busses" label="busses">' + '</optgroup>');
	var $busses = $('.busses');
	for(var j = 7; j < 78; j++){
		$busses.append('<option>' + routesList[j] + '</option>');
	}


	//enable bootstrap-select
	$('select').selectpicker();
};


