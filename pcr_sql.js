/*
  I have no idea what I'm doing. 
*/

let db = null;
let currentTrackFilename = "";

function logEntireDatabase(){
  logger("dumping entire table:");
  db.exec(
    {
      sql: "select * from tracks",
      rowMode: 'object',
      callback: function(row){
        logger("row ",++this.counter,"=",JSON.stringify(row));
	  }.bind({counter: 0})
	}
  );
}

function registerKeys(){
  document.addEventListener("keypress", function onPress(event) {
    var header = document.getElementById("pcr_header"); 
    var article = document.getElementById("pcr_article"); 
    var footer = document.getElementById("pcr_footer"); 

    if (event.key === "t") {
		if(header.className === 'uiVisible' && article.className === 'uiVisible' && footer.className === 'uiVisible'){
			article.classList.remove('uiVisible');
			article.classList.add('uiGone');
			footer.classList.remove('uiVisible');
			footer.classList.add('uiGone');
		}else if(header.className === 'uiVisible'){
			header.classList.remove('uiVisible');
			header.classList.add('uiGone');
		}else{
			header.classList.remove('uiGone');
    	    header.classList.add('uiVisible');
    	    article.classList.remove('uiGone');
    	    article.classList.add('uiVisible');
    	    footer.classList.remove('uiGone');
    	    footer.classList.add('uiVisible');
		}
	}
  });
}


function startListening () {
  	updateCurrentTrackData()
  	setInterval(function(){
  		updateCurrentTrackData()
  	}, 8000)
}
  
async function  updateCurrentTrackData(){
  const currentTrack = await fetch("current_pcr_track.txt");
  const currentTrackString = await currentTrack.text();
  const currentTrackTrimmed =  currentTrackString.trim();

  console.log("Current track is " + currentTrackTrimmed);
  
  if(currentTrackFilename !== currentTrackTrimmed){
    currentTrackFilename = currentTrackTrimmed;
	//logger("Track has changed: ", currentTrackFilename);
    const sqlWrapper = document.getElementById("sql_wrapper")
    sqlWrapper.innerHTML = '';
    
    const sqlQuery = "SELECT * FROM tracks WHERE filename is '" + currentTrackFilename + "'";
    //logger(sqlQuery);
    db.exec(
    	{
    		sql: sqlQuery,
    		rowMode: 'object',
    		callback: function(row){
    		  //logger("row ",++this.counter,"=",JSON.stringify(row));
    		  const filenameParagraph = document.createElement("p");
    		  filenameParagraph.append(document.createTextNode(row.filename));
              sqlWrapper.append(filenameParagraph);

              const descriptionParagraph = document.createElement("p");
              descriptionParagraph.append(document.createTextNode(row.description));
              sqlWrapper.append(descriptionParagraph);
              sqlWrapper.append(document.createElement("br"));

			  document.body.style.backgroundImage = "url('images_tracks/" + row.image + "')"; 

              const artistLink = document.createElement("a"); 

              artistLink.setAttribute("href", row.artist_url);
              artistLink.setAttribute("target", "_blank");

              const artist  = document.createTextNode(row.artist);
              artistLink.appendChild(artist);

              artistLink.className = "buttonstyle";
              sqlWrapper.appendChild(artistLink);    		  
    		}.bind({counter: 0})
    	}
    );
  }else{
  	console.log("" + currentTrackFilename + " is same as " + currentTrackTrimmed);
  }    
}

function logger(...args){
      const div = document.createElement('div');
      const small = document.createElement('small');
      small.append(document.createTextNode(args.join(' ')));
      div.append(small);
      document.body.append(div);
};

(function(){
  const openDatabase = function(sqlite3){
    fetch("./track_database.db")
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const p = sqlite3.wasm.allocFromTypedArray(arrayBuffer);
        db = new sqlite3.oo1.DB();
        
        const rc = sqlite3.capi.sqlite3_deserialize(db.pointer, 'main', p, arrayBuffer.byteLength, arrayBuffer.byteLength, sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE);
        db.checkRc(rc);

        startListening();
        registerKeys();
      }
    );    
  };

  //Boilerplate loading from sqlite3 WASM demo::
  if(globalThis.window!==globalThis){
    importScripts('sqlite3.js');
  }
  globalThis.sqlite3InitModule({
  }).then(function(sqlite3){
    try {
      openDatabase(sqlite3);
    }catch(e){
      console.log(e.message);
    }
  });
})();
