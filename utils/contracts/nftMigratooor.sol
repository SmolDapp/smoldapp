// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IERC721 {
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract NFTMigratooor {
	function migrate(IERC721 collection, address to, uint256[] calldata tokenIDs) public {
        bool isApprovedForAll = collection.isApprovedForAll(msg.sender, address(this));

        require(isApprovedForAll, "missing approval for all");
        uint256 len = tokenIDs.length;
        for (uint256 i = 0; i < len; i++) {
            require(collection.ownerOf(tokenIDs[i]) == msg.sender, "not owner of token");
            collection.safeTransferFrom(msg.sender, to, tokenIDs[i]);
        }
	}
}
