/*!
* A.getJS v1.1
* http://www.artzstudio.com/A.js/getJS/
*
* Developed by: 
* - Dave Artz http://www.artzstudio.com/
*
* Copyright (c) 2010
* Not yet licensed cuz I lack free time.
*/

/*
* A.getJS is a script that loads JavaScript asynchronously while
* preserving execution order via a chaining interface.
* 
* @author        Dave Artz
* @copyright     (c) 2010 Dave Artz
*/
(function( document ) {

// Artz: Consider implementing Image() for IE? Might be more bloaty.
// http://platform.aol.com/code/upusi/2/edit
function getObject ( elem, url, callback, type ) {

	var	object = document.createElement( elem ),
		done = 0;
	
	object.src = object.data = url;
	object.type = type;
	object.width = object.height = 0;
	
	// Attach handlers for all browsers
	object[ strOnLoad ] = object[ strOnReadyStateChange ] = function() {
		
		if ( !done && (!object[ strReadyState ] ||
			object[ strReadyState ] == "loaded" || object[ strReadyState ] == "complete") ) {
			
			// Tell global scripts object this script has loaded.
			// Set scriptDone to prevent this function from being called twice.
			done = 1;
			
			callback( url );
			
			// Handle memory leak in IE
			object[ strOnLoad ] = object[ strOnReadyStateChange ] = null;
			docElement.removeChild( object );
		}
	};
	
	docElement.appendChild( object );
}

function getJS ( urlKey, urlKeyCallback ) {
	
	function executeJS () {
		
		function executeCallback () {
			
			// If all scripts have been cached in the set, it's time
			// to execute the urlKey callback after the script loads.
			if ( ++cacheCount == thisUrlsCount ) {
				
				// Execute the callback associated with this urlKey
				thisUrlKeyCallback && thisUrlKeyCallback();
				
				// Kill the first item in the url chain and redo executeJS
				urlKeyChain.shift();
				executeJS();
			}
		}
		
		for ( var i = 0,
			thisUrlKey = urlKeyChain[0] || "",
			thisUrls = thisUrlKey.split( urlSplit ),
			thisUrl,
			thisUrlsCount = thisUrls.length,
			thisUrlKeyCallback = urlKeyCallbacks[ thisUrlKey ],
			cacheCount = 0; i < thisUrlsCount; i++ ) {
			
			thisUrl = thisUrls[i];
			
			if ( urlCached[ thisUrl ] ) {
				if ( urlExecuted[ thisUrl ] ) {
					// If we already executed, just do the callback.
					executeCallback();					
				} else {
					// Rememeber that this script already executed.
					urlExecuted[ thisUrl ] = 1;
					
					// Fetch script with a blank type; i.e. load normally.
					getObject( strScript, thisUrl, executeCallback, "" );
				}
			}
		}
	}
	
	function getJSCallback ( url ) {

		// Remember that we have this script cached.
		urlCached[ url ] = 1;
		
		// If this callback happens to be for the first urlKey
		// in the chain, we can trigger the execution. 
		urlKey == urlKeyChain[0] && executeJS();
	}
	
	var urls = urlKey.split( urlSplit ),
		urlCountTotal = urls.length,
		i = 0,
		elem = "object",
		type = "text/plain",
		urlKeyChain = this.c; // Contains an arays of urlKeys of this chain, if available.
		
	// Our object trick works for all browsers except IE.
	// Instead, we'll use the script mime type trick to cache.
	if ( isIE ) {
		
		// We set this to something bogus so IE does not 
		// execute code on our initial request.
		// http://ejohn.org/blog/javascript-micro-templating/
		elem = strScript;
	}
	
	// If this is a new chain, start a new array, otherwise push the new guy in.
	// This is used to preserve execution order for non FF browsers.
	if ( urlKeyChain ) {
		// Push the urlKey into the chain.
		urlKeyChain.push( urlKey );
	} else {
		// Create a new urlKeyChain to pass on to others.
		urlKeyChain = [ urlKey ];
	}
	
	// Remember the original callback for this key for later.
	urlKeyCallbacks[ urlKey ] = urlKeyCallback;
	// Cache the scripts requested.
	for (; i < urlCountTotal; i++) {
		// Fetch the script.
		getObject( elem, urls[i], getJSCallback, type );
	}
	
	return {
		c: urlKeyChain,
		getJS: getJS
	};
}

var	docElement = document.documentElement,
	//	Artz: Just making things smaller, uncomment if people care.
	//	head = document.getElementsByTagName("head")[0] || docElement,  
	urlKeyCallbacks = {},
	urlCached = {},
	urlExecuted = {},
	urlSplit = ",",	

	strScript = "script",
	strReadyState = "readyState",
	strOnReadyStateChange = "onreadystatechange",
	strOnLoad = "onload",
	
	isIE = /*@cc_on!@*/0;

// Open A.getJS for business!
this.A || (A = {});
A.getJS = getJS;

})( document );