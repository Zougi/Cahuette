<?php
$file = '../../gallery.json';
	
function display_json($a) {
	echo json_encode($a, JSON_FORCE_OBJECT);
}

function display_error($code) {
	display_json(array(
	    "error" => $code
	));
}

function display_success() {
	display_json(array(
		"response" => "success"
	));
}

function load_gallery_json() {
	global $file;
	if (($handle = fopen($file, 'r')) == false) {
		return null;
	}
	$data = fread($handle, filesize($file));
	$json = json_decode($data, JSON_FORCE_OBJECT);
	fclose($handle);
	return $json;
}

function save_gallery_json($gallery) {
	global $file;
	if (($handle = fopen($file, 'w')) == false) {
		return false;
	}
	$text = json_encode($gallery);
	fwrite($handle, $text);
	fclose($handle);
	return true;
}

?>