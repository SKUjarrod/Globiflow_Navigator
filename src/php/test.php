<?php
// need to figure out how to handle a http request to other page or this page

print_r($_GET);

$var = "test";

header('Content-Type: application/json');

echo json_encode($var); 


?>