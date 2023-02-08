function relativeTimeFormat(value: number): string {
	let		locale = 'fr-FR';
	if (typeof(navigator) !== 'undefined') {
		locale = navigator.language || 'fr-FR';
	}

	const	now = Date.now().valueOf() / 1000;
	const	timeDiffWithNow = (value - now);
	const	hourDiffWithNow = timeDiffWithNow / 3600;
	const	dayDiffWithNow = hourDiffWithNow / 24;

	//use day scale if diff is more than 24 hours
	if (Math.abs(hourDiffWithNow) >= 24) {
		return new Intl.RelativeTimeFormat([locale, 'en-US']).format(Math.floor(dayDiffWithNow), 'days');
	}
	return new Intl.RelativeTimeFormat([locale, 'en-US']).format(Math.floor(hourDiffWithNow), 'hours');
}

export default relativeTimeFormat;
