//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract VNFT is ERC721 {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private constant signerAddress = 0x0e06D2876F1451B07aeb4D6B3b5e32C10884C197;
    string private constant domainName = "VNFT";
    string private constant version = "1.0";
    uint256 private constant chainId = 11155111; // chainId could be dynamic in order to support different chains
    bytes32 DOMAIN_SEPARATOR;

    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    string private constant EIP712_DOMAIN_TYPE = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN_TYPE));

    struct Message {
        address minter;
        uint256 mintPrice;
        uint8 maxMint;
    }

    string private constant MESSAGE_TYPE = "Message(address minter,uint256 mintPrice,uint8 maxMint)";
    bytes32 public constant MESSAGE_TYPEHASH = keccak256(abi.encodePacked(MESSAGE_TYPE));

    //--- Modifiers ---
    /**
     * @notice Function modifier to check for non-zero quantity
     */
    modifier nonZeroQuantity(uint8 _quantity) {
        require(_quantity != 0, "VNFT: _quantity must not be 0");
        _;
    }

    constructor() ERC721("Vito NFT", "VNFT") {
        DOMAIN_SEPARATOR = hashDomain(EIP712Domain({name: domainName, version: version, chainId: chainId, verifyingContract: address(this)}));
    }

    // @title Mint batch of NFTs
    // @param string tokenURI
    function mint(bytes memory _signature, uint256 _mintPrice, uint8 _maxMint, uint8 _quantity) public payable nonZeroQuantity(_quantity) {
        address signer = recover(_signature, msg.sender, _mintPrice, _maxMint);

        require(signer == signerAddress, "Invalid signature");
        require(balanceOf(msg.sender) + _quantity <= _maxMint, "You are not able to mint more than _maxMint");
        require(msg.value >= _mintPrice * _quantity, "Insufficient amount of ETH. The amount should be _mintPrice * _quantity + gas");

        // Minting in batches will be more efficient for the users.
        // If there is more time, consider implementing the ERC721A standard and compare.
        for (uint i = 0; i < _quantity; i++) {
            _tokenIds.increment();
            _safeMint(msg.sender, _tokenIds.current());
        }
    }

    // @title Calculate EIP712Domain TypeHash
    // @param EIP712Domain eip712Domain
    function hashDomain(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(eip712Domain.name)),
                keccak256(bytes(eip712Domain.version)),
                eip712Domain.chainId,
                eip712Domain.verifyingContract
            )
        );
    }

    // @title Calculate Message TypeHash
    // @param Message message
    function hashMessage(Message memory message) private view returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(MESSAGE_TYPEHASH, message.minter, message.mintPrice, message.maxMint)))
        );
    }

    // @title Recover signer: Obtain EOA address from signature
    // @param bytes _signature
    // @param address minter
    // @param uint256 mintPrice
    // @param uint8 maxMint
    // @return address EOA address obtained from signature
    function recover(bytes memory _signature, address minter, uint256 mintPrice, uint8 maxMint) public view returns (address) {
        Message memory message = Message({minter: minter, mintPrice: mintPrice, maxMint: maxMint});
        bytes32 hash = hashMessage(message);
        return hash.recover(_signature);
    }

    // @title Returns the total supply of the NFT collection
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}