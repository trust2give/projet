
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connect-wallet').addEventListener('click', async () => {
        if (window.ethereum) {
            try {
                // Demander une connexion au wallet
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                // Afficher l'adresse connectée
                console.log('Compte connecté :', accounts[0]);
                
            } catch (error) {
                console.error('Erreur lors de la connexion au wallet :', error.message);
            }
        } else {
            console.error("No Ethereum provider found.");
        } 
    });
});
