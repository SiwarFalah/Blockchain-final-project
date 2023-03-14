import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { nftAddress, nftMarketAddress, coinAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import { useRouter } from 'next/router';
import CLMarket from '../artifacts/contracts/CLMarket.sol/CLMarket.json';
import CLC from '../artifacts/contracts/CLC.sol/CLC.json';

// in this component we set the ipfs up to host our nft data of
// file storage

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function MintItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [address, setAddress] = useState([]);
  const [balance, setBalance] = useState(0);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  });

  const router = useRouter();

  useEffect(() => {
    getAddress();
  }, []);

  async function getAddress() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const currentAddress = await signer.getAddress();
    setAddress(currentAddress);
    let contract = new ethers.Contract(coinAddress, CLC.abi, signer);
    let currentBalance = await contract.balanceOf(currentAddress);
    setBalance(ethers.utils.formatUnits(currentBalance.toString(), 'ether'));
  }

  // set up a function to fireoff when we update files in our form - we can add our
  // NFT images - IPFS

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: prog => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    // upload to IPFS
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      // run a function that creates sale and passes in the url
      createSale(url);
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  }

  async function createSale(url) {
    // create the items and list them on the marketplace
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // we want to create the token
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.mintToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, 'ether');

    // list the item for sale on the marketplace
    contract = new ethers.Contract(nftMarketAddress, CLMarket.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.makeMarketItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });

    await transaction.wait();
    router.push('./');
  }

  return (
    <div>
      <div className="flex justify-center">
        <div
          style={{
            border: '1px solid',
            width: '50%',
            position: 'relative',
            top: '20%',
            backgroundColor: 'rgb(148 163 184)',
            transform: 'translate(0,20%)',
          }}
        >
          <div
            className=" flex flex-col pb-12"
            style={{
              width: '95%',
              position: 'relative',
              left: '50%',
              transform: 'translate(-50%,0)',
            }}
          >
            <input
              placeholder="Asset Name"
              className="mt-8 p-4"
              onChange={e =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
            <input
              placeholder="Asset Description"
              className="mt-2 p-4"
              onChange={e =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
            />
            <input
              placeholder="Asset Price in CLC"
              className="mt-2 p-4"
              onChange={e =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
            <input
              type="file"
              name="Asset"
              className="mt-4 "
              onChange={onChange}
            />{' '}
            {fileUrl && (
              <img className="rounded mt-4" width="250px" src={fileUrl} />
            )}
            <button
              onClick={createMarket}
              className="bg-teal-400 hover:bg-teal-300 text-gray-800 font-bold py-2 px-4 rounded-l mt-6"
            >
              Mint NFT
            </button>
          </div>
        </div>
      </div>

      <p
        className="font-bold text-right text-xl"
        style={{ marginTop: '8%', marginRight: '1%' }}
      >
        Account: {address} | Balance: {Math.round(balance)} CLC
      </p>
    </div>
  );
}
