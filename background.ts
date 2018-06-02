function sendToCurrentTab(msg: string) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		let tab = tabs[0];
		if (tabs)
			chrome.tabs.sendMessage(tab.id, msg);
	});
}

chrome.commands.onCommand.addListener(sendToCurrentTab);
