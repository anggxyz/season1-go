// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/MerkleProof.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "./Admins.sol";

error MintPriceNotPaid();
error MaxSupply();
error NonExistentTokenURI();
error WithdrawTransfer();
error UsedHash();
error HashVerificationFailed();
error NewMintersOnly();
error PublicMintsPaused();
error PublicMintsActive();
error WhitelistTransfersPaused();
error WhitelistTransfersActive();
error OutOfBounds();

contract VCS1 is ERC721, Admins {
    using Strings for uint256;

    string public baseURI;
    uint256 public currentTokenId;
    uint256 public constant TOTAL_SUPPLY = 1500;
    uint256 public constant MINT_PRICE = 0.01 ether;

    // updated when an address mints an NFT
    mapping(address => uint256) public minterToTokenId;

    // updated when a hash is used to mint by an address (record of consumed hashes)
    mapping(bytes32 => address) public hashToMinter;

    // updated when a new whitelisted mint has happened
    // used to check in _beforeTokenTransfer
    mapping(address => bool) public isWhitelisted;

    bool public whitelistTransfersPaused;
    bool public publicMintsPaused;

    // whitelist merkle root
    bytes32 public merkleRoot;

    event RootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);
    event WhitelistMint(address indexed minter, bytes32 indexed hash, uint256 tokenId);
    event PublicMint(address indexed minter, bytes32 indexed hash, uint256 tokenId);

    constructor() ERC721("VCS1", "VCS1") {
        whitelistTransfersPaused = true;
        publicMintsPaused = true;
        _addAdmin(msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function isMinter(address minter) public view returns (bool) {
        return minterToTokenId[minter] != 0;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}
     *
     * Requirements:
     * - tokenId should be minted (owned by an address)
     *
     * @param tokenId id to return full URI for
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (ownerOf(tokenId) == address(0)) {
            revert NonExistentTokenURI();
        }
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    function walletOfOwner(address _address) public view virtual returns (uint256[] memory) {
        // Thanks 0xinuarashi for da inspo
        // (and @mousedev)
        uint256 _balance = balanceOf(_address);
        uint256[] memory _tokens = new uint256[](_balance);
        uint256 _addedTokens;
        for (uint256 i = 1; i <= TOTAL_SUPPLY; i++) {
          // will revert with ERC721: invalid token ID if token id i isn't minted
            if (ownerOf(i) == _address) {
                _tokens[_addedTokens] = i;
                _addedTokens++;
            }
            if (_addedTokens == _balance) break;
        }
        return _tokens;
    }

    function tokenOfOwnerByIndex(address _address, uint256 index) public view virtual returns (uint256) {
      uint256[] memory wallet = walletOfOwner(_address);
      return wallet[index];
    }

    function updateMerkleRoot(bytes32 newRoot) external onlyAdmin {
        bytes32 oldRoot = merkleRoot;
        merkleRoot = newRoot;
        emit RootUpdated(oldRoot, newRoot);
    }

    function pausePublicMints() external onlyAdmin {
        if (publicMintsPaused) {
            revert PublicMintsPaused();
        }
        publicMintsPaused = true;
    }

    function pauseWhitelistTransfers() external onlyAdmin {
        if (whitelistTransfersPaused) {
            revert WhitelistTransfersPaused();
        }
        whitelistTransfersPaused = true;
    }

    function unpausePublicMints() external onlyAdmin {
        if (!publicMintsPaused) {
            revert PublicMintsActive();
        }
        publicMintsPaused = false;
    }

    function unpauseWhitelistTransfers() external onlyAdmin {
        if (!whitelistTransfersPaused) {
            revert WhitelistTransfersActive();
        }
        whitelistTransfersPaused = false;
    }

    /**
     * @dev onlyOwner function to update the base URI for the NFTs
     *
     * @param _baseURI new uri to update
     */
    function updateBaseURI(string memory _baseURI) external onlyAdmin {
        baseURI = _baseURI;
    }

    /**
     * @dev transfers all ETH owned by self to a given address
     *
     * @param payee address to send funds to
     */
    function withdrawPayments(address payable payee) external onlyAdmin {
        uint256 balance = address(this).balance;
        (bool transferTx,) = payee.call{value: balance}("");
        if (!transferTx) {
            revert WithdrawTransfer();
        }
    }

    // @todo
    // a whitelisted address could approve another non-whitelisted address
    // and make a transfer -- should revert for that
    // or remove approvals
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize)
        internal
        virtual
        override(ERC721)
    {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // revert if `from` was a whitelist mint and whitelist transfers are currently paused
        if ((isWhitelisted[from] == true) && whitelistTransfersPaused) {
            revert WhitelistTransfersPaused();
        }
    }

    /**
     * @dev called before minting a token, checks if the recipient
     * already owns a token or has previously minted a token
     *
     * Requirements:
     * - the recipient must have 0 balance
     * - the recipient should not have previously minted a token
     *
     * @param recipient receiver of the minted token
     */
    function _preMintCheck(address recipient, bytes32 hash) internal view {
        // revert if recipient already has an NFT or has already minted one
        if (balanceOf(recipient) > 0 || isMinter(recipient)) {
            revert NewMintersOnly();
        }
        if (hashToMinter[hash] != address(0)) {
            revert UsedHash();
        }
    }

    /**
     * @dev Verify if the given hash belongs to the merkle tree
     * with `root`
     * @param hash hash to verify
     */
    function _verifyHash(bytes32 hash, bytes32[] memory proof) internal view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, hash);
    }

    /**
     * override of _verifyHash(bytes32, bytes32[])
     * This one verifies if a given signature on a hashed message is signed on by an admin or not
     * @param hash hash of the message that is signed on by one of the admins
     * @param signature signature
     */

    function _verifyHash(bytes32 hash, bytes memory signature) internal view returns (bool) {
        return isAdmin(ECDSA.recover(hash, signature));
    }

    function _postMint(address recipient, bytes32 hash) internal {
        minterToTokenId[recipient] = currentTokenId;
        hashToMinter[hash] = recipient;
    }
    /**
     * @dev increments the `currentTokenId` param and
     * assigns the new token id to recipient
     *
     * Requirements:
     * - newTokenId should be strictly less than TOTAL_SUPPLY
     *
     * @param recipient receiver of the token
     */

    function _mint(address recipient) internal {
        uint256 newTokenId = ++currentTokenId;
        if (newTokenId > TOTAL_SUPPLY) {
            revert MaxSupply();
        }
        _safeMint(recipient, newTokenId);
    }

    /**
     * @dev mints a new token to the recipient - public mint function, can be called by anyone if _publicMintsPaused = false
     *
     * Requirements:
     * - recipient must have 0 balance
     * - recipient should not have previously minted a token
     * - `_publicMintsPaused` should be false
     * - value sent in the transaction should equal MINT_PRICE
     * - signature
     *
     * @param recipient receiver of the token
     */
    function mintTo(address recipient, bytes32 hash, bytes memory signature) public payable returns (uint256) {
        _preMintCheck(recipient, hash);

        if (publicMintsPaused) {
            revert PublicMintsPaused();
        }

        if (msg.value != MINT_PRICE) {
            revert MintPriceNotPaid();
        }

        // check if hash is signed by an admin
        if (!_verifyHash(hash, signature)) {
            revert HashVerificationFailed();
        }

        _mint(recipient);
        _postMint(recipient, hash);

        emit PublicMint(recipient, hash, currentTokenId);

        return currentTokenId;
    }
    /**
     * @dev mints a new token to the recipient - called by whitelisted addresses
     *
     * Requirements:
     * - recipient must have 0 balance
     * - recipient should not have previously minted a token
     * - hash must be a part of the merkle tree set by `root`
     *
     * @param recipient receiver of the nft
     * @param hash unique hash associated with minter's twitter handle
     */

    function mintTo(address recipient, bytes32 hash, bytes32[] memory proof) public returns (uint256) {
        _preMintCheck(recipient, hash);

        if (!_verifyHash(hash, proof)) {
            revert HashVerificationFailed();
        }

        _mint(recipient);
        _postMint(recipient, hash);

        isWhitelisted[recipient] = true;

        emit WhitelistMint(recipient, hash, currentTokenId);
        return currentTokenId;
    }
}
