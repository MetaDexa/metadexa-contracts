const MetaSwapRouter = artifacts.require("MetaSwapRouter");
const ERC20 = artifacts.require("ERC20");

module.exports = async(callback) => {

    try {

        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        const metaSwap = await MetaSwapRouter.deployed();

        const tokenFrom = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; //eth
        const tokenTo = "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789";

        const amountFrom = "10000000000000000";

        const aggregatorAddress = "0x1111111254fb6c44bac0bed2854e76f90643097d"; // 1inch
        const aggregatorData = "0xe449022e000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000cd3fb6ca0339a8a1700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001c000000000000000000000006ae0cdc5d2b89a8dcb99ad6b3435b3e7f7290077cfee7c08";
        // at block 14813128

        let token0Instance = await ERC20.at(tokenTo);
        let balanceToken0Before = await token0Instance.balanceOf(currentAccount);
        console.log('balanceToken0Before:', web3.utils.fromWei(balanceToken0Before.toString()));

        let balanceETHBefore = await web3.eth.getBalance(currentAccount)
        console.log('ETH balance before:', web3.utils.fromWei(balanceETHBefore.toString()));

        const adapterId = 'SwapAggregator';
        const adapterData = web3.eth.abi.encodeParameter(
            'tuple(address,address,uint256,uint256,address,bytes)',
            [tokenFrom, tokenTo, amountFrom, '200000000000000000000', aggregatorAddress, aggregatorData]
        );

        console.log(adapterData);
        const estimatedGas = await metaSwap.swap.estimateGas(tokenFrom, amountFrom,
            '0x0000000000000000000000000000000000000001',
            [
                adapterId,
                adapterData
            ]
        ,{value: amountFrom, from: currentAccount});

        console.log('estimatedGas:', estimatedGas);

        const gasLimit = new web3.utils.BN(estimatedGas * 1.10);

        const performedSwap = await metaSwap.swap(tokenFrom, amountFrom,
            '0x0000000000000000000000000000000000000001',
            [
                adapterId,
                adapterData
            ]
            ,{value: amountFrom, from: currentAccount, gas: gasLimit});

        console.log('performedSwap:', performedSwap);

        const balanceToken0After = await token0Instance.balanceOf(currentAccount);
        console.log('balanceToken0 after:', web3.utils.fromWei(balanceToken0After.toString()));

        const balanceETHAfter = await web3.eth.getBalance(currentAccount)
        console.log('ETH balance after:', web3.utils.fromWei(balanceETHAfter.toString()));

        console.log("Token diff: " + web3.utils.fromWei((balanceToken0After - balanceToken0Before).toString()));
        console.log("ETH diff: " + web3.utils.fromWei((balanceETHAfter - balanceETHBefore).toString()));

    } catch (error) {
        console.log(error);
    }
    callback();
}