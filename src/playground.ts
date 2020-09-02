import HLTV from './index'
// HLTV.getMatch({ id: 2332676 })
//   .then(res => console.dir(res, { depth: null }))
//   .catch(err => console.log(err))
// HLTV.getMatches().then(res => console.log(res))
// HLTV.getResults({pages: 1}).then(res => console.log(res))
// HLTV.getStreams({ loadLinks: true }).then(res => console.log(res))
// HLTV.getActiveThreads().then(res => console.log(res))
// HLTV.getTeamRanking().then(res => console.log(res))
// HLTV.getTeamRanking({ country: 'Thailand' }).then(res => console.log(res))
const scorebotProxy = 'http://193.31.100.189:9428';
HLTV.connectToScorebot({
    ids: [2343534],
    sockets: [
        'https://cf1-scorebot.hltv.org',
        'https://cf2-scorebot.hltv.org',
        'https://cf3-scorebot.hltv.org',
    ],
    onScoreUpdate: (data) => {
    const matchInfo = {
      id: data.listId,
      live: data.liveLog[''],
      score: Object.keys(data.wins || {}).map((teamId: string) => ({
        teamId: Number(teamId),
        score: data.wins[teamId],
      })),
      maps: Object.keys(data.mapScores)
        .map(
          (key: string) => {
              const map = data.mapScores[key];
              return {
                score: Object.keys(map.scores || {})
                  .map((teamId: string) => ({
                    teamId: Number(teamId),
                    score: data.wins[teamId],
                  })),
                number: map.mapOrdinal,
                forfeit: map.defaultWin,
                name: map.name,
                live: !map.mapOver,
              };
          }),
    };

    console.log('onScoreUpdate update!')
        console.log(JSON.stringify(data))
        console.log(isLiveMatch(data))
    console.log()
    console.log('---===---')
    console.log()
  }})
// HLTV.getMatchesStats({startDate: '2017-07-10', endDate: '2017-07-18'}).then(res => console.log(res.length))
// HLTV.getMatch({id: 2312432}).then(res => console.dir(res, {depth: null})).catch(err => console.log(err))
// HLTV.getMatchMapStats({id: 49968}).then(res => console.dir(res, { depth: null }))
// HLTV.getMatchStats({id: 62979}).then(res => console.dir(res, { depth: null }))
// HLTV.getTeam({ id: 9481 })
//   .then(res => console.dir(res, { depth: null }))
//   .catch(err => console.log(err))
// HLTV.getTeamStats({id: 6669}).then(res => console.dir(res, { depth: null })).catch(err => console.log(err))
// HLTV.getPlayer({id: 9216}).then(res => console.dir(res, { depth: null })).catch(err => console.log(err))
// HLTV.getEvent({id: 3773}).then(res => console.dir(res, { depth: null })).catch(err => console.log(err))
// HLTV.getResults({pages: 1, eventId: 3883}).then(res => console.log(res))


function isLiveMatch (match: any) {

    const teamIds = Object.keys(match.wins).map(Number);
    const formatRegexp = /.*Best of (\d+).*/gi.exec('Best of 3');
    const format = formatRegexp ? Number(formatRegexp.pop()) : 1;

    const scores = Object.keys(match.mapScores).map((key: string) => match.mapScores[key]);

    const mapsDone = scores.filter((mapItem: any) => mapItem.mapOver === true).length;

    const allMapsDone = format === mapsDone;

    const team1WonMaps = scores
        .filter(
            (mapItem: any) => mapItem.scores && mapItem.scores[teamIds[0]] > mapItem.scores[teamIds[1]] && mapItem.mapOver,
        ).length;

    const team2WonMaps = scores
        .filter(
            (mapItem: any) => mapItem.scores && mapItem.scores[teamIds[1]] > mapItem.scores[teamIds[0]] && mapItem.mapOver,
        ).length;

    // Все карты сыграны 3 из 3х
    // Команда 1 или 2 выиграла больше половины карт наприме bo3 2:0
    // Могут быть ещё forfeit

    return !(allMapsDone
        || (team1WonMaps > (format / 2))
        || (team2WonMaps > (format / 2)));

}
