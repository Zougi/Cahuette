<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

if (isset($_POST['token']) && isset($_POST['new_text'])) {
	if ($_POST['token'] != $_SESSION['token']) {
		display_error("invalid token");
	} else {
	
	}
}

?>