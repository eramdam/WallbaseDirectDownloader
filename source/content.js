(function wallbaseDownloadFromSearch() {
	var updating = false;

	function urlCheck(url, callback){
	    var request = new XMLHttpRequest;
	    request.open('HEAD', url, true);
	    request.send();
	    request.onreadystatechange = function(){
	        if(request.readyState==4){
	            callback(request)
	        }
	    }
	};

	// Function to add a download link to a thumbnail element
	function addDownloadLink(element) {
		if(!element.getElementsByClassName("wbs_dl")[0]) {
			var thumbnailImage,
			thumbnailLink,
			downloadLink,
			downloadDiv,
			downloadAnchor,
			previewAnchor;

			// Get the thumbnail URL and create a download URL from it
			thumbnailImage = element.getElementsByTagName("img")[0];
			
			if(!element.getElementsByTagName("img")[0].getAttribute("data-original"))
				thumbnailLink = thumbnailImage.getAttribute("src");
			else
				thumbnailLink = thumbnailImage.getAttribute("data-original");

			// Checking the "format" of the thumbnail then adapting the downloadLink accordingly
			if(thumbnailLink.indexOf("orig") > -1) {
				downloadLink = thumbnailLink.replace(/origthumb/g, "wallpaper");
				downloadLink = downloadLink.replace(/thumb/g, "wallpaper");
			} else if(thumbnailLink.indexOf("sthumb") > -1) {
				downloadLink = thumbnailLink.replace(/sthumb/g, "wallpaper");
				downloadLink = downloadLink.replace(/thumb/g, "wallpaper");
			} else {
				downloadLink = thumbnailLink.replace(/thumb/g, "wallpaper");
			}

			// Removing the double slash in URLs
			downloadLink = downloadLink.replace(/cc\//,"cc");

			downloadDiv = document.createElement("div");
			downloadDiv.className = "wbs_dl wbs_unsafe";
			downloadAnchor = document.createElement("a");
			downloadAnchor.setAttribute("href",downloadLink);
			downloadAnchor.setAttribute("download","");
			downloadAnchor.classList.add("icon-download");
			previewAnchor = document.createElement("a");
			previewAnchor.setAttribute("href",downloadLink);
			previewAnchor.setAttribute("target","_blank");
			previewAnchor.classList.add("icon-eye");
			downloadDiv.appendChild(previewAnchor);
			downloadDiv.appendChild(downloadAnchor);
			element.appendChild(downloadDiv);
		}
	};	

	function fixLinks() {
		toFix = document.getElementsByClassName("wbs_unsafe");
		for (var i = 0; i < toFix.length; i++) {
			var link = toFix[i];
			urlCheck(link.querySelector("a").href, function(request) {
				if(request.status===404) {
					linkFixed = link.querySelector("a").href.replace(/jpg$/,"png");
					link.querySelectorAll('a[class^="icon-"]')[0].setAttribute("href", linkFixed);
					link.querySelectorAll('a[class^="icon-"]')[1].setAttribute("href", linkFixed);
				}
			});
			link.classList.remove("wbs_unsafe");
			
		};
	}

	// Document load handler
	function addDownloadLinks() {
		var wrappers = document.getElementById("thumbs").getElementsByClassName("wrapper");
		for (var i = 0, l = wrappers.length; i < l; i++) {
			addDownloadLink(wrappers.item(i));
			fixLinks();
		}
		updating = false;
	};

	// Document update handler
	function updateDownloadLinks(event) {
		if (event.target.classList && event.target.classList.contains("thumbnail") && !updating) {
			updating = true;
			addDownloadLinks();
		}
	};

	// The thumbnail list will be updated on scroll
	document.getElementById("thumbs").addEventListener("DOMNodeInserted", updateDownloadLinks);

	addDownloadLinks();
	fixLinks();

}());