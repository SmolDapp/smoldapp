export function isLensNFT(nftName: string): boolean {
	nftName = nftName.toLowerCase();

	if (
		nftName.includes('lens-Follower') ||
		nftName.includes('lensprotocol') ||
		nftName.includes('lens protocol') ||
		nftName.includes('lens-collect') ||
		nftName.includes("lens's follower nft")
	) {
		return true;
	}
	return false;
}
