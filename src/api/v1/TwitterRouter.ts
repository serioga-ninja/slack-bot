import {Request, Response, NextFunction} from 'express';
import {RouterClass} from '../../classes/router.class';
import * as request from 'request';
import {TwitterHelper} from '../../helpers/twitter.helper';
import variables from '../../configs/variables';
import * as qs from 'querystring';


export class TwitterRouter extends RouterClass {

    public authCallback(req: Request, res: Response, next: NextFunction) {
        console.log(req.body, req.query);
    }

    public auth(req: Request, res: Response, next: NextFunction) {

        request({
            method: 'POST',
            url: `https://api.twitter.com/oauth2/token`,
            headers: {
                Authorization: `Basic ${TwitterHelper.bearer}`,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: qs.stringify({
                grant_type: 'client_credentials'
            })
        }, (error, result: any) => {
            let resultBody: { token_type: string; access_token: string; } = JSON.parse(result.body);
            variables.social.twitter.accessToken = resultBody.access_token;

            res.json(resultBody);
        });
    }

    public invalidate(req: Request, res: Response, next: NextFunction) {
        console.log(qs.stringify({
            access_token: variables.social.twitter.accessToken
        }));

        request({
            method: 'POST',
            url: `https://api.twitter.com/oauth2/invalidate_token`,
            headers: {
                Authorization: `Basic ${TwitterHelper.bearer}`,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: qs.stringify({
                access_token: variables.social.twitter.accessToken
            })
        }, (error, result: any) => {
            let resultBody: { token_type: string; access_token: string; } = JSON.parse(result.body);
            if (resultBody.access_token)
                variables.social.twitter.accessToken = resultBody.access_token;

            res.json(resultBody);
        });
    }

    public search(req: Request, res: Response) {
        let searchQ: string = req.query.q;

        console.log({
            headers: {
                Authorization: `Bearer ${variables.social.twitter.accessToken}`
            }
        });

        request({
            method: 'GET',
            url: `https://api.twitter.com/1.1/users/search.json?${qs.stringify({
                q: searchQ
            })}`,
            headers: {
                Authorization: `Bearer ${variables.social.twitter.accessToken}`
            }
        }, (error, result: any) => {

            res.json(result.body);
        });
    }

    public search2(req: Request, res: Response) {
        let searchQ: string = req.query.q;

        request({
            method: 'GET',
            url: `https://api.twitter.com/1.1/users/search.json?${qs.stringify({
                q: searchQ
            })}`,
            headers: {
                Authorization: `OAuth ${TwitterHelper.getOAuthAuthorizationString(
                    'GET',
                    'https://api.twitter.com/1.1/users/search.json',
                    {
                        q: searchQ
                    })}`
            }
        }, (error, result: any) => {

            request({
                method: 'GET',
                url: `https://api.twitter.com/1.1/users/search.json?${qs.stringify({
                    q: searchQ
                })}`,
                headers: {
                    Authorization: `OAuth ${
                        TwitterHelper.getOAuthAuthorizationString(
                            'GET',
                            'https://api.twitter.com/1.1/users/search.json',
                            {
                                q: searchQ
                            },
                            new Date(result.headers.date).getTime().toString()
                        )
                        }`
                }
            }, (error, result: any) => {

                res.json(result.body);
            });
        });
    }


    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     *
     */
    init() {
        this.router.get('/auth-callback', this.authCallback);
        this.router.get('/auth', this.auth);
        this.router.get('/search-2', this.search2);
        this.router.get('/invalidate', this.invalidate);
    }

}

// Create the SlackRouter, and export its configured Express.Router
let twitterRouter = new TwitterRouter();

export default twitterRouter.router;