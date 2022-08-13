import {Arg, Mutation, PubSub, PubSubEngine, Resolver} from "type-graphql";

import {Game} from "../../entity/Game";
import {GameRepository} from "../../database/GameRepository";
import {JoinInput} from "./join/JoinInput";

@Resolver()
export class JoinResolver {
    @Mutation(() => Game)
    async join(
        @Arg('data') { gameId, player }: JoinInput,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game | null> {

        const activeGame = GameRepository.Get(gameId)

        if (!activeGame) return null

        const joinedGame = GameRepository.Save(gameId, {...activeGame, player2: player})

        await pubSub.publish(gameId, {action: "join", player: player})

        return joinedGame
    }
}
