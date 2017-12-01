import {BaseCommand, ICommandSuccess} from '../../core/BaseCommand.class';
import RegisteredAppModel from '../../slack-apps/models/registered-app.model';
import {ISlackRequestBody} from '../../../interfaces/i-slack-request-body';
import {
    ChanelNotRegisteredError, InformaticsSlackBotBaseError,
    ModuleNotExistsError
} from '../../core/Errors';
import {ModuleTypes} from '../../../enums/module-types';
import {RegisteredModulesService} from '../../core/Modules.service';
import {ChannelIsActivated, ChannelIsRegistered, SimpleCommandResponse} from '../../core/CommandDecorators';

class PoltavaNewsRemoveCommand extends BaseCommand {

    validate(requestBody: ISlackRequestBody) {
        return RegisteredAppModel
            .find({'incoming_webhook.channel_id': requestBody.channel_id})
            .then(collection => {
                if (collection.length === 0) {
                    throw new ChanelNotRegisteredError();
                }

                return RegisteredModulesService
                    .moduleIsExists(ModuleTypes.poltavaNews, requestBody.channel_id)
                    .then(exists => {
                        if (!exists) {
                            throw new ModuleNotExistsError();
                        }
                    })
            })
    }

    @ChannelIsRegistered
    @ChannelIsActivated(ModuleTypes.poltavaNews)
    @SimpleCommandResponse
    execute(requestBody: ISlackRequestBody): Promise<any> {
        return RegisteredModulesService
            .deactivateModuleByChannelId(requestBody.channel_id)
            .then((model) => RegisteredModulesService.stopModuleInstance(model._id));
    }
}

let poltavaNewsRemoveCommand = new PoltavaNewsRemoveCommand();

export default poltavaNewsRemoveCommand;