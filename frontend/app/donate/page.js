'use client';

export default function Donate() {
    const categories = [
        'mines', 'agriculture', 'medecine', 'association', 'peche',
        'banque', 'industrie', 'avion', 'transport', 'voiture',
        'loisirs', 'transport', 'justice'
    ];

    const amounts = [25, 40, 50, 75, 100, 150];

    return (
        <div className="container mx-auto">
            <div className="w-full flex justify-center mb-8 bg-gradient-to-b from-indigo-300">
                <img src="/img/mains.svg" alt="Mains" className="w-1/3 max-w-4xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Faire un don</h1>
            <form className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category, index) => (
                            <label key={index} className="cursor-pointer group">
                                <input type="checkbox"
                                       name="category[]"
                                       value={category}
                                       className="hidden category-checkbox" />
                                <div className="border-2 rounded-lg p-4 text-center transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-lg category-card">
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
                                               name="is_company"
                                               id="company-switch" className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer peer is_company" />
                                        <div className="block h-6 w-12 rounded-full bg-gray-300 peer-checked:bg-indigo-400"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white peer-checked:translate-x-6"></div>
                                    </div>
                                </label>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Genre</label>
                                    <select name="gender"
                                            id="gender" className="w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                        <option value="mr">M.</option>
                                        <option value="mrs">Mme</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nom</label>
                                    <input type="text"
                                           name="lastname"
                                           className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prénom</label>
                                    <input type="text"
                                           name="firstname"
                                           className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email"
                                           name="email"
                                           className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Adresse 1</label>
                                <input type="text"
                                       name="address_1"
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Adresse 2</label>
                                <input type="text"
                                       name="address_2"
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Code Postal</label>
                                <input type="text"
                                       name="postcode"
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ville</label>
                                <input type="text"
                                       name="city"
                                       className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pays</label>
                                <input type="text"
                                       name="country"
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
                                       value={amount}
                                       className="hidden amount-radio" />
                                <div className="border-2 rounded-xl p-4 text-center transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-lg amount-card">
                                    <span className="text-xl font-bold">{amount}€</span>
                                </div>
                            </label>
                        ))}
                        <div>
                            <input type="number"
                                   name="custom_amount"
                                   placeholder="Autre montant"
                                   id="custom-amount"
                                   className="w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 custom-amount" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button"
                                id="submit"
                                className="bg-indigo-500 text-white px-8 py-3 rounded-xl hover:bg-indigo-600 transition-colors duration-300">
                            Faire un don
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
