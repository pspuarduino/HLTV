import { UpcomingMatch } from '../models/UpcomingMatch'
import { LiveMatch } from '../models/LiveMatch'
import { Event } from '../models/Event'
import { Team } from '../models/Team'
import { MapSlug } from '../enums/MapSlug'
import { popSlashSource, text } from '../utils/parsing'
import { HLTVConfig } from '../config'
import { extractEventId, fetchPage, toArray } from '../utils/mappers'

export const getMatches = (config: HLTVConfig) => async (): Promise<
  (UpcomingMatch | LiveMatch)[]
> => {
  const $ = await fetchPage(`${config.hltvUrl}/matches`, config.loadPage)

  const liveMatches: LiveMatch[] = toArray($('.live-match .a-reset')).map(matchEl => {
    const id = Number(matchEl.attr('href').split('/')[2])
    const teamEls = matchEl.find('img.logo')
    const stars = matchEl.find('.stars i').length

    const team1: Team = {
      name: teamEls.first().attr('title'),
      id: Number(popSlashSource(teamEls.first())) || undefined
    }

    const team2: Team = {
      name: teamEls.last().attr('title'),
      id: Number(popSlashSource(teamEls.last())) || undefined
    }

    const format = matchEl.find('.bestof').text()
    const maps = toArray(matchEl.find('.header .map')).map(text) as MapSlug[]

    const event: Event = {
      name: matchEl.find('.event-logo').attr('title'),
      id: Number(popSlashSource(matchEl.find('.event-logo'))!.split('.')[0]) || undefined
    }

    return { id, team1, team2, event, format, maps, stars, live: true }
  })

  const upcomingMatches: UpcomingMatch[] = toArray($('.upcomingMatch')).map(matchEl => {

    if (matchEl.find('.matchInfoEmpty').length) return;

    const id = Number(matchEl.find('a.a-reset').attr('href').split('/')[2])
    const date = Number(matchEl.find('div.matchTime').attr('data-unix')) || undefined
    const title = matchEl.find('.matchEvent .matchEventName').text() || undefined
    const stars = 5 - matchEl.find('.matchRating i.fa-star.faded').length

    const format = matchEl.find('.matchMeta').text();
    const map = undefined;

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

  return [...liveMatches, ...upcomingMatches]
}
