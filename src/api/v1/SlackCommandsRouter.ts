import {Request, Response} from 'express';
import {RouterClass} from '../../classes/router.class';
import weatherService, {OpenWeatherService} from '../../services/open-weather.service';
import {InstagramService} from '../../services/instagram.service';
import slackAppModule from '../../modules/commands.module';

export class SlackCommandsRouter extends RouterClass {

    public getSomeBoobs(req: Request, res: Response) {
        return InstagramService
            .getAllImages()
            .then(data => {

                res.json({
                    response_type: 'in_channel',
                    text: '',
                    attachments: [{
                        image_url: data[Math.floor(Math.random() * data.length)]
                    }]
                });
            });
    }

    public getSomeWeather(req: Request, res: Response) {
        let itemsToShow = 3;
        let {text} = req.body;
        if (text.length > 0 && typeof parseInt(text.split(' ')[0], 10) === 'number') {
            itemsToShow = parseInt(text.split(' ')[0], 10);
        }


        return weatherService
            .getAvailableData()
            .then(data => {
                res.json({
                    response_type: 'in_channel',
                    text: '',
                    attachments: OpenWeatherService.weatherItemToSlackAttachment(data.list.slice(0, itemsToShow))
                });
            });
    }

    public informaticsBot(req: Request, res: Response) {
        return slackAppModule
            .execute(req.body.text, req.body)
            .then(result => {
                res.json(result);
            })
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.post('/boobs', this.getSomeBoobs);
        this.router.post('/weather', this.getSomeWeather);
        this.router.post('/informatics-bot', this.informaticsBot);
    }

}

// Create the SlackRouter, and export its configured Express.Router
const slackBoobsRouter = new SlackCommandsRouter();

export default slackBoobsRouter.router;