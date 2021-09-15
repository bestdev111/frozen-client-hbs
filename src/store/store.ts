import { Db, MongoClient } from 'mongodb';
import { Stores } from '../types';
const url = process.env.MONGO_DB_URL || 'mongodb://localhost:27018';
const database = process.env.MONGO_DB_DATABASE || 'frozen';

export let store: Db;
export let stores: Stores;
export let client: MongoClient;

export const ready = (async () => {
  try {
    client = await new MongoClient(url, { useUnifiedTopology: true }).connect();

    store = client.db(database);
    stores = {
      prescriptions: store.collection('prescriptions'),
      laboratoryExamOrders: store.collection('laboratoryExamOrders'),
      imageryExamOrders: store.collection('imageryExamOrders'),
    };
  } catch (e: any) {
    console.error(e);
    return false;
  }
  return true;
})();
