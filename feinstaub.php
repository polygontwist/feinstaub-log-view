<?php 
 header("Content-Type: text/plain; charset=utf-8");//text/html;
 header('Access-Control-Allow-Origin: *'); 

 
 echo "{";
 echo '"feinstaub":';
 include "feinstaub.log";//JSON
  
 echo "}";
 
?>

