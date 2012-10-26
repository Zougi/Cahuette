<?php
$path_gallery = '../../storage/gallery.json';
	
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

function load_json($file) {
	$json = null;
	if (($handle = fopen($file, 'r')) == false) {
		return null;
	}
	if (($filesize = filesize($file)) > 0) {
		$data = fread($handle, $filesize);
		$json = json_decode($data, JSON_FORCE_OBJECT);
	}
	fclose($handle);
	return $json;
}

function load_gallery_json() {
	global $path_gallery;
	return load_json($path_gallery);
}

function load_text_json() {
	global $path_text;
	return load_json($path_text);
}

function save_json($file, $obj) {
	if (($handle = fopen($file, 'w')) == false) {
		return false;
	}
	$text = json_encode($obj);
	fwrite($handle, $text);
	fclose($handle);
	return true;
}

function save_gallery_json($gallery) {
	global $path_gallery;
	return save_json($path_gallery, $gallery);
}

function save_text_json($obj_text) {
	global $path_text;
	return save_json($path_text, $obj_text);
}
?>