browser.contextMenus.create(
	{
		id: "note-selection",
		title: "Save Selection as Note",
		contexts: ["selection"],
	},
	() => {},
);

browser.menus.onClicked.addListener(async (info) => {
	if (info.menuItemId === "note-selection") {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
		const url = new URL(info.pageUrl);
		const highlight = `${url.origin}${url.pathname}#:~:text=${encodeURIComponent(info.selectionText)}`;
		navigator.clipboard.writeText(highlight);
		const key = `${url.hostname}${url.pathname}`;
		const items = await browser.storage.local.get(key);
		if (Object.keys(items).length === 0) {
			browser.storage.local.set({ [key]: {title: tab.title, links: [{ link: highlight, text: info.selectionText }]} });
		} else {
			const arr = items[key].links;
			browser.storage.local.set({ [key]: {title: tab.title, links: arr.concat([{ link: highlight, title: tab.title, text: info.selectionText }])} });
		}
	}
});
