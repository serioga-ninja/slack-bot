import {CommandNotFoundError} from '../../core/errors';
import {IBaseModuleClass} from '../../core/modules/base-module.class';
import {ICommandResult} from '../../core/modules/commands/models';
import slackAppModule from '../../modules/slack-app/slack-app.module';
import {LoggerService} from '../../services/logger.service';

import MODULES_LIST from './available-modules.list';
import {ISlackRequestBody} from './models/i-slack-request-body';
import {ISlackWebHookRequestBody} from './models/i-slack-web-hook-request-body';

const logService = new LoggerService('CommandsLogic');

export class CommandsLogic {

  static getModule(commandStringArr: string[]): IBaseModuleClass {
    const [moduleName] = commandStringArr;

    return MODULES_LIST.filter((module) => module.moduleName === moduleName)[0] || slackAppModule;
  }

  static getCommand(commandStringArr: string[]): string {
    return commandStringArr[1] || 'help';
  }

  static collectArguments(commandStringArr: string[]): object {
    const [module, command, ...configArgs] = commandStringArr;

    return configArgs.reduce((all: string[], current: string) => {
      const [key, value] = current.split('=');

      all[key] = (value || '').split(',').map((link) => link.replace(/ /, ''));

      return all;
    }, {});
  }

  public async execute(commandString: string, requestBody: ISlackRequestBody): Promise<ISlackWebHookRequestBody> {
    try {
      const {module, command, args} = await this.parse(commandString);

      const result: ICommandResult = await module.execute(requestBody, command, args);

      return {
        response_type: 'ephemeral',
        text: result.text || '',
        ...result
      };
    } catch (error) {
      logService.error(error);

      return <ISlackWebHookRequestBody>{
        response_type: 'ephemeral',
        text: error.type,
        attachments: [
          {
            title: error.name,
            text: error.message,
            color: '#a60200'
          }
        ]
      };

    }
  }

  private parse(commandString: string): Promise<{ module: IBaseModuleClass, command: string; args: object }> {
    return new Promise((resolve, reject) => {
      let commandStringArr = commandString.split(' ');

      const module: IBaseModuleClass = CommandsLogic.getModule(commandStringArr);

      // if module has not been set we set it to the default one
      if (module.moduleName === slackAppModule.moduleName) {
        commandStringArr = ['app'].concat(commandStringArr);
      }

      const command: string = CommandsLogic.getCommand(commandStringArr);

      if (!module.hasCommand(command)) {
        throw new CommandNotFoundError(command, module.moduleName);
      }

      const args = CommandsLogic.collectArguments(commandStringArr);

      resolve({module, command, args});
    });
  }
}

const commandsModule = new CommandsLogic();

export default commandsModule;