'use client'
import {useAccount} from "wagmi";
import React, {useState} from "react";
import CompanyForm from "@/app/register/CompanyForm";
import PersonForm from "@/app/register/PersonForm";

//installer rabby pour la connexion de wallet
//
export default function Register() {
    const { address, isConnected } = useAccount();
    const [isCompany, setIsCompany] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        firstname: '',
        email: '',
        siren: '',
        address_1: '',
        address_2: '',
        postcode: '',
        city: '',
        country: 'FRANCE',
        entity: 'NONE',
        entityType: 'NONE',
        entitySize: 'NONE',
        sector: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isConnected) {
            alert("Veuillez connecter votre wallet")
        } else {

            let name = formData.name
            name += formData.firstname ? ' ' + formData.firstname : ''

            let fullAddress = formData.address_1

            fullAddress += formData.address_2 ? ' ' + formData.address_2 : ''
            fullAddress += ' ' + formData.postcode
            fullAddress += ' ' + formData.city

            const inputs = {
                person: !isCompany,
                inputs: {
                    name: name,
                    email: formData.email,
                    uid: formData.siren,
                    postal: fullAddress,
                    country: formData.country,
                    entity: isCompany ? formData.entity : 'PERSON',
                    unitType: formData.entityType,
                    unitSize: formData.entitySize,
                    sector: formData.sector,
                }
            }

            const jsonString = JSON.stringify({ call: 'set', inputs: [inputs] });
            const encodedJsonString = encodeURIComponent(jsonString);

            fetch('http://46.226.107.26:8080/T2G'.concat(`?call=entity&inputs=${encodedJsonString}`))
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur réseau');
                    }
                    return response.json();
                })
                .then(async data => {
                    console.log(data[0].tx)
                    fetch('/register/api', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            hash: data[0].tx,
                            address: address,
                        })
                    })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch users');
                         }
                         return response.json();
                    })
                    .then((data) => console.log(data))
                    .catch((error) => console.error(error));
            })
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center my-10">Création de compte</h1>
            <form className="max-w-6xl mx-auto" onSubmit={handleSubmit}>
                <div className="space-y-4 md:w-7/12 mx-auto">
                    <span className="mr-3">Qui êtes-vous ?</span>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <input type="radio"
                                   onChange={(e) => setIsCompany(true)}
                                   name="is_company"
                                   className="mr-2"
                                   id="company"
                                   value="1" />
                            <label htmlFor="company">Une entreprise</label>
                        </div>
                        <div>
                            <input type="radio"
                                   onChange={(e) => setIsCompany(false)}
                                   name="is_company"
                                   className="mr-2"
                                   id="person"
                                   checked={!isCompany}
                                   value="0" />
                            <label htmlFor="person">Une personne physique</label>
                        </div>
                    </div>
                </div>
                {isCompany ? (
                    <CompanyForm formData={formData} handleChange={handleChange} />
                ) : (
                    <PersonForm formData={formData} handleChange={handleChange} />
                )}
                <div className="flex justify-center my-4">
                    <button type="submit"
                            className="bg-indigo-500 text-white px-8 py-3 rounded-xl hover:bg-indigo-600 transition-colors duration-300">
                        Créer votre compte
                    </button>
                </div>
            </form>
        </div>
    )
}
