// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "../src/VCS1.sol";

contract VCS1Test is Test {
    using stdStorage for StdStorage;

    VCS1 private nft;

    function setUp() public {
        // Deploy NFT contract
        nft = new VCS1("VCS1", "VCS1", "baseUri");
    }

    function test_bulkUpdateWhitelist() public {
      address[] memory whitelist = new address[](2);
      whitelist[0] = address(1);
      whitelist[1] = address(2);
      nft.bulkUpdateWhitelist(whitelist, true);

      uint256 slotForFirstMember = stdstore
            .target(address(nft))
            .sig(nft.whitelistedAddresses.selector)
            .with_key(address(1))
            .find();
      uint256 slotForSecondMember = stdstore
            .target(address(nft))
            .sig(nft.whitelistedAddresses.selector)
            .with_key(address(1))
            .find();

      bytes32 loc1 = bytes32(slotForFirstMember);
      bytes32 loc2 = bytes32(slotForSecondMember);

      bytes32 isFirstWhitelisted = vm.load(address(nft), bytes32(abi.encode(loc1)));
      bytes32 isSecondWhitelisted = vm.load(address(nft), bytes32(abi.encode(loc2)));

      assertEq(isFirstWhitelisted, bytes32(abi.encode(true)));
      assertEq(isSecondWhitelisted, bytes32(abi.encode(true)));
    }

    function test_bulkUpdateWhitelistRevertForZeroAddress() public {
      address[] memory whitelist = new address[](1);
      whitelist[0] = address(0);
      vm.expectRevert(InvalidAddress.selector);
      nft.bulkUpdateWhitelist(whitelist, true);
    }

    /**
     * pausing contract for whitelisted holders
     * should disallow transfers
     */
    function test_pauseForWhitelistedHolders() public {
      // set an address as whitelisted
      uint256 slot = stdstore
            .target(address(nft))
            .sig(nft.whitelistedAddresses.selector)
            .with_key(address(1))
            .find();
      bytes32 loc = bytes32(slot);
      vm.store(address(nft), loc, bytes32(abi.encode(true)));

      // pause transfers for whitelisted addresses
      nft.pause();

      // set token ownership for this address
      // no value sent, cuz whitelistede
      // should be token id 1
      nft.mintTo(address(1));

      vm.startPrank(address(address(1)));

      // expect revert
      vm.expectRevert(WhitelistPause.selector);

      // try transferring token id 1
      nft.safeTransferFrom(address(1), address(2), 1);
      vm.stopPrank();
    }

    /**
     * Allow free minting of NFTs for whitelisted addresses
     */
    function test_MintWithoutValueForWhitelists() public {
        uint256 slot = stdstore
            .target(address(nft))
            .sig(nft.whitelistedAddresses.selector)
            .with_key(address(1))
            .find();
        bytes32 loc = bytes32(slot);
        // mark address(1) as whitelisted
        vm.store(address(nft), loc, bytes32(abi.encode(true)));
        // no value is being sent. should not revert
        nft.mintTo(address(1));
    }
    /**
     * for non-whitelisted addresses, price is required
     */
    function test_MintPriceNotPaid() public {
      vm.expectRevert(MintPriceNotPaid.selector);
      // no value being sent
      nft.mintTo(address(1));
    }

    /**
     * if not whitelisted, and price paid, mint nft
     */
    function test_MintPricePaid() public {
      nft.mintTo{value: 0.01 ether}(address(1));
    }

    /**
     * revert if TOTALSUPPLY=1500 mints have happened
     */
    function test_RevertMintMaxSupplyReached() public {
        uint256 slot = stdstore
            .target(address(nft))
            .sig("currentTokenId()")
            .find();
        bytes32 loc = bytes32(slot);
        bytes32 mockedCurrentTokenId = bytes32(abi.encode(10000));
        vm.store(address(nft), loc, mockedCurrentTokenId);
        vm.expectRevert(MaxSupply.selector);
        nft.mintTo{value: 0.01 ether}(address(1));
    }

    /**
     * revert if recipient is zero address
     */
    function test_RevertMintToZeroAddress() public {
        vm.expectRevert("ERC721: mint to the zero address");
        nft.mintTo{value: 0.01 ether}(address(0));
    }


    /**
     * correctly register owner of a token id
     */
    function test_NewMintOwnerRegistered() public {
        nft.mintTo{value: 0.01 ether}(address(1));
        uint256 slotOfNewOwner = stdstore
            .target(address(nft))
            .sig(nft.ownerOf.selector)
            .with_key(1)
            .find();

        uint160 ownerOfTokenIdOne = uint160(
            uint256(
                (vm.load(address(nft), bytes32(abi.encode(slotOfNewOwner))))
            )
        );
        assertEq(address(ownerOfTokenIdOne), address(1));
    }

    /**
     * correctly increment balance of recipient
     */
    function test_BalanceIncremented() public {
        nft.mintTo{value: 0.01 ether}(address(1));
        uint256 slotBalance = stdstore
            .target(address(nft))
            .sig(nft.balanceOf.selector)
            .with_key(address(1))
            .find();

        uint256 balanceFirstMint = uint256(
            vm.load(address(nft), bytes32(slotBalance))
        );
        assertEq(balanceFirstMint, 1);

        nft.mintTo{value: 0.01 ether}(address(1));
        uint256 balanceSecondMint = uint256(
            vm.load(address(nft), bytes32(slotBalance))
        );
        assertEq(balanceSecondMint, 2);
    }

    function test_SafeContractReceiver() public {
        Receiver receiver = new Receiver();
        nft.mintTo{value: 0.01 ether}(address(receiver));
        uint256 slotBalance = stdstore
            .target(address(nft))
            .sig(nft.balanceOf.selector)
            .with_key(address(receiver))
            .find();

        uint256 balance = uint256(vm.load(address(nft), bytes32(slotBalance)));
        assertEq(balance, 1);
    }

    function test_RevertUnSafeContractReceiver() public {
        vm.etch(address(12), bytes("mock code"));
        vm.expectRevert(bytes(""));
        nft.mintTo{value: 0.01 ether}(address(12));
    }

    function test_WithdrawalWorksAsOwner() public {
        // Mint an NFT, sending eth to the contract
        Receiver receiver = new Receiver();
        address payable payee = payable(address(0x1337));
        uint256 priorPayeeBalance = payee.balance;
        nft.mintTo{value: nft.MINT_PRICE()}(address(receiver));
        // Check that the balance of the contract is correct
        assertEq(address(nft).balance, nft.MINT_PRICE());
        uint256 nftBalance = address(nft).balance;
        // Withdraw the balance and assert it was transferred
        nft.withdrawPayments(payee);
        assertEq(payee.balance, priorPayeeBalance + nftBalance);
    }

    function test_WithdrawalFailsAsNotOwner() public {
        // Mint an NFT, sending eth to the contract
        Receiver receiver = new Receiver();
        nft.mintTo{value: nft.MINT_PRICE()}(address(receiver));
        // Check that the balance of the contract is correct
        assertEq(address(nft).balance, nft.MINT_PRICE());
        // Confirm that a non-owner cannot withdraw
        vm.expectRevert("Ownable: caller is not the owner");
        vm.startPrank(address(0xd3ad));
        nft.withdrawPayments(payable(address(0xd3ad)));
        vm.stopPrank();
    }
}

contract Receiver is ERC721TokenReceiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

