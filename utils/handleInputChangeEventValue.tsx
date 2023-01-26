import {ethers} from 'ethers';

import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

function handleInputChangeEventValue(e: React.ChangeEvent<HTMLInputElement>, decimals?: number): TNormalizedBN {
	const	{valueAsNumber, value} = e.target;
	const	amount = valueAsNumber;
	if (isNaN(amount)) {
		return ({raw: ethers.constants.Zero, normalized: ''});
	}
	if (amount === 0) {
		let		amountStr = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
		const	amountParts = amountStr.split('.');
		if ((amountParts[0])?.length > 1 && Number(amountParts[0]) === 0) {
			//
		} else {
			//check if we have 0 everywhere
			if (amountParts.every((part: string): boolean => Number(part) === 0)) {
				if (amountParts.length === 2) {
					amountStr = amountParts[0] + '.' + amountParts[1].slice(0, decimals);
				}
				const	raw = ethers.utils.parseUnits(amountStr || '0', decimals);
				return ({raw: raw, normalized: amountStr || '0'});
			}
		}
	}

	const	raw = ethers.utils.parseUnits(amount.toString() || '0', decimals);
	return ({raw: raw, normalized: amount.toString() || '0'});
}

export default handleInputChangeEventValue;
