addEventListener('message', (event) => {
	fetch('/api/getBatchBalances', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(event.data)
	})
	.then(async (res) => res.json())
	.then((res) => postMessage(JSON.stringify(res)));
});
