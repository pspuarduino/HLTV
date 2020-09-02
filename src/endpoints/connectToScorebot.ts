import * as io from 'socket.io-client'
import { ScoreboardUpdate } from '../models/ScoreboardUpdate'
import { LogUpdate } from '../models/LogUpdate'
import { HLTVConfig } from '../config'
import { getRandomInteger } from '../utils/get-random-int';
const HttpsProxyAgent = require('https-proxy-agent');

export type ConnectToScorebotParams = {
  ids: number[]
  sockets: string[]
  onScoreboardUpdate?: (data: ScoreboardUpdate) => any
  onLogUpdate?: (data: LogUpdate) => any
  onFullLogUpdate?: (data: unknown) => any
  onConnect?: () => any
  onScoreUpdate?: (data) => any
  onDisconnect?: () => any
  proxyUrl?: string
}

export const connectToScorebot = (config: HLTVConfig) => async (
  {
    ids,
    onScoreboardUpdate,
    onLogUpdate,
    onFullLogUpdate,
    onScoreUpdate,
    onConnect,
    onDisconnect,
    proxyUrl,
    sockets,
  }: ConnectToScorebotParams) => {

  let socket;
  const randomEndpoint = sockets[getRandomInteger(0, sockets.length - 1)];

  if (proxyUrl) {
      const agent = new HttpsProxyAgent(proxyUrl);
      socket = io.connect(randomEndpoint, { agent: agent });
  } else {
      socket = io.connect(randomEndpoint);
  }


  const initScoreObject = JSON.stringify({
    token: '',
    listIds: ids,
  });

  socket.on('connect', () => {
    if (onConnect) {
      onConnect()
    }

    socket.on('scoreboard', data => {
      if (onScoreboardUpdate) {
        onScoreboardUpdate(data)
      }
    });

    socket.on('score', data => {
      if (onScoreUpdate) {
        onScoreUpdate(data)
      }
    });

    socket.on('log', data => {
      if (onLogUpdate) {
        onLogUpdate(JSON.parse(data))
      }
    });

    socket.on('fullLog', data => {
      if (onFullLogUpdate) {
        onFullLogUpdate(JSON.parse(data))
      }
    });

    socket.emit('readyForScores', initScoreObject);

  });

  socket.on('reconnect', () => {
    socket.emit('readyForScores', initScoreObject)
  });

  socket.on('disconnect', () => {
    if (onDisconnect) {
      onDisconnect()
    }
  });

  return socket;
};
