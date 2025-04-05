import PaypackJs from 'paypack-js';
import dotenv from 'dotenv';
dotenv.config();

const paypack = new PaypackJs.default({
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

export default paypack;
