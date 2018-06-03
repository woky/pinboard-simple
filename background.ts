function createPinboardUrl(tab: chrome.tabs.Tab, command: string): string {
	let u = encodeURIComponent(tab.url);
	let t = encodeURIComponent(tab.title);
	let url = `https://pinboard.in/add?url=${u}&title=${t}`;
	if (command == 'readLater')
		url += '&later=yes&noui=yes';
	else
		url += '&showtags=yes'
	return url;
}

function bookmarkCurrentTab(command: string) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		let tab = tabs[0];
		if (tab) {
			chrome.tabs.create({
				openerTabId: tab.id,
				url: createPinboardUrl(tab, command)
			});
		}
	});
}

chrome.commands.onCommand.addListener(bookmarkCurrentTab);

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg == 'close'  && sender.tab)
		chrome.tabs.remove(sender.tab.id);
});
