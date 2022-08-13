import {Arg, Mutation, PubSub, PubSubEngine, Resolver} from "type-graphql";

import {Game} from "../../entity/Game";
import {GameRepository} from "../../database/GameRepository";
import {MakeMoveInput} from "./makeMove/MakeMoveInput";
import {getGamewinner} from "./makeMove/getGameStatus";
import {GameSubscribeEvent} from "./gameSubscribe/GameSubscribeEvent";

@Resolver()
export class MakeMoveResolver {
    @Mutation(() => Game)
    async makeMove(
        @Arg('data') { gameId, player, move }: MakeMoveInput,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game | null> {

        const activeGame = GameRepository.Get(gameId)

        if (!activeGame) return null

        const positions = JSON.parse(activeGame.positions)

        if (positions[move]) return null // The player already played this position

        positions[move] = player

        const gameWinner: string | null = getGamewinner(positions)


        const subscriptionPayload: GameSubscribeEvent = {positions: JSON.stringify(positions), action: "makeMove"}
        const leftMoves = false

        if (gameWinner) {
            subscriptionPayload.player = gameWinner
            subscriptionPayload.action = "win"
        }
        else {
            subscriptionPayload.action = leftMoves ? "draw" : "makeMove"
        }

        await pubSub.publish(gameId, subscriptionPayload)
        return GameRepository.Save(gameId, {...activeGame, positions: JSON.stringify(positions)})
    }
}
