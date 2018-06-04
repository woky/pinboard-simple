let settings = {
	syncPeriod: 10,
	apiToken: null
};

const elForm       = document.querySelector('form');
const elSyncPeriod = document.querySelector('#syncPeriod') as HTMLInputElement;
const elApiToken   = document.querySelector('#apiToken') as HTMLInputElement;
const elSubmit     = document.querySelector('button[type="submit"]') as HTMLButtonElement;

elSyncPeriod.addEventListener('change', () => {
	settings.syncPeriod = parseInt(elSyncPeriod.value);
});

elApiToken.addEventListener('change', () => {
	settings.apiToken = elApiToken.value;
});

elForm.addEventListener('submit', ev => {
	ev.preventDefault();
	chrome.storage.local.set(settings);
	chrome.runtime.sendMessage('restartSync');
});

chrome.storage.local.get(settings, (newSettings: typeof settings) => {
	settings = newSettings;
	elSyncPeriod.value = newSettings.syncPeriod.toString();
	elApiToken.value = newSettings.apiToken;
});
