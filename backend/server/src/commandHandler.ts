// commandHandler.ts
export const handleCommand = (command: string): string => {
    switch (command) {
        case 'greet':
            return 'Hello, World!';
        case 'time':
            return `Current time is: ${new Date().toISOString()}`;
        default:
            return 'Unknown command';
    }
};

