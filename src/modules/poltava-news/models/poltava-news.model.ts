import * as mongoose from 'mongoose';
import {IPoltavaNewsModel} from '../interfaces/i-poltava-news-model';

export interface IPoltavaNewsModelDocument extends IPoltavaNewsModel, mongoose.Document {
}


export const PoltavaNewsModelSchema: mongoose.Schema = new mongoose.Schema({
    link: {
        type: String,
        require: true,
        unique: true
    },
    title: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    },
    postedChannels: [String]
}, {
    timestamps: {createdAt: 'created_at'}
});

export const PoltavaNewsModel = mongoose.model<IPoltavaNewsModelDocument>('poltava_news', PoltavaNewsModelSchema);

export default PoltavaNewsModel;