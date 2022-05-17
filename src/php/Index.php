<?php
require_once __DIR__ . '\..\..\vendor\autoload.php';
require_once __DIR__ . '\GlobiflowAPIHandler.php';


// checks if server is https or not and then sends it into dashboard directory. This dir doesnt exist in current layout but did in default htdocs
// if (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) {
//     $uri = 'https://';
// } else {
//     $uri = 'http://';
// }
// $uri .= $_SERVER['HTTP_HOST'];
// header('Location: '.$uri.'/dashboard/');
// exit;


// display html
$file = "C:/xampp/htdocs/src/html/index.html";
echo file_get_contents($file);
//




?>