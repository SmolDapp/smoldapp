if (!self.define) {
	let e,
		s = {};
	const c = (c, a) => (
		(c = new URL(c + '.js', a).href),
		s[c] ||
			new Promise(s => {
				if ('document' in self) {
					const e = document.createElement('script');
					(e.src = c), (e.onload = s), document.head.appendChild(e);
				} else (e = c), importScripts(c), s();
			}).then(() => {
				let e = s[c];
				if (!e) throw new Error(`Module ${c} didn’t register its module`);
				return e;
			})
	);
	self.define = (a, i) => {
		const n = e || ('document' in self ? document.currentScript.src : '') || location.href;
		if (s[n]) return;
		let t = {};
		const r = e => c(e, n),
			f = {module: {uri: n}, exports: t, require: r};
		s[n] = Promise.all(a.map(e => f[e] || r(e))).then(e => (i(...e), t));
	};
}
define(['./workbox-50de5c5d'], function (e) {
	'use strict';
	importScripts(),
		self.skipWaiting(),
		e.clientsClaim(),
		e.precacheAndRoute(
			[
				{
					url: '/_next/static/cWSgYo8WxUBXNSNLgPpm3/_buildManifest.js',
					revision: '7e03bd94063d994e8b02f46e11bfc855'
				},
				{
					url: '/_next/static/cWSgYo8WxUBXNSNLgPpm3/_ssgManifest.js',
					revision: 'b6652df95db52feb4daf4eca35380933'
				},
				{url: '/_next/static/chunks/1088.04d87f92e05f23c7.js', revision: '04d87f92e05f23c7'},
				{url: '/_next/static/chunks/1608.ec04f07937386922.js', revision: 'ec04f07937386922'},
				{url: '/_next/static/chunks/1711.ae2b84d9f5645069.js', revision: 'ae2b84d9f5645069'},
				{url: '/_next/static/chunks/1727.af62bd633f21ee69.js', revision: 'af62bd633f21ee69'},
				{url: '/_next/static/chunks/1748.f63b451fd93f590b.js', revision: 'f63b451fd93f590b'},
				{url: '/_next/static/chunks/1950.c8039f3dc9bb92f5.js', revision: 'c8039f3dc9bb92f5'},
				{url: '/_next/static/chunks/2435.c4b1656647b0fe53.js', revision: 'c4b1656647b0fe53'},
				{url: '/_next/static/chunks/2592.d428b3938103eff9.js', revision: 'd428b3938103eff9'},
				{url: '/_next/static/chunks/2604.250be1a3b8354750.js', revision: '250be1a3b8354750'},
				{url: '/_next/static/chunks/2746.0a838d09eabc5b43.js', revision: '0a838d09eabc5b43'},
				{url: '/_next/static/chunks/2898.f370a64b5af02f0b.js', revision: 'f370a64b5af02f0b'},
				{url: '/_next/static/chunks/3068.9f3651d6d877c64c.js', revision: '9f3651d6d877c64c'},
				{url: '/_next/static/chunks/3200.6135ea7388cc6e9c.js', revision: '6135ea7388cc6e9c'},
				{url: '/_next/static/chunks/3338-c9f5ead531194dc9.js', revision: 'c9f5ead531194dc9'},
				{url: '/_next/static/chunks/3525.53072abba3ca74b8.js', revision: '53072abba3ca74b8'},
				{url: '/_next/static/chunks/3646.48057d31a5949257.js', revision: '48057d31a5949257'},
				{url: '/_next/static/chunks/37-f7c862df2be08559.js', revision: 'f7c862df2be08559'},
				{url: '/_next/static/chunks/3908-cdf50b272d4531b2.js', revision: 'cdf50b272d4531b2'},
				{url: '/_next/static/chunks/4253.6be69df622e36e45.js', revision: '6be69df622e36e45'},
				{url: '/_next/static/chunks/4419.c4f2007bfe36ec14.js', revision: 'c4f2007bfe36ec14'},
				{url: '/_next/static/chunks/5119.33e08a0525159056.js', revision: '33e08a0525159056'},
				{url: '/_next/static/chunks/514.d2f047fea62adf58.js', revision: 'd2f047fea62adf58'},
				{url: '/_next/static/chunks/5488.ea86c6ce443ba3bd.js', revision: 'ea86c6ce443ba3bd'},
				{url: '/_next/static/chunks/5693-bda75d8fa01e55f2.js', revision: 'bda75d8fa01e55f2'},
				{url: '/_next/static/chunks/5741-a0e99ea1aa406589.js', revision: 'a0e99ea1aa406589'},
				{url: '/_next/static/chunks/5806.7abe5840ceba140e.js', revision: '7abe5840ceba140e'},
				{url: '/_next/static/chunks/5811.8e5554fd675560fd.js', revision: '8e5554fd675560fd'},
				{url: '/_next/static/chunks/5939.0a433dc6f963fc41.js', revision: '0a433dc6f963fc41'},
				{url: '/_next/static/chunks/6237.f7b1d24c812922e4.js', revision: 'f7b1d24c812922e4'},
				{url: '/_next/static/chunks/6253.dcdff54f0dceda1f.js', revision: 'dcdff54f0dceda1f'},
				{url: '/_next/static/chunks/6328.ea13afa99496d818.js', revision: 'ea13afa99496d818'},
				{url: '/_next/static/chunks/6551.432f96462db0d036.js', revision: '432f96462db0d036'},
				{url: '/_next/static/chunks/66.76fb1eb37b3a131f.js', revision: '76fb1eb37b3a131f'},
				{url: '/_next/static/chunks/6792.5b709590c10ed97e.js', revision: '5b709590c10ed97e'},
				{url: '/_next/static/chunks/6847.a575059dbc72db1a.js', revision: 'a575059dbc72db1a'},
				{url: '/_next/static/chunks/6942.c08085427c39966c.js', revision: 'c08085427c39966c'},
				{url: '/_next/static/chunks/704.484bcd9e0a7f5626.js', revision: '484bcd9e0a7f5626'},
				{url: '/_next/static/chunks/7148-e24a91a3849b8fe5.js', revision: 'e24a91a3849b8fe5'},
				{url: '/_next/static/chunks/7392-e2251e6af789b4d4.js', revision: 'e2251e6af789b4d4'},
				{url: '/_next/static/chunks/7394-59d43127bf33024b.js', revision: '59d43127bf33024b'},
				{url: '/_next/static/chunks/7619.e9de6998c48d9e4a.js', revision: 'e9de6998c48d9e4a'},
				{url: '/_next/static/chunks/7682.b0a3567fac8e0052.js', revision: 'b0a3567fac8e0052'},
				{url: '/_next/static/chunks/794.f18da82915d63734.js', revision: 'f18da82915d63734'},
				{url: '/_next/static/chunks/8137.d6c500ddcf42e542.js', revision: 'd6c500ddcf42e542'},
				{url: '/_next/static/chunks/8189.ae87237233ed00d6.js', revision: 'ae87237233ed00d6'},
				{url: '/_next/static/chunks/8416.3c4e42758f00b6a7.js', revision: '3c4e42758f00b6a7'},
				{url: '/_next/static/chunks/8618.e00e30d7f1f20a73.js', revision: 'e00e30d7f1f20a73'},
				{url: '/_next/static/chunks/8827-5be0fca3d2be6ad5.js', revision: '5be0fca3d2be6ad5'},
				{url: '/_next/static/chunks/8881.8c985300b37d631a.js', revision: '8c985300b37d631a'},
				{url: '/_next/static/chunks/9223.882cd6b61a640a13.js', revision: '882cd6b61a640a13'},
				{url: '/_next/static/chunks/934.405a73de74b58e27.js', revision: '405a73de74b58e27'},
				{url: '/_next/static/chunks/9343.930086841fb8fcc7.js', revision: '930086841fb8fcc7'},
				{url: '/_next/static/chunks/9459.07161754e4d5eaf0.js', revision: '07161754e4d5eaf0'},
				{url: '/_next/static/chunks/9657-df59dedc7b4e67a7.js', revision: 'df59dedc7b4e67a7'},
				{url: '/_next/static/chunks/9941.44044767831d9eb0.js', revision: '44044767831d9eb0'},
				{url: '/_next/static/chunks/framework-2645a99191cfc5e9.js', revision: '2645a99191cfc5e9'},
				{url: '/_next/static/chunks/main-546630cf2350b7c4.js', revision: '546630cf2350b7c4'},
				{url: '/_next/static/chunks/pages/_error-82b79221b9ed784b.js', revision: '82b79221b9ed784b'},
				{url: '/_next/static/chunks/pages/disperse-052db7e3ea59695b.js', revision: '052db7e3ea59695b'},
				{url: '/_next/static/chunks/pages/index-d7d69ba56cf1e552.js', revision: 'd7d69ba56cf1e552'},
				{url: '/_next/static/chunks/pages/migratooor-454256e997e15469.js', revision: '454256e997e15469'},
				{url: '/_next/static/chunks/pages/nftmigratooor-440086c53a4220db.js', revision: '440086c53a4220db'},
				{url: '/_next/static/chunks/pages/safe-d02e610f33353806.js', revision: 'd02e610f33353806'},
				{url: '/_next/static/chunks/pages/tokenlistooor-412bc3fb2116eba3.js', revision: '412bc3fb2116eba3'},
				{
					url: '/_next/static/chunks/pages/tokenlistooor/%5Blist%5D-d81b5693e9f386cf.js',
					revision: 'd81b5693e9f386cf'
				},
				{
					url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
					revision: '79330112775102f91e1010318bae2bd3'
				},
				{url: '/_next/static/chunks/webpack-e08e98bf1e5e12c7.js', revision: 'e08e98bf1e5e12c7'},
				{url: '/_next/static/css/0a3c8756c99d8f00.css', revision: '0a3c8756c99d8f00'},
				{url: '/_next/static/media/2aaf0723e720e8b9-s.p.woff2', revision: 'e1b9f0ecaaebb12c93064cd3c406f82b'},
				{url: '/_next/static/media/9c4f34569c9b36ca-s.woff2', revision: '2c1fc211bf5cca7ae7e7396dc9e4c824'},
				{url: '/_next/static/media/ae9ae6716d4f8bf8-s.woff2', revision: 'b0c49a041e15bdbca22833f1ed5cfb19'},
				{url: '/_next/static/media/b1db3e28af9ef94a-s.woff2', revision: '70afeea69c7f52ffccde29e1ea470838'},
				{url: '/_next/static/media/b967158bc7d7a9fb-s.woff2', revision: '08ccb2a3cfc83cf18d4a3ec64dd7c11b'},
				{url: '/_next/static/media/c0f5ec5bbf5913b7-s.woff2', revision: '8ca5bc1cd1579933b73e51ec9354eec9'},
				{url: '/_next/static/media/d1d9458b69004127-s.woff2', revision: '9885d5da3e4dfffab0b4b1f4a259ca27'},
				{url: '/android-icon-192x192.ico', revision: '3522f6114029893bc7adc5421a8c6e95'},
				{url: '/avatar.png', revision: 'b1e48274eb64a241e89ad52fb47e361f'},
				{url: '/chains/1.svg', revision: 'd190d20239795887620a657bd48b982a'},
				{url: '/chains/10.svg', revision: '85144305d13c97980ca8e6facced626c'},
				{url: '/chains/100.svg', revision: '7c4dbbdca837208a4992a86f737dfa8f'},
				{url: '/chains/1101.svg', revision: '747ec6f4561ca8099e012d4389be00e2'},
				{url: '/chains/137.svg', revision: '240c672509905ec66816df7976a03fea'},
				{url: '/chains/250.svg', revision: 'b8ea29442284fc8e0e90b3c1558ef228'},
				{url: '/chains/42161.svg', revision: 'd163ec20a4de7585d424f4a662ebfb77'},
				{url: '/chains/8453.svg', revision: '342895b6c4992c314e40acd0dd04f64d'},
				{url: '/cover.jpg', revision: '6a4de244968766fb41290e52f82aa5d9'},
				{url: '/dumpservices.svg', revision: 'eeb91c3a1b9cc194f6a78ae711c990eb'},
				{url: '/favicons/android-icon-144x144.png', revision: 'f84c22abbaf2104f0a15e5fa7ce57b00'},
				{url: '/favicons/android-icon-192x192.png', revision: '511bcb417298d5c1213764a36560b32f'},
				{url: '/favicons/android-icon-36x36.png', revision: '29c6d2e5a169c485bd3c9ff8d507d06a'},
				{url: '/favicons/android-icon-48x48.png', revision: 'ac8a9ab09e2ad7a4a83a8242e368d955'},
				{url: '/favicons/android-icon-72x72.png', revision: '1558ca8274579e2ec3de8656b4fdbadc'},
				{url: '/favicons/android-icon-96x96.png', revision: '087c1fefc4d8c3405ed3f190fde66488'},
				{url: '/favicons/apple-icon-114x114.png', revision: '636830f827e5ef6a7e311ecb194724e8'},
				{url: '/favicons/apple-icon-120x120.png', revision: '927c6b82f4a9b24625a71f2af0d573c3'},
				{url: '/favicons/apple-icon-144x144.png', revision: '3e450ed21f08e365988e1b4204741414'},
				{url: '/favicons/apple-icon-152x152.png', revision: '9679a0904a815021bcc077c896745035'},
				{url: '/favicons/apple-icon-180x180.png', revision: '3c2ff5ee3103cde01363264bdfb5af30'},
				{url: '/favicons/apple-icon-57x57.png', revision: 'e7263b5f6cffc2f8b5eaacb3d1cb923e'},
				{url: '/favicons/apple-icon-60x60.png', revision: '4f8dd5b7c43677ad0d0280fb2da2c717'},
				{url: '/favicons/apple-icon-72x72.png', revision: '553485edb24f1d2dff0475d7cfaaa179'},
				{url: '/favicons/apple-icon-76x76.png', revision: '1a2296d1b48a640ac2573c943afd4521'},
				{url: '/favicons/apple-icon-precomposed.png', revision: 'a5e9655fc315dac613db287d4c8e1b76'},
				{url: '/favicons/apple-icon.png', revision: 'a5e9655fc315dac613db287d4c8e1b76'},
				{url: '/favicons/browserconfig.xml', revision: '653d077300a12f09a69caeea7a8947f8'},
				{url: '/favicons/favicon-16x16.png', revision: '5b3a238a137b1131203647aa86566db6'},
				{url: '/favicons/favicon-32x32.png', revision: '23b4db369271952e5181e4821a4110d2'},
				{url: '/favicons/favicon-96x96.png', revision: 'f28206c4fd55681bc94f5eb988754213'},
				{url: '/favicons/favicon.ico', revision: '4cdcbe3ad9c6ebe78cdc084448c06753'},
				{url: '/favicons/favicon.svg', revision: '6d222efc790057eab4b7861734a9b7c1'},
				{url: '/favicons/manifest.json', revision: 'b58fcfa7628c9205cb11a1b2c3e8f99a'},
				{url: '/favicons/migratooor.png', revision: 'c4b113e92e2bb184bc38d51d155fbe9a'},
				{url: '/favicons/ms-icon-144x144.png', revision: '3e450ed21f08e365988e1b4204741414'},
				{url: '/favicons/ms-icon-150x150.png', revision: 'b8562b84bdb01e15ac2a9da77851f7d0'},
				{url: '/favicons/ms-icon-310x310.png', revision: '11d6296e7dd481a314efc70319b0bd2c'},
				{url: '/favicons/ms-icon-70x70.png', revision: '3f0ee0a51145090f43afd16ae01f7023'},
				{url: '/manifest.json', revision: 'a9d80e671daa9979af521321d9b72d32'},
				{url: '/og.png', revision: '6db3b275535fd4ca1668a70b9695c519'},
				{url: '/og_disperse.png', revision: '784c32d2acff860ebe51ee8120f0ffa5'},
				{url: '/og_migratooor.png', revision: 'f1a18c476bb8dade1a82cd8bea7af5ac'},
				{url: '/og_multisafe.png', revision: '326c84f0a57cb17ecaef9a53f754afe9'},
				{url: '/og_tokenlistooor.png', revision: '4ffbb2ea6468d9045af942d00465cd9a'},
				{url: '/placeholder-nft.png', revision: '0a5319ce91d205bd2dbbeb5de2d1dcaa'},
				{url: '/placeholder.png', revision: '76e4abc63869962750bcd60694719807'}
			],
			{ignoreURLParametersMatching: []}
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(
			'/',
			new e.NetworkFirst({
				cacheName: 'start-url',
				plugins: [
					{
						cacheWillUpdate: async ({request: e, response: s, event: c, state: a}) =>
							s && 'opaqueredirect' === s.type
								? new Response(s.body, {status: 200, statusText: 'OK', headers: s.headers})
								: s
					}
				]
			}),
			'GET'
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
			new e.CacheFirst({
				cacheName: 'google-fonts-webfonts',
				plugins: [new e.ExpirationPlugin({maxEntries: 4, maxAgeSeconds: 31536e3})]
			}),
			'GET'
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
			new e.StaleWhileRevalidate({
				cacheName: 'google-fonts-stylesheets',
				plugins: [new e.ExpirationPlugin({maxEntries: 4, maxAgeSeconds: 604800})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-font-assets',
				plugins: [new e.ExpirationPlugin({maxEntries: 4, maxAgeSeconds: 604800})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-image-assets',
				plugins: [new e.ExpirationPlugin({maxEntries: 64, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\/_next\/image\?url=.+$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'next-image',
				plugins: [new e.ExpirationPlugin({maxEntries: 64, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:mp3|wav|ogg)$/i,
			new e.CacheFirst({
				cacheName: 'static-audio-assets',
				plugins: [new e.RangeRequestsPlugin(), new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:mp4)$/i,
			new e.CacheFirst({
				cacheName: 'static-video-assets',
				plugins: [new e.RangeRequestsPlugin(), new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:js)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-js-assets',
				plugins: [new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:css|less)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-style-assets',
				plugins: [new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\/_next\/data\/.+\/.+\.json$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'next-data',
				plugins: [new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:json|xml|csv)$/i,
			new e.NetworkFirst({
				cacheName: 'static-data-assets',
				plugins: [new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			({url: e}) => {
				if (!(self.origin === e.origin)) return !1;
				const s = e.pathname;
				return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
			},
			new e.NetworkFirst({
				cacheName: 'apis',
				networkTimeoutSeconds: 10,
				plugins: [new e.ExpirationPlugin({maxEntries: 16, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			({url: e}) => {
				if (!(self.origin === e.origin)) return !1;
				return !e.pathname.startsWith('/api/');
			},
			new e.NetworkFirst({
				cacheName: 'others',
				networkTimeoutSeconds: 10,
				plugins: [new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 86400})]
			}),
			'GET'
		),
		e.registerRoute(
			({url: e}) => !(self.origin === e.origin),
			new e.NetworkFirst({
				cacheName: 'cross-origin',
				networkTimeoutSeconds: 10,
				plugins: [new e.ExpirationPlugin({maxEntries: 32, maxAgeSeconds: 3600})]
			}),
			'GET'
		);
});
