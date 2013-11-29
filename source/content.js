(function wallbaseDownloadFromSearch() {
	var updating = false;

	// Function to add a download link to a thumbnail element
	var addDownloadLink = function addDownloadLink(element) {
		var thumbnailImage,
			thumbnailLink,
			downloadLink,
			downloadDiv,
			downloadAnchor;

		// Get the thumbnail URL and create a download URL from it
		thumbnailImage = element.getElementsByTagName("img")[0];
		thumbnailLink = thumbnailImage.getAttribute("data-original");
		downloadLink = thumbnailLink.replace(/thumb/g, "wallpaper");

		// Add a download link to the thumbnail
		downloadDiv = document.createElement("div");
		downloadDiv.className = "wbs_dl";
		downloadAnchor = document.createElement("a");
		downloadAnchor.href = downloadLink;
		downloadAnchor.textContent = "Download";
		downloadDiv.appendChild(downloadAnchor);
		element.appendChild(downloadDiv);
	};

	// Document load handler
	var addDownloadLinks = function initDownloadLinks() {
		var wrappers = document.getElementById("thumbs").getElementsByClassName("wrapper");
		for (var i = 0, l = wrappers.length; i < l; i++) {
			addDownloadLink(wrappers.item(i));
		}
		updating = false;
	};

	// Document update handler
	var updateDownloadLinks = function updateDownloadLinks(event) {
		if (event.target.classList && event.target.classList.contains("thumbnail")) {
			if (!updating) {
				updating = true;
				addDownloadLinks();
			}
		}
	};

	// The thumbnail list will be updated on scroll
	document.getElementById("thumbs").addEventListener("DOMNodeInserted", updateDownloadLinks);

	addDownloadLinks();
}());
