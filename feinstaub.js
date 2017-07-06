"use strict";

var feinstaubviewer=function(zielID){
	var feinstaubdata={};
	
	//Folgende URLs müssen an Deinen Gegebenheiten angepasst werden:
	var quellurlNow="http://rp1/io/feinstaub.php";		//aktuelle Werte
	var quellurlDay="http://rp1/io/feinstaublog.php";	//Ordner
	
	var candat={
		width:800,//86400 sec 1440
		height:180,
		temperature:"#5DA346",
		humidity:"#8EC0CC",
		SDS_P1color:"#B7752D",
		SDS_P2color:"#B72D77",
		signalcolor:"#2E78BA",
		software_versioncolor:"#2b2b2b",
		showwertebereich:200
		};
	
	var basisnode;
	var ZielText;
	var KurvenCanvas;
	var KurvenMonCanvas;
	var optionen={//default
		"view":"text,daypic",//monpic
		"daypic":"WIFI,SDS_P1,SDS_P2",
		"text":"titel,datum,SDS_P1,SDS_P2,temperature,humidity,signal,IP"//,MAC,NAME,STAT
		//"datumpic":"20170210" //nur für Diagramm
		};
	//
	
	//API
	var empfaenger=[];
	this.getData=function(){return feinstaubdata;};
	this.setEmpfaenger=function(func){
		empfaenger.push(func);
	};
	
	var EmpaengerRefresh=function(){
		var i,f;
		for(i=0;i<empfaenger.length;i++){
			f=empfaenger[i];
			f();
		}
		
	}
	
	//Basics
	
	var gE=function(id){if(id=="")return undefined; else return document.getElementById(id);}
	var cE=function(z,e,id,cn){
		var newNode=document.createElement(e);
		if(id!=undefined && id!="")newNode.id=id;
		if(cn!=undefined && cn!="")newNode.className=cn;
		if(z)z.appendChild(newNode);
		return newNode;
	}
	var getDataTyp=function(o){//String:'[object Array]' '[object String]'  '[object Number]' '[object Boolean]'
			return Object.prototype.toString.call(o); 
	}
	
	var parseJSON=function(s){
		var re=s;
		if(re.indexOf("'")>-1)re=re.split("'").join('"');
		try {
			re=JSON.parse(re);
			} 
		catch(e) {
			console.log("JSON.parse ERROR",re);
			re={"error":"parseerror"};
			}
		return re;
	}
	
	var loadData =function(url, auswertfunc,id){
		var loObj=new Object();
		loObj.url=url;    
		loObj.myID=id;
		try {
		// Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
		loObj.xmlloader = new XMLHttpRequest();
			} catch(e) {
			   try {                        
					 loObj.xmlloader  = new ActiveXObject("Microsoft.XMLHTTP");// MS Internet Explorer (ab v6)
					} catch(e) {
							try {                                
									loObj.xmlloader  = new ActiveXObject("Msxml2.XMLHTTP");// MS Internet Explorer (ab v5)
							} catch(e) {
									loObj.xmlloader  = null;
							}
					}
			}	
		if(!loObj.xmlloader)alert('XMLHttp nicht möglich.');

		loObj.load=function(url){	
			var loader=loObj.xmlloader;					
			loader.parserfunc=loObj.parseFunc;
			loader.myID=loObj.myID;
			loader.open('GET',url,true);//open(method, url, async, user, password)
			loader.onreadystatechange = function(){
				if (loader.readyState == 4) { 					   
					loader.parserfunc(loader);//.responseText
					}
			};
			// loader.timeout=  //ms
			loader.setRequestHeader('Content-Type', 'text/plain'); 
			loader.send(null);
			return false;
		}	
		loObj.parseFunc = auswertfunc;    
		loObj.load(url);    
	}
	
	
	//func
	var ini=function(){
		if(getDataTyp(zielID).indexOf("object HTML")>-1){//"[object HTMLDivElement]"
			basisnode=zielID;
		}
		else
		if(getDataTyp(zielID)=="[object String]"){
			basisnode=gE(zielID);
		}
		else{
			console.log("Ziel nicht gefunden ",zielID,basisnode);
			return;
		}
		basisnode.innerHTML="";
		
		var tmp=basisnode.getAttribute("data-option");
		if(tmp!=undefined){
			tmp=parseJSON(tmp);
			if(tmp.error==undefined)optionen=tmp;			
		}
		if(optionen.view!=undefined)	optionen.view=optionen.view.split(',');
		if(optionen.daypic!=undefined)	optionen.daypic=optionen.daypic.split(',');
		if(optionen.monpic!=undefined)	optionen.monpic=optionen.monpic.split(',');
		if(optionen.text!=undefined)	optionen.text=optionen.text.split(',');
		//console.log(optionen);
		create();
		reload();
	}
	var create=function(){
		var i;
		if(optionen.view==undefined)return;
		
		for(i=0;i<optionen.view.length;i++){
			if(optionen.view[i]=="text"){
				ZielText=cE(basisnode,"div",undefined,'feinstaubtext');
				
			}
			if(optionen.view[i]=="daypic"){
				KurvenCanvas=cE(basisnode,"canvas",undefined,'feinstaubcanvas');
				KurvenCanvas.width=candat.width;
				KurvenCanvas.height=candat.height;
			}
			if(optionen.view[i]=="monpic"){
				KurvenMonCanvas=cE(basisnode,"canvas",undefined,'feinstaubcanvas');
				KurvenMonCanvas.width=candat.width;
				KurvenMonCanvas.height=candat.height;
			}
		}
	}
	
	var reload=function(){
		var i,
			d = new Date(),
			s=d.getTime(),
			tag="";
		if(optionen.view==undefined)return;
		if(optionen.monat!=undefined){
			var tempd=new Date(d.getFullYear(),d.getMonth()+optionen.monat,1,0,0,0,0);
			d=tempd;
		}
		
		for(i=0;i<optionen.view.length;i++){
			if(optionen.view[i]=="text"){
				loadData(quellurlNow+"?t="+s+tag,parseTextdata,"");
			}
			if(optionen.view[i]=="daypic"){
				var tagdata=d.getFullYear();
				if((d.getMonth()+1)<10)tagdata+='0';
				tagdata+=(d.getMonth()+1);
				if(d.getDate()<10)tagdata+='0';
				tagdata+=d.getDate();	
				
				if(optionen.datumpic!=undefined){
					tagdata=optionen.datumpic;
				}
				
				loadData(quellurlDay+"?dat="+tagdata+".log&t="+s+tag,parseDAYPICdata,"");				
			}
			if(optionen.view[i]=="monpic"){
				var yyyymm=d.getFullYear();
				if((d.getMonth()+1)<10)yyyymm+='0';
				yyyymm+=(d.getMonth()+1);
				
				loadData(quellurlDay+"?dat="+yyyymm+"&t="+s+tag,parseMonPICdata,"");	
			}
		}
	}
	
	var timer=undefined;
	
	var startReloadTimer=function(zeit){
		if(timer!=undefined)clearTimeout(timer);
		timer=setTimeout(reload,zeit);//1min
	}
	
	var getSensorValues=function(id,data){
		var sensorval=data;
		var i,re="",o;
		if(data==undefined)return re;
		for(i=0;i<data.length;i++){
			o=data[i];
			if(o.value_type==id){
				if(o.value_type=="temperature"){re="Temperatur: ";}
				else
				if(o.value_type=="humidity"){re="Luftfeuchtigkeit: ";}
				else
				if(o.value_type=="SDS_P1"){re="PM10: ";}
				else
				if(o.value_type=="SDS_P2"){re="PM2.5: ";}
				else
				if(o.value_type=="signal"){re="WiFi Signal: ";}
				else
					re=o.value_type+': ';
				
				re+=o.value;
				if( (o.value_type=="SDS_P1")||(o.value_type=="SDS_P2") )re+=" µg/m³";
				if( (o.value_type=="temperature") )re+=" °C";
				if( (o.value_type=="humidity") )re+=" %";
				
			}
		}
		return re;
	}
	var getIPValues=function(id,ipAddress,macclients){//id>IP,MAC,NAME,STAT
		var i,o,re="";
		if(macclients!=undefined){
			for(i=0;i<macclients.length;i++){
				o=macclients[i];
				if(o.ip==ipAddress){
					switch(id){
						case "IP":
							re=o.ip;
						break;
						case "MAC":
							re=o.mac;
						break;
						case "NAME":
							re=o.name;
						break;
						case "STAT":
							re=o.stat;
						break;
					}	
				}
			}
		}else{
			if(id=="IP")re=ipAddress;
		}
		
		return re;
	}
	
	var parseTextdata=function(data){
		if(data!=""){
			try {
				feinstaubdata=JSON.parse(data.responseText);
			} 
			catch(e) {
				console.log("JSON.parse ERROR",data.responseText);	
				feinstaubdata={}
			}
			
			//console.log(">>",feinstaubdata);
			showTextInfo();
			startReloadTimer(1000*60);//1min
		}
		else
			startReloadTimer(1000*5);//5sec
		
		EmpaengerRefresh();
	}
	var showTextInfo=function(){
		var i,o,node,zeigen,s,lc,sval,sid,macclients;
		
		if(ZielText==undefined)return;
		ZielText.innerHTML="";
		
		if(feinstaubdata.feinstaub==undefined)return;
		
		var sensorval=feinstaubdata.feinstaub.daten.sensordatavalues;
		var ipAddress=feinstaubdata.feinstaub.ipAddress;
		if(feinstaubdata.maclog!=undefined)
			macclients=feinstaubdata.maclog.clients;
		
		if(optionen.text!=undefined){
			var consolenoutput="";
			for(lc=0;lc<optionen.text.length;lc++){
				sid=optionen.text[lc];
				if(sid=="titel")
					node=cE(ZielText,"h1");
					else
					node=cE(ZielText,"div");
				//CSS
				switch(sid){
					case "SDS_P1":
						node.style.color=candat.SDS_P1color;
						break;
					case "SDS_P2":
						node.style.color=candat.SDS_P2color;
						break;
					case "signal":
						node.style.color=candat.signalcolor;
						break;
					case "temperature":
						node.style.color=candat.temperature;
						break;
					case "humidity":
						node.style.color=candat.humidity;
						break;
					
				}
				//get Data
				switch(sid){
					case "titel":
						sval="Feinstaub";
					break;
					case "datum":
						sval=feinstaubdata.feinstaub.zeit+' '+feinstaubdata.feinstaub.datum;
					break;
					
					case "temperature":
					case "humidity":
					case "SDS_P1":
					case "SDS_P2":
					case "signal":
						sval=getSensorValues(sid,sensorval);
						break;
					
					case "IP":
						sval=ipAddress;
						break;
					case "MAC":
					case "NAME":
					case "STAT":
						sval=getIPValues(sid,ipAddress,macclients);
						break;
				}	
				//Aufbereitung (W)LAN-Infos
				switch(sid){
					case "IP":
						s='ip: <a href="http://'+sval+'" target="_blank">'+sval+'</a>';
						sval=s;
						break;
					case "MAC":
						sval="mac: "+sval;
						break;
					case "NAME":
						sval="name: "+sval;
						break;
					case "STAT":
						sval="stat: "+sval;
						break;
				}				
				node.innerHTML=sval;
				if(sid=="SDS_P1"||sid=="SDS_P2"||sid=="signal"||sid=="temperature"||sid=="humidity")
					consolenoutput+=sval+' ';
			}
			if(consolenoutput!="")console.log(consolenoutput,feinstaubdata);
		}
		
		// optionen.text="titel,datum,SDS_P1,SDS_P2,signal,IP,MAC,NAME,STAT"
		
	}

	var Can_clear=function(cc){
		cc.clearRect(0, 0, candat.width, candat.height);
		cc.lineWidth = 1;
		cc.lineJoin = 'round';		
	} 
	var Can_drawCanHead=function(cc,data){
		cc.strokeStyle = "#828282";
		cc.fillStyle  = "#828282";
		cc.font = '12px Arial';
		cc.textAlign = 'center';
		cc.textBaseline = 'middle';
		cc.fillText(data.titel, candat.width*0.5+0.5, 10);
	}
	var Can_Legende=function(cc,aopt){//"WIFI,SDS_P1,SDS_P2,"
		var i,sopt;
		cc.font = '12px Arial';
		cc.textBaseline = 'middle';
		for(i=0;i<aopt.length;i++){
			sopt=aopt[i];
			if(sopt=="WIFI"){//rechts
				cc.textAlign = 'right';
				cc.fillStyle  = candat.signalcolor;
				cc.fillText("-30 dBm", Math.floor(candat.width)-2.5, 10);
				cc.fillText("-90 dBm", Math.floor(candat.width)-2.5, candat.height-5);
			}
			if(sopt=="SDS_P1" || sopt=="SDS_P2"){//links
				//Grenzwert
				cc.textAlign = 'left';
				cc.fillStyle  = "#A01414";
				cc.fillText(candat.showwertebereich+' µg/m³', 2.5, 10);
				
				cc.strokeStyle = "#E80202";
				cc.beginPath();
				cc.moveTo(0.5,			   Math.floor(candat.height/candat.showwertebereich*(candat.showwertebereich-50))-0.5);
				cc.lineTo(candat.width+0.5,Math.floor(candat.height/candat.showwertebereich*(candat.showwertebereich-50))-0.5);
				cc.stroke();
				
				cc.fillStyle  = "#E80202";
				cc.fillText("50 µg/m³", 2.5, Math.floor(candat.height/candat.showwertebereich*(candat.showwertebereich-50))-5.5);
				cc.fillStyle  = "#149E36";
				cc.fillText("0 µg/m³", 2.5, Math.floor(candat.height-5)-0.5);
			}
			//temperature,humidity
		}
	}
	
	var Can_drawLines=function(cc,typ,data,color){
		var i,t,x,y=0,lastx=0,lasty=0;
		cc.beginPath();		
		for(i=0;i<data.length;i++){
			x=data[i].x;
			if(typ=="WIFI"){
				y=candat.height/60*(data[i].value*-1-30);// typisch: -30(max)...-90(min)
			}
			
			if(typ=="temperature"){
				t=data[i].value;
				if(t>40)t=40;
				if(t<-20)t=-20;
				y=candat.height-candat.height/(20+40)*(t+20);//-30...+40
			}
			if(typ=="humidity"){
				t=data[i].value;//0...100 %
				y=candat.height/(100)*(100-t);
			}
			if(typ=="SDS_P1" || typ=="SDS_P2"){
				t=data[i].value;//Wertebereich 0...1000 µg/m³ Grenzwert=50
				if(t>candat.showwertebereich)t=candat.showwertebereich;
				y=candat.height/candat.showwertebereich*(candat.showwertebereich-t);
			}
			
			if(x-lastx>5){
				cc.lineTo(lastx,lasty);
				cc.moveTo(x,y);
			}
	
			
			if(i==0)
				cc.moveTo(x,y);
			else
				cc.lineTo(x,y);
			lastx=x;
			lasty=y;
		}		
		cc.strokeStyle = color;
		cc.stroke();
		
	}
	
	
	var Can_drawDots=function(cc,typ,data,color){
		var i,t,x,y=0;
		for(i=0;i<data.length;i++){
			x=data[i].x;
			if(typ=="WIFI"){
				y=candat.height/60*(data[i].value*-1-30);// typisch: -30(max)...-90(min)
			}
			
			if(typ=="temperature"){
				t=data[i].value;
				if(t>40)t=40;
				if(t<-20)t=-20;
				y=candat.height-candat.height/(20+40)*(t+20);//-30...+40
			}
			if(typ=="humidity"){
				t=data[i].value;//0...100 %
				y=candat.height/(100)*(100-t);
			}
			if(typ=="SDS_P1" || typ=="SDS_P2"){
				t=data[i].value;//Wertebereich 0...1000 µg/m³ Grenzwert=50
				if(t>candat.showwertebereich)t=candat.showwertebereich;
				y=candat.height/candat.showwertebereich*(candat.showwertebereich-t);
			}

			cc.fillStyle = color;
			cc.fillRect( x, y, 1, 1 );			
		}
	}
	
	
	var Can_drawChanges=function(cc,typ,data,color){
		var i,t,x,y=0,lastdat="",drawit=false;
		for(i=0;i<data.length;i++){
			x=data[i].x;
			drawit=(lastdat!=data[i].value);
//console.log(data[i].value,drawit,x);						
			if(drawit){
				cc.fillStyle = color;
				cc.fillRect( x, 0, 2, candat.height);
				
				cc.font = '12px Arial';
				cc.textAlign = 'left';
				cc.fillStyle  = color;
				cc.save();
				cc.translate(x+2.5+5, 20);
				cc.rotate(90*Math.PI/180, 0, 0);
				//cc.fillText(data[i].value, x+2.5, 10);
				cc.fillText(data[i].value,0, 0);
				cc.restore();
				
				lastdat=data[i].value;
			}		
		}
	}
	
	
	
	var parseDAYPICdata=function(data){
		var i,t,o,ov,x,y, hh,mm,ss,lc;
		if(KurvenCanvas==undefined)return;
		if(data.responseText=="")return;
		
		var daydata=parseJSON('{"daten":['+data.responseText+']}');
		if(daydata.error!=undefined){
			startReloadTimer(1000*5);//5sec
			return;
			}
		
		/*,{"time":1486668690,"datum":"2017-02-09","zeit":"20:31:30",
			"daten":{
				"software_version": "NRZ-2016-048", 
				"sensordatavalues":[
					{"value_type":"SDS_P1","value":"56.63"},
					{"value_type":"SDS_P2","value":"40.22"},
					{"value_type":"temperature","value":"-3.10"},
					{"value_type":"humidity","value":"59.50"},
					{"value_type":"samples","value":"324128"},
					{"value_type":"min_micro","value":"165"},
					{"value_type":"max_micro","value":"26935"},
					{"value_type":"signal","value":"-62 dBm"}
				]
			}
			}
		*/

		//Daten aufbereiten
		var daten={
			SDS_P1:[],
			SDS_P2:[],
			temperature:[],//dht22
			humidity:[],//dht22
			WIFI:[] //0..-90			
		}
		for(i=0;i<daydata.daten.length;i++){
			o=daydata.daten[i];
			t=o.zeit.split(':'); //"17:46:52"
			hh=parseInt(t[0]);
			mm=parseInt(t[1]);
			ss=parseInt(t[2]);
			x=Math.floor(candat.width/(24*60*60) * (hh*60*60+ mm*60 +ss));
			for(t=0;t<o.daten.sensordatavalues.length;t++) {
				ov=o.daten.sensordatavalues[t];
				if(ov.value_type=="temperature"){
					daten.temperature.push({"value":parseFloat(ov.value),"x":x } );
				}
				if(ov.value_type=="humidity"){
					daten.humidity.push({"value":parseFloat(ov.value),"x":x });
				}
				if(ov.value_type=="SDS_P1"){
					daten.SDS_P1.push({"value":parseFloat(ov.value),"x":x });
				}
				if(ov.value_type=="SDS_P2"){
					daten.SDS_P2.push({"value":parseFloat(ov.value),"x":x });
				}
				if(ov.value_type=="signal"){
					daten.WIFI.push({"value":parseInt(ov.value.split(' ')[0]),"x":x });//"-41 dBm"
				}
			}
		}
		
		//drawlines
		var lastdat=daydata.daten[daydata.daten.length-1];
		
		var cc=KurvenCanvas.getContext('2d');
		var ddatum=lastdat.datum.split('-');
		
		Can_clear(cc);
		Can_drawCanHead(cc,{"titel":ddatum[2]+'.'+ddatum[1]+'.'+ddatum[0]+' '+lastdat.zeit})
		
		//stundenstriche
		for(i=1;i<24;i++){
			x=parseInt(candat.width/24*i)+0.5;
			cc.beginPath();
			cc.moveTo(x,candat.height);
			cc.lineTo(x,candat.height-10);
			cc.stroke();
			cc.fillText(i+'h', x+0.5, candat.height-15);
		}
		
		
		
		//Legende
		var lopt=[];
		if(optionen.daypic!=undefined){
			Can_Legende(cc,optionen.daypic);
			//temperature,humidity
		}
		
		
		//Linien
		if(optionen.daypic!=undefined){
			for(lc=0;lc<optionen.daypic.length;lc++){
				if(optionen.daypic[lc]=="WIFI"){
					Can_drawLines(cc,"WIFI",daten.WIFI,candat.signalcolor);					
				}
				if(optionen.daypic[lc]=="temperature"){
					Can_drawLines(cc,"temperature",daten.temperature,candat.temperature);					
				}
				if(optionen.daypic[lc]=="humidity"){
					Can_drawLines(cc,"humidity",daten.humidity,candat.humidity);
				}
				if(optionen.daypic[lc]=="SDS_P1"){
					Can_drawLines(cc,"SDS_P1",daten.SDS_P1,candat.SDS_P1color);
				}
				if(optionen.daypic[lc]=="SDS_P2"){
					Can_drawLines(cc,"SDS_P2",daten.SDS_P2,candat.SDS_P2color);
				}
			}
		}
				
		if(optionen.datumpic!=undefined)return;
		
		startReloadTimer(1000*60);//1min
	}
	
	var parseMonPICdata=function(data){
		var i,t,o,ov,x,y, tt,hh,mm,ss,lc;
		if(KurvenMonCanvas==undefined)return;
		if(data.responseText=="")return;
		
		var daydata=parseJSON('{"daten":['+data.responseText+']}');
		//console.log(">",daydata);
		
		//Daten aufbereiten
		var daten={
			SDS_P1:[],
			SDS_P2:[],
			temperature:[],//dht22
			humidity:[],//dht22
			WIFI:[], //0..-90			
			software_version:[] 			
		}
		for(i=0;i<daydata.daten.length;i++){
			o=daydata.daten[i];
			t=o.zeit.split(':'); //"17:46:52"
			hh=parseInt(t[0]);
			mm=parseInt(t[1]);
			ss=parseInt(t[2]);
			
			t=o.datum.split('-'); //"17:46:52"
			tt=parseInt(t[2])-1;
			
			x=Math.floor(candat.width/( 31*24*60*60 ) * (tt*24*60*60 +  hh*60*60+ mm*60 +ss));
			
			for(t=0;t<o.daten.sensordatavalues.length;t++) {
				ov=o.daten.sensordatavalues[t];
				if(ov.value_type=="temperature"){
					daten.temperature.push({"value":parseFloat(ov.value),"x":x } );
				}
				if(ov.value_type=="humidity"){
					daten.humidity.push({"value":parseFloat(ov.value),"x":x });
				}
				if(ov.value_type=="SDS_P1"){
					daten.SDS_P1.push({"value":parseFloat(ov.value),"x":x });
				}
				if(ov.value_type=="SDS_P2"){
					daten.SDS_P2.push({"value":parseFloat(ov.value),"x":x });
				}
				if(ov.value_type=="signal"){
					daten.WIFI.push({"value":parseInt(ov.value.split(' ')[0]),"x":x });//"-41 dBm"
				}
			}
			if(o.daten.software_version!=undefined){
				daten.software_version.push({"value":o.daten.software_version,"x":x });//"NRZ-2017-066"
			}
		}
		
		//drawlines
		var lastdat=daydata.daten[daydata.daten.length-1];
		
		var cc=KurvenMonCanvas.getContext('2d');
		var ddatum=lastdat.datum.split('-');
		
		Can_clear(cc);
		Can_drawCanHead(cc,{"titel":ddatum[1]+'.'+ddatum[0]})
		
		//Tagesstriche
		
		for(i=1;i<31;i++){
			x=parseInt(candat.width/31*i)+0.5;
			cc.beginPath();
			cc.moveTo(x,candat.height);
			cc.lineTo(x,candat.height-10);
			cc.stroke();
			cc.fillText((i+1)+'.', x+0.5, candat.height-15);
		}
		
		
		//Legende
		var lopt=[];
		if(optionen.monpic!=undefined){
			Can_Legende(cc,optionen.monpic);
			//temperature,humidity
		}
		
		
		//Linien
		if(optionen.monpic!=undefined){
			for(lc=0;lc<optionen.monpic.length;lc++){
				if(optionen.monpic[lc]=="software_version"){
					Can_drawChanges(cc,"software_version",daten.software_version,candat.software_versioncolor);					
				}
				if(optionen.monpic[lc]=="WIFI"){
					Can_drawDots(cc,"WIFI",daten.WIFI,candat.signalcolor);					
				}
				if(optionen.monpic[lc]=="temperature"){
					Can_drawDots(cc,"temperature",daten.temperature,candat.temperature);					
				}
				if(optionen.monpic[lc]=="humidity"){
					Can_drawDots(cc,"humidity",daten.humidity,candat.humidity);
				}
				if(optionen.monpic[lc]=="SDS_P1"){
					Can_drawDots(cc,"SDS_P1",daten.SDS_P1,candat.SDS_P1color);
				}
				if(optionen.monpic[lc]=="SDS_P2"){
					Can_drawDots(cc,"SDS_P2",daten.SDS_P2,candat.SDS_P2color);
				}
			}
		}
		
		
		
	}
	
	//Start	
	ini();
}

var inifeinstaubviewer=function(){
	
	var searchNodes=function(node){
		var i,n;		
		if(node.getAttribute!=null){
			if(node.getAttribute("data-option")!=undefined){
				var fv=new feinstaubviewer(node);
				node.dataFSV=fv;
			}
		}

		if(node.children!=undefined){
			for(i=0;i<node.children.length;i++){
				n=node.children[i];
				searchNodes(n);
			}
		}
		else
		{	//iemobile11
			var nc=node.childNodes;//+navigator.userAgent
			for(i=0;i<nc.length;i++){
				searchNodes(nc[i]);
			}			
		}
	};
		
	
	searchNodes(document);
}


window.addEventListener('load', function (event) {
		inifeinstaubviewer();
		
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
