function createAddUrl(): string {
	let u = encodeURIComponent(location.href);
	let t = encodeURIComponent(document.title);
	return `https://pinboard.in/add?next=same&url=${u}&title=${t}`;
}

function bookmark() {
	document.location.href = createAddUrl() + '&next=same';
}

function readLater() {
	open(createAddUrl() + '&later=yes&noui=yes');
}

chrome.runtime.onMessage.addListener((msg: string) => {
	switch (msg) {
		case 'bookmark': bookmark(); break;
		case 'readLater': readLater(); break;
	}
});
