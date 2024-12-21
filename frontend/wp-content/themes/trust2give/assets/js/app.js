const web3 = new Web3('http://127.0.0.1:8545');
const rootAddress = '0x38a024c0b412b9d1db8bc398140d00f5af3093d4'
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_root",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "SyndFordidden",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "facet",
                "type": "string"
            }
        ],
        "name": "SyndicInvalidContractAddress",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "SyndicInvalidSender",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "SyndAlreadyBanned",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "SyndAlreadyRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_stamp",
                "type": "uint256"
            }
        ],
        "name": "SyndNewBanned",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_stamp",
                "type": "uint256"
            }
        ],
        "name": "SyndNewRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "SyndRightsGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "SyndUnknown",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "SyndicRootAddressSet",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            }
        ],
        "name": "banWallet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "beacon_SyndicFacet",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_profile",
                "type": "uint8"
            }
        ],
        "name": "declineWalletRights",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            }
        ],
        "name": "getWalletRights",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "get_T2G_SyndicFacet",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_profile",
                "type": "uint8"
            }
        ],
        "name": "grantWalletRights",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            }
        ],
        "name": "isWalletBanned",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            }
        ],
        "name": "isWalletRegistered",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_profile",
                "type": "uint8"
            }
        ],
        "name": "registerWallet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_mockup",
                "type": "address"
            }
        ],
        "name": "updateMockUpAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

let data = {
    'categories': [],
    'informations': {
        'company': false,
        'gender': 'mr',
        'lastname': '',
        'firstname': '',
        'email': '',
        'address_1': '',
        'address_2': '',
        'postcode': '',
        'city': '',
        'country': ''
    },
    'amount': 0,
    'custom_amount': 0,
};

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('connect-wallet').addEventListener('click', async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log(accounts[0])
                //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

                if (accounts[0] !== 'undefined') {
                    const contract = new web3.eth.Contract(abi, rootAddress);
                    const receipt = await contract.methods.registerWallet(accounts[0], 2).send({
                        from: accounts[0] // Adresse de l'expéditeur
                    });
                    console.log('Transaction Hash:', receipt.transactionHash);
                    console.log('Transaction Receipt:', receipt);
                }
            } catch (error) {
                console.error('Erreur lors de la connexion au wallet :', error.message);
            }
        } else {
            console.error("No Ethereum provider found.");
        }


    });


    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (el) => {

            if (el.target.checked) {
                data['categories'].push(el.target.value);

            } else {
                data['categories'].pop(el.target.value);
            }
        });
    });

    document.getElementById('company-switch').addEventListener('change', function() {
        if (this.checked) {
            data['informations']['company'] = true;
        } else {
            data['informations']['company'] = false;
        }
    });

    document.getElementById('gender').addEventListener('change', function() {
        data['informations']['company'] = this.value;
    });

    document.querySelectorAll('.input-text').forEach(input => {
        input.addEventListener('change', function() {
            data['informations'][this.name] = this.value;
        });
    });

    document.querySelectorAll('.amount-radio').forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                data['amount'] = this.value;
            }
        });
    });

    document.getElementById('custom-amount').addEventListener('change', function() {
        data['amount'] = 0;
        data['custom_amount'] = this.value;
    });

    document.getElementById('submit').addEventListener('click', function() {
        console.table(data);
    });
});