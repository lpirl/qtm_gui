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
	var values = [];
	$(
		'input[type="checkbox"]:checked'
	).filter(
		'[name="' + name + '"]'
	).each(function(){
		values.push($(this).val());
	});
	return values;
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
		'name=', (script=='queryinmap' ? name : ''),
		'&',
		'key=', key,
		'&',
		'value=', (key ? value : ''),
		'&',
		'types=', types.join('-'),
	].join('');
}

function sanitive_inputs(){
	$('input[name="search_name"]').each(function(){
		if( ! $(this).val() ) {
			console.log("should_update");
			$(this).val('*');
		}
	});
}

function initialize_url_generation(map){
	var	source_projection = new OpenLayers.Projection("EPSG:900913"),
		target_projection = new OpenLayers.Projection("EPSG:4326");
	$('#link a').on('click', function(){
		sanitive_inputs();
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
		input_and_label("search_value").fadeTo(
			'slow',
			Number( $(e.target).val() != '' )
		);
	}).trigger('keyup');
}

$(document).ready(function(){
	var map = initialize_map();
	initialize_url_generation(map);
	initialize_select_text_on_focus();
	initialize_adapt_form_to_script();
	initialize_adapt_form_to_key();
	initialize_open_map_on_submit();
});
