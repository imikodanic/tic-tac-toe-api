import {Field, InputType} from "type-graphql";

@InputType()
export class JoinInput {
    @Field()
    gameId: string

    @Field()
    player: number // ID (Usually here would go the JWT token but this is a simple version)
}
