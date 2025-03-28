'use client'
import React from 'react';

const PersonForm = ({ formData, handleChange }) => {
    return (
        <div className="md:w-7/12 mx-auto">
            <div className="flex gap-5">
                <div className="md:w-1/2">
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Nom</label>
                        <input type="text"
                               name="name"
                               value={formData.name}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Prénom</label>
                        <input type="text"
                               name="firstname"
                               value={formData.firstname}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email"
                               name="email"
                               value={formData.email}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="md:w-1/2">
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Adresse</label>
                        <input type="text"
                               name="address_1"
                               value={formData.address_1}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Complément d'adresse</label>
                        <input type="text"
                               name="address_2"
                               value={formData.address_2}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Code Postal</label>
                        <input type="text"
                               name="postcode"
                               value={formData.postcode}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Ville</label>
                        <input type="text"
                               name="city"
                               value={formData.city}
                               onChange={handleChange}
                               className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Pays</label>
                        <select
                            name="country"
                            value="FRANCE"
                            onChange={handleChange}
                            className="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="GERMANY">Allemagne</option>
                            <option value="BELGIUM">Belgique</option>
                            <option value="BRAZIL">Brésil</option>
                            <option value="DENMARK">Danemark</option>
                            <option value="FINLAND">Finlande</option>
                            <option value="FRANCE">France</option>
                            <option value="GREATBRITAIN">Grande Bretagne</option>
                            <option value="IRELAND">Irlande</option>
                            <option value="ISLAND">Island</option>
                            <option value="LUXEMBURG">Luxembourg</option>
                            <option value="NETHERLAND">Pays-Bas</option>
                            <option value="NORWAY">Norvège</option>
                            <option value="POLAND">Pologne</option>
                            <option value="PORTUGAL">Portugal</option>
                            <option value="SCOTTLAND">Ecosse</option>
                            <option value="SPAIN">Espagne</option>
                            <option value="SWEDEN">Suède</option>
                            <option value="SWITZERLAND">Suisse</option>
                            <option value="USA">USA</option>
                            <option value="NONE">Aucun</option>
                            <option value="OTHERS">Autre</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonForm;
