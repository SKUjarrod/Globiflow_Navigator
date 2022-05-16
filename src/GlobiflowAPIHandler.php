<?php
require __DIR__ . '\..\vendor\autoload.php';

$client_id = "globiflownav";
$client_secret = "yn4Lg5ytBtPO8HRu5irHoP3kb7HLmwmBLMEhhpgUmfcKgFLCMKe5OFXC6lHlRtui";
$app_id = "27204671";
$app_token = "c1f9def98286b1ed52871b80c4e2711b";


Podio::setup($client_id, $client_secret);
Podio::authenticate_with_app($app_id, $app_token);
$items = PodioItem::filter($app_id);

print "My app has ".count($items)." items";




?>