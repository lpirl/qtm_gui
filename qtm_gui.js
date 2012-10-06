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
		'name=', name,
		'&',
		'key=', key,
		'&',
		'value=', value,
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
	$('input').on('change', function(){
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

$(document).ready(function(){
	var map = initialize_map();
	initialize_url_generation(map);
	initialize_select_text_on_focus();
	//TODO: initialize_open_map_on_submit();
});
