<?php
require_once __DIR__ . '\..\..\vendor\autoload.php';
require_once __DIR__ . '\Secrets.php';
require_once __DIR__ . '\SessionManager.php';

///////////////////////////////////////
// start server-sided authentication //
///////////////////////////////////////

if (!Podio::is_authenticated()) {
    // Set up the REDIRECT_URI -- which is just the URL for this file.
    define("REDIRECT_URI", 'http://localhost:80');
    // Set up the scope string
    define("SCOPE", 'user:read space:all');
    Podio::setup($client_id, $client_secret, array(
      "session_manager" => "PodioBrowserSession"
    ));
    
    if (!isset($_GET['code']) && !Podio::is_authenticated()) {
      // User is not being redirected and does not have an active session
      // We just display a link to the authentication page on podio.com
      $auth_url = htmlentities(Podio::authorize_url(REDIRECT_URI, SCOPE));
      print "<a href='{$auth_url}'>Start authenticating</a>";
      
    } elseif (Podio::is_authenticated()) {
      // User already has an active session. You can make API calls here:
      print "You were already authenticated and no authentication is needed.";

    }
  elseif (isset($_GET['code'])) {
    // User is being redirected back from podio.com after authenticating.
    // The authorization code is available in $_GET['code']
    // We use it to finalize the authentication
    
    // If there was a problem $_GET['error'] is set:
    if (isset($_GET['error'])) {
      print "There was a problem. The server said: {$_GET['error_description']}";

    }
    else {
      // Finalize authentication. Note that we must pass the REDIRECT_URI again.
      Podio::authenticate_with_authorization_code($_GET['code'], REDIRECT_URI);
      print "You have been authenticated. Wee!";
    
    }
  }
}

///////////////////////////////////////
//  end server-sided authentication  //
///////////////////////////////////////


// display html
$file = "C:/xampp/htdocs/src/html/index.html";
echo file_get_contents($file);
//

?>