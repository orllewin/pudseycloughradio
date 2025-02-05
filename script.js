var currentFile = "";
var trackDetails = null;
var playing = false;

var player = null;

function playToggle(){
	//var audio = document.getElementById("rad_audio"); 
	var playToggleButton = document.getElementById("radio_stream_toggle"); 
	if (!playing){
		if(player == null){
			player = document.createElement('audio');
			player.id = 'lazy_rad_audio';
			player.src = 'https://orllewin.radioca.st/rad.ogg';
			player.type = 'audio/ogg';
			
			document.getElementById('invis_rad_div').appendChild(player);
			
		}
		
		player.play(); 
		playToggleButton.innerHTML = "stop"
		playing = true;
	}else{
		player.pause();
		player.currentTime = 0;
		playToggleButton.innerHTML = "play"
		playing = false;
	}
}

async function getCurrentPCRFilename() {
	if(trackDetails === null){
		const trackDetailsJson = await fetch("pcr_tracks.json");
		const trackDetailsStr = await trackDetailsJson.text(); 
		trackDetails = JSON.parse(trackDetailsStr);
	}
	const currentTrack = await fetch("current_pcr_track.txt");
	const currentTrackString = await currentTrack.text(); 

	if(currentFile != currentTrackString){
		const radioFilenameElement = document.getElementById("radio_filename");
		radioFilenameElement.innerHTML = currentTrackString;
		currentFile = String(currentTrackString).trim();
		getDetails();
	}
}

function startListening() {
	getCurrentPCRFilename();
	setInterval(function(){
			getCurrentPCRFilename()
	}, 15000)
}

async function getDetails() {
	const trackDetail = trackDetails.find((element) => "" + element.filename.trim() == "" + currentFile);
	if(trackDetail !== undefined){
		const radioFileInfoElement = document.getElementById("radio_file_info");
		radioFileInfoElement.innerHTML = trackDetail.info;
		
		const radioFileImageElement = document.getElementById("radio_file_image");
		
		if(trackDetail.image !== ""){
			radioFileImageElement.src = "" + trackDetail.image + "";
		}else{
			radioFileImageElement.src = "";
		}
		
		const artistAttributionDiv = document.getElementById("artist_attribution");
		const link = trackDetail.link
		if(link !== ""){
			artistAttributionDiv.style.display = "block";
			
			const artistLinkButton = document.getElementById("artist_link_button");
			artistLinkButton.setAttribute("href", link);
			artistLinkButton.innerHTML = trackDetail.link.replace('https://','').replace('http://','');
		}else{
			artistAttributionDiv.style.display = "none";
		}
	}
}

