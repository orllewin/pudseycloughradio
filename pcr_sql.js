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
              sqlWrapper.append(document.createTextNode(row.filename));
              sqlWrapper.appendChild(document.createElement("br"));
              sqlWrapper.append(document.createTextNode(row.description));
              sqlWrapper.appendChild(document.createElement("br"));
              const img = document.createElement('img');
              img.src = "images_tracks/" + row.image;
              sqlWrapper.appendChild(document.createElement("br"));
              sqlWrapper.appendChild(img);
              sqlWrapper.appendChild(document.createElement("br"));
              const artistLink = document.createElement("a"); 

              artistLink.setAttribute("href", row.artist_url);
              artistLink.setAttribute("target", "_blank");

              const artist  = document.createTextNode(row.artist);
              artistLink.appendChild(artist);

              artistLink.className = "buttonstyle";
              sqlWrapper.appendChild(artistLink);

              const extLinkImg = document.createElement('img');
              extLinkImg.src = "images/external_link.svg"
              extLinkImg.className = "external_link";

              sqlWrapper.appendChild(extLinkImg);
    		  
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
