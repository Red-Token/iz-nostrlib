import {AbstractNostrContext} from './AbstractNostrContext'
import {ProfileService} from '../services/ProfileService'
import {normalizeRelayUrl} from '@welshman/util'
import {setContext} from '@welshman/lib'
import {getDefaultNetContext} from '@welshman/net'
import {getDefaultAppContext} from '@welshman/app'

/**
 * This context is the global context and is used for maintaining the global profile database.
 */
export class GlobalNostrContext extends AbstractNostrContext {
    public profileService: ProfileService = new ProfileService(this)

    static readonly startUrls = ['wss://relay.lxc']

    private static _instance: GlobalNostrContext
    static get instance(): GlobalNostrContext {
        if (GlobalNostrContext._instance === undefined) {
            setContext({
                net: getDefaultNetContext(),
                app: getDefaultAppContext()
            })
            const relays = [...GlobalNostrContext.startUrls.map((url) => normalizeRelayUrl(url))]

            GlobalNostrContext._instance = new GlobalNostrContext(relays)
        }

        return GlobalNostrContext._instance
    }
}
