import { UpcomingMatch } from '../models/UpcomingMatch'
import { LiveMatch } from '../models/LiveMatch'
import { Event } from '../models/Event'
import { Team } from '../models/Team'
import { HLTVConfig } from '../config'
import { extractEventId, fetchPage, toArray } from '../utils/mappers'

export const getMatches = (config: HLTVConfig) => async (): Promise<
  (UpcomingMatch | LiveMatch)[]
> => {
  const $ = await fetchPage(`${config.hltvUrl}/matches`, config.loadPage)

  const upcomingMatches: UpcomingMatch[] = toArray($('.upcomingMatch')).map(matchEl => {

    const id = Number(matchEl.find('a.a-reset').attr('href').split('/')[2]);
    const date = Number(matchEl.find('div.matchTime').attr('data-unix')) || undefined;
    const title = matchEl.find('.matchEvent .matchEventName').text() || undefined;
    const stars = 5 - matchEl.find('.matchRating i.fa-star.faded').length;
    const format = matchEl.find('.matchMeta').text();
    const map = undefined;

    if (matchEl.find('.matchInfoEmpty').length) {
      return {
        id,
        date,
        format,
        map,
        title,
        stars,
        team1: null,
        team2: null,
        event: null,
        live: false,
      };
    }

    let event: Event | undefined;
    let team1: Team | undefined;
    let team2: Team | undefined;

    team1 = {
      name: matchEl
        .find('.matchTeam.team1 .matchTeamName')
        .first()
        .text(),
      id: Number(matchEl.attr('team1')),
    };

    team2 = {
      name: matchEl
        .find('.matchTeam.team2 .matchTeamName')
        .first()
        .text(),
      id: Number(matchEl.attr('team2')),
    };

    event = {
      name: matchEl.find('.matchEvent .matchEventName').text(),
      id: extractEventId(matchEl),
    };

    return { id, date, team1, team2, format, map, title, event, stars, live: false } as any;
  }).filter(Boolean);

  return [...upcomingMatches]
};
