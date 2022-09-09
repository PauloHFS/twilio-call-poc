import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from 'express';
import twilio from 'twilio';

const account_sid = process.env.ACCOUNT_SID;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'up' });
});

app.post('/token', (req, res) => {
  const { identity, roomName } = req.body;

  const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
    room: roomName,
  });

  const token = new twilio.jwt.AccessToken(account_sid, api_key, api_secret);

  token.addGrant(videoGrant);

  token.identity = identity;

  res.send({ token: token.toJwt() });
});

app.listen(process.env.PORT ?? 3333, () => {
  console.log(`running on ...:${process.env.PORT ?? 3333}`);
});
