const elForm       = document.querySelector('form');
const elSyncModeD  = document.querySelector('#syncModeD') as HTMLInputElement;
const elSyncModeP  = document.querySelector('#syncModeP') as HTMLInputElement;
const elSyncPeriod = document.querySelector('#syncPeriod') as HTMLInputElement;
const elSyncNow    = document.querySelector('#syncNow') as HTMLInputElement;

elSyncModeD.addEventListener('change', () => {
	if (elSyncModeD.checked)
		elSyncPeriod.disabled = true;
});
elSyncModeP.addEventListener('change', () => {
	if (elSyncModeP.checked)
		elSyncPeriod.disabled = false;
});

elForm.addEventListener('submit', ev => {
	ev.preventDefault();
	chrome.storage.local.set({
		syncMode: elSyncModeD.checked ? 'd' : 'p',
		syncPeriod: elSyncPeriod.value,
	});
});

chrome.storage.local.get(['syncMode', 'syncPeriod'], result => {
	let elActiveSyncMode;
	if (result.syncMode && result.syncMode === 'd')
		elActiveSyncMode = elSyncModeD;
	else
		elActiveSyncMode = elSyncModeP;
	elActiveSyncMode.checked = true;
	elActiveSyncMode.dispatchEvent(new Event('change'));

	let syncPeriod = result.syncPeriod;
	if (!syncPeriod)
		syncPeriod = 30;
	elSyncPeriod.value = syncPeriod;
});

//chrome.sendMessage(
