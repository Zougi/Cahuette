<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

ini_set('display_errors', 'On');
error_reporting(E_ALL);

//remove section from gallery
function remove_section($gallery, $post_section) {
	foreach ($gallery as $section_name => $section) {
		if ($section_name == $post_section) {

			foreach ($section as $n => $img) {
				echo var_dump($img['url']);
				unlink('../../' . $img['url']);
			}
			unset($gallery[$section_name]);
			break;
		}
	}
	save_gallery_json($gallery);
}

//remove images from gallery's section
function remove_images($gallery, $post) {
	foreach ($gallery as $section_name => $section) {
		if ($section_name == $post['section']) {
			
			foreach ($section as $n => $img) {
				foreach ($post as $post_name => $url) {
					
					if (strrpos($post_name, 'url') == 0) {
						if ($img['url'] == $url) {
							unlink('../../' . $img['url']);
							unset($gallery[$section_name][$n]);
							break;
						}	
					}
					
				}
			}
			break;
		}
	}
	save_gallery_json($gallery);
}

//main
if (isset($_POST['token']) && isset($_POST['section'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
		$gallery = load_gallery_json();
		if (isset($_POST['url0'])) {
			remove_images($gallery, $_POST);
		} else {
			remove_section($gallery, $_POST['section']);
		}
		display_success();
	}
} else {
	display_error(400);
}