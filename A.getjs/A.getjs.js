/*!
 * A.getJS v0.9
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

function getScript ( url, callback, type ) {
	
	var	script = document.createElement("script"),
		done = 0;
	
	script.src = url;
	script.type = type || "text/javascript";
	
	// Attach handlers for all browsers
	script[ strOnLoad ] = script[ strOnReadyStateChange ] = function(){

		if ( !done && (!script[ strReadyState ] ||
				script[ strReadyState ] == "loaded" || script[ strReadyState ] == "complete") ) {

			// Tell global scripts object this script has loaded.
			// Set scriptDone to prevent this function from being called twice.
			done = 1;

			callback( url );
			
			// Handle memory leak in IE
			script[ strOnLoad ] = script[ strOnReadyStateChange ] = null;
			docElement.removeChild( script );
		}
	};
	
	docElement.appendChild( script );
}
	
function getJS ( urlKey, urlKeyCallback ) {
		
	function geckoCallback ( url ) {
		// If both scripts loaded, it's time to party.
		++urlCount == urlCountTotal && urlKeyCallback && urlKeyCallback();
	}
		
	function getJSCallback ( url ) {
			
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
						getScript( thisUrl, executeCallback );	
					}
				}
			}
		}
		
		// Remember that we have this script cached.
		urlCached[ url ] = 1;

		// If this callback happens to be for the first urlKey
		// in the chain, we can trigger the execution. 
		urlKey == urlKeyChain[0] && executeJS();
	}

	var urls = urlKey.split( urlSplit ),
		urlCount = 0,
		urlCountTotal = urls.length,
		i = 0,
		type,
		urlKeyChain = this.c; // Contains an arays of urlKeys of this chain, if available.
		
	// Gecko does what we want out of the box, sort of.
	// Bypass our super special callback.
	if ( isGecko ) {
		
		getJSCallback = geckoCallback;
		
	// Manage callbacks and execution order manually.
	} else {
		
		// We set this to something bogus so browsers do not 
		// execute code on our initial request.
		// http://ejohn.org/blog/javascript-micro-templating/
		type = "c";
		
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
	}
				
	// Cache the scripts requested.
	for (; i < urlCountTotal; i++) {
		// Fetch the script.
		getScript( urls[i], getJSCallback, type );
	}
	
	return {
		c: urlKeyChain,
		getJS: getJS
	}
}

var	docElement = document.documentElement,
//	Artz: Just making things smaller, uncomment if people care.
//	head = document.getElementsByTagName("head")[0] || docElement,  
	urlKeyCallbacks = {},
	urlCached = {},
	urlExecuted = {},
	urlSplit = ",",	
	
	strReadyState = "readyState",
	strOnReadyStateChange = "onreadystatechange",
	strOnLoad = "onload",
	
	isGecko = ("MozAppearance" in docElement.style);

// Open A.getJS for business!
this.A || (A = {});
A.getJS = getJS;

})( document );