var yearInit = 1980;
var index = 0;
var previous_song = "";
var csvData;
var stop = false;
var step = 1;
var previous_year = 1984;

$( document ).ready(function() {
	
	
	var csvString = "";
	$("audio")[0].volume = 0;
	$(function() {
		$( "#slider" ).slider({
			min: 1984,
			max: 2016,
			slide: function( event, ui ) {
				$("#yearSld").attr('value', ui.value);
			},
			change: function( event, ui ) {
				yearInit = ui.value;
				var elem = csvData[index];
				$("#yearSld").attr('value', ui.value);
				if(yearInit != parseInt(elem["Date"].substring(elem["Date"].length - 4))){
					index = 0;
				}
				
				//if(ready) parseFn();
			}
		});
	});
	
	$("#play").click(function(){
		if($("#play").html().trim() == '<span class="glyphicon glyphicon-volume-off" aria-hidden="true"></span>'){
			$("#play").html('<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span>');
			$("audio")[0].volume = 1;
		}
		else{
			$("#play").html('<span class="glyphicon glyphicon-volume-off" aria-hidden="true"></span>');
			$("audio")[0].volume = 0;
		}
	});
	
	$.ajax({
		type: "GET",
		url: "all_rows.csv",
		dataType: "text",
		success: function(data) {processData(data);}	
	});
		

	 
});

function processData(data){
	csvData = d3.csvParse(data);
	parseFn();
}


var callbackSearch=function(result){
	//console.log('got result', result);
	if(result.tracks.length > 0){
		updateSongInfo(result);		
	}
	else
	{
		// recherche dégradée
		doSearch(elem["Title"], "", "", updateSongInfo);
	}
}


function updateSongInfo(result){
	var chaine;
	if(step == 1){
		$(".current").fadeOut(function(){$(".hiddenDiv").fadeIn();});
		chaine = "hiddenDiv";
		step = 0;
	}else{
		$(".hiddenDiv").fadeOut(function(){$(".current").fadeIn();});
		chaine = "current";
		step = 1;
	}
	if(result.tracks.length > 0){
		document.getElementById('audiotag1').src = result.tracks[0].preview + ".mp3";
		document.getElementById('audiotag1').play();
		$("."+chaine+" > #img")[0].src = result.tracks[0].cover_url;	
		$("."+chaine+" > #title")[0].innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];		
	}
	else
	{
		document.getElementById('audiotag1').pause();
		$("."+chaine+" > #img")[0].src = "";	
		$("."+chaine+" > #title")[0].innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];
		console.log('nothing found for '+elem["Title"] + " - " + elem["Artist"]  + " - " +  elem["Date"]);
	}
}


var parseFn = function(){
	elem = csvData[index];
	index++;
	while(parseInt(elem["Date"].substring(elem["Date"].length - 4)) < yearInit){
		index++;	
		elem = csvData[index];
	}
	
	if(parseInt(elem["Date"].substring(elem["Date"].length - 4)) != previous_year){
		$( "#slider" ).slider( "value", parseInt(elem["Date"].substring(elem["Date"].length - 4)));
	}
	
	if(elem["Title"] != previous_song){
		// load the song from spotify and play for 3 seconds
		doSearch(elem["Title"], elem["Artist"], elem["Date"].substring(elem["Date"].length - 4), callbackSearch);
	}else{
		$(".current > #title")[0].innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];
		$(".hiddenDiv > #title")[0].innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];
	}
		
	previous_year = parseInt(elem["Date"].substring(elem["Date"].length - 4));
	previous_song = elem["Title"];
	// wait 3 seconds
	setTimeout(parseFn, 4000);			
	
}



var doSearch = function(title, artist, year, callback) {
	//console.log('search for ' + title);
	var url = 'https://api.spotify.com/v1/search?type=track&limit=1&q=' + encodeURIComponent('track:"'+title+'"') + encodeURIComponent(' artist:"'+artist+'"');
	$.ajax(url, {
		dataType: 'json',
		success: function(r) {
			//console.log('got track', r);
			callback({
				title: title,
				tracks: r.tracks.items
					.map(function(item) {
						var ret = {
							name: item.name,
							artist: 'Unknown',
							artist_uri: '',
							album: item.album.name,
							album_uri: item.album.uri,
							cover_url: '',
							uri: item.uri,
							preview: item.preview_url
						}
						if (item.artists.length > 0) {
							ret.artist = item.artists[0].name;
							ret.artist_uri = item.artists[0].uri;
						}
						if (item.album.images.length > 0) {
							ret.cover_url = item.album.images[1].url;
						}
						return ret;
					})
			});
		},
		error: function(r) {
			callback({
				title: title,
				tracks: []
			});
		}
	});
}