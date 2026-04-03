// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FoundersNFT
 * @notice Minimal ERC-721 with enumerable extension, fixed supply, owner-only mint, pause, and updatable base URI.
 */
contract FoundersNFT is ERC721Enumerable, Ownable {
    uint256 public immutable maxSupply;
    string private _baseTokenURI;
    bool public mintPaused;

    event BaseURIUpdated(string newBaseURI);
    event MintPaused(bool paused);
    event FounderMinted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        string memory baseURI_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        require(initialOwner != address(0), "FoundersNFT: zero owner");
        require(maxSupply_ > 0, "FoundersNFT: zero maxSupply");
        maxSupply = maxSupply_;
        _baseTokenURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function mintFounder(address to) external onlyOwner {
        require(!mintPaused, "FoundersNFT: mint paused");
        require(to != address(0), "FoundersNFT: mint to zero");
        uint256 nextId = totalSupply() + 1;
        require(nextId <= maxSupply, "FoundersNFT: max supply");
        _safeMint(to, nextId);
        emit FounderMinted(to, nextId);
    }

    function mintBatch(address[] calldata recipients) external onlyOwner {
        require(!mintPaused, "FoundersNFT: mint paused");
        uint256 n = recipients.length;
        uint256 supply = totalSupply();
        require(supply + n <= maxSupply, "FoundersNFT: max supply");

        for (uint256 i = 0; i < n; ) {
            address to = recipients[i];
            require(to != address(0), "FoundersNFT: mint to zero");
            uint256 tokenId = supply + i + 1;
            _safeMint(to, tokenId);
            emit FounderMinted(to, tokenId);
            unchecked {
                ++i;
            }
        }
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function pauseMint(bool paused) external onlyOwner {
        mintPaused = paused;
        emit MintPaused(paused);
    }

    function tokensOfOwner(address owner_) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner_);
        uint256[] memory ids = new uint256[](balance);
        for (uint256 i = 0; i < balance; ) {
            ids[i] = tokenOfOwnerByIndex(owner_, i);
            unchecked {
                ++i;
            }
        }
        return ids;
    }
}
