import { RacingGame } from "../src/domain/RacingGame/RacingGame";
import { Car } from "../src/domain/Car/Car";
import { getRandomNumberInRange } from "../src/util/getRandomNumber";
import {
  MIN_GAME_SIZE,
  RANDOM_MAX_NUMBER,
  RANDOM_MIN_NUMBER,
} from "../src/domain/RacingGame/_consts";
import {
  RUN_THRESHOLD,
  RUN_UNIT,
  START_POSITION,
} from "../src/domain/Car/_consts";

describe("Together RacingGame (여럿이서 하는 레이싱 게임)", () => {
  const GAME_SIZE = 5;
  const DEFAULT_CAR_NAMES_INPUT = "pobi,crong,honux";
  const DEFAULT_PLAYERS = [new Car("pobi"), new Car("crong"), new Car("honux")];

  const RANDOM_NUMBERS_ALL = Array.from(new Array(DEFAULT_PLAYERS.length), () =>
    Array.from(new Array(GAME_SIZE), () =>
      getRandomNumberInRange(RANDOM_MIN_NUMBER, RANDOM_MAX_NUMBER)
    )
  );

  const CAN_GO_ROUNDS = RANDOM_NUMBERS_ALL.map(
    (RANDOM_NUMBERS) =>
      RANDOM_NUMBERS.filter((number) => number >= RUN_THRESHOLD).length
  );

  const EXPECT_POSITIONS = CAN_GO_ROUNDS.map(
    (CAN_GO_ROUND) => START_POSITION + CAN_GO_ROUND * RUN_UNIT
  );

  const WINNER_POSITION = Math.max(...EXPECT_POSITIONS);

  const EXPECT_GAME_RESULT = DEFAULT_PLAYERS.map(
    (player, i) => new Car(player.getName(), EXPECT_POSITIONS[i])
  );

  const EXPECT_POSITION_LOGS = EXPECT_GAME_RESULT.map((player) =>
    player.getPositionLog()
  );

  const EXPECT_WINNERS = EXPECT_GAME_RESULT.filter(
    (player) => player.getPosition() === WINNER_POSITION
  ).map((player) => player.getName());

  const EXPECT_WINNER_LOG = `${EXPECT_WINNERS.join(",")}가 최종 우승했습니다.`;

  let racingGame = new RacingGame();
  racingGame.setRacingGameSize(GAME_SIZE);

  it(`자동차 게임 시도 횟수를 입력받아서 자동차 게임을 셋팅할 때, 이상한 값을 입력했을 경우 에러를 출력하고 게임을 종료한다.`, () => {
    expect(() => racingGame.setRacingGameSize('abc')).toThrow(`레이싱 게임 시도 회수를 숫자로 제대로 입력해야합니다.`);
  })

  it(`자동차 게임 시도 횟수를 입력받아서 자동차 게임을 셋팅할 때, 입력한 시도 횟수가 0 미만이면 에러를 출력하고 게임을 종료한다.`, () => {
    expect(() => racingGame.setRacingGameSize(-1)).toThrow(`레이싱 게임 시도 회수는 ${MIN_GAME_SIZE} 이상이어야 합니다.`);
  })

  it(`"${DEFAULT_CAR_NAMES_INPUT}"가 레이싱 게임에 등록했을 때, 등록된 자동차는 총 ${DEFAULT_PLAYERS.length}대 이다.`, () => {
    racingGame.setPlayers(
      racingGame.getPlayerNamesFromInput(DEFAULT_CAR_NAMES_INPUT)
    );
    const expectedPlayersNames = DEFAULT_PLAYERS.map((player) =>
      player.getName()
    );
    const receivedPlayersNames = racingGame
      .getPlayers()
      .map((player) => player.getName());
    expect(receivedPlayersNames).toStrictEqual(expectedPlayersNames);
  });

  describe("자동차 경주 진행 중", () => {
    DEFAULT_PLAYERS.forEach((_, playerIdx) => {
      it(`${START_POSITION}에서 시작해서 ${GAME_SIZE}회 동안 자동차가 ${CAN_GO_ROUNDS[playerIdx]}번 갈 수 있었을 때, 최종적으로 도착한 위치는 ${EXPECT_POSITIONS[playerIdx]}이다.`, () => {
        for (let round = 0; round < GAME_SIZE; round++) {
          racingGame.playerPlayOneRound(
            playerIdx,
            RANDOM_NUMBERS_ALL[playerIdx][round]
          );
        }
        expect(racingGame.getPlayers()[playerIdx].getPosition()).toBe(
          EXPECT_POSITIONS[playerIdx]
        );
      });
    });
  });

  describe("자동차 경주 완료", () => {
    racingGame.getPlayers().forEach((player, playerIdx) => {
      it(`${GAME_SIZE}회 동안 자동차가 ${CAN_GO_ROUNDS[playerIdx]}번 갈 수 있었을 때, 총 움직인 만큼을 출력 가능한 형태로 표시할 수 있다.`, () => {
        expect(player.getPositionLog()).toBe(EXPECT_POSITION_LOGS[playerIdx]);
      });
    });

    it(`자동차 게임의 우승자는 ${EXPECT_WINNERS.join(",")}이다.`, () => {
      expect(racingGame.getWinnersNames()).toStrictEqual(EXPECT_WINNERS);
    });

    it(`우승자를 출력 가능한 형태로 표시할 수 있다.`, () => {
      expect(racingGame.getWinnerLog()).toBe(EXPECT_WINNER_LOG);
    });
  });
});
