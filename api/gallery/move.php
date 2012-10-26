<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['token']) && isset($_POST['section']) && isset($_POST['move'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
		$gallery = load_gallery_json();
		
		if (isset($_POST['url'])) {
			foreach ($gallery as $section_name => $section) {
				foreach ($section as $n => $img) {
					if ($img['url'] == $_POST['url']) {
						if ($_POST['move'] == "up") {

						} else if ($_POST['move'] == "down") {

						}
						save_gallery_json($gallery);
						break;
					}
				}
			}
		} else { //move section
			
		}
		
		display_success();
	}
} else {
	display_error(400);
}