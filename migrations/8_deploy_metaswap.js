const SwapAggregatorAdapter = artifacts.require("SwapAggregatorAdapter");
const GaslessSwapAdapter = artifacts.require("GaslessSwapAdapter");
const MetaSwapRouter = artifacts.require("MetaSwapRouter");

module.exports = async function(deployer) {
    await deployer.deploy(SwapAggregatorAdapter);
    await deployer.deploy(MetaSwapRouter);
    await deployer.deploy(GaslessSwapAdapter);

    const aggregatorAdapter = await SwapAggregatorAdapter.deployed();
    const metaswap = await MetaSwapRouter.deployed();

    const targetGasPrice = await web3.eth.getGasPrice();

    await metaswap.createFlashWallet({gasPrice: targetGasPrice});
    await metaswap.addAdapter('SwapAggregator', aggregatorAdapter.address, {gasPrice: targetGasPrice});
    await metaswap.addAdapter('GaslessSwap', aggregatorAdapter.address, {gasPrice: targetGasPrice});
}
