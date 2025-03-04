import {ReactiveArray} from "../../src/org/nostr/util/ReactiveArray.js";

describe('Test of creating a reactive array', () => {

    before(function () {
        // Code to run before all tests
    });

    it('should complete an async operation', async () => {

        const relays = new ReactiveArray<string>([]);

        relays.addListener((x) => {
            console.log("ME" + x);
        })

        relays.addListener((x) => {
            console.log("ME2" + x);
        })

        relays.push("ZOOL")
        relays.push("ZOO2222L")

        relays.value.forEach((x) => {
            console.log(x);
        })
    })

})
