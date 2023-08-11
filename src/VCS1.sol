// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

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
error CallerNotAdmin();

contract Admins {
  event NewAdminAdded(address indexed admin);
  event RenounceAdmin(address indexed admin);

  mapping (address => bool) private admins;
  constructor () {
    _addAdmin(msg.sender);
  }

  modifier onlyAdmin() {
    _checkAdmin();
    _;
  }

  function _checkAdmin() internal view virtual {
    if (admins[msg.sender] != true) {
      revert CallerNotAdmin();
    }
  }

  function _addAdmin(address newAdmin) internal virtual {
    admins[newAdmin] = true;
    emit NewAdminAdded(newAdmin);
  }

  function _renounceAdmin(address oldAdmin) internal virtual {
    admins[oldAdmin] = false;
    emit RenounceAdmin(oldAdmin);
  }

  function addNewAdmin(address newAdmin) public onlyAdmin {
    _addAdmin(newAdmin);
  }

  /**
   * @dev any admin can remove any other admin
   * @param oldAdmin admin to remove
   */
  function renounceAdmin(address oldAdmin) public onlyAdmin {
    _renounceAdmin(oldAdmin);
  }

  function isAdmin(address addr) public view returns (bool) {
    return admins[addr];
  }
}

contract VCS1 is ERC721, ERC721Enumerable, Admins {
    using Strings for uint256;
    string public baseURI;
    uint256 public currentTokenId;
    uint256 public constant TOTAL_SUPPLY = 1500;
    uint256 public constant MINT_PRICE = 0.01 ether;

    // updated when an address mints an NFT
    // includes all whitelisted and non-whitelisted
    mapping (address => uint256) internal _minter;

    // updated when a hash is used to mint by an address (record of consumed hashes)
    // hashes are only used by whitelisted accounts
    mapping (bytes32 => address) internal _hashToMinter;

    // all whitelisted minters
    // updated when a hash is used to mint by an address (record of all whitelisted successful minters)
    // hashes are only used by whitelisted accounts
    mapping (address => bytes32) internal _minterToHash;

    bool private _whitelistTransfersPaused;
    bool private _publicMintsPaused;

    // whitelist merkle root
    bytes32 private _root;

    event RootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);
    event WhitelistMint(address indexed minter, bytes32 indexed hash, uint256 tokenId );
    event PublicMint(address indexed minter, uint256 tokenId);

    constructor() ERC721("VCS1", "VCS1") {
        _whitelistTransfersPaused = true;
        _publicMintsPaused = true;
        _addAdmin(msg.sender);
    }
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    function minterToHash(address minter) public view returns (bytes32) {
      return _minterToHash[minter];
    }

  function hashToMinter(bytes32 hash) public view returns (address) {
      return _hashToMinter[hash];
    }

    function isMinter(address minter) public view returns (bool) {
      return _minter[minter] != 0;
    }

    function minterToTokenId(address minter) public view returns (uint256) {
      return _minter[minter];
    }

    function merkleRoot() public view virtual returns (bytes32) {
      return _root;
    }

    function publicMintsPaused() public view virtual returns (bool) {
      return _publicMintsPaused;
    }

    function whitelistTransfersPaused() public view virtual returns (bool) {
      return _whitelistTransfersPaused;
    }

  /**
   * @dev See {IERC721Metadata-tokenURI}
   *
   * Requirements:
   * - tokenId should be minted (owned by an address)
   *
   * @param tokenId id to return full URI for
   */
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

    function updateMerkleRoot(bytes32 newRoot) external onlyAdmin {
      bytes32 oldRoot = _root;
      _root = newRoot;
      emit RootUpdated(oldRoot, newRoot);
    }

    function pausePublicMints() external onlyAdmin {
      if (publicMintsPaused()) {
        revert PublicMintsPaused();
      }
      _publicMintsPaused = true;
    }

    function pauseWhitelistTransfers() external onlyAdmin {
      if (whitelistTransfersPaused()) {
        revert WhitelistTransfersPaused();
      }
      _whitelistTransfersPaused = true;
    }

    function unpausePublicMints() external onlyAdmin {
      if (!publicMintsPaused()) {
        revert PublicMintsActive();
      }
      _publicMintsPaused = false;
    }

    function unpauseWhitelistTransfers() external onlyAdmin {
      if (!whitelistTransfersPaused()) {
        revert WhitelistTransfersActive();
      }
      _whitelistTransfersPaused = false;
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
        (bool transferTx, ) = payee.call{ value: balance }("");
        if (!transferTx) {
            revert WithdrawTransfer();
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override (ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        if (minterToHash(from) != 0 && whitelistTransfersPaused()) {
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
    function _preMintCheck(address recipient, bytes32 hash) view internal {
      // revert if recipient already has an NFT or has already minted one
      if (balanceOf(recipient) > 0 || isMinter(recipient)) {
        revert NewMintersOnly();
      }
      if (hashToMinter(hash) != address(0)){
        revert UsedHash();
      }
      if (minterToHash(recipient) != 0) {
        revert NewMintersOnly();
      }
    }

    // @todo
    /**
     * @dev Verify if the given hash belongs to the merkle tree
     * with `root`
     * @param hash hash to verify
     */
    function _verifyHash(bytes32 hash) internal pure returns (bool) {
      return true;
    }

    function _postMint(address recipient) internal {
      _minter[recipient] = currentTokenId;
    }
    function _postMint(address recipient,bytes32 hash) internal {
      _minter[recipient] = currentTokenId;
      _hashToMinter[hash] = recipient;
      _minterToHash[recipient] = hash;
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
     *
     * @param recipient receiver of the token
     */
    function mintTo(address recipient) public payable returns (uint256) {
      _preMintCheck(recipient, 0);
      if (publicMintsPaused()) {
        revert PublicMintsPaused();
      }
      if (msg.value != MINT_PRICE) {
        revert MintPriceNotPaid();
      }
      _mint(recipient);
      _postMint(recipient);

      emit PublicMint(recipient, currentTokenId);

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
    function mintTo(address recipient, bytes32 hash) public returns (uint256) {
      _preMintCheck(recipient, hash);

      if (!_verifyHash(hash)) {
        revert HashVerificationFailed();
      }

      _mint(recipient);
      _postMint(recipient, hash);

      emit WhitelistMint(recipient, hash, currentTokenId);

      return currentTokenId;
    }
}
