import * as Bluebird from 'bluebird';
import * as mongoose from 'mongoose';
import variables from './variables';

(<any>mongoose).Promise = Bluebird;
const connectString: string = `mongodb://${variables.database.user}:${variables.database.password}@${variables.database.host}/${variables.database.name}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;

mongoose.connect(connectString, {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('We are connected!');
});
