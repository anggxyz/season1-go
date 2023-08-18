// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

error CallerNotAdmin();
error ZeroAddressNotAllowed();

contract Admins {
    event NewAdminAdded(address indexed admin);
    event AdminRenounced(address indexed admin);

    mapping(address => bool) private admins;

    constructor() {
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
        if (newAdmin == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        admins[newAdmin] = true;
        emit NewAdminAdded(newAdmin);
    }

    function _renounceAdmin(address oldAdmin) internal virtual {
        admins[oldAdmin] = false;
        emit AdminRenounced(oldAdmin);
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
