import prompts from 'prompts';
import actions from './actions/index.js';

(async() => {
    while (true) {
        console.log('\n');
        const { choice } = await prompts([{
            type: 'select',
            name: 'choice',
            message: 'What action do you want to execute?',
            choices: actions,
            initial: 1,
        }], {
            onCancel: () => process.exit(0)
        });


        const action = actions.find(({ value }) => value == choice);

        if (!action) process.exit(1);

        await action.execute();
    }
})();
