// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/security/Pausable.sol";

error MintPriceNotPaid();
error MaxSupply();
error NonExistentTokenURI();
error WithdrawTransfer();
error WhitelistPause();
error InvalidAddress();
error SingleNFTOwnershipOnly();

contract VCS1 is ERC721Enumerable, Ownable, Pausable {
    using Strings for uint256;

    string public baseURI;
    uint256 public currentTokenId;

    uint256 public constant TOTAL_SUPPLY = 1500;
    uint256 public constant MINT_PRICE = 0.01 ether;

    mapping(address => bool) public whitelistedAddresses;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        baseURI = _baseURI;
    }

    function pause() external onlyOwner {
      _pause();
    }

    function unpause() external onlyOwner {
      _unpause();
    }

    function updateAddressWhitelist(address addr, bool flag) internal {
      if (addr == address(0)) {
        revert InvalidAddress();
      }
      whitelistedAddresses[addr] = flag;
    }

    function bulkUpdateWhitelist(address[] memory addresses, bool flag) external onlyOwner {
      for (uint256 i = 0; i < addresses.length; ++i) {
        updateAddressWhitelist(addresses[i], flag);
      }
    }


    function isWhitelisted(address addr) public view virtual returns (bool) {
      return whitelistedAddresses[addr];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);

        // an address can only one NFT
        if (balanceOf(to) > 0) {
          revert SingleNFTOwnershipOnly();
        }

        // whitelisted addresses cannot transfer / swap NFTs
        if (isWhitelisted(from) && paused()) {
            revert WhitelistPause();
        }
    }

    function mintTo(address recipient) public payable returns (uint256) {
        if (msg.value != MINT_PRICE && !isWhitelisted(recipient)) {
            revert MintPriceNotPaid();
        }
        uint256 newTokenId = ++currentTokenId;
        if (newTokenId > TOTAL_SUPPLY) {
            revert MaxSupply();
        }
        _safeMint(recipient, newTokenId);
        return newTokenId;
    }


    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (ownerOf(tokenId) == address(0)) {
            revert NonExistentTokenURI();
        }
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    function withdrawPayments(address payable payee) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool transferTx, ) = payee.call{ value: balance }("");
        if (!transferTx) {
            revert WithdrawTransfer();
        }
    }
}


/// @notice A generic interface for a contract which properly accepts ERC721 tokens.
/// @author Solmate (https://github.com/transmissions11/solmate/blob/main/src/tokens/ERC721.sol)
abstract contract ERC721TokenReceiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external virtual returns (bytes4) {
        return ERC721TokenReceiver.onERC721Received.selector;
    }
}