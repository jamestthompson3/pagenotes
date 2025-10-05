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
    const id = await makeId(info.selectionText);
		if (Object.keys(items).length === 0) {
			browser.storage.local.set({ [key]: {title: tab.title, links: [{ link: highlight, text: info.selectionText, id }]} });
		} else {
			const arr = items[key].links;
			browser.storage.local.set({ [key]: {title: tab.title, links: arr.concat([{ link: highlight, title: tab.title, text: info.selectionText, id }])} });
		}
	}
});

async function makeId(text) {
  const t = new TextEncoder();
  const bytes = await window.crypto.subtle.digest("SHA-1", t.encode(text));
  const arr = Array.from(new Uint8Array(bytes));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("")
}
