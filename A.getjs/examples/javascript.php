<?php
header('Content-type: application/x-javascript');
$sleep = 1;
if ( isset($_GET['sleep']) ) {
	$sleep = $_GET['sleep'];
}
sleep($sleep);
?>
A.log("Executing script: " + <?php echo $_GET['num'] ?>);