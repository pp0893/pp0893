var yearInit = 1980;
var index = 0;
var previous_song = "";
var ready = false;
var csvData;
var stop = false;

$( document ).ready(function() {
	
	
	var csvString = "";
		 
	$(function() {
		$( "#slider" ).slider({
			min: 1984,
			max: 2016,
			slide: function( event, ui ) {
				$("#yearSld").attr('value', ui.value);
			},
			change: function( event, ui ) {
				yearInit = ui.value;
				index = 0;
				//if(ready) parseFn();
			}
		});
	});
	$.ajax({
		type: "GET",
		url: "all_rows.csv",
		dataType: "text",
		success: function(data) {processData(data);}	
	});
	$("#play").click(function(){
		if($("#play").html() == '<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play'){
			$("#play").html('<span class="glyphicon glyphicon-stop" aria-hidden="true"></span> Stop');
			while(!ready){
			}
			parseFn();
		}
		else{
			stopMusic();
			$("#play").html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play');
		}
		
	});
	 
});

function processData(data){
	csvData = d3.csvParse(data);
	ready = true;
}

function stopMusic(){
	stop = true;
	$("audio").volume = 0;
}

var callbackSearch=function(result){
	//console.log('got result', result);
	if(result.tracks.length > 0){
		document.getElementById('audiotag1').src = result.tracks[0].preview + ".mp3";
		document.getElementById('audiotag1').play();
		document.getElementById('img').src = result.tracks[0].cover_url;	
		document.getElementById('title').innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];		
	}
	else
	{
		// recherche dégradée
		doSearch(elem["Title"], "", "", callbackSearchTitleOnly);
	}
}

var callbackSearchTitleOnly=function(result){
	//console.log('got result', result);
	if(result.tracks.length > 0){
		document.getElementById('audiotag1').src = result.tracks[0].preview + ".mp3";
		document.getElementById('audiotag1').play();
		document.getElementById('img').src = result.tracks[0].cover_url;	
		document.getElementById('title').innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];		
	}
	else
	{
		document.getElementById('title').innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];
		document.getElementById('audiotag1').pause();
		document.getElementById('img').src = "";	
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
	
		
	if(elem["Title"] != previous_song){
		
		// load the song from spotify and play for 3 seconds
		doSearch(elem["Title"], elem["Artist"], elem["Date"].substring(elem["Date"].length - 4), callbackSearch);
		
	}
	previous_song = elem["Title"];
	while(!stop){
		// wait 3 seconds
		setTimeout(parseFn, 3000);		
	}
	
	
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
							ret.cover_url = item.album.images[0].url;
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