// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "../src/VCS1.sol";


contract VCS1Test is Test {
    using stdStorage for StdStorage;
    VCS1 private nft;

    function setUp() public {
        nft = new VCS1();
    }

    function test_deployerIsAdmin() public {
        assertEq(nft.isAdmin(address(this)), true);
    }

    function test_updateMerkleRootOnlyOwner() public {
      bytes32 root = 0x71b54e74658fd550f813904ff0ebe1505967c6940c36761f7b3b9e8b85c4916f;
      vm.expectRevert(CallerNotAdmin.selector);
      vm.startPrank(address(0));
      nft.updateMerkleRoot(root);
      vm.stopPrank();

      nft.updateMerkleRoot(root);
      assertEq(nft.merkleRoot(), root);
    }

    function test_unpausePublicMintsOnlyOwner() public {
      vm.startPrank(address(0));
      vm.expectRevert(CallerNotAdmin.selector);
      nft.pausePublicMints();
      vm.stopPrank();

      // should be true by default
      assertEq(nft.publicMintsPaused(), true);
      nft.unpausePublicMints(); // sets to false
      assertEq(nft.publicMintsPaused(), false);
    }

    function test_unpauseWhitelistTransfersOnlyOwner() public {
      vm.startPrank(address(0));
      vm.expectRevert(CallerNotAdmin.selector);
      nft.unpauseWhitelistTransfers();
      vm.stopPrank();


      assertEq(nft.whitelistTransfersPaused(), true);
      nft.unpauseWhitelistTransfers();
      assertEq(nft.whitelistTransfersPaused(), false);
    }


    ////// PUBLIC MINT

    function test_MintPriceNotPaid() public {
      nft.unpausePublicMints();
      vm.expectRevert(MintPriceNotPaid.selector);
      bytes32 hash = 0x71b54e74658fd550f813904ff0ebe1505967c6940c36761f7b3b9e8b85c4916f;
      bytes memory signature = hex"8c63f85d91e2e6538e35a2335a5af5c29b253407fb841a1daacd1e0481838b163ca09c469030f3973737cbe598682d91c3bd2426bbe297bea0cd2d7c533897c51c";
      nft.mintTo(address(1), hash, signature);
    }

    function test_publicMint() public {
      nft.unpausePublicMints();
      nft.addNewAdmin(0x9FcD02E0A409192D6095546657A6c30e0F47b9C4); // server test admin address
      bytes32 hash = 0x71b54e74658fd550f813904ff0ebe1505967c6940c36761f7b3b9e8b85c4916f; // hash of key (twitter handle)
      bytes memory signature = hex"8c63f85d91e2e6538e35a2335a5af5c29b253407fb841a1daacd1e0481838b163ca09c469030f3973737cbe598682d91c3bd2426bbe297bea0cd2d7c533897c51c"; // signed by 0x9FcD02E0A409192D6095546657A6c30e0F47b9C4
      nft.mintTo{value: nft.MINT_PRICE()}(address(1), hash, signature);
      assertEq(nft.balanceOf(address(1)), 1);
      assertEq(nft.ownerOf(1), address(1));
      assertEq(nft.minterToTokenId(address(1)), 1);
      assertEq(nft.hashToMinter(hash), address(1));
      assertEq(nft.minterToHash(address(1)), hash);
    }

    /// WHITELIST MINT
    function test_whitelistMint() public {
      address minter = address(1);
      bytes32 merkleRoot = 0xc4cb5ce24816d92e27fa0df7b57ceebae902e66e28170e9baf799f81ff69d9a6;
      bytes32 hash = 0xde6017cd2af3b5cb89a89a8fc232cd92efef7d727709f3aad6825a1e111d9fff;
      bytes32[] memory proof = new bytes32[](1);
      proof[0] = bytes32(0xc1990e329b108f754cf082c36ac67429aae15476a0efeb46ae70831110834ee0);
      // update merkle root
      nft.updateMerkleRoot(merkleRoot);

      // whitelist mint
      nft.mintTo(minter, hash, proof);

      // check vars
      assertEq(nft.balanceOf(minter), 1);
      assertEq(nft.ownerOf(1), minter);
      assertEq(nft.minterToTokenId(minter), 1);
      assertEq(nft.hashToMinter(hash), minter);
      assertEq(nft.minterToHash(minter), hash);
    }

    function test_whitelistMintInvalidHash() public {
      address minter = address(1);
      bytes32 merkleRoot = 0xc4cb5ce24816d92e27fa0df7b57ceebae902e66e28170e9baf799f81ff69d9a6;
      bytes32 hash = 0x222bf48c471ec38d734d2271c9aa48d6ca9e6488f2768dcb082ebc017d4c7be3; // random hash
      bytes32[] memory proof = new bytes32[](1);
      proof[0] = bytes32(0xc1990e329b108f754cf082c36ac67429aae15476a0efeb46ae70831110834ee0);
      nft.updateMerkleRoot(merkleRoot);
      vm.expectRevert(HashVerificationFailed.selector);
      nft.mintTo(minter, hash, proof);
    }

    /**
     * revert if TOTALSUPPLY mints have happened
     */
    function test_RevertMintMaxSupplyReached() public {
        uint256 slot = stdstore
            .target(address(nft))
            .sig("currentTokenId()")
            .find();
        bytes32 loc = bytes32(slot);
        bytes32 mockedCurrentTokenId = bytes32(abi.encode(1500));
        vm.store(address(nft), loc, mockedCurrentTokenId);

        // try whitelist mint
        address minter = address(1);
        bytes32 merkleRoot = 0xc4cb5ce24816d92e27fa0df7b57ceebae902e66e28170e9baf799f81ff69d9a6;
        bytes32 hash = 0xde6017cd2af3b5cb89a89a8fc232cd92efef7d727709f3aad6825a1e111d9fff;
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bytes32(0xc1990e329b108f754cf082c36ac67429aae15476a0efeb46ae70831110834ee0);
        // update merkle root
        nft.updateMerkleRoot(merkleRoot);
        vm.expectRevert(MaxSupply.selector);
        nft.mintTo(minter, hash, proof);
    }

    function test_WithdrawalWorksAsOwner() public {
        // try public mint
        nft.unpausePublicMints();
        nft.addNewAdmin(0x9FcD02E0A409192D6095546657A6c30e0F47b9C4); // server test admin address
        bytes32 publicHash = 0x71b54e74658fd550f813904ff0ebe1505967c6940c36761f7b3b9e8b85c4916f; // hash of key (twitter handle)
        bytes memory signature = hex"8c63f85d91e2e6538e35a2335a5af5c29b253407fb841a1daacd1e0481838b163ca09c469030f3973737cbe598682d91c3bd2426bbe297bea0cd2d7c533897c51c"; // signed by 0x9FcD02E0A409192D6095546657A6c30e0F47b9C4
        nft.mintTo{value: nft.MINT_PRICE()}(address(1), publicHash, signature);
        address payable payee = payable(address(0x1337));
        nft.addNewAdmin(payee);

        vm.startPrank(payee);
        uint256 priorPayeeBalance = payee.balance;
        // Check that the balance of the contract is correct
        assertEq(address(nft).balance, nft.MINT_PRICE());
        uint256 nftBalance = address(nft).balance;
        // Withdraw the balance and assert it was transferred
        nft.withdrawPayments(payee);
        assertEq(payee.balance, priorPayeeBalance + nftBalance);
        vm.stopPrank();
    }

    function test_WithdrawalFailsAsNotOwner() public {
        // try public mint
        nft.unpausePublicMints();
        nft.addNewAdmin(0x9FcD02E0A409192D6095546657A6c30e0F47b9C4); // server test admin address
        bytes32 publicHash = 0x71b54e74658fd550f813904ff0ebe1505967c6940c36761f7b3b9e8b85c4916f; // hash of key (twitter handle)
        bytes memory signature = hex"8c63f85d91e2e6538e35a2335a5af5c29b253407fb841a1daacd1e0481838b163ca09c469030f3973737cbe598682d91c3bd2426bbe297bea0cd2d7c533897c51c"; // signed by 0x9FcD02E0A409192D6095546657A6c30e0F47b9C4
        nft.mintTo{value: nft.MINT_PRICE()}(address(1), publicHash, signature);

        address payable payee = payable(address(0x1337));
        vm.startPrank(payee);
        assertEq(address(nft).balance, nft.MINT_PRICE());
        vm.expectRevert(CallerNotAdmin.selector);
        nft.withdrawPayments(payee);
        vm.stopPrank();
    }
}
