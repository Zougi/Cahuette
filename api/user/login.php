<?php
require '../lib.php';
header('Content-type: application/json');
session_start();

$def_login = 'max';
$def_password = 'maxime';

if (isset($_GET['login']) && isset($_GET['password'])
		&& $_GET['login'] == $def_login && $_GET['password'] == $def_password) {
	$_SESSION['token'] = uniqid() + rand(1000000000, 2000000000);
	display_json(array('token' => $_SESSION['token']));
} else {
	display_error(401);
}
?>