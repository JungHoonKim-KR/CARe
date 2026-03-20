// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice 정산 최종 금액(finalAmount)을 온체인에 확정 기록하는 컨트랙트
contract DisputeSettlement is Ownable {

    struct Settlement {
        uint256 finalAmount;
        uint256 recordedAt;
        address recordedBy;
    }

    mapping(bytes32 => Settlement) private settlements;
    mapping(bytes32 => bool) private settled;
    mapping(address => bool) public settlementOperators;

    event SettlementOperatorUpdated(address indexed operator, bool allowed);
    event SettlementRecorded(
        bytes32 indexed settlementKey,
        uint256 finalAmount,
        uint256 recordedAt,
        address recordedBy
    );

    error NotSettlementOperator();
    error InvalidOperatorAddress();
    error InvalidSettlementKey();
    error AlreadySettled(bytes32 settlementKey);

    modifier onlySettlementOperator() {
        if (msg.sender != owner() && !settlementOperators[msg.sender]) {
            revert NotSettlementOperator();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) {
            revert InvalidOperatorAddress();
        }
    }

    /// @notice 정산 수행자를 등록/해제합니다. (예: 백엔드 서버 지갑)
    function setSettlementOperator(address operator, bool allowed) external onlyOwner {
        if (operator == address(0)) {
            revert InvalidOperatorAddress();
        }

        settlementOperators[operator] = allowed;
        emit SettlementOperatorUpdated(operator, allowed);
    }

    /// @notice 정산 결과(finalAmount)를 settlementKey 기준으로 1회만 기록합니다.
    function recordSettlement(
        bytes32 settlementKey,
        uint256 finalAmount
    ) external onlySettlementOperator {
        if (settlementKey == bytes32(0)) {
            revert InvalidSettlementKey();
        }
        if (settled[settlementKey]) {
            revert AlreadySettled(settlementKey);
        }

        settlements[settlementKey] = Settlement({
            finalAmount: finalAmount,
            recordedAt: block.timestamp,
            recordedBy: msg.sender
        });
        settled[settlementKey] = true;

        emit SettlementRecorded(
            settlementKey,
            finalAmount,
            block.timestamp,
            msg.sender
        );
    }

    function isSettled(bytes32 settlementKey) external view returns (bool) {
        return settled[settlementKey];
    }

    function getSettlement(bytes32 settlementKey) external view returns (Settlement memory) {
        return settlements[settlementKey];
    }
}
