// src/services/userService.ts

interface User {
    id: number;
    name: string;
  }
  
  const users: User[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  
  // Fonction pour récupérer un utilisateur par ID
  export const getUserById = (id: number): User | undefined => {
    return users.find(user => user.id === id);
  };
  
  // Fonction pour ajouter un nouvel utilisateur
  export const addUser = (user: User): User => {
    users.push(user);
    return user;
  };
  