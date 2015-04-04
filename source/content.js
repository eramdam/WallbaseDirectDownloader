
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
		if(!element.getElementsByClassName('wbs_dl')[0]) {
			var thumbnailImage,
			thumbnailLink,
			downloadLink,
			downloadDiv,
			downloadAnchor,
			previewAnchor;

			// Get the thumbnail URL and create a download URL from it
			thumbnailImage = element.getElementsByTagName('img')[0];
			
			if(!element.getElementsByTagName('img')[0].getAttribute('data-src'))
				thumbnailLink = thumbnailImage.getAttribute('src');
			else
				thumbnailLink = thumbnailImage.getAttribute('data-src');


			downloadLink = thumbnailLink.replace(/\/thumb\/[a-z]+\/th-/g,'/full/wallhaven-');

			downloadDiv = document.createElement('div');
			downloadDiv.className = 'wbs_dl wbs_unsafe';
			downloadAnchor = document.createElement('a');
			downloadAnchor.setAttribute('alt', 'Download');
			downloadAnchor.setAttribute('href',downloadLink);
			downloadAnchor.setAttribute('download','');
			downloadAnchor.classList.add('icon-download');
			previewAnchor = document.createElement('a');
			previewAnchor.setAttribute('alt', 'Open in new tab');
			previewAnchor.setAttribute('href',downloadLink);
			previewAnchor.setAttribute('target','_blank');
			previewAnchor.classList.add('icon-eye');
			downloadDiv.appendChild(previewAnchor);
			downloadDiv.appendChild(downloadAnchor);
			element.appendChild(downloadDiv);
		}
	};	

	function fixLinks() {
		toFix = document.getElementsByClassName('wbs_unsafe');
		for (var i = 0; i < toFix.length; i++) {
			var link = toFix[i];
			urlCheck(link.querySelector('a').href, function(request) {
				if(request.status===404) {
					linkFixed = link.querySelector('a').href.replace(/jpg$/,'png');
					link.querySelectorAll('a[class^="icon-"]')[0].setAttribute('href', linkFixed);
					link.querySelectorAll('a[class^="icon-"]')[1].setAttribute('href', linkFixed);
				}
			});
			link.classList.remove('wbs_unsafe');
			
		};
	}

	// Document load handler
	function addDownloadLinks() {
		var wrappers = document.querySelector('#thumbs, #tag-thumbs').querySelectorAll('li figure.thumb');
		for (var i = 0, l = wrappers.length; i < l; i++) {
			addDownloadLink(wrappers.item(i));
			fixLinks();
		}
		updating = false;
	};

	// Document update handler
	function updateDownloadLinks(event) {
		if (event.relatedNode.querySelectorAll('.thumb') && !updating) {
			updating = true;
			addDownloadLinks();
		}
	};

	function addDownloadLinksOnWallpapersPage() {
		var wallpaperLink = document.getElementById('wallpaper').getAttribute('src');
		var downloadButton = document.createElement('div');
		downloadButton.className = 'button';
		downloadButton.id = 'wbs-dl-button';

		var downloadLink = document.createElement('a');
		downloadLink.setAttribute('href', wallpaperLink);
		downloadLink.setAttribute('download','');
		downloadLink.insertAdjacentHTML('afterbegin', '<i class="icon icon-download"></i> Download this wallpaper');
		downloadButton.appendChild(downloadLink);

		document.getElementById('fav-button').insertAdjacentHTML('afterend', downloadButton.outerHTML);
	}

	// The thumbnail list will be updated on scroll
	if (document.querySelector('#thumbs, #tag-thumbs')) {
		document.querySelector('#thumbs, #tag-thumbs').addEventListener('DOMNodeInserted', updateDownloadLinks);
		addDownloadLinks();
		fixLinks();
	} else if (document.getElementById('showcase-sidebar')) {
		addDownloadLinksOnWallpapersPage();
	}

}());

