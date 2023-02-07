// This is a module worker, so we can use imports (in the browser too!)
import pi from './fetchBalances';

type TPerformCall = ({
	chainID: number,
	address: string,
	tokens: any[]
})

addEventListener('message', (event: MessageEvent<TPerformCall>): void => {
	pi(event.data).then((res): any => postMessage(res));
});
