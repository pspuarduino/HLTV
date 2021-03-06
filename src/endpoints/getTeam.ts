import { FullTeam, Result, Achievement } from '../models/FullTeam'
import { Player } from '../models/Player'
import { HLTVConfig } from '../config'
import { fetchPage, toArray, getMapsStatistics } from '../utils/mappers'
import { popSlashSource, hasChild } from '../utils/parsing'

export const getTeam = (config: HLTVConfig) => async ({
  id
}: {
  id: number
}): Promise<FullTeam> => {
  const t$ = await fetchPage(`${config.hltvUrl}/team/${id}/-`, config.loadPage)

  const name = t$('.profile-team-name').text()
  const logo = `${config.hltvStaticUrl}/images/team/logo/${id}`
  const coverImage = t$('.coverImage').attr('data-bg-image')
  const location = t$('.team-country .flag').attr('alt')
  const facebook = t$('.facebook')
    .parent()
    .attr('href')
  const twitter = t$('.twitter')
    .parent()
    .attr('href')
  const rank =
    Number(
      t$('.profile-team-stat .right')
        .first()
        .text()
        .replace('#', '')
    ) || undefined

  const regularPlayers: Player[] = toArray(t$('.overlayImageFrame-square'))
    .filter(hasChild('.playerFlagName .text-ellipsis'))
    .map(playerEl => ({
      name: playerEl.find('.playerFlagName .text-ellipsis').text(),
      id: Number(
        playerEl
          .find('.profileImage')
          .attr('src')
          .split('/')
          .slice(-2, -1)
      )
    }))

  const officialPicturePlayers: Player[] = toArray(t$('.overlayImageFrame'))
    .filter(hasChild('.playerFlagName .text-ellipsis'))
    .map(playerEl => ({
      name: playerEl.find('.playerFlagName .text-ellipsis').text(),
      id: Number(popSlashSource(playerEl.find('.bodyshot-team-img'))!.split('.')[0])
    }))

  const players = regularPlayers.concat(officialPicturePlayers)

  const recentResults: Result[] = toArray(t$('.results-holder .a-reset')).map(matchEl => ({
    matchID: matchEl.attr('href') ? Number(matchEl.attr('href').split('/')[2]) : undefined,
    enemyTeam: {
      id: Number(popSlashSource(t$(matchEl.find('.team-logo').get(1)))!),
      name: t$(matchEl.find('.team').get(1)).text()
    },
    result: matchEl.find('.result-score').text(),
    event: {
      id: Number(popSlashSource(matchEl.find('.event-logo'))!.split('.')[0]),
      name: matchEl.find('.event-name').text()
    }
  }))

  let rankingDevelopment

  try {
    const rankings = JSON.parse(t$('.graph').attr('data-fusionchart-config'))
    rankingDevelopment = rankings.dataSource.dataset[0].data.map(x => x.value).map(Number)
  } catch {
    rankingDevelopment = []
  }

  const bigAchievements: Achievement[] = []

  const mapStatisticsGraphElement = t$(t$('.graph').get(1))

  const mapStatistics =
    mapStatisticsGraphElement.length !== 0
      ? getMapsStatistics(mapStatisticsGraphElement.attr('data-fusionchart-config'))
      : undefined

  return {
    id,
    name,
    logo,
    coverImage,
    location,
    facebook,
    twitter,
    rank,
    players,
    recentResults,
    rankingDevelopment,
    bigAchievements,
    mapStatistics,
  }
}
