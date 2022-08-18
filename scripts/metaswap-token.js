const MetaSwapRouter = artifacts.require("MetaSwapRouter");
const ERC20 = artifacts.require("ERC20");

module.exports = async(callback) => {

    try {

        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        const metaSwap = await MetaSwapRouter.deployed();

        const tokenFrom = "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789";
        const tokenTo = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // eth

        const amountFrom = "200000000000000000000";
        let token0Instance = await ERC20.at(tokenFrom);
        let token1Instance = await ERC20.at(tokenTo);

        if (amountFrom > 0) {
            await token0Instance.approve(
                metaSwap.address,
                amountFrom,
                {from: currentAccount, gas: 100000}
            );

            console.log('Allowance: ' + (await token0Instance.allowance(currentAccount, metaSwap.address)).toString());
        }

        let balanceToken0Before = await token0Instance.balanceOf(currentAccount);
        console.log('balanceToken0Before:', web3.utils.fromWei(balanceToken0Before.toString()));

        let balanceETHBefore = await web3.eth.getBalance(currentAccount)
        console.log('ETH balance before:', web3.utils.fromWei(balanceETHBefore.toString()));

        const aggregatorAddress = "0x1111111254fb6c44bac0bed2854e76f90643097d"; // 1inch
        const aggregatorData = "0xe449022e00000000000000000000000000000000000000000000000ad78ebc5ac6200000000000000000000000000000000000000000000000000000000000000075e9c3000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000020000000000000000000000006ae0cdc5d2b89a8dcb99ad6b3435b3e7f7290077000000000000000000000000c5af84701f98fa483ece78af83f11b6c38aca71dcfee7c08";
        // at block 14813128

        const adapterId = 'SwapAggregator';
        const adapterData = web3.eth.abi.encodeParameter(
            'tuple(address,address,uint256,uint256,address,bytes)',
            [tokenFrom, tokenTo, amountFrom, '7077689', aggregatorAddress, aggregatorData]
        );

        // const estimatedGas = await metaSwap.swap.estimateGas(tokenFrom, amountFrom,
        //     '0x0000000000000000000000000000000000000001',
        //     [
        //         adapterId,
        //         adapterData
        //     ]
        // ,{from: currentAccount});
        //
        // const gasLimit = new web3.utils.BN(estimatedGas * 1.10);

        const flashWallet = await metaSwap.flashWallet.call();
        console.log(flashWallet);

        const performedSwap = await metaSwap.swap(tokenFrom, amountFrom,
            '0x0000000000000000000000000000000000000001',
            [
                adapterId,
                adapterData
            ]
            ,{from: currentAccount});

        console.log('performedSwap:', performedSwap);

        const balanceToken0After = await token0Instance.balanceOf(currentAccount);
        console.log('balanceToken0 after:', web3.utils.fromWei(balanceToken0After.toString()));

        const balanceETHAfter = await web3.eth.getBalance(currentAccount)
        console.log('ETH balance after:', web3.utils.fromWei(balanceETHAfter.toString()));

        const balanceToken1After = await token1Instance.balanceOf(currentAccount);
        console.log('balanceToken1 after:', web3.utils.fromWei(balanceToken1After.toString()));

        console.log("Token diff: " + web3.utils.fromWei((balanceToken0After - balanceToken0Before).toString()));
        console.log("ETH diff: " + web3.utils.fromWei((balanceETHAfter - balanceETHBefore).toString()));

    } catch (error) {
        console.log(error);
    }
    callback();
}