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

	if ($gallery != null) {
		foreach ($gallery as $key => $value) {
			if ($section == $key && $inObj == false) {
				$gallery[$section] = array_merge($gallery[$section], $img_json);
				$inObj = true;
				break;
			}
		}
	}
	//create new section
	if ($inObj == false) {
		//is first section
		if ($gallery == null) {
			$gallery = array();
		}
		$gallery[$section] = $img_json;
	}
	save_gallery_json($gallery);
}

$errors = array();
$fileTypes = array('jpg','jpeg','gif','png', 'bmp');
//return tab[url & name]
function save_files_to_disk($files) {
	global $errors, $fileTypes;
	
	$gallery_path = '../../gallery/';
	$gallery_virtual_path = 'gallery/';
	foreach ($files as $key => $value) {
		$extension = pathinfo($value['name'], PATHINFO_EXTENSION);
		$name = pathinfo($value['name'], PATHINFO_BASENAME);
		if (in_array($extension, $fileTypes)) {
			$filename = uniqid() . '.' . $extension;
			move_uploaded_file($value['tmp_name'], $gallery_path . $filename);
			$img_json[] = (object)array(
			    "name" => $name,
			    "url" => $gallery_virtual_path . $filename,
			);
		} else {
			$errors[] = ($name . " upload failed. ");
		}
	}
	return $img_json;
}

//main
if (!empty($_FILES) && isset($_POST['token']) && isset($_POST['section'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
		$img_json = save_files_to_disk($_FILES);
		add_to_gallery_json($_POST['section'], $img_json);
		if (sizeof($errors) == 0) {
			display_success();	
		} else {
			display_error($errors . "Format must be: jpg, jpeg, gif, png or bmp");
		}
	}
} else {
	display_error(400);
}
?>