import '../styles/globals.css';
import './app.css';
import Link from 'next/link';

function CryptoLionMarketplace({ Component, pageProps }) {
  return (
    <div>
      <nav
        className="border-b p-6 opacity-85"
        style={{ backgroundColor: 'black' }}
      >
        <div className="img_logo">
          <img className="object-contain w-96" src="../logo.png" alt="logo" />
        </div>
        <ul className="flex">
          <li className="flex-1 mr-2">
            <Link href="/">
              <a className="font-bold text-center block border border-neutral-900 rounded py-2 px-4 bg-stone-400 hover:bg-stone-300 text-black">
                Marketplace
              </a>
            </Link>
          </li>
          <li className="flex-1 mr-2">
            <Link href="/mint-item">
              <a className="font-bold text-center block border border-neutral-900 rounded py-2 px-4 bg-stone-400 hover:bg-stone-300 text-black">
                Mint Tokens
              </a>
            </Link>
          </li>
          <li className="flex-1 mr-2">
            <Link href="/my-nfts">
              <a className="font-bold text-center block border border-neutral-900 rounded py-2 px-4 bg-stone-400 hover:bg-stone-300 text-black ">
                My NFts
              </a>
            </Link>
          </li>
          <li className="flex-1 mr-2">
            <Link href="/buy-coin">
              <a className="font-bold text-center block border border-neutral-900 rounded py-2 px-4 bg-stone-400 hover:bg-stone-300 text-black ">
                Buy CLC
              </a>
            </Link>
          </li>
          <li className="text-center flex-1">
            <Link href="/account-dashboard">
              <a className="font-bold text-center block border border-neutral-900 rounded py-2 px-4 bg-stone-400 hover:bg-stone-300 text-black ">
                Dashboard
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default CryptoLionMarketplace;
