import {saveAs} from 'file-saver';
function urlCheck(url) {
  return fetch(url, {
    method: 'HEAD'
  });
}

async function maybeGetFixedUrl(url) {
  const res = await urlCheck(url);
  if (res.status === 200) {
    return url;
  }

  return url.replace(/jpg$/, 'png');
}

function addDownloadLinksToThumbnails() {
  const wrappers = document
    .querySelector('#thumbs, #tag-thumbs')
    .querySelectorAll('li figure.thumb');

  Array.from(wrappers).forEach(item => {
    addDownloadLinksToThumbnail(item);
  });
}

async function addDownloadLinksToThumbnail(element) {
  if (element.querySelector('.wbs_dl')) {
    return;
  }

  // Get the thumbnail URL and create a download URL from it
  const thumbnailImage = element.querySelector('img');

  if (!thumbnailImage) {
    return;
  }

  let thumbnailLink = '';

  if (!thumbnailImage.getAttribute('data-src')) thumbnailLink = thumbnailImage.getAttribute('src');
  else thumbnailLink = thumbnailImage.getAttribute('data-src');

  const downloadLink = thumbnailLink
    .replace(/\/small\/([0-9a-z]+)\//i, '/full/$1/wallhaven-')
    .replace('th.wallhaven', 'w.wallhaven');

  const fixedDownloadLink = await maybeGetFixedUrl(downloadLink);

  const downloadDiv = document.createElement('div');
  downloadDiv.className = 'wbs_dl wbs_unsafe';
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('alt', 'Download');
  downloadAnchor.setAttribute('target', '_blank');
  downloadAnchor.setAttribute('href', fixedDownloadLink);
  downloadAnchor.setAttribute('download', '');
  downloadAnchor.classList.add('icon-download');

  const previewAnchor = document.createElement('a');
  previewAnchor.setAttribute('alt', 'Open in new tab');
  previewAnchor.setAttribute('href', fixedDownloadLink);
  previewAnchor.setAttribute('target', '_blank');
  previewAnchor.classList.add('icon-eye');

  downloadAnchor.onclick = e => {
    e.preventDefault();
    saveAs(e.target.href, new URL(e.target.href).pathname.split('/').reverse()[0]);
  };

  downloadDiv.appendChild(previewAnchor);
  downloadDiv.appendChild(downloadAnchor);
  element.appendChild(downloadDiv);
}

function addDownloadLinkOnWallpaperPage() {
  const wallpaperLink = document.querySelector('#wallpaper').getAttribute('src');
  const downloadButton = document.createElement('div');
  downloadButton.className = 'button';
  downloadButton.id = 'wbs-dl-button';

  const downloadLink = document.createElement('a');
  const iconElement = document.createElement('i');
  iconElement.className = 'icon icon-download';

  downloadLink.setAttribute('href', wallpaperLink);
  downloadLink.setAttribute('target', '_blank');
  downloadLink.insertAdjacentText('beforeend', ' Download this wallpaper');
  downloadLink.insertAdjacentElement('afterbegin', iconElement);
  downloadButton.appendChild(downloadLink);

  downloadButton.onclick = e => {
    e.preventDefault();
    saveAs(wallpaperLink, new URL(wallpaperLink).pathname.split('/').reverse()[0]);
  };

  document
    .querySelector('.sidebar-section[data-storage-id="showcase-tools"] .showcase-tools')
    .insertAdjacentElement('beforebegin', downloadButton);
}

setTimeout(() => {
  if (document.querySelector('#thumbs, #tag-thumbs')) {
    const observer = new MutationObserver(() => {
      Array.from(document.querySelectorAll('figure.thumb')).forEach(el => {
        addDownloadLinksToThumbnail(el);
      });
    });

    observer.observe(document.querySelector('#thumbs, #tag-thumbs'), {
      childList: true
    });

    addDownloadLinksToThumbnails();
  } else if (document.querySelector('#showcase-sidebar')) {
    addDownloadLinkOnWallpaperPage();
  }
}, 0);
