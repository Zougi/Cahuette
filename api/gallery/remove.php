<?php
if (isset($_GET['token']) && $_GET['token'] == $_SESSION['token'] && isset($_GET['url'])) {
	foreach ($gallery as $key => $value) {
		if ($value->url == $_GET['url']) {
			$file = '../../' . $value;
			$json = $gallery[$key];
			break;
		}
	}
	var_dump($json);
		var_dump($file);
//	unset($json);
//	unlink($file);
}
?>