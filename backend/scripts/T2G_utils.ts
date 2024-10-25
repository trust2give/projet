
export function colorOutput( text: string, color?: string, hide?: boolean ) : string {
    var output ="";
    switch (color) {
        case "yellow": {
            output = '\x1b[33m '.concat( text, ' \x1b[0m');
            break;
            }
        case "blue": {
            output = '\x1b[34m '.concat( text, ' \x1b[0m');
            break;
            }
        case "green": {
            output = '\x1b[32m '.concat( text, ' \x1b[0m');
            break;
            }
        case "red": {
            output = '\x1b[31m '.concat( text, ' \x1b[0m');
            break;
            }
        case "cyan": {
            output = '\x1b[36m '.concat( text, ' \x1b[0m');
            break;
            }
        case "magenta": {
            output = '\x1b[35m '.concat( text, ' \x1b[0m');
            break;
            }    
        case "white": {
            output = '\x1b[37m '.concat( text, ' \x1b[0m');
            break;
            }
        default: {
            output = text;
            }
        }
    if (!hide) console.log(output);
    return output;
    }