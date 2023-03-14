import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { coinAddress } from '../config';
import CLC from '../artifacts/contracts/CLC.sol/CLC.json';
import { useRouter } from 'next/router';

export default function Clc() {
  const [address, setAddress] = useState([]);
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);

  const router = useRouter();

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

  async function buyCLC() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(coinAddress, CLC.abi, signer);
    await contract.buyCoin({
      value: ethers.utils.parseUnits(amount.toString(), 'ether'),
    });

    router.push('./');
  }
  useEffect(() => {
    getAddress();
  }, []);

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
              placeholder="Amount..."
              className="mt-8 p-4"
              onChange={e => setAmount(Number(e.target.value))}
            />
            <button
              onClick={buyCLC}
              className="bg-teal-400 hover:bg-teal-300 text-gray-800 font-bold py-2 px-4 rounded-l mt-6"
            >
              Buy CLC
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
