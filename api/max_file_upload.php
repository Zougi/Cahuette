<?php
require 'lib.php';
header('Content-type: application/json');
session_start();

if (isset($_POST['token'])) {
	display_json(array(
	    "limit" => ini_get("max_file_uploads")
	));
} else {
	display_error(400);
}
?>