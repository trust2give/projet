import React, {useState} from 'react';

const CompanyForm = ({ formData, handleChange }) => {

    return (
        <div className="md:w-7/12 mx-auto">
            <div className="flex gap-5">
                <div className="md:w-1/2">
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Nom de la structure</label>
                        <input type="text"
                               name="name"
                               value={formData.name}
                               onChange={handleChange}
                               className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">SIREN</label>
                        <input type="text"
                               name="siren"
                               value={formData.siren}
                               onChange={handleChange}
                               className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email"
                               name="email"
                               value={formData.email}
                               onChange={handleChange}
                               className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="mt-4">
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Adresse</label>
                            <input type="text"
                                   name="address_1"
                                   value={formData.address_1}
                                   onChange={handleChange}
                                   className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Complément d'adresse</label>
                            <input type="text"
                                   name="address_2"
                                   value={formData.address_2}
                                   onChange={handleChange}
                                   className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Code Postal</label>
                            <input type="text"
                                   name="postcode"
                                   value={formData.postcode}
                                   onChange={handleChange}
                                   className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Ville</label>
                            <input type="text"
                                   name="city"
                                   value={formData.city}
                                   onChange={handleChange}
                                   className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Pays</label>
                            <select
                                name="country"
                                value="FRANCE"
                                onChange={handleChange}
                                className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
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





                    {/*ajouter le champ secteur voir types.ts
                    [ "NONE", "TRANSPORT", "AUTOMOTIVE", "AEROSPACE", "SERVICES", "SOFTWARE", "ITINDUSTRY", "HIGHTECH", "LUXURY", "BUILDINGS", "SUPPLYCHAIN", "FOOD", "HEALTHCARE" ]
                    */}
                    {/*ajouter un champ unitType
                    [ "NONE", "ENTREPRISE", "ASSOCIATION", "FONDATION", "PLATEFORME", "COLLECTIVITE", "EPICS", "ETAT" ]
                    */}


                </div>
                <div className="md:w-1/2">
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Type d'entité</label>
                        <select
                            name="entity"
                            onChange={handleChange}
                            className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="NONE">Aucun</option>
                            <option value="ENTITY">Entité</option>
                            <option value="GROUP">Groupe</option>
                            <option value="NETWORK">Réseau</option>
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Type de structure</label>
                        <select
                            name="entityType"
                            onChange={handleChange}
                            className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="NONE">Aucun</option>
                            <option value="ENTREPRISE">Entreprise</option>
                            <option value="ASSOCIATION">Association</option>
                            <option value="FONDATION">Fondation</option>
                            <option value="PLATEFORME">Plateforme</option>
                            <option value="COLLECTIVITE">Collectivité</option>
                            <option value="EPICS">Epics</option>
                            <option value="ETAT">Etat</option>
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Type de structure</label>
                        <select
                            name="entitySize"
                            onChange={handleChange}
                            className="input-text p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="NONE">Aucun</option>
                            <option value="SOLE">Indépendant</option>
                            <option value="TPE">Très petite entreprise</option>
                            <option value="PME">Petite et moyenne entreprise</option>
                            <option value="ETI">ETI ?</option>
                            <option value="GE">GE ?</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyForm;
