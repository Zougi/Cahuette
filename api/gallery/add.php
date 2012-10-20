<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

ini_set('display_errors', 'On');
error_reporting(E_ALL);

//add an image to the json gallery.
//1st arg: string section.
//2nd arg: json_decode('{ "name": "totoooooo", "url": "gallery/613822jdp8j4.jpg" }', true);
function add_to_gallery_json($section, $img_json) {
	$inObj = false;
  $gallery = load_gallery_json();
	foreach ($gallery as $key => $value) {
		if ($section == $key && $inObj == false) {
			array_push($gallery[$section], $img_json);
			$inObj = true;
		}
	}
	//create new section
	if ($inObj == false) {
		array_push($gallery, $section);
		foreach ($imgz_json as $key => $value) {
			array_push($gallery[$section], $value);
		}
	}
	save_gallery_json($gallery);
}

if (isset($_POST['token']) && isset($_POST['section'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
		foreach ($_FILES as $key => $value) {
			$filename = uniqid() . '.' . pathinfo($value['name'], PATHINFO_EXTENSION);
			move_uploaded_file($value['tmp_name'], '../../gallery/' . $filename);
			add_to_gallery_json($_POST['section'], (object)array(
			    "name" => pathinfo($value['name'], PATHINFO_BASENAME),
			    "url" => 'gallery/' . $filename,
			));
		}
		display_success();
	}
} else {
	display_error(400);
}
?>