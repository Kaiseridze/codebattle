import React, {
 memo, useMemo, useState,
} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import capitalize from 'lodash/capitalize';
import groupBy from 'lodash/groupBy';
import reverse from 'lodash/reverse';

import Loading from '../../components/Loading';
import MatchStatesCodes from '../../config/matchStates';
import { getOpponentId } from '../../utils/matches';

import StageCard from './StageCard';
import StageTitle from './StageTitle';
import StatisticsCard from './StatisticsCard';
import UsersMatchList from './UsersMatchList';

const navMatchesTabsClassName = cn(
  'nav nav-tabs flex-nowrap text-center border-0',
  'text-uppercase font-weight-bold pb-2',
  'cb-overflow-x-auto cb-overflow-y-hidden',
);

const tabLinkClassName = active => cn(
    'nav-item nav-link text-uppercase text-nowrap rounded-0 font-weight-bold p-3 border-0 w-100', {
      active,
    },
  );

const tabContentClassName = active => cn('tab-pane fade', {
    'd-flex flex-column show active': active,
  });

const PlayerPanelCodes = {
  review: 'review',
  stages: 'stages',
  matches: 'matches',
};

const playerPanels = Object.values(PlayerPanelCodes);

function PlayerStatsPanel({
  currentRound,
  roundsLimit,
  matches,
  players,
  currentUserId,
}) {
  const [playerPanel, setPlayerPanel] = useState(PlayerPanelCodes.review);
  const currentPlayer = players[currentUserId];

  const matchList = useMemo(() => (
    reverse(Object.values(matches))
      .filter(match => match.playerIds.includes(currentUserId))
  ), [matches, currentUserId]);
  const [
    opponentId,
    matchId,
  ] = useMemo(() => {
    const activeMatch = matchList.find(match => match.state === MatchStatesCodes.playing);
    const lastMatch = matchList[0];
    const targetMatch = activeMatch || lastMatch;

    if (targetMatch) {
      const playerId = getOpponentId(targetMatch, currentUserId);

      return [
        playerId,
        targetMatch.id,
      ];
    }

    return [];
  }, [matchList, currentUserId]);
  const groupedMatchListByRound = useMemo(() => groupBy(matchList, 'round'), [matchList]);
  const stages = useMemo(
    () => reverse(Object.keys(groupedMatchListByRound)).map(Number),
    [groupedMatchListByRound],
  );

  if (!currentPlayer) {
    return <Loading />;
  }

  return (
    <div className="d-flex flex-column border border-success rounded-lg shadow-sm">
      <div className="d-flex border-bottom p-2">
        <div>
          <span className="text-nowrap" title={currentPlayer.name}>
            {currentPlayer.name}
            <span className="badge badge-success text-white mx-2">you</span>
          </span>
          <span title="Your place in tournament">
            <FontAwesomeIcon className="text-warning" icon="trophy" />
            {`: ${currentPlayer.place}`}
          </span>
        </div>
      </div>
      <nav>
        <div
          id="nav-player-panels-tab"
          role="tablist"
          className={navMatchesTabsClassName}
        >
          {playerPanels.map(panelName => (
            <a
              className={tabLinkClassName(playerPanel === panelName)}
              id={`${panelName}-player-panel`}
              key={`player-panel-tab-${panelName}`}
              data-toggle="tab"
              href={`#player-panel-${panelName}`}
              role="tab"
              aria-controls={`player-panel-${panelName}`}
              aria-selected="true"
              onClick={() => {
                setPlayerPanel(panelName);
              }}
            >
              {capitalize(panelName)}
            </a>
          ))}
        </div>

        <div
          id="nav-player-panels-tabContent"
          className="tab-content flex-grow-1"
        >
          <div
            id={`player-panel-${PlayerPanelCodes.review}`}
            key={`player-panel-${PlayerPanelCodes.review}`}
            className={tabContentClassName(playerPanel === PlayerPanelCodes.review)}
            role="tabpanel"
            aria-labelledby={`player-panel-tab-${PlayerPanelCodes.review}`}
          >
            <div className="d-flex flex-column flex-md-row flex-lg-row flex-xl-row border-bottom p-2">
              <StageCard
                playerId={currentUserId}
                opponentId={opponentId}
                stage={currentRound}
                stagesLimit={roundsLimit}
                players={players}
                lastGameId={matches[matchId]?.gameId}
                lastMatchState={matches[matchId]?.state}
                matchList={groupedMatchListByRound[currentRound]}
              />
              <StatisticsCard
                playerId={currentUserId}
                // place={currentPlayer.place}
                // matchList={matchList}
                matchList={groupedMatchListByRound[currentRound]}
              />
            </div>
          </div>
          <div
            id={`player-panel-${PlayerPanelCodes.stages}`}
            key={`player-panel-${PlayerPanelCodes.stages}`}
            className={tabContentClassName(playerPanel === PlayerPanelCodes.stages)}
            role="tabpanel"
            aria-labelledby={`player-panel-tab-${PlayerPanelCodes.stages}`}
          >
            {stages.length < 2 ? (<div className="d-flex justify-content-center p-1">No stages statistics</div>) : stages.map(stage => {
              const stageFirstMatch = groupedMatchListByRound[stage][0];
              const stageOpponentId = getOpponentId(stageFirstMatch, currentUserId);

              return (
                <div
                  key={`stage-${stage}-statistics`}
                  className="d-flex flex-column flex-md-row flex-lg-row flex-xl-row border-bottom p-2"
                >
                  <StageCard
                    playerId={currentUserId}
                    opponentId={stageOpponentId}
                    stage={stage}
                    stagesLimit={roundsLimit}
                    players={players}
                    lastGameId={stageFirstMatch?.gameId}
                    lastMatchState={stageFirstMatch?.state}
                    matchList={groupedMatchListByRound[stage]}
                  />
                  <StatisticsCard
                    playerId={currentUserId}
                    matchList={groupedMatchListByRound[stage]}
                  />
                </div>
              );
            })}
          </div>
          <div
            id={`player-panel-${PlayerPanelCodes.matches}`}
            key={`player-panel-${PlayerPanelCodes.matches}`}
            className={tabContentClassName(playerPanel === PlayerPanelCodes.matches)}
            role="tabpanel"
            aria-labelledby={`player-panel-tab-${PlayerPanelCodes.matches}`}
          >
            {stages.map(stage => (
              <React.Fragment key={`stage-${stage}-matches`}>
                <div className="d-flex justify-content-center p-2">
                  <StageTitle
                    stage={stage}
                    stagesLimit={roundsLimit}
                  />
                </div>
                <div className="border-top">
                  <UsersMatchList
                    currentUserId={currentUserId}
                    playerId={currentUserId}
                    matches={groupedMatchListByRound[stage]}
                    hideStats
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default memo(PlayerStatsPanel);