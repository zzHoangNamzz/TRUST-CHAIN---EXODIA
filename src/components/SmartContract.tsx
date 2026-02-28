import React from 'react';
import { Code2, Lock, ShieldCheck } from 'lucide-react';

export default function SmartContract() {
  const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustChainEscrow {
    enum BlockState { Open, Funded, InProgress, Verified, Completed, Locked }

    struct SmartBlock {
        uint256 id;
        bytes32 donorHash;
        bytes32 volunteerHash;
        bytes32 recipientHash;
        uint256 targetAmount;
        uint256 currentAmount;
        BlockState state;
        bytes32 offlineDataHash; // Sealed package hash
        uint256 trustScore;
    }

    mapping(uint256 => SmartBlock) public blocks;
    uint256 public blockCounter;

    event BlockCreated(uint256 indexed id, bytes32 donorHash, uint256 targetAmount);
    event FundsDeposited(uint256 indexed id, uint256 amount);
    event DeliveryVerified(uint256 indexed id, uint256 trustScore);
    event BlockLocked(uint256 indexed id);

    modifier onlyState(uint256 _id, BlockState _state) {
        require(blocks[_id].state == _state, "Invalid state");
        _;
    }

    function createBlock(bytes32 _donorHash, uint256 _targetAmount) external returns (uint256) {
        blockCounter++;
        blocks[blockCounter] = SmartBlock({
            id: blockCounter,
            donorHash: _donorHash,
            volunteerHash: bytes32(0),
            recipientHash: bytes32(0),
            targetAmount: _targetAmount,
            currentAmount: 0,
            state: BlockState.Open,
            offlineDataHash: bytes32(0),
            trustScore: 0
        });
        emit BlockCreated(blockCounter, _donorHash, _targetAmount);
        return blockCounter;
    }

    function fundBlock(uint256 _id) external payable onlyState(_id, BlockState.Open) {
        SmartBlock storage b = blocks[_id];
        b.currentAmount += msg.value;
        if (b.currentAmount >= b.targetAmount) {
            b.state = BlockState.Funded;
        }
        emit FundsDeposited(_id, msg.value);
    }

    function assignVolunteer(uint256 _id, bytes32 _volunteerHash, bytes32 _recipientHash) external onlyState(_id, BlockState.Funded) {
        SmartBlock storage b = blocks[_id];
        b.volunteerHash = _volunteerHash;
        b.recipientHash = _recipientHash;
        b.state = BlockState.InProgress;
    }

    function verifyDelivery(uint256 _id, bytes32 _offlineDataHash, uint256 _trustScore) external onlyState(_id, BlockState.InProgress) {
        // In reality, this would be called by an authorized AI Oracle address
        require(_trustScore >= 80, "Trust score too low");
        SmartBlock storage b = blocks[_id];
        b.offlineDataHash = _offlineDataHash;
        b.trustScore = _trustScore;
        b.state = BlockState.Verified;
        emit DeliveryVerified(_id, _trustScore);
    }

    function releaseFunds(uint256 _id) external onlyState(_id, BlockState.Verified) {
        SmartBlock storage b = blocks[_id];
        b.state = BlockState.Completed;
        // Logic to transfer funds to volunteer/vendor
        lockBlock(_id);
    }

    function lockBlock(uint256 _id) internal {
        SmartBlock storage b = blocks[_id];
        b.state = BlockState.Locked;
        emit BlockLocked(_id);
    }
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Code2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Smart Block & Hợp đồng Ký quỹ</h2>
          <p className="text-text-muted">Triển khai Solidity cho quyên góp cộng đồng minh bạch và khóa vĩnh viễn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-border-color shadow-sm">
            <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-xs text-gray-400 font-mono">TrustChainEscrow.sol</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-gray-300">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-base p-5 rounded-xl border border-border-color">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-success" />
              Định danh Ẩn danh (Hashing)
            </h3>
            <p className="text-sm text-text-muted">
              Người dùng được định danh bằng mã băm <code className="bg-bg-hover px-1 rounded">bytes32</code>. 
              Số điện thoại hoặc Social ID được băm ở phía client trước khi lưu lên chuỗi, đảm bảo quyền riêng tư trong khi duy trì khả năng kiểm toán minh bạch.
            </p>
          </div>

          <div className="bg-bg-base p-5 rounded-xl border border-border-color">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-primary" />
              Khóa Vĩnh viễn
            </h3>
            <p className="text-sm text-text-muted">
              Khi một block đạt trạng thái <code className="bg-bg-hover px-1 rounded">BlockState.Completed</code>, hàm <code className="bg-bg-hover px-1 rounded">lockBlock()</code> sẽ được gọi. 
              Nó sẽ niêm phong vĩnh viễn block, ngăn chặn mọi thay đổi đối với bản ghi trong tương lai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
