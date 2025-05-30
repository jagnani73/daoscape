import { HOUSES } from "../constants";

export const randomVotingHouse = (): HOUSES => {
    const houses = Object.values(HOUSES);
    const randomIndex = Math.floor(Math.random() * houses.length);
    return houses[randomIndex];
};
