// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "../src/VCS1.sol";

contract VCS1Test is Test {
    using stdStorage for StdStorage;

    VCS1 private nft;

    function setUp() public {
        // Deploy NFT contract
        nft = new VCS1();
    }

    function test_addAdmin() public {
      // nft.addNewAdmin(address(1));
      // nft.renounceAdmin(address(1));
      // vm.startPrank(address(1));
      // nft.unpausePublicMints();
      // vm.stopPrank();
    }

    /**
     * only owner is able to update the root
     */
    function test_updateMerkleRootOnlyOwner() public {}

    /**
     * root should be updated correctly
     */
    function test_updateMerkleRoot() public {}

    /**
     * only owner should be able to execute
     */
    function test_pausePublicMintsOnlyOwner() public {}

    /**
     * should pause public mint
     * execute pausePublicMint
     * execute `mintTo(address)` -> should revert with PublicMintsPaused()
     */
    function test_pausePublicMints() public {
      // nft.pausePublicMints();
    }

    /**
     * should unpause public mint
     * check pausedPublicMints -> should be false (by default)
     * execute pausePublicMints by owner
     * check pausedPublicMints -> should be true
     * execute unpausePublicMints by owner
     * check pausedPublicMints -> shoudl be false
     */
    function test_unpausePublicMints() public {
      nft.unpausePublicMints();
    }

    /**
     * only owner should be able to execute
     */
    function test_pauseWhitelistTransfersOnlyOwner() public {}

    /**
     * should pause transfers for whitelisted addresses
     * execute pauseWhitelistTransfers
     * create merkle tree with 1 random hash
     * set merkle root
     * use hash to execute:
     * execute mintTo(address, hash)
     * execute safeTransferFrom for the tokenid
     * should revert on WhitelistTransfersPaused()
     */
    function test_pauseWhitelistTransfers() public {}

    /**
     * check pausedWhitelistTransfers -> should be false by default
     * execute pauseWhitelistTransfers by owner
     * check pausedWhitelistTransfers -> should be true
     * execute pauseWhitelistTransfers by owner
     * check pausedWhitelistTransfers -> should be false
     */
    function test_unpauseWhitelistTransfers() public {}

    /**
     * no value sent in `mintTo`
     * should revert with MintPriceNotPaid
     */
    function test_MintPriceNotPaid() public {
      // vm.expectRevert(MintPriceNotPaid.selector);
      // nft.mintTo(address(1));
    }

    /**
     * successful public mint
     * publicMintPaused should be false
     * execute `mintTo(address)` -> should not revert
     * address should now own a token (check balanceOf)
     * should emit PublicMint
     */
    function test_publicMint() public {}

    /**
     * successful whitelist mint
     * check whitelistTransfersPaused -> should be false (by default)
     * create merkle tree with 1 random hash
     * set merkle root
     * use hash to execute:
     * execute mintTo(address, hash)
     * check balanceOf
     * should emit WhitelistMint
     */
    function test_whitelistMint() public {}


    /**
     * should revert for invalid hash
     * check whitelistTransfersPaused -> should be false (by default)
     * create merkle tree with 1 random hash
     * set merkle root
     * use random (invalid) to execute:
     * execute mintTo(address, hash)
     * should revert with HashVerificationFailed()
     */
    function test_whitelistMintInvalidHash() public {}


    /**
     * revert if TOTALSUPPLY mints have happened
     */
    function test_RevertMintMaxSupplyReached() public {
        // uint256 slot = stdstore
        //     .target(address(nft))
        //     .sig("currentTokenId()")
        //     .find();
        // bytes32 loc = bytes32(slot);
        // bytes32 mockedCurrentTokenId = bytes32(abi.encode(10000));
        // vm.store(address(nft), loc, mockedCurrentTokenId);
        // vm.expectRevert(MaxSupply.selector);
        // nft.mintTo{value: 0.01 ether}(address(1));
    }

    /**
     * revert if recipient is zero address
     */
    function test_RevertMintToZeroAddress() public {
        // vm.expectRevert("ERC721: mint to the zero address");
        // nft.mintTo{value: 0.01 ether}(address(0));
    }


    /**
     * callable by owner
     * execute updateBaseURI
     * call tokenURI ot check
     */
    function test_updateBaseURI() public {}


    /**
     * correctly register owner of a token id
     * execute a public mint (`mintTo(address)`)
     * execute a whitelist mint (`mintTo(address,hash)`)
     * call minterToHash [for whitelisted]
     * call hashToMinter  [for whitelisted]
     * call isMinter [for both]
     * call balanceOf [for both]
     */
    // function test_NewMintOwnerRegistered() public {
    //     nft.mintTo{value: 0.01 ether}(address(1));
    //     uint256 slotOfNewOwner = stdstore
    //         .target(address(nft))
    //         .sig(nft.ownerOf.selector)
    //         .with_key(1)
    //         .find();

    //     uint160 ownerOfTokenIdOne = uint160(
    //         uint256(
    //             (vm.load(address(nft), bytes32(abi.encode(slotOfNewOwner))))
    //         )
    //     );
    //     assertEq(address(ownerOfTokenIdOne), address(1));
    // }


    // /**
    //  * an address should be able to own a single NFT only
    //  * via mint
    //  */
    // function test_SingleNFTOwnershipOnlyViaMint() public {
    //     nft.mintTo{value: 0.01 ether}(address(1));
    //     vm.expectRevert(SingleNFTOwnershipOnly.selector);
    //     nft.mintTo{value: 0.01 ether}(address(1));
    // }
    // /**
    //  * an address should be able to own a single NFT only
    //  * via transfer
    //  */
    // function test_SingleNFTOwnershipOnlyViaTransfer() public {
    //     nft.mintTo{value: 0.01 ether}(address(1)); // token id 1
    //     nft.mintTo{value: 0.01 ether}(address(2)); // token id 2
    //     vm.startPrank(address(2));
    //     vm.expectRevert(SingleNFTOwnershipOnly.selector);
    //     nft.safeTransferFrom(address(2), address(1), 2);
    //     vm.stopPrank();
    // }


    function test_WithdrawalWorksAsOwner() public {
        // Mint an NFT, sending eth to the contract
        // Receiver receiver = new Receiver();
        // address payable payee = payable(address(0x1337));
        // uint256 priorPayeeBalance = payee.balance;
        // nft.mintTo{value: nft.MINT_PRICE()}(address(0));
        // Check that the balance of the contract is correct
        // assertEq(address(nft).balance, nft.MINT_PRICE());
        // uint256 nftBalance = address(nft).balance;
        // Withdraw the balance and assert it was transferred
        // nft.withdrawPayments(payee);
        // assertEq(payee.balance, priorPayeeBalance + nftBalance);
    }

    function test_WithdrawalFailsAsNotOwner() public {
        // // Mint an NFT, sending eth to the contract
        // Receiver receiver = new Receiver();
        // nft.mintTo{value: nft.MINT_PRICE()}(address(receiver));
        // // Check that the balance of the contract is correct
        // assertEq(address(nft).balance, nft.MINT_PRICE());
        // // Confirm that a non-owner cannot withdraw
        // vm.expectRevert("Ownable: caller is not the owner");
        // vm.startPrank(address(0xd3ad));
        // nft.withdrawPayments(payable(address(0xd3ad)));
        // vm.stopPrank();
    }
}
