import {ISlackWebHookRequestBody} from '../../../interfaces/i-slack-web-hook-request-body';
import {BaseCommand} from '../../core/base-command.class';
import {baseModuleCommands} from '../../core/help-command.factories';


class HelpCommand extends BaseCommand {

    execute() {
      return Promise.resolve(<ISlackWebHookRequestBody>{
            response_type: 'in_channel',
            text: '',
            attachments: [
                ...baseModuleCommands('[:module-name]'),
                {
                    title: 'Modules available',
                    text: `instagram-links|poltava-news`
                }
            ]
        });
    }
}

const helpCommand = new HelpCommand();

export default helpCommand;
