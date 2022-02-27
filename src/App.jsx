import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import Domains from './utils/Domains.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = ".nuf";
const CONTRACT_ADDRESS = "0xC676e17080b4428924073304bAed4C3695574cA1";

const App = () => {

  const [network, setNetwork] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [mints, setMints] = useState('');

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts'});

    if (accounts.length != 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized user found.");
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);

    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: '0x13881'}],
        })
      } catch(error) {
        if (error.code == 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
  								chainName: 'Polygon Mumbai Testnet',
  								rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
  								nativeCurrency: {
  										name: "Mumbai Matic",
  										symbol: "MATIC",
  										decimals: 18
  								},
  								blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch(error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }
  
  const mintDomain = async () => {
    if (!domain) { return }
    if (domain.length < 3) {
      alert("Domain must be at least 3 characters long.");
      return;
    }

    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log("Minting domain", domain, "with price", price);
    
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract =  new ethers.Contract(CONTRACT_ADDRESS, Domains.abi, signer);

        console.log("Going to pop wallet now to pay gas...");

        let tx =  await contract.register(domain, {value: ethers.utils.parseEther(price)});
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);

          setRecord('');
          setDomain('');
        } else {
          alert("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMints = async () => {
    
  }

  const updateDomain = async () => {
    if (!record || !domain) { return }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.provider.Web3Provider(ethereum);
        const signer = prover.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, Domains.abi, signer);

        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log("Record sethttps://mumbai.polygonscan.com/tx/"+tx.hash);

        fetchMints();
        setRecord('');
        setDeomain('');
      }
    } catch(error) {
      console.log(error);
    }
    setLoading(false);
  }

  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
			<img src="https://media4.giphy.com/media/11leP64sKAQmEo/giphy.gif?cid=ecf05e47o0dvdstl3srab4uwa1ficvb888qj1havfqlzvoyr&rid=giphy.gif&ct=g" alt="Bentley gif" />
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
  );

  const renderInputForm = () => {
    if (network !== 'Polygon Mumbai Testnet') {
		return (
			<div className="connect-wallet-container">
				<h2>Please switch to Polygon Mumbai Testnet</h2>
				{/* This button will call our switch network function */}
				<button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
			</div>
		);
	}
    
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder='Favorite Bentley quote:'
					onChange={e => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button className='cta-button mint-button' onClick={mintDomain}>
						Mint
					</button>  
				</div>

			</div>
		);
	};

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
            <div className="left">
              <p className="title">Bentley Domain Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>
            <div className="right">
			        <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
			        { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
		        </div>
					</header>
				</div>
        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
