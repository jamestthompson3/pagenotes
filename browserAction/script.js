document.addEventListener("DOMContentLoaded", async () => {
	const loadingEl = document.getElementById("loading");
	const containerEl = document.getElementById("container");
	const emptyStateEl = document.getElementById("empty-state");
	const pageInfoEl = document.getElementById("page-info");

	loadingEl.classList.remove("hidden");
	containerEl.classList.add("hidden");
	emptyStateEl.classList.add("hidden");

	try {
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (tab && tab.url) {
			try {
				const url = new URL(tab.url);
				const key = `${url.hostname}${url.pathname}`;

				try {
					const res = await browser.storage.local.get(key);
					const { links, title } = res[key];

					loadingEl.classList.add("hidden");

					if (links.length === 0) {
						emptyStateEl.classList.remove("hidden");
					} else {
						containerEl.classList.remove("hidden");

						pageInfoEl.textContent = title;
						links.forEach((item, index) => {
							const highlightItem = document.createElement("div");
							highlightItem.className = "highlight-item";

							const link = document.createElement("a");
							link.href = item.link;
							link.textContent = item.text || `HIGHLIGHT ${index + 1}`;
							link.className = "highlight-link";

							// Prevent default link behavior and open in current tab
							link.addEventListener("click", async (e) => {
								e.preventDefault();
								try {
									await browser.tabs.update({ url: item.link });
									window.close(); // Close the popup after navigation
								} catch (error) {
									console.error("Error navigating to link:", error);
								}
							});
							const addNoteButton = document.createElement("button");
							addNoteButton.textContent = "[...]";
							addNoteButton.addEventListener("click", () => {
								if (item.note) {
									note.value = item.note;
								}
								note.dataset.id = item.id;
								note.classList.remove("hidden");
							});

							highlightItem.appendChild(link);
							highlightItem.appendChild(addNoteButton);
							containerEl.appendChild(highlightItem);
						});
						note.addEventListener("blur", (e) => {
							const link = links.find((link) => link.id === note.dataset.id);
							link.note = note.value;
							browser.storage.local.set({ [key]: { title, links } });
              note.classList.add("hidden");
						});
					}
				} catch (storageError) {
					console.error("Storage error:", storageError);
					loadingEl.classList.add("hidden");
					showErrorState();
				}
			} catch (urlError) {
				console.error("URL parsing error:", urlError);
				loadingEl.classList.add("hidden");
				showErrorState();
			}
		} else {
			console.error("No active tab found");
			loadingEl.classList.add("hidden");
			showErrorState();
		}
	} catch (generalError) {
		console.error("General error:", generalError);
		loadingEl.classList.add("hidden");
		showErrorState();
	}

	function showErrorState() {
		emptyStateEl.classList.remove("hidden");
		emptyStateEl.innerHTML = `
      <h3>System Error</h3>
      <p>Unable to load highlights data</p>
    `;
	}
});
