import {IParseDataResults, ParserService} from '../../classes/parser.service';
import InstagramLinkModel, {IInstagramLinkModelDocument} from './models/instagram-link.model';
import {IInstagramLinkModel} from './interfaces/i-instagram-link-model';
import * as _ from 'lodash';

const DOMAIN_URL = 'http://instagram.com';

export class InstagramService extends ParserService<string[]> {

    public static parseUrlFn(a: string[]): string {
        return a[1];
    }

    public static filterLinks(data: IParseDataResults[]): Promise<IParseDataResults[]> {
        let allLinks: string[] = data
            .map(row => {
                return row.results;
            })
            .reduce((all: string[], current: string[]) => {
                return all.concat(current);
            }, []);

        return InstagramLinkModel
            .find({imageUrl: {$in: allLinks}})
            .then((objects: IInstagramLinkModelDocument[]) => {
                let existingLinks = objects.map(model => model.imageUrl);

                data.forEach(row => {
                    row.results = row.results.filter(link => existingLinks.indexOf(link) === -1);
                });

                return data;
            });
    }

    public static saveToDB(data: IParseDataResults[]) {
        return Promise.all(data.map(row => {
            return Promise.all(row.results.map(link => {
                return new InstagramLinkModel().set(<IInstagramLinkModel>{
                    imageUrl: link,
                    instChanelId: row.chanelId
                }).save();
            }));
        }))
    }

    public static getAllImageDocuments(): Promise<IInstagramLinkModelDocument[]> {
        return InstagramLinkModel
            .find({link: /^http/})
            .then((data: IInstagramLinkModelDocument[]) => data);
    }

    public static getAllImages(): Promise<string[]> {
        return InstagramService
            .getAllImageDocuments()
            .then(data => {
                return data.map((row: IInstagramLinkModelDocument) => row.imageUrl)
            });
    }

    public urls: string[];
    public thumbnailReg: RegExp;

    constructor(instagramPublicIds: string[], thumbnailReg: RegExp) {
        super();

        this.urls = instagramPublicIds.map(id => `${DOMAIN_URL}/${id}`);

        this.thumbnailReg = thumbnailReg;
    }

    public collectData(): Promise<IParseDataResults[]> {
        return this.grabTheData(InstagramService.parseUrlFn, this.urls);
    }
}