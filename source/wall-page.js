(function addDownloadLinksOnWallpapersPage() {
	var wallpaperLink = document.querySelector("img.wall").getAttribute("src");
	var downloadLink = document.createElement("a");
	downloadLink.setAttribute("href",wallpaperLink);
	downloadLink.setAttribute("download","");

	var downloadElement = document.createElement("div");
	downloadElement.className = "row favsrow wbs-down clr";

	downloadLink.insertAdjacentHTML("afterbegin", '<div class="icon icon-download"></div><div class="title">1-click download this wallpaper.</div>');
	downloadElement.insertAdjacentHTML("afterbegin",downloadLink.outerHTML);

	document.querySelector("div.row.favsrow").insertAdjacentHTML("afterend", downloadElement.outerHTML);
}());