<?php
require_once __DIR__ . '\..\..\vendor\autoload.php';
require_once __DIR__ . '\Secrets.php';
require_once __DIR__ . '\SessionManager.php';


///////////////////////////////////////
//       Get Request Routing         //
///////////////////////////////////////

Podio::setup($client_id, $client_secret, array(
  "session_manager" => "PodioBrowserSession"
));

if (Podio::is_authenticated() && count($_GET) > 0 ) {
  switch ($_GET["apiType"]) {

    case "getSpace":

      $spacesRaw = PodioSpace::get_for_org($mainOrgID);

      $spaces = array();
      foreach ($spacesRaw as $spaceKey => $spaceValue) {
        $apps = array();

        $appsRaw = PodioApp::get_for_space($spaceValue->__get("space_id"));
        foreach ($appsRaw as $appKey => $appValue) {

          $appDetail = array(
            "appID" => $appValue->__get("app_id"),
            "appName" => $appValue->__get("config")["name"],
            "flows" => null
          );
          
          for ($app=0; $app < count($appsRaw); $app++) { 
            $flowsRaw = PodioFlow::get("2934015");
            // $flowsRaw = PodioFlow::get($appDetail["appID"]);

            $flows = array();
          }

          $apps[] = $appDetail;



        }

        $spaces[] = array(
          "spaceName" => $spaceValue->__get("name"),
          "spaceApps" => $apps
        );

      }
      



      echo json_encode($spaces);
      break;

    // case 'getFlow':

    //   break;
    
    default:

      break;
  }
  
  // print_r($spaces);
  // print_r($apps);

}

///////////////////////////////////////
//       End Request Routing         //
///////////////////////////////////////

?>