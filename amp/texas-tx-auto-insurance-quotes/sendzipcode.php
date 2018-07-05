<?php
if (!empty($_POST)) {

   header('Cache-Control: private, no-cache');

$thisDomain="https://www.elephant.com";
$devDomain="https://www.ampify.ga";

$googleAMPCacheSubdomain=str_replace(".","-",str_replace("-","--",$thisDomain));

$validOrigins=array('https://'.$googleAMPCacheSubdomain.'.cdn.ampproject.org','https://cdn.ampproject.org','https://amp.cloudflare.com',$thisDomain,$devDomain);
if (!in_array($_SERVER['HTTP_ORIGIN'],$validOrigins)) {
    header('X-Debug: '.$_SERVER['HTTP_ORIGIN'].' is an unrecognised origin');
    header('HTTP/1.0 403 Forbidden');exit;

    //Stop doing anything if this is an unfamiliar origin
}
if ($_GET['__amp_source_origin']!=$thisDomain AND $_GET['__amp_source_origin']!=$devDomain) {
    header('X-Debug: '.$_GET['__amp_source_origin'].' is an unrecognised source origin');
    header('HTTP/1.0 403 Forbidden');exit;
}
header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Expose-Headers:AMP-Redirect-To,AMP-Access-Control-Allow-Source-Origin");
header('AMP-Access-Control-Allow-Source-Origin: '.urldecode($_GET['__amp_source_origin']));
header('Content-Type: application/json');



	$zip = $_POST["zipCode"];
	$utm_source = $_POST["utm_source"];
	$utm_medium = $_POST["utm_medium"];
	$utm_campaign = $_POST["utm_campaign"];
	 
	header("AMP-Redirect-To:https://quotes.elephant.com/?utm_source=".$utm_source."&utm_medium=".$utm_medium."&utm_campaign=".$utm_campaign."/#/postal-landing/" . $zip); //For Post Submissions Redirect URL - Must be HTTPS Only
	
 
	$returnstring=json_encode($returnArray);
    echo $returnstring;
}
