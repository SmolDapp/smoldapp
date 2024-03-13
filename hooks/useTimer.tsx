import {useCallback, useEffect, useRef, useState} from 'react';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';

import type {TMilliseconds, TSeconds} from '@yearn-finance/web-lib/utils/time';

extend(dayjsDuration);

type TProps = {
	endTime?: TSeconds;
};

export function computeTimeLeft({endTime}: {endTime?: TSeconds}): number {
	if (!endTime) {
		return 0;
	}
	const currentTime = dayjs();
	const diffTime = endTime - currentTime.unix();
	const duration = dayjs.duration(diffTime * 1000, 'milliseconds');
	const ms = duration.asMilliseconds();
	return ms > 0 ? ms : 0;
}

function useTimer({endTime}: TProps): string {
	const interval = useRef<Timer | null>(null);
	const timeLeft = computeTimeLeft({endTime});
	const [time, set_time] = useState<TMilliseconds>(timeLeft);

	useEffect((): VoidFunction => {
		interval.current = setInterval((): void => {
			const newTimeLeft = computeTimeLeft({endTime});
			set_time(newTimeLeft);
		}, 1000);

		return (): void => {
			if (interval.current) {
				clearInterval(interval.current);
			}
		};
	}, [endTime, timeLeft]);

	const formatTimestamp = useCallback((n: number): string => {
		const twoDP = (n: number): string | number => (n > 9 ? n : '0' + n);
		const duration = dayjs.duration(n, 'milliseconds');
		const days = duration.days();
		const hours = duration.hours();
		const minutes = duration.minutes();
		const seconds = duration.seconds();
		return `${days ? `${days}d ` : ''}${twoDP(hours)}h ${twoDP(minutes)}m ${twoDP(seconds)}s`;
	}, []);

	return time ? formatTimestamp(time) : '00H 00M 00S';
}

export {useTimer};
