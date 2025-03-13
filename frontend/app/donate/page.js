'use client';

import {useAccount} from "wagmi";
import {useEffect, useState} from "react";

export default function Donate() {
    const categories = [
        'mines', 'agriculture', 'medecine', 'association', 'peche',
        'banque', 'industrie', 'avion', 'transport', 'voiture',
        'loisirs', 'transport', 'justice'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const { address, isConnected } = useAccount();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [category, setCategory] = useState([]);
    const [isCompany, setIsCompany] = useState(false);
    const [gender, setGender] = useState('');
    const [name, setName] = useState('');
    const [firstname, setFirstname] = useState('');
    const [email, setEmail] = useState('');
    const [address_1, setAddress1] = useState('');
    const [address_2, setAddress2] = useState('');
    const [postcode, setPostcode] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(null);


    useEffect(() => {
        if (isConnected) {

        }
    }, [isConnected])

    //quand on soumet le formulaire faire un fetch
    //inputs = Array<{  person: boolean, inputs: {
    //         name: string,
    //         uid?: string,
    //         email: string,
    //         postal: string,
    //         entity?: string,
    //         sector?: string,
    //         unitType?: string,
    //         unitSize?: string,
    //         country: string
    //         } //valeur du form
    // const jsonString = JSON.stringify({ call: 'set', inputs: [] });
    // const encodedJsonString = encodeURIComponent(jsonString);

    const amounts = [25, 40, 50, 75, 100, 150];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.table(selectedCategories)
        const inputs = {
            person: isCompany,
            inputs: {
                name: name + ' ' + firstname,
                email: email,
                postal: postcode,
                // postal: postcode,
                // entity?: string,
                // sector?: string,
                // unitType?: string,
                // unitSize?: string,
                country: country
            }
        }

        console.log(inputs)

        // const jsonString = JSON.stringify({ call: 'set', inputs: [] });
        // const encodedJsonString = encodeURIComponent(jsonString);
        //
        // fetch('http://46.226.107.26:8080/T2G'.concat(`?call=entity&inputs=${encodedJsonString}`))
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('Erreur réseau');
        //         }
        //         return response.json();
        //     })
        //     .then(async data => {
                // const user = await prisma.donator.create({
                //     data: {
                //         hash: 'elsa@prisma.io',
                //         address: 'Elsa Prisma',
                //     },
                // })

                //ici on recupère le hash de l'entité enregistrée dans la bc
                 //ce hash il faut le mettre en base avec prisma hash => adresse wallet
            // })
    };

    return (
        <div className="container mx-auto">
            <div className="w-full flex justify-center mb-8 bg-gradient-to-b from-indigo-300">
                <img src="/img/mains.svg" alt="Mains" className="w-1/4 max-w-4xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Faire un don</h1>
            <form className="max-w-6xl mx-auto" onSubmit={handleSubmit}>
                <div className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category, index) => (
                            <label key={index} className="cursor-pointer group">
                                <input type="checkbox"
                                       name="category[]"
                                       value={category}
                                       onChange={(e) => handleCheckboxChange(e, category)}
                                       checked={selectedCategories.includes(category)}
                                       className="hidden category-checkbox" />
                                <div
                                    className={`border-2 rounded-lg p-4 text-center transition-all duration-300
                                            group-hover:border-indigo-500 group-hover:shadow-lg 
                                        ${selectedCategories.includes(category) ? 'border-indigo-500' : ''} 
                                        group-hover:shadow-lg category-card`}
                                >
                                    <img src={`/img/${category}.png`}
                                         alt={category.charAt(0).toUpperCase() + category.slice(1)}
                                         className="w-16 h-16 mx-auto mb-2" />
                                    <span className="block text-sm font-medium">
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr className="my-8 border-gray-300" />
                <div className="mb-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <span className="mr-3">Company</span>
                                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                        <input type="checkbox"
                                               onChange={(e) => setIsCompany(e.target.checked)}
                                               value="1"
                                               id="company-switch"
                                               className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer peer is_company" />
                                        <div className="block h-6 w-12 rounded-full bg-gray-300 peer-checked:bg-indigo-400"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white peer-checked:translate-x-6"></div>
                                    </div>
                                </label>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Genre</label>
                                    <select onChange={(e) => setGender(e.target.value)}
                                            id="gender"
                                            className="w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                        <option value="mr">M.</option>
                                        <option value="mrs">Mme</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nom</label>
                                    <input type="text"
                                           onChange={(e) => setName(e.target.value)}
                                           className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prénom</label>
                                    <input type="text"
                                           onChange={(e) => setFirstname(e.target.value)}
                                           className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email"
                                           onChange={(e) => setEmail(e.target.value)}
                                           className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Adresse 1</label>
                                <input type="text"
                                       onChange={(e) => setAddress1(e.target.value)}
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Adresse 2</label>
                                <input type="text"
                                       onChange={(e) => setAddress2(e.target.value)}
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Code Postal</label>
                                <input type="text"
                                       name="postcode"
                                       onChange={(e) => setPostcode(e.target.value)}
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ville</label>
                                <input type="text"
                                       onChange={(e) => setCity(e.target.value)}
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pays</label>
                                <input type="text"
                                       onChange={(e) => setCountry(e.target.value)}
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>
               <hr className="my-8 border-gray-300" />

                <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 justify-content-between">
                        {amounts.map((amount, index) => (
                            <label key={index} className="cursor-pointer group w-48">
                                <input type="radio"
                                       name="amount"
                                       onChange={(e) => setSelectedAmount(e.target.value)}
                                       value={amount}
                                       className="hidden amount-radio" />


                                <div className={`border-2 rounded-xl p-4 text-center transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-lg amount-card ${
                                    selectedAmount === amount.toString() ? 'border-indigo-500' : ''
                                }`}
                                >
                                    <span className="text-xl font-bold">{amount}€</span>
                                </div>
                            </label>
                        ))}
                        <div>
                            <input type="number"
                                   onChange={(e) => setSelectedAmount(e.target.value)}
                                   placeholder="Autre montant"
                                   id="custom-amount"
                                   className="w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 custom-amount" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit"
                                className="bg-indigo-500 text-white px-8 py-3 rounded-xl hover:bg-indigo-600 transition-colors duration-300">
                            Faire un don
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
