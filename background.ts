function doForCurrentTab(fun: (tab: chrome.tabs.Tab) => void) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		let tab = tabs[0];
		if (!tab)
			return;
		fun(tab);
	});
}

function doAdd(tab: chrome.tabs.Tab) {
	let tabUrl = encodeURIComponent(tab.url);
	let tabTitle = encodeURIComponent(tab.title);
	let redirUrl = `https://pinboard.in/add?next=same&url=${tabUrl}&title=${tabTitle}`;
	let code = `document.location = '${redirUrl}'`;
	chrome.tabs.executeScript(tab.id, { code: code });
}

function doReadLater(tab: chrome.tabs.Tab) {
	let tabUrl = encodeURIComponent(tab.url);
	let tabTitle = encodeURIComponent(tab.title);
	let redirUrl = `https://pinboard.in/add?later=yes&noui=yes&url=${tabUrl}&title=${tabTitle}`;
	let code = `open('${redirUrl}')`;
	chrome.tabs.executeScript(tab.id, { code: code });
}

chrome.commands.onCommand.addListener(command => {
	switch (command) {
		case "add":
			doForCurrentTab(doAdd);
			break;
		case "readlater":
			doForCurrentTab(doReadLater);
			break;
		default:
	}
});
