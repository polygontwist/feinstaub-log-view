<?php 
 header("Content-Type: text/plain; charset=utf-8");//text/html;
 header('Access-Control-Allow-Origin: *'); 

 //"?dat="+tagdata+".log&t="+s,parseDAYPICdata
 $dat=$_GET["dat"];
 if(strrpos($dat,'.log')>-1)
 {
	if(file_exists("feinstaublog/".$dat)){
		include "feinstaublog/".$dat;//JSON
	}
 }
 else{//alle Daten vom Monat "yyyymm"
	$iserster=true;
	for ($i = 1; $i <= 31; $i++) {
		 $istr="";
		 if($i<10)$istr="0";
		 $istr=$istr.$i;
		if(file_exists("feinstaublog/".$dat.$istr.".log")){
			if(!$iserster)echo ",";
			include "feinstaublog/".$dat.$istr.".log";//JSON
			$iserster=false;
		}
	}
 }
 
?>

