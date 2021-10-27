export default {
    title: 'Quit',
    description: 'Quit the program',
    value: 'quit',
    execute: () => {
        console.log('Good bye!');
        process.exit(0);
    }
};
