'use client';


import Link from "next/link";

export default function Home() {

    return (
        <div>
            <div className="mb-12 py-8 w-full bg-gradient-to-b from-indigo-300">
                <div className="flex w-full md:w-4/6 mx-auto">
                    <div className="w-full sm:w-1/2 sm:align-items-center content-center">
                        <h1 className="text-4xl font-bold mb-4">
                            Le climat a besoin de vous !
                        </h1>
                        <p>Le climat a besoin de vous !</p>
                        <div className="place-content-center sm:place-content-end grid">
                        <Link className="mt-4 lg:inline-block mx-auto lg:mr-3 py-2 border-2 px-6 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition duration-200"
                              href="#">
                            Faire un don
                        </Link>
                    </div>
                </div>
                <div className="hidden sm:inline-block w-1/2">
                    <img width="400" src="/img/terre.svg" className="mx-auto" />
                </div>
            </div>
            <div className="flex items-center w-full bg-indigo-500 text-center text-white h-48 text-xl">
                <div className="w-full sm:w-2/5 mx-auto">
                    <p>Luttons ensemble contre le réchauffement climatique en toute confiance &amp; transparence</p>
                </div>
            </div>
            <div className="w-full sm:w-3/5 sm:mx-auto bg-world py-24 text-center shadow-lg h-96 font-bold">
                <span className="text-green text-4xl">Où en sommes nous aujourd'hui ?</span>
                <div className="text-green text-2xl">
                    <ul className="flex align-items-center mt-8">
                        <li className="flex flex-col w-1/3">
                            <span>36.3MD</span>
                            <span>d'emission mondiale de CO²</span>
                        </li>
                        <li className="flex flex-col w-1/3">
                            <span>110</span>
                            <span>partenaires</span>
                        </li>
                        <li className="flex flex-col w-1/3">
                            <span>+1.5°C</span>
                            <span>d'ici 2023</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="py-8 w-full bg-clear-green text-black ">
                <div className="flex flew-col sm:flex-row w-full sm:w-3/5 sm:mx-auto space-x-[20px]">
                    <div className="w-full sm:w-1/2">
                        <h2 className="text-center text-2xl text-green mb-10">
                            Il était une fois Trust2Give
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <br />
                        <div className="text-right">
                            <a className="py-2 px-6 border-solid border-2 bg-green text-white rounded-xl" href="#">
                                En savoir plus
                            </a>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 relative h-[20rem]">
                        <img src="/img/team.png" alt="team" width="300" className="absolute top-0 right-0" />
                        <img src="/img/don.png" alt="don" width="180" className="absolute bottom-0" />
                    </div>
                </div>
            </div>
            <div className=" w-full sm:w-3/5 sm:mx-auto">
                <ul className="flex flex-col sm:flex-row justify-between text-center">
                    <li className="shadow-lg sm:w-64 p-4">
                        <img className="mx-auto mb-2" src="/img/oeil.png" width="70" alt="oeil" />
                        <h3>Transparence</h3>
                        <p className="text-sm">
                            TransparenceLorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </li>
                    <li className="shadow-lg sm:w-64 p-4">
                        <img className="mx-auto mb-2" src="/img/cadenas.png" width="70" alt="cadenas" />
                        <h3>Intégrité</h3>
                        <p className="text-sm">
                            TransparenceLorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </li>
                    <li className="shadow-lg sm:w-64 p-4">
                        <img className="mx-auto " src="/img/impact.png" width="60" alt="impact" />
                        <h3>Impact</h3>
                        <p className="text-sm">
                            TransparenceLorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    );
}