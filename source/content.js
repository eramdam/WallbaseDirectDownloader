import {saveAs} from 'file-saver';

async function getMarkAsSeenSetting() {
  // It's not like Wallhaven has an API or anything so our best bet here is to just crawl the settings page like it's 2003 or something.
  const dom = new DOMParser();
  const html = await fetch('https://wallhaven.cc/settings/browsing').then(res => res.text());
  const settingsPage = dom.parseFromString(html, 'text/html');
  const input = settingsPage.querySelector('[name="mark_seen_wallpapers"]');

  if (!input) return false;

  return Boolean(input.checked);
}

let shouldMarkAsSeen = false;

function addDownloadLinksToThumbnails() {
  // Grab our thumbnails.
  const wrappers = document
    .querySelector('#thumbs, #tag-thumbs')
    .querySelectorAll('li figure.thumb');

  // Add links to every one of them.
  Array.from(wrappers).forEach(item => {
    addDownloadLinksToThumbnail(item);
  });
}

const WallhavenSennWallpapersStorageKey = 'wallhaven.seen-wallpapers';

function markWallpaperAsSeen(downloadLink) {
  if (!shouldMarkAsSeen) {
    return;
  }

  // Grab the wallpaper id from the download link
  const [, wallpaperId] = String(downloadLink).match(/wallhaven-([^.]+)./);
  // Grab the already seen wallpapers from localStorage, default to an empty array if there are none
  const seenWallpapersRaw = localStorage.getItem(WallhavenSennWallpapersStorageKey) || '[]';

  try {
    const seenWallpapersArray = Array.from(JSON.parse(seenWallpapersRaw));
    // Add the new id to the array.
    seenWallpapersArray.push(wallpaperId);

    // Write the array to localStorage.
    localStorage.setItem(WallhavenSennWallpapersStorageKey, JSON.stringify(seenWallpapersArray));

    // Update the UI.
    const thumbnailNode = document.querySelector(`.thumb[data-wallpaper-id="${wallpaperId}"]`);
    if (thumbnailNode) {
      thumbnailNode.classList.add('thumb-seen');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

async function addDownloadLinksToThumbnail(element) {
  // If we already added downloads links, nothing to do.
  if (element.querySelector('.wbs_dl')) {
    return;
  }

  // Find the image element.
  const thumbnailImage = element.querySelector('img');

  // If there is no image element, nothing to do.
  if (!thumbnailImage) {
    return;
  }

  // Grab the url of the thumbnail.
  const thumbnailLink =
    thumbnailImage.getAttribute('data-src') || thumbnailImage.getAttribute('src');

  // Change it so we obtain the final wallpaper URL.
  const downloadLink = thumbnailLink
    .replace(/.cc\/[a-z]+\/([0-9a-z]+)\//i, '.cc/full/$1/wallhaven-')
    .replace('th.wallhaven', 'w.wallhaven');

  const isPng = Boolean(element.querySelector('.png'));

  const fixedDownloadLink = isPng ? downloadLink.replace('.jpg', '.png') : downloadLink;

  // Create our download and preview links.
  const downloadDiv = document.createElement('div');
  downloadDiv.className = 'wbs_dl wbs_unsafe';

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('alt', 'Download');
  downloadAnchor.setAttribute('target', '_blank');
  downloadAnchor.setAttribute('href', fixedDownloadLink);
  downloadAnchor.classList.add('icon-download');

  const previewAnchor = document.createElement('a');
  previewAnchor.setAttribute('alt', 'Open in new tab');
  previewAnchor.setAttribute('href', fixedDownloadLink);
  previewAnchor.setAttribute('target', '_blank');
  previewAnchor.classList.add('icon-eye');

  // Add a handler to the download element.
  downloadAnchor.onclick = e => {
    e.preventDefault();
    // We used to rely on the `download` attribute but browsers now restrict it to same-origin URLs.
    // Since Wallhaven now hosts files on a different domain than the main site, we need to use file-saver to trigger a download.
    saveAs(e.target.href, new URL(e.target.href).pathname.split('/').reverse()[0]);
    markWallpaperAsSeen(downloadLink);
  };

  previewAnchor.onclick = () => {
    markWallpaperAsSeen(downloadLink);
  };

  // Add our links to the DOM.
  downloadDiv.appendChild(previewAnchor);
  downloadDiv.appendChild(downloadAnchor);
  element.appendChild(downloadDiv);
}

function addDownloadLinkOnWallpaperPage() {
  // Get the link to the wallpaper file.
  const wallpaperLink = document.querySelector('#wallpaper').getAttribute('src');

  // Create our button/link.
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

  // Add a handler to the download element.
  downloadButton.onclick = e => {
    e.preventDefault();
    // We used to rely on the `download` attribute but browsers now restrict it to same-origin URLs.
    // Since Wallhaven now hosts files on a different domain than the main site, we need to use file-saver to trigger a download.
    saveAs(wallpaperLink, new URL(wallpaperLink).pathname.split('/').reverse()[0]);
  };

  // Add the button to the DOM.
  document
    .querySelector('.sidebar-section[data-storage-id="showcase-tools"] .showcase-tools')
    .insertAdjacentElement('beforebegin', downloadButton);
}

// Hacky way to wait for everything to be ready
setTimeout(() => {
  // Fetch the mark as seen setting once so we don't need to, like, fetch it a million times over a single session.
  getMarkAsSeenSetting().then(result => {
    shouldMarkAsSeen = result;
  });

  // If we're on a tag/list page
  if (document.querySelector('#thumbs, #tag-thumbs')) {
    const observer = new MutationObserver(() => {
      Array.from(document.querySelectorAll('figure.thumb')).forEach(el => {
        addDownloadLinksToThumbnail(el);
      });
    });

    // Set-up an observer that'll run everytime new elements are added to the page.
    observer.observe(document.querySelector('#thumbs, #tag-thumbs'), {
      childList: true
    });

    addDownloadLinksToThumbnails();
  } else if (document.querySelector('#showcase-sidebar')) {
    addDownloadLinkOnWallpaperPage();
  }
}, 0);
