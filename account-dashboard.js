// we want to load the users nfts and display

import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftAddress, nftMarketAddress, coinAddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import CLMarket from '../artifacts/contracts/CLMarket.sol/CLMarket.json';
import CLC from '../artifacts/contracts/CLC.sol/CLC.json';

export default function AccountDashBoard() {
  // array of nfts
  const [nfts, setNFts] = useState([]);
  const [address, setAddress] = useState([]);
  const [sold, setSold] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    // what we want to load:
    // we want to get the msg.sender hook up to the signer to display the owner nfts

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const currentAddress = await signer.getAddress();
    setAddress(currentAddress);
    let contract = new ethers.Contract(coinAddress, CLC.abi, signer);
    let currentBalance = await contract.balanceOf(currentAddress);
    setBalance(ethers.utils.formatUnits(currentBalance.toString(), 'ether'));

    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      CLMarket.abi,
      signer
    );
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        // we want get the token metadata - json
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    // create a filtered array of items that have been sold
    const soldItems = items.filter(i => i.sold);
    setSold(soldItems);
    setNFts(items);
    setLoadingState('loaded');
  }

  if (loadingState === 'loaded' && !nfts.length)
    return (
      <div>
        <h1 className="px-20 py-7 text-4x1 font-bold">
          You have not minted any NFTs!
        </h1>
        <p
          className="font-bold text-right text-xl"
          style={{ marginTop: '30%', marginRight: '1%' }}
        >
          Account: {address} | Balance: {Math.round(balance)} CLC
        </p>
      </div>
    );
  return (
    <div className="p-4">
      <h1 style={{ fontSize: '20px', color: 'black', fontWeight: 'bold' }}>
        Tokens Minted
      </h1>
      <div style={{ marginLeft: '7%', padding: '10px' }}>
        <div className="px-4" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-x1 overflow-hidden">
                <img src={nft.image} />
                <div className="p-4 bg-white">
                  <p
                    style={{ height: '64px' }}
                    className="p-3 text-black font-bold border-b-4 border-amber-300 "
                  >
                    {nft.name}
                  </p>
                  <div style={{ height: '72px', overflow: 'auto' }}>
                    <p className="p-3 text-gray-500 font-bold">
                      {nft.description}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-2 bg-white ">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-black mr-2 mb-2">
                    {nft.price} CLC
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="font-bold text-right text-xl" style={{ marginTop: '2%' }}>
          Account: {address} | Balance: {Math.round(balance)} CLC
        </p>
      </div>
    </div>
  );
}
