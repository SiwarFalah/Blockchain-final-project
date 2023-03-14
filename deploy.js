const hre = require('hardhat');
const fs = require('fs');

async function main() {
  const COIN = await hre.ethers.getContractFactory('CLC');
  const coin = await COIN.deploy();
  await coin.deployed();
  console.log('Coin contract deployed successfully to: ', coin.address);

  const NFTMarket = await hre.ethers.getContractFactory('CLMarket');
  const nftMarket = await NFTMarket.deploy(coin.address);
  await nftMarket.deployed();
  console.log('nftMarket contract deployed to: ', nftMarket.address);

  const NFT = await hre.ethers.getContractFactory('NFT');
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log('NFT contract deployed to: ', nft.address);

  let config = `
  export const nftMarketAddress = '${nftMarket.address}'
  export const nftAddress = '${nft.address}'
  export const coinAddress = '${coin.address}'`;

  let data = JSON.stringify(config);
  fs.writeFileSync('config.js', JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
