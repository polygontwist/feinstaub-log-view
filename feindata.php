<?php 
$logURL="feinstaub.log";
$logToOrdner="feinstaublog/".date('Ymd').".log";

$itime= time();//timestamp Januar 1 1970 00:00:00 GMT
$datum= date('Y-m-d');
$zeit=  date('G:i:s');
$ipAddress=$_SERVER['REMOTE_ADDR'];

$daten = file_get_contents('php://input');

if(isset($daten) && !empty($daten)){//wenn Daten leer, nicht speichern
	//create oder add; aktuelles Messwert
	$handle=fopen($logURL,'w');
	fwrite ($handle, "{" );
	fwrite ($handle, '"time":'.$itime.','.chr(10));
	fwrite ($handle, '"datum":"'.$datum.'",'.chr(10));
	fwrite ($handle, '"zeit":"'.$zeit.'",'.chr(10));
	fwrite ($handle, '"ipAddress":"'.$ipAddress.'",'.chr(10));
	fwrite ($handle, '"daten":'.$daten.chr(10)  );
	fwrite ($handle, "}".chr(10) );
	fclose ($handle);
}

if(isset($daten) && !empty($daten)){//wenn Daten leer, nicht speichern
	//als Datensätze in Ordner, 
	$add=file_exists($logToOrdner);
	$handle=fopen($logToOrdner,'a');
	if($add)fwrite ($handle, "," );
	fwrite ($handle, "{" );
	fwrite ($handle, '"time":'.$itime.',');
	fwrite ($handle, '"datum":"'.$datum.'",');
	fwrite ($handle, '"zeit":"'.$zeit.'",');
	fwrite ($handle, '"daten":'.$daten  );
	fwrite ($handle, "}".chr(10) );
	fclose ($handle);
}

?>