var fbaseURL = "https://www.googleapis.com/freebase/v1/search";
var fbaseKey = "AIzaSyDg3Mx_26umohj8Z_fCDdEufoNn1gry3QE";
var omdbURL = "http://www.omdbapi.com/";
var utils = new Utilities();


function MovieSearch() {
}

MovieSearch.prototype.searchMovie = function(movie) {
	matchFound = false;
	fbase = new FreebaseSearch();
	omdb = new OMDbSearch();
	fbase.searchMovie(movie);
	omdb.searchMovie(movie);
};

function FreebaseSearch() {
}

FreebaseSearch.prototype.searchMovie = function(movie) {
	var request = fbaseURL + "?filter=(any type:/film/film)&spell=no_results&key=" + fbaseKey + "&query=" + movie;
	$.getJSON(request,
        function(response){
			//console.log(JSON.stringify(response.result));
			var correction = response.correction;
			//console.log("correction : " + correction.length);
			if(typeof(response.correction) != 'undefined') {
				//console.log("bestMatch : " + response.correction);
				$("#fbaseMatch").val(correction);
				$("#resultText").append("Freebase : " + $("#fbaseMatch").val() + "<br>");
				console.log("fbase match : " + $("#fbaseMatch").val());
				matchFound = true;
				return;
			}
			var matches = [];
			$.each(response.result, function(i, match){
				matches.push(match.name.toLowerCase());
			});
			bestMatch = utils.getBestMatch(movie, matches);
			matchFound = true;
			$("#fbaseMatch").val(bestMatch);
			$("#resultText").append("Freebase : " + $("#fbaseMatch").val() + "<br>");
			console.log("fbase match : " + $("#fbaseMatch").val());
			//console.log("matches : " + matches);
			//$("#text").text(matches);
        });
};

function OMDbSearch() {
}

OMDbSearch.prototype.searchMovie = function(movie) {
	var request = omdbURL + "?&s=" + movie;
	$.getJSON(request,
        function(response){
			var matches = [];
			if (typeof(response.Search) == 'undefined') {
				return;
			}
			//console.log(JSON.stringify(response.Search));
			$.each(response.Search, function(i, match){
				//console.log(JSON.stringify(match.Title));
				matches.push(match.Title.toLowerCase());
			});
			bestMatch = utils.getBestMatch(movie, matches);
			$("#omdbMatch").val(bestMatch);
			$("#resultText").append("OMDb : " + $("#omdbMatch").val() + "<br>");
			console.log("omdb match : " + $("#omdbMatch").val());
			//console.log("matches : " + matches);
			//$("#text").text(matches);
        });
};

function Utilities() {
}

Utilities.prototype.getBestMatch = function(movie, matches) {
	var strLength = movie.length;
	var minDist = strLength, minInd = -1, curDist = -1, bestMatch;
	
	for(i in matches) {
		//console.log(matches[i] + " " + this.editDistance(movie, matches[i], movieLength/3));
		curDist = this.editDistance(movie, matches[i], strLength/3);
		if (curDist != -1 && curDist < minDist) {
			minDist = curDist;
			minInd = i;
		}
	}
	if (minInd != -1) {
		bestMatch = matches[minInd];
	} else {
		bestMatch = "";
	}
	return bestMatch;
//	console.log("bestMatch : " + bestMatch);
//	$("#resultText").text(bestMatch);
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

			if (s_i == t_j) { cost = 0; }
			else { cost = 1; }

			d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+cost);
		}
	}
	return d[n][m];
};