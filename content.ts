let urlQuery = new URL(document.location.href).searchParams;
if (urlQuery.get('noui') == 'yes' || urlQuery.toString() == '') {
	chrome.runtime.sendMessage('close');
}
