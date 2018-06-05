import { Pinboard, Bookmark, AddParams } from './Pinboard.js';

////////////////////////////////////////////////////////////////////////////////

const CMD_BOOKMARK = 'bookmark';
const CMD_READLATER = 'readLater';
const FLAG_TOREAD = 1;

let settings = {
	syncPeriod: 10,
	apiToken: null
};

let pb: Pinboard;
let bookmarksByUrl = new Map<string, number>();
let localUpdateTime = 0;
let syncing = false;
let addTabsToUrls = new Map<number, string>();
let timeoutId: number;

////////////////////////////////////////////////////////////////////////////////

function openAddTab(tab: chrome.tabs.Tab) {
	let u = encodeURIComponent(tab.url);
	let t = encodeURIComponent(tab.title);
	let url = `https://pinboard.in/add?url=${u}&title=${t}&showtags=yes`;
	chrome.tabs.create({ openerTabId: tab.id, url: url },
		addTab => { addTabsToUrls.set(addTab.id, tab.url); });
}

async function toggleReadLater(tab: chrome.tabs.Tab): Promise<void> {
	if (!settings.apiToken)
		return;
	let params: AddParams = {
		url: tab.url,
		description: tab.title,
	};
	let existing = (await pb.get({url: tab.url}))[0];
	if (existing) {
		params.extended = existing.extended;
		params.tags = existing.tags;
		params.dt = existing.time;
		params.replace = 'yes';
		params.shared = existing.shared;
	}
	params.toread = (!existing || existing.toread == 'no') ? 'yes' : 'no';
	if (params.toread == 'no' && params.tags == '') {
		await pb.delete(tab.url);
		bookmarksByUrl.delete(tab.url);
	}
	else {
		await pb.add(params);
		bookmarksByUrl.set(tab.url, params.toread == 'yes' ? FLAG_TOREAD : 0);
	}
	updateTabBadge(tab);
}

function bookmarkTab(tab: chrome.tabs.Tab, command: string) {
	switch (command) {
		case CMD_READLATER:
			toggleReadLater(tab);
			break;
		case CMD_BOOKMARK:
			openAddTab(tab);
			break;
		default:
			throw new Error('Unknown command: ' + command);
	}
}

function bookmarkCurrentTab(command: string) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		let tab = tabs[0];
		if (tab)
			bookmarkTab(tab, command);
	});
}

function updateTabBadge(tab: chrome.tabs.Tab) {
	if (!tab.url)
		return;
	let flag = bookmarksByUrl.get(tab.url);
	if (flag != null) {
		let color = flag & FLAG_TOREAD ? '#CC0033' : '#009933';
		chrome.browserAction.setBadgeText({ text: '✓', tabId: tab.id });
		chrome.browserAction.setBadgeBackgroundColor({ color: color, tabId: tab.id });
	}
	else
		chrome.browserAction.setBadgeText({ text: '', tabId: tab.id });
}

function addBookmark(b: Bookmark) {
	let flag = 0;
	if (b.toread == 'yes')
		flag |= FLAG_TOREAD;
	bookmarksByUrl.set(b.href, flag);
}

function updateTabBadges() {
	chrome.tabs.query({}, tabs => {
		for (let tab of tabs)
			updateTabBadge(tab);
	});
}

async function syncBookmarks() {
	if (syncing)
		return;
	syncing = true;
	bookmarksByUrl.clear();
	try {
		let remoteUpdateTime = await pb.lastUpdateTime();
		if (remoteUpdateTime > localUpdateTime) {
			for (let b of await pb.all())
				addBookmark(b);
			localUpdateTime = remoteUpdateTime;
		}
	}
	catch (e) {
		// TODO signal to user
		console.error(e);
	}
	finally {
		syncing = false;
	}
	updateTabBadges();
}

async function updateBookmark(url: string) {
	bookmarksByUrl.delete(url);
	for (let b of await pb.get({url: url}))
		addBookmark(b);
	updateTabBadges();
}

function restartSync() {
	if (timeoutId != null)
		clearTimeout(timeoutId)
	pb = null;
	chrome.storage.local.get(settings, async (newSettings: typeof settings) => {
		settings = newSettings;
		if (settings.apiToken != null && settings.syncPeriod >= 5) {
			pb = new Pinboard(settings.apiToken);
			await syncBookmarks();
			timeoutId = setTimeout(syncBookmarks, settings.syncPeriod * 60 * 1000);
		}
	});
}

////////////////////////////////////////////////////////////////////////////////

chrome.tabs.onRemoved.addListener(tabId => {
	addTabsToUrls.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	switch (msg) {
		case 'closeAddTab':
			let url = addTabsToUrls.get(sender.tab.id);
			if (url) {
				addTabsToUrls.delete(sender.tab.id);
				chrome.tabs.remove(sender.tab.id);
				updateBookmark(url);
			}
			else
				console.error('Close from unknown tab. URL: ' + sender.tab.url);
			break;
		case 'restartSync':
			restartSync();
			break;
		default:
			console.error('Unknown message: ' + msg);
	}
});

chrome.commands.onCommand.addListener(bookmarkCurrentTab);

chrome.browserAction.onClicked.addListener(tab => {
	bookmarkTab(tab, CMD_BOOKMARK);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	updateTabBadge(tab);
});

restartSync();