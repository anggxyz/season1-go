// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "../src/Admins.sol";

// @todo

contract AdminsTest is Test {
    function test_addNewAdmin() public {
        // isAdmin should return true
        // emits NewAdminAdded event
    }
    function test_renounceAdmin() public {
        // isAdmin should return false
        // emits AdminRenounced event
    }
    function test_addNewAdminOnlyCallableByAdmin() public {
        // check isAdmin to be false for a random address
        // call add new admin via the address
        // should revert with CallerNotAdmin
    }
    function test_renounceAdminOnlyCallableByAdmin() public {
        // check isAdmin to be false for a random address
        // call renounceAdmin via the address
        // should revert with CallerNotAdmin
    }
}
