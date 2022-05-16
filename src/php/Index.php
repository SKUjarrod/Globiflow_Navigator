<!-- <head>
    <link rel="stylesheet" href="src/styles.css" type="text/css"/>
    <script src="node_modules/two.js/build/two.min.js"></script>
    <script src="node_modules/two.js/extras/js/zui.js"></script>
</head> -->


<?php
require_once __DIR__ . '\..\..\vendor\autoload.php';

// display html
// $file = "src\html\index.html";


$doc = new DOMDocument('1.0');
// @$doc->LoadHTMLFile($file);

$root = $doc->createElement('html');
$root = $doc->appendChild($root);

$head = $doc->createElement('head');
$head = $root->appendChild($head);

// $root->appendChild('
// <link rel="stylesheet" href="src/styles.css" type="text/css"/>
// <script src="node_modules/two.js/build/two.min.js"></script>
// <script src="node_modules/two.js/extras/js/zui.js"></script>
// ');

$body = $doc->createElement('body');
$body = $root->appendChild($body);

// $text = $doc->createTextNode('This is the title');
// $text = $title->appendChild($text);

echo $doc->saveHTML();
//


?>

<!-- 
<script src="src/Action.js"></script>
<script src="src/ElementSizes.js"></script>
<script src="src/FileIO.js"></script>
<script src="src/Search.js"></script>
<script src="src/GlobiflowDataStructure.js"></script>
<script src="src/GlobiflowXMLParser.js"></script>
<script src="src/Data_Functions.js"></script>
<script src="src/Object_Functions.js"></script>
<script src="src/SceneManager.js"></script>
<script src="src/Main.js"></script> 
-->