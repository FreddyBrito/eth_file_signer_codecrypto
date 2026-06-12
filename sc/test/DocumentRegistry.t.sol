// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DocumentRegistry.sol";

contract DocumentRegistryTest is Test {
    DocumentRegistry public registry;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    bytes32 constant TEST_HASH = keccak256("test document content");
    bytes32 constant TEST_HASH_2 = keccak256("another document content");
    uint256 constant TEST_TIMESTAMP = 1700000000;
    bytes constant TEST_SIGNATURE = abi.encodePacked(hex"1234567890abcdef");

    function setUp() public {
        registry = new DocumentRegistry();
    }

    // ========== STORE ==========
    function testStoreDocument() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        assertTrue(registry.isDocumentStored(TEST_HASH));
        assertEq(registry.getDocumentCount(), 1);
    }

    function testRejectDuplicateDocument() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        vm.prank(user1);
        vm.expectRevert("Document already exists");
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);
    }

    function testMultipleDocuments() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        bytes memory sig2 = abi.encodePacked(hex"abcdef1234567890");
        vm.prank(user2);
        registry.storeDocumentHash(TEST_HASH_2, TEST_TIMESTAMP + 1, sig2, user2);

        assertEq(registry.getDocumentCount(), 2);
        assertTrue(registry.isDocumentStored(TEST_HASH));
        assertTrue(registry.isDocumentStored(TEST_HASH_2));
    }

    // ========== VERIFY ==========
    function testVerifyDocument() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        assertTrue(registry.verifyDocument(TEST_HASH, user1, TEST_SIGNATURE));
    }

    function testVerifyWithWrongSigner() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        assertFalse(registry.verifyDocument(TEST_HASH, user2, TEST_SIGNATURE));
    }

    function testVerifyWithWrongSignature() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        bytes memory wrongSig = abi.encodePacked(hex"ffffffffffff");
        assertFalse(registry.verifyDocument(TEST_HASH, user1, wrongSig));
    }

    // ========== GET INFO ==========
    function testGetDocumentInfo() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        DocumentRegistry.Document memory doc = registry.getDocumentInfo(TEST_HASH);
        assertEq(doc.hash, TEST_HASH);
        assertEq(doc.timestamp, TEST_TIMESTAMP);
        assertEq(doc.signer, user1);
    }

    function testRejectGetInfoNonExistent() public {
        vm.expectRevert("Document does not exist");
        registry.getDocumentInfo(TEST_HASH);
    }

    // ========== COUNT & INDEX ==========
    function testGetDocumentCount() public {
        assertEq(registry.getDocumentCount(), 0);

        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);
        assertEq(registry.getDocumentCount(), 1);
    }

    function testGetDocumentHashByIndex() public {
        vm.prank(user1);
        registry.storeDocumentHash(TEST_HASH, TEST_TIMESTAMP, TEST_SIGNATURE, user1);

        bytes32 hash = registry.getDocumentHashByIndex(0);
        assertEq(hash, TEST_HASH);
    }

    function testRejectIndexOutOfBounds() public {
        vm.expectRevert("Index out of bounds");
        registry.getDocumentHashByIndex(0);
    }
}
