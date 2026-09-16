// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

contract PolicyGuard {
    struct Policy {
        uint256 maxAmountPerTx;
        uint256 dailySpendingLimit;
        bool requireMemo;
    }

    struct SpendingRecord {
        uint256 amount;
        uint256 date;
        uint32 count;
    }

    mapping(address => Policy) public policies;
    mapping(address => mapping(uint256 => SpendingRecord)) public spending;

    event PolicySet(
        address indexed agent,
        uint256 maxAmountPerTx,
        uint256 dailySpendingLimit,
        bool requireMemo
    );

    event TransactionRecorded(address indexed agent, uint256 amount);
    event TransactionRejected(address indexed agent, string reason);

    function setPolicy(
        uint256 _maxAmountPerTx,
        uint256 _dailySpendingLimit,
        bool _requireMemo
    ) external {
        policies[msg.sender] = Policy({
            maxAmountPerTx: _maxAmountPerTx,
            dailySpendingLimit: _dailySpendingLimit,
            requireMemo: _requireMemo
        });

        emit PolicySet(msg.sender, _maxAmountPerTx, _dailySpendingLimit, _requireMemo);
    }

    function checkTransaction(uint256 _amount, bool _hasMemo)
        external
        view
        returns (bool)
    {
        Policy memory policy = policies[msg.sender];

        if (policy.maxAmountPerTx > 0 && _amount > policy.maxAmountPerTx) {
            revert("AMT_EXCEED");
        }

        if (policy.requireMemo && !_hasMemo) {
            revert("MEMO_REQ");
        }

        uint256 today = block.timestamp / 1 days;
        SpendingRecord memory record = spending[msg.sender][today];

        if (
            policy.dailySpendingLimit > 0 &&
            record.amount + _amount > policy.dailySpendingLimit
        ) {
            revert("DAILY_EXC");
        }

        return true;
    }

    function recordTransaction(uint256 _amount) external {
        uint256 today = block.timestamp / 1 days;
        SpendingRecord storage record = spending[msg.sender][today];

        record.amount += _amount;
        record.count += 1;

        emit TransactionRecorded(msg.sender, _amount);
    }

    function getSpending(uint256 _day)
        external
        view
        returns (uint256 amount, uint32 count)
    {
        SpendingRecord memory record = spending[msg.sender][_day];
        return (record.amount, record.count);
    }
}
