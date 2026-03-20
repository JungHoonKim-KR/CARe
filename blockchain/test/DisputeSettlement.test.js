const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DisputeSettlement", function () {
  async function deployFixture() {
    const [owner, operator, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DisputeSettlement");
    const contract = await Factory.deploy(owner.address);
    await contract.waitForDeployment();

    return { contract, owner, operator, outsider };
  }

  it("stores finalAmount on-chain and emits SettlementRecorded", async function () {
    const { contract, owner } = await deployFixture();

    const settlementKey = ethers.keccak256(ethers.toUtf8Bytes("settlement-1"));
    const finalAmount = 125000;

    await expect(contract.connect(owner).recordSettlement(settlementKey, finalAmount))
      .to.emit(contract, "SettlementRecorded");

    expect(await contract.isSettled(settlementKey)).to.equal(true);

    const stored = await contract.getSettlement(settlementKey);
    expect(stored.finalAmount).to.equal(finalAmount);
    expect(stored.recordedBy).to.equal(owner.address);
    expect(stored.recordedAt).to.be.gt(0);
  });

  it("allows registered operator to record settlement", async function () {
    const { contract, owner, operator } = await deployFixture();

    const settlementKey = ethers.keccak256(ethers.toUtf8Bytes("settlement-2"));
    const finalAmount = 99000;

    await contract.connect(owner).setSettlementOperator(operator.address, true);
    await contract.connect(operator).recordSettlement(settlementKey, finalAmount);

    const stored = await contract.getSettlement(settlementKey);
    expect(stored.finalAmount).to.equal(finalAmount);
    expect(stored.recordedBy).to.equal(operator.address);
  });

  it("rejects duplicate settlement keys", async function () {
    const { contract, owner } = await deployFixture();

    const settlementKey = ethers.keccak256(ethers.toUtf8Bytes("settlement-3"));
    await contract.connect(owner).recordSettlement(settlementKey, 1);

    await expect(contract.connect(owner).recordSettlement(settlementKey, 2))
      .to.be.revertedWithCustomError(contract, "AlreadySettled");
  });

  it("rejects non-operators", async function () {
    const { contract, outsider } = await deployFixture();

    const settlementKey = ethers.keccak256(ethers.toUtf8Bytes("settlement-4"));
    await expect(contract.connect(outsider).recordSettlement(settlementKey, 123))
      .to.be.revertedWithCustomError(contract, "NotSettlementOperator");
  });
});
