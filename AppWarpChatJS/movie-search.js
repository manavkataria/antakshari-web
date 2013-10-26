var movieSearch = (function() {
	var fbaseURL = "https://www.googleapis.com/freebase/v1/search";
	var fbaseKey = "AIzaSyDg3Mx_26umohj8Z_fCDdEufoNn1gry3QE";
	var omdbURL = "http://www.omdbapi.com/";
	var tmdbURL = "http://api.themoviedb.org/3/search/movie"
	var tmdbKey = "14e22c5dfb9846f171b2441488d4959b";
	var tmdbPosterURL = "http://d3gtl9l2a4fn1j.cloudfront.net/t/p/original"
	var matchFound = false;
	var resCallback;
	
	function transform(str) {
		result = str.trim().toLowerCase().split(':')[0].replace(/[^a-z0-9 ]/g, " ").replace(/ +/g, " ");
		return result;
	}
		
	function getEditDistance (p_source, p_target, p_limit) {
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
	}
	
	function getBestMatch(movie, matches) {
		if(!matchFound) {
			var strLength = movie.length;
			var minDist = strLength, minInd = -1, curDist = -1, bestMatch = null;
			
			for(i in matches) {
				curDist = getEditDistance(movie, matches[i], strLength/3);
				if (curDist != -1 && curDist < minDist) {
					minDist = curDist;
					minInd = i;
				};
			}
			if (minInd != -1)
				bestMatch = matches[minInd];
			return bestMatch;
		}
	}
	
	function omdbSearch(movie) {
		if(!matchFound) {
			var mWords = new String(movie).split(" ");
			for(var i = 0; i < mWords.length; i++) {
				if(mWords[i].length < 3)
					continue;
				var omdbReq = omdbURL + "?&s=" + mWords[i];
				console.log("omdb search : " + mWords[i]);
				$.getJSON(omdbReq, function(response) {
					//console.log(response);
					if(!matchFound) {
						var matches = [];
						if (response.Error == 'undefined') {
							$.each(response.Search, function(i, match){
								matches.push(transform(match.Title));
							});
							//console.log(matches);
							var bestMatch = getBestMatch(movie, matches);
							if(bestMatch != null)
								getInfo(bestMatch);
						}
					}
			    });
			};
		}
	}
	
	function getInfo(movie) {
		if(!matchFound) {
			var omdbReq = omdbURL + "?&t=" + movie;
			$.getJSON(omdbReq, function(response) {
				if(!matchFound) {
					console.log("omdb info : " + movie);
					//console.log(typeof(response.Error));
					if (typeof(response.Error) == 'undefined') {
						//console.log("result : " + respnose);
						matchFound = true;
						resCallback(response);
					}
				}
		     });
		}
	}
	
	function tmdbSearch(movie) {
		//http://api.themoviedb.org/3/search/movie?api_key=14e22c5dfb9846f171b2441488d4959b&query=titanic
		var tmdbReq = tmdbURL + "?api_key=" + tmdbKey + "&query=" + movie;
		//console.log(tmdbReq);
		$.getJSON(tmdbReq, function(response) {
			var resp = null;
			results = response.total_results;
			if(results != 0) {
				poster = response.results[0].poster_path;
				//console.log(tmdbPosterURL + poster);
				resp = {"title" : movie, "poster" : tmdbPosterURL + poster};
			} else {
				resp = {"title" : movie, "poster" : "na"};
			}
			resCallback(resp);
		});
	}

	function fbaseSearch(movie) {
		var fbaseReq = fbaseURL + "?filter=(any type:/film/film)&limit=5&spell=always&key=" +  fbaseKey + "&query=" + movie;
		var correction;
		console.log("freebase search: " + movie);
		$.getJSON(fbaseReq, function(response) {
			correction = response.correction;
			if(typeof(correction) == 'undefined' && response.hits == 0) {
				console.log("freebase no results");
				//omdbSearch(movie);
			} else if(typeof(correction) != 'undefined') {
				console.log("correction : " + correction);
				tmdbSearch(correction);
				//getInfo(correction);
				//omdbSearch(correction);
			} else {
				console.log("freebase matches found");
				var matches = [];
				//console.log(response);
				$.each(response.result, function(i, match){
					matches.push(transform(match.name));
				});
				//console.log(matches);
				var bestMatch = getBestMatch(movie, matches);
				if(bestMatch != null) {
					tmdbSearch(bestMatch);
					//getInfo(bestMatch);
					//omdbSearch(movie);
				}	
			}
		});
	}

	return { // public interface
		setCallback: function (funcName) {
			resCallback = funcName;
	    },
	    getMovieInfo: function (movie) {
	    	matchFound = false;
	    	trMovie = transform(movie);
	    	fbaseSearch(trMovie);
	    },
	    searchTMDB: function(movie) {
	    	tmdbSearch(movie);
	    }
	};
})();