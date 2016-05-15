$( document ).ready(function() {

	var csvString = "";
	
	$.ajax({
        type: "GET",
        url: "all_rows.csv",
        dataType: "text",
        success: function(data) {processData(data);}
     });
	 
});

function processData(data){

	var csvData = d3.csvParse(data);
	
	var previous_song = "";

	var doSearch = function(title, artist, callback) {
		console.log('search for ' + title);
		var url = 'https://api.spotify.com/v1/search?type=track&limit=1&q=' + encodeURIComponent('track:"'+title+'"')+ "&" + encodeURIComponent('artist:"'+artist+'"');
		$.ajax(url, {
			dataType: 'json',
			success: function(r) {
				console.log('got track', r);
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
	var i = 0;
	var parseFn = function(){
		elem = csvData[i];
		i++;
		document.getElementById('title').innerHTML = elem["Date"] + " : " + elem["Title"] + " de " + elem["Artist"];	
	if(elem["Title"] != previous_song){
			
			// load the song from spotify and play for 3 seconds
			doSearch(elem["Title"], elem["Artist"], function(result) {
					console.log('got result', result);
					document.getElementById('audiotag1').src = result.tracks[0].preview + ".mp3";
					document.getElementById('audiotag1').play();
					document.getElementById('img').src = result.tracks[0].cover_url;
			});
			
		}
		previous_song = elem["Title"];
		// wait 3 seconds
		setTimeout(parseFn, 3000);		
		
	}

	parseFn();
	
}
