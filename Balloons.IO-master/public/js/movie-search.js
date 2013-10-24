var fbaseURL = "https://www.googleapis.com/freebase/v1/search";
var fbaseKey = "AIzaSyDg3Mx_26umohj8Z_fCDdEufoNn1gry3QE";
var omdbURL = "http://www.omdbapi.com/";
var utils;
var fbase;
var titleFound = false;
var infoFound = false;
var matchCallback, infoCallback;

function MovieSearch() {
	utils = new Utilities();
	fbase = new Freebase();
}

function Freebase() {}
function OMDb() {}
function Utilities() {}

MovieSearch.prototype.getResponse = function(movie, callback) {
	var fbaseReq = fbaseURL + "?filter=(any type:/film/film)&limit=5&spell=always&key=" + fbaseKey + "&query=" + movie;
	$.getJSON(fbaseReq,
		function(response) {
			//socket.emit('my msg', { msg: "response"});
			callback(response);
		}
	);
};

MovieSearch.prototype.search = function(movie, mCallback, iCallback) {
	if(typeof(movie) == 'undefined')
		return;
	titleFound = false;
	infoFound = false;
	matchCallback = mCallback;
	infoCallback = iCallback;
	fbase.search(movie);
};

Freebase.prototype.search = function(movie) {
	var fbaseReq = fbaseURL + "?filter=(any type:/film/film)&limit=5&spell=always&key=" + fbaseKey + "&query=" + movie;
	var correction;
	var omdb = new OMDb();
	$.getJSON(fbaseReq,
        function(response){
		console.log("freebase search: " + movie);
		console.log(response);
		correction = response.correction;
		if(typeof(correction) == 'undefined' && response.hits == 0) {
			console.log("freebase no results");
			omdb.search(movie);
		}
		if(typeof(correction) != 'undefined') {
			console.log("correction : " + correction);
			if(!titleFound) {
				matchCallback(correction);
				titleFound = true;
				utils.getMovieInfo(correction);
			}
			/*if(!found) {
				omdb.search(correction);
			}*/
		}
		var matches = [];
		$.each(response.result, function(i, match){
			matches.push(match.name.toLowerCase());
		});
		var bestMatch = utils.getBestMatch(movie, matches);
		if(!titleFound) {
			matchCallback(bestMatch);
			titleFound = true;
		}
		utils.getMovieInfo(bestMatch);
     	});
};

OMDb.prototype.search = function(movie) {
	var mWords = new String(movie).split(" ");
	for(var i = 0; i < mWords.length; i++) {
		if(mWords[i].length < 3)
			continue;
		var omdbReq = omdbURL + "?&s=" + mWords[i];
		console.log("omdb search : " + mWords[i]);
		$.getJSON(omdbReq,
	        function(response) {
				//console.log(response);
				var matches = [];
				if (typeof(response.Search) != 'undefined' &&  !titleFound) {
					$.each(response.Search, function(i, match){
						matches.push(match.Title.toLowerCase());
					});
					utils.getMovieInfo(utils.getBestMatch(movie, matches));
				}
	    });
	};
};

Utilities.prototype.getMovieInfo = function(movie) {
	if(infoFound || movie == null)
		return;
	var omdbReq = omdbURL + "?&t=" + movie;
	$.getJSON(omdbReq,
        function(response) {
			console.log("omdb info : " + movie);
			//console.log(response);
			var result = response.Title;
			var poster = response.Poster;
			if(typeof(result) != 'undefined') {
				console.log("result : " + result);
				//console.log("poster : " + poster);
				if (poster == "N/A") {
					poster = "../img/icon-user.png";
					console.log("poster : " + poster);
				} else {
					//poster = "http://ia.media-imdb.com/images/M/MV5BMjExNzM0NDM0N15BMl5BanBnXkFtZTcwMzkxOTUwNw@@._V1_SX300.jpg";
					console.log("poster : " + poster);
				}
				//poster = "http://ia.media-imdb.com/images/M/MV5BMjExNzM0NDM0N15BMl5BanBnXkFtZTcwMzkxOTUwNw@@._V1_SX300.jpg";
				if(!infoFound) {
					//console.log(poster);
					infoCallback(poster);
					infoFound = true;
				}
			};
        });
};

Utilities.prototype.getBestMatch = function(movie, matches) {
	if(titleFound)
		return;
	var strLength = movie.length;
	var minDist = strLength, minInd = -1, curDist = -1, bestMatch = null;
	
	for(i in matches) {
		curDist = this.editDistance(movie, matches[i], strLength/3);
		if (curDist != -1 && curDist < minDist) {
			minDist = curDist;
			minInd = i;
		};
	}
	if (minInd != -1)
		bestMatch = matches[minInd];
	return bestMatch;
};

Utilities.prototype.editDistance = function(p_source, p_target, p_limit) {
	if (p_source == null) { p_source = ''; }
	if (p_target == null) { p_target = ''; }

	if (p_source == p_target) { return 0; }

	var d = [];
	var cost;
	var n = p_source.length;
	var m = p_target.length;

	if (n == 0) { return m; }
	if (m == 0) { return n; }
	if (Math.abs(m - n) > p_limit) { return -1; }
	
	for (var a=0; a<=n; a++) { d[a] = []; }
	for (var b=0; b<=n; b++) { d[b][0] = b; }
	for (var c=0; c<=m; c++) { d[0][c] = c; }

	for (var i=1; i<=n; i++) {

		var s_i = p_source.charAt(i-1);
		for (var j=1; j<=m; j++) {

			var t_j = p_target.charAt(j-1);

			if (s_i == t_j) {
				cost = 0; 
			} else { 
				cost = 1; 
			}
			d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+cost);
		};
	}
	return d[n][m];
};
