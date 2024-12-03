import hre from "hardhat";
import { Address } from "viem";
// import syndicFacetAbi from './abi/syndicFacet.json';

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
                // Demander une connexion au wallet
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const publicClient = await hre.viem.getPublicClient();
                // Afficher l'adresse connectée
                // console.log('Compte connecté :', accounts[0]);
                // const walletIsRegistered = await client.readContract({
                //     address: accounts[0],
                //     abi: syndicFacetAbi.abi,
                //     functionName: 'registerWallet',
                //     arguments: [accounts[0], 2]
                // });
                //
                // console.log(walletIsRegistered)

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