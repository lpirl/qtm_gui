function initialize_map(){
	var urls = [
		"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
		"http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
		"http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
	];

	var map = new OpenLayers.Map({
		div: "map",
		layers: [
			new OpenLayers.Layer.XYZ("OSM", urls, {
				transitionEffect: "resize", buffer: 2, sphericalMercator: true,
				attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
			}),
		],
		controls: [
			new OpenLayers.Control.Navigation({
				dragPanOptions: {
					enableKinetic: true
				}
			}),
			new OpenLayers.Control.PanZoom(),
			new OpenLayers.Control.Attribution()
		],
		center: [0, 0],
		zoom: 3
	});
	return map;
}

function retrieve_checkbox_values(name){
	return	$(
				'input[type="checkbox"]:checked'
			).filter(
				'[name="' + name + '"]'
			).map(
				function(){return $(this).val()}
			).get(
			);
}

function build_qtm_url(script, bbox, name, key, value, types){
	if( !script ) return;
	if( !bbox ) return;
	if( !types ) return;
	return [
		'http://toolserver.org/~kolossos/qtm2/',
		script, '.php?',
		'BBOX=', bbox,
		'&',
		'name=', (script=='queryinmap' ? encodeURIComponent(name) : ''),
		'&',
		'key=', encodeURIComponent(key),
		'&',
		'value=', (key ? encodeURIComponent(value) : ''),
		'&',
		'types=', types.join('-'),
	].join('');
}

function sanitize_inputs(){
	$('input[name="search_name"]').each(function(){
		if( ! $(this).val() ) {
			$(this).val('*');
		}
	});
}

function initialize_url_generation(map){
	var	source_projection = new OpenLayers.Projection("EPSG:900913"),
		target_projection = new OpenLayers.Projection("EPSG:4326");
	$('#link a').on('click', function(){
		sanitize_inputs();
		var	bbox =	map.getExtent(
					).transform(
						source_projection,
						target_projection
					).toBBOX(
					),
			url = build_qtm_url(
				$('input[name="script_to_query"]:checked').val(),	// script
				bbox,												// bbox
				$('input[name="search_name"]').val(),				// name
				$('input[name="search_key"]').val(),				// key
				$('input[name="search_value"]').val(),				// value
				retrieve_checkbox_values('types')
			);
		if( url ) $('#link').show('slow').find('a').attr('href', url);
	});
}

function initialize_select_text_on_focus(){
	$("input[type=text]").on('focus', function(){
		this.select();
	});
}

function initialize_adapt_form_to_script(){
	$('input[name="script_to_query"]').on('change', function(){
		var	name_input = input_and_label("search_name");
		name_input.fadeTo(
			'slow',
			Number( $(this).filter(':checked').val() != 'featurelist' )
		);
	}).trigger('change');
}

function initialize_open_map_on_submit(){
	$('input').on('keypress', function(e){
		if( e.which == 13 ) {
			$('#link a')[0].click();
			e.preventDefault();
		}
	});
}

function input_and_label(name){
	return $(
		'input[name="' + name + '"]'
	).add(
		'label[for="' + name + '"]'
	);
}

function initialize_adapt_form_to_key(){
	$('input[name="search_key"]').on('keyup', function(e){
		input_and_label(
			"search_value"
		).fadeTo(
			'slow',
			Number( $(e.target).val() != '' ),
			function(){$(this).not(':visible').blur()}
		);
	}).trigger('keyup');
}

function initialize_toggle_popup() {
	$('a.toggle_popup').on('click', function(e){
		$(e.target).closest('a').attr('href', document.URL);
		if( !window.is_popup ){
			var new_window = window.open(
				document.URL,
				document.title,
				'height=500,width=900'
			);
			if (window.focus) {new_window.focus()}
			new_window.is_popup = true;
			e.preventDefault();
		}

		// next line fixes strange behavior of chromium
		// see http://productforums.google.com/forum/#!topic/chrome/GjsCrvPYGlA
		window.open('','_self');
		window.close();
	});
}

function request_for_taginfo(request, include_key){
	if( typeof include_key == 'undefined' ) include_key = false;

	request.sortname = 'count_all';
	request.sortorder = 'desc';
	request.rp = '10';
	request.page = '1';
	if( request.term ) request.query = request.term;

	if( include_key ) request.key = $('input[name="search_key"]').val();

	return request
}

function taginfo_json_to_results(json, property_name){
	return	$(
				json.data
			).map(
				function(){return this[property_name]}
			).get(
			).reverse(
			);
}

function taginfo_request_url(path) {
	return "http://taginfo.openstreetmap.org/api/4/" + path + "?callback=?";
}

function initialize_key_autocomplete(){
	$('input[name="search_key"]').autocomplete({
		minLength: 1,
		position: {my: "left bottom", at: "left top",},
		source: function(request, response ) {
			$.getJSON(
				taginfo_request_url("keys/all"),
				request_for_taginfo(request),
				function(json) {
					response(taginfo_json_to_results(json, 'key'));
				}
			);
		}
	});
}

function initialize_value_autocomplete(){
	$('input[name="search_value"]').autocomplete({
		minLength: 1,
		position: {my: "left bottom", at: "left top",},
		source: function(request, response ) {
			$.getJSON(
				taginfo_request_url("key/values"),
				request_for_taginfo(request, true),
				function(json) {
					response(taginfo_json_to_results(json, 'value'));
				}
			);
		}
	});
}

$(document).ready(function(){

	// fixes bug w/ popups in chromium
	// see http://lists.osgeo.org/pipermail/openlayers-users//2012-January/023757.html
	$('#map').css({width: '100%', height: '100%'});

	var map = initialize_map();
	initialize_url_generation(map);
	initialize_select_text_on_focus();
	initialize_adapt_form_to_script();
	initialize_adapt_form_to_key();
	initialize_open_map_on_submit();
	initialize_toggle_popup();
	initialize_key_autocomplete();
	initialize_value_autocomplete();
});
