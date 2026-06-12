// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DocumentRegistry.sol";

contract DocumentRegistryIntegrationTest is Test {
    DocumentRegistry public registry;

    uint256 constant PK0 = 0xA11CE;
    uint256 constant PK1 = 0xB0B;
    uint256 constant PK2 = 0xCA1;

    address public wallet0;
    address public wallet1;
    address public wallet2;

    bytes32 constant DOC_A = keccak256("Document A - Test Content");
    bytes32 constant DOC_B = keccak256("Document B - Another Content");
    bytes32 constant DOC_C = keccak256("Document C - Edge Case");

    uint256 constant BASE_TIMESTAMP = 1700000000;

    function setUp() public {
        registry = new DocumentRegistry();
        wallet0 = vm.addr(PK0);
        wallet1 = vm.addr(PK1);
        wallet2 = vm.addr(PK2);
    }

    function testHappyPath_StoreSignVerify() public {
        bytes memory sig = _signAs(PK0, DOC_A);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig, wallet0);

        assertTrue(registry.isDocumentStored(DOC_A));
        assertTrue(registry.verifyDocument(DOC_A, wallet0, sig));
    }

    function testRejectDuplicate_SameHashDifferentSigners() public {
        bytes memory sig0 = _signAs(PK0, DOC_A);
        bytes memory sig1 = _signAs(PK1, DOC_A);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig0, wallet0);

        vm.prank(wallet1);
        vm.expectRevert("Document already exists");
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP + 1, sig1, wallet1);
    }

    function testVerificationFails_WrongSigner() public {
        bytes memory sig = _signAs(PK0, DOC_A);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig, wallet0);

        assertFalse(registry.verifyDocument(DOC_A, wallet1, sig));
    }

    function testVerificationFails_WrongSignature() public {
        bytes memory sig = _signAs(PK0, DOC_A);
        bytes memory wrongSig = _signAs(PK1, DOC_A);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig, wallet0);

        assertFalse(registry.verifyDocument(DOC_A, wallet0, wrongSig));
    }

    function testVerifyNonExistent_Reverts() public {
        vm.expectRevert("Document does not exist");
        registry.verifyDocument(DOC_C, wallet0, hex"00");
    }

    function testGetInfoNonExistent_Reverts() public {
        vm.expectRevert("Document does not exist");
        registry.getDocumentInfo(DOC_C);
    }

    function testMultipleWallets_IndependentDocuments() public {
        bytes memory sig0 = _signAs(PK0, DOC_A);
        bytes memory sig1 = _signAs(PK1, DOC_B);
        bytes memory sig2 = _signAs(PK2, DOC_C);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig0, wallet0);

        vm.prank(wallet1);
        registry.storeDocumentHash(DOC_B, BASE_TIMESTAMP + 100, sig1, wallet1);

        vm.prank(wallet2);
        registry.storeDocumentHash(DOC_C, BASE_TIMESTAMP + 200, sig2, wallet2);

        assertEq(registry.getDocumentCount(), 3);
        assertTrue(registry.verifyDocument(DOC_A, wallet0, sig0));
        assertTrue(registry.verifyDocument(DOC_B, wallet1, sig1));
        assertTrue(registry.verifyDocument(DOC_C, wallet2, sig2));
    }

    function testDocumentInfo_Integrity() public {
        bytes memory sig = _signAs(PK0, DOC_A);
        uint256 timestamp = BASE_TIMESTAMP;

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, timestamp, sig, wallet0);

        DocumentRegistry.Document memory doc = registry.getDocumentInfo(DOC_A);

        assertEq(doc.hash, DOC_A);
        assertEq(doc.timestamp, timestamp);
        assertEq(doc.signer, wallet0);
        assertEq(keccak256(doc.signature), keccak256(sig));
    }

    function testDocumentHashByIndex_PreservesOrder() public {
        bytes memory sig0 = _signAs(PK0, DOC_A);
        bytes memory sig1 = _signAs(PK1, DOC_B);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig0, wallet0);

        vm.prank(wallet1);
        registry.storeDocumentHash(DOC_B, BASE_TIMESTAMP + 100, sig1, wallet1);

        assertEq(registry.getDocumentHashByIndex(0), DOC_A);
        assertEq(registry.getDocumentHashByIndex(1), DOC_B);
    }

    function testDocumentStored_Event() public {
        bytes memory sig = _signAs(PK0, DOC_A);

        vm.expectEmit(true, true, false, true);
        emit DocumentRegistry.DocumentStored(DOC_A, wallet0, BASE_TIMESTAMP);

        vm.prank(wallet0);
        registry.storeDocumentHash(DOC_A, BASE_TIMESTAMP, sig, wallet0);
    }

    function _signAs(uint256 privateKey, bytes32 hash) internal returns (bytes memory) {
        bytes32 prefixedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, prefixedHash);
        return abi.encodePacked(r, s, v);
    }
}
