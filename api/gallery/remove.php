<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['token']) && isset($_POST['section'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
		$gallery = load_gallery_json();
		if (isset($_POST['url0'])) { //remove images from section
			
			foreach ($gallery as $section_name => $section) {
				foreach ($section as $n => $img) {
					foreach ($_POST as $post_name => $url) {
						if (strrpos($post_name, 'url') == 0) {
							if ($img['url'] == $url) {
								unlink('../../' . $img['url']);
								unset($gallery[$section_name][$n]);
								save_gallery_json($gallery);
								break;
							}	
						}
					}
				}
			}
			
		} else { //remove section
			foreach ($gallery as $section_name => $section) {
				foreach ($section as $n => $img) {
					unlink('../../' . $img['url']);
				}
			}
			unset($gallery[$section_name]);
			save_gallery_json($gallery);
		}
		display_success();
	}
} else {
	display_error(400);
}