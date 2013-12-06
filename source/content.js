(function wallbaseDownloadFromSearch() {
	var updating = false;

	// Function to add a download link to a thumbnail element
	function addDownloadLink(element) {
		if(!element.getElementsByClassName("wbs_dl")[0]) {
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
			downloadAnchor.download = "";
			downloadAnchor.classList.add("icon-download");
			previewAnchor = document.createElement("a");
			previewAnchor.href = downloadLink;
			previewAnchor.target = "_blank";
			previewAnchor.classList.add("icon-eye");
			downloadDiv.appendChild(previewAnchor);
			downloadDiv.appendChild(downloadAnchor);
			element.appendChild(downloadDiv);
		}
	};

	// Document load handler
	function addDownloadLinks() {
		var wrappers = document.getElementById("thumbs").getElementsByClassName("wrapper");
		for (var i = 0, l = wrappers.length; i < l; i++) {
			addDownloadLink(wrappers.item(i));
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
}());
