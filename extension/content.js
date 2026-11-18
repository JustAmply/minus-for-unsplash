const plusImageSelector = 'img[src^="https://plus.unsplash.com"]'

// Older Firefox versions supported by this extension lack :has().
if (!CSS.supports("selector(:has(*))")) {
	const collectFigures = (node, figures) => {
		for (let figure = node.closest("figure"); figure; figure = figure.parentElement?.closest("figure")) {
			figures.add(figure)
		}
	}
	const updateFigure = (figure) => {
		figure.classList.toggle("minus-unsplash-plus", !!figure.querySelector(plusImageSelector))
	}

	const initialFigures = new Set()
	document.querySelectorAll(plusImageSelector).forEach((image) => {
		collectFigures(image, initialFigures)
	})
	initialFigures.forEach(updateFigure)

	new MutationObserver((records) => {
		const figures = new Set()
		for (const record of records) {
			collectFigures(record.target, figures)
			for (const node of record.addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue
				if (node.matches(plusImageSelector)) collectFigures(node, figures)
				node.querySelectorAll(plusImageSelector).forEach((image) => {
					collectFigures(image, figures)
				})
			}
		}
		figures.forEach(updateFigure)
	}).observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["src"],
	})
}

function setState(state) {
	document.body.classList.toggle("unminus", state !== false)
}

let stateChanged = false
chrome.storage.onChanged.addListener(function (changes, areaName) {
	if (areaName !== "local" || !changes.isOn) return
	stateChanged = true
	setState(changes.isOn.newValue)
})

chrome.storage.local.get(["isOn"], function (result) {
	if (stateChanged) return
	setState(result.isOn)
	if (result.isOn === undefined) chrome.storage.local.set({ isOn: true })
})
