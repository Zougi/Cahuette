<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

ini_set('display_errors', 'On');
error_reporting(E_ALL);

function swap_array(&$a, $elem, $elem2) {
	$tmp = $a[$elem];
	$a[$elem] = $a[$elem2];
	$a[$elem2] = $tmp;
}

function move_image($gallery, $section, $url, $move) {
	foreach ($gallery as $s => $v) {
		if ($s == $section) {
			for ($i = 0; $i < sizeof($gallery[$s]); $i++) {
				if ($gallery[$s][$i]['url'] == $url) {
					if ($move == "up" && isset($gallery[$s][$i - 1])) {
						swap_array($gallery[$s], $i, $i - 1);
					} else if ($move == "down" && isset($gallery[$s][$i + 1])) {
						swap_array($gallery[$s], $i, $i + 1);
					}
					save_gallery_json($gallery);
					break;
				}
			}
			break;
		}
	}
}
// 
// function move_section($gallery, $section, $move) {
// 	foreach ($gallery as $s => $v) {
// 		if ($gallery[$s] == $section) {
// 			if ($move == "up" && isset($gallery[$s - 1])) {
// 				swap_array($gallery, $gallery[$s], $gallery[$s - 1]);
// 			} else if ($move == "down" && isset($gallery[$s + 1])) {
// 				swap_array($gallery, $gallery[$s], $gallery[$s + 1]);
// 			}
// 			save_gallery_json($gallery);
// 			break;
// 		}
// 	}
// }

if (isset($_POST['token']) && isset($_POST['section']) && isset($_POST['move'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
		$gallery = load_gallery_json();
		
		if (isset($_POST['url'])) {
			move_image($gallery, $_POST['section'], $_POST['url'], $_POST['move']);
		} else {
			//move_section($gallery, $_POST['section'], $_POST['move']);
		}
		display_success();
	}
} else {
	display_error(400);
}
?>