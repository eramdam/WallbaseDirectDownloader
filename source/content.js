$(document).ready(function() {
	$('section#thumbs div.thumbnail > div.wrapper').each(function(index, el) {
		var thumbLink = $("img",this).attr('data-original');
		var wallLink = thumbLink.replace("thumbs","wallpapers");
		var wallLink = wallLink.replace("thumb-","wallpaper-");
		$(this).append('<div class="dl"><a href='+wallLink+' >Download</a></div>');
	});
});

