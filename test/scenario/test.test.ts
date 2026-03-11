import {AbstractNipMiniEvent} from 'iz-nostrlib';
import {type TrustedEvent} from '@red-token/welshman/util';
import {hash, Nip01Signer, own} from '@red-token/welshman/signer';
import {generateSecretKey, getPublicKey, verifyEvent} from 'nostr-tools/pure';
import {bytesToHex} from "@noble/hashes/utils";
import {VerifiedEvent} from "nostr-tools/core";
import {AbstractNipObjectEvent, safeFindOptionalMultiTagValues, safeFindSingleTagValue} from "../../src/index.js";
import {expect} from "chai";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class AccessRequestChallengeMessage extends AbstractNipMiniEvent {
    public static KIND: number = 5670;

    private _memberships: string[];

    constructor(memberships: string[] = [], tags: string[][] = [], event?: TrustedEvent) {
        super(tags, event);
        this._memberships = memberships;
    }

    get kind() {
        return AccessRequestChallengeMessage.KIND;
    }

    get eTags(): string[][] {
        return this._memberships.map(m => [m])
    }
}

class AccessRequestMessage extends AbstractNipObjectEvent<any[]> {
    public static KIND: number = 5671;

    private readonly _request: string;

    constructor(request: string, messages: any[] = [], tags: string[][] = [], event?: TrustedEvent) {
        super(messages, tags, event);
        this._request = request;
    }

    get kind() {
        return AccessRequestMessage.KIND
    }

    get eTags(): string[][] {
        return [[this._request]]
    }

    static create(te: TrustedEvent) {
        // TODO: make sure that there is only one e

        return new AccessRequestMessage(
            safeFindSingleTagValue(te, 'e'),
            JSON.parse(te.content),
            te.tags.filter(t => t[0] !== 'e'),
            te)
    }
}

class MembershipDefinitionMessage extends AbstractNipMiniEvent {
    public static KIND: number = 5672;

    constructor(private readonly _title: string, private readonly _description: string = '', tags: string[][] = [], event?: TrustedEvent) {
        super(tags, event);
    }

    get kind() {
        return MembershipDefinitionMessage.KIND
    }

    get content(): string {
        return this._description
    }

    get otherTags(): string[][] {
        return [['t', this._title]]
    }
}

class MembershipRequestMessage extends AbstractNipMiniEvent {
    public static KIND: number = 5673;

    constructor(private readonly _mdmId: string, tags: string[][] = [], event?: TrustedEvent) {
        super(tags, event);
    }

    get kind() {
        return MembershipRequestMessage.KIND
    }

    get eTags(): string[][] {
        return [[this._mdmId]]
    }
}

type MembershipLimitation = {
    start?: number,
    duration?: number,
    end?: number,
    membersince?: number,
    proofofpurchase?: string,
}

class MembershipIssuanceMessage extends AbstractNipObjectEvent<MembershipLimitation> {
    public static KIND: number = 5674;

    constructor(
        private readonly _mdmIds: string[],
        private readonly _memberIds: string[],
        private readonly _mrmIds: string[] = [],
        limitation: MembershipLimitation = {},
        tags: string[][] = [],
        event?: TrustedEvent) {
        super(limitation, tags, event);
    }

    get mdmIds(): string[] {
        return this._mdmIds;
    }

    get memberIds(): string[] {
        return this._memberIds;
    }

    get kind() {
        return MembershipIssuanceMessage.KIND
    }

    get eTags(): string[][] {
        return [
            ...this._mdmIds.map(id => [id, 'def']),
            ...this._mrmIds.map(id => [id, 'req']),
        ]
    }

    get pTags(): string[][] {
        return [
            ...this._memberIds.map(id => [id]),
        ]
    }

    static create(te: TrustedEvent): MembershipIssuanceMessage {

        const reqs: string[] = safeFindOptionalMultiTagValues(te, 'e')
            .filter((t) => t.length > 1 && t[1] === 'req')
            .map((t) => t[0])

        const defs: string[] = safeFindOptionalMultiTagValues(te, 'e')
            .filter((t) => t.length === 1 || (t.length > 1 && t[1] === 'def'))
            .map((t) => t[0])

        const members = safeFindOptionalMultiTagValues(te, 'p')
            .map((t) => t[0])

        return new MembershipIssuanceMessage(defs, members, reqs, JSON.parse(te.content), undefined, te)
    }
}

type ProofOfPurchase = {
    preimage: string
}

class MembershipActivationMessage extends AbstractNipObjectEvent<ProofOfPurchase> {
    public static KIND: number = 5675;

    constructor(private readonly _mimId: string, pop: ProofOfPurchase, tags: string[][] = [], event?: TrustedEvent) {
        super(pop, tags, event);
    }

    get mimId() {
        return this._mimId;
    }

    get kind() {
        return MembershipActivationMessage.KIND
    }

    get eTags(): string[][] {
        return [[this._mimId]]
    }

    static create(te: TrustedEvent) {
        return new MembershipActivationMessage(
            safeFindSingleTagValue(te, 'e'),
            JSON.parse(te.content));
    }
}


function verifyLn(proofofpurchase: string, preimage: string) {
    return true;
}

describe('zaringa', () => {
    it('lets test this', async () => {
        console.log('test');

        const aliceSk = generateSecretKey();
        const alicePk = getPublicKey(aliceSk);
        const aliceSigner: Nip01Signer = new Nip01Signer(bytesToHex(aliceSk))

        const bobSk = generateSecretKey();
        const bobPk = getPublicKey(bobSk);
        const bobSigner: Nip01Signer = new Nip01Signer(bytesToHex(bobSk))

        // Bob creates the club
        const mdm = new MembershipDefinitionMessage('Bobs TeaClub Silver', 'Learn how to make great tea')
        const mdme = await bobSigner.sign(hash(own(mdm.template, bobPk)))

        // Alice applies for membership
        const mrm = new MembershipRequestMessage(mdme.id)
        const mrme = await aliceSigner.sign(hash(own(mrm.template, alicePk)))

        expect(mrme.pubkey).equal(alicePk)

        // Bob issues a membership for Alice
        const ml: MembershipLimitation = {proofofpurchase: 'paytolnXXXXX'}
        const mim = new MembershipIssuanceMessage([mdme.id], [mrme.pubkey], [mrme.id], ml)
        const mime = await bobSigner.sign(hash(own(mim.template, bobPk)))

        expect(mim.memberIds).to.includes(alicePk)
        expect(mim.mdmIds).to.include(mdme.id)

        // Alice pays for the membership creating a
        const pop: ProofOfPurchase = {preimage: 'YES, I have payed'}
        const mam = new MembershipActivationMessage(mime.id, pop)
        const mame = await aliceSigner.sign(hash(own(mam.template, alicePk)))

        // Login challenge
        const serverSk = generateSecretKey();
        const serverPk = getPublicKey(serverSk);
        const serverSigner: Nip01Signer = new Nip01Signer(bytesToHex(serverSk))

        const message = new AccessRequestChallengeMessage([mdme.id]);
        const signedEvent = await serverSigner.sign(hash(own(message.template, serverPk)))

        const json = JSON.stringify(signedEvent)

        const verifiedEvent: VerifiedEvent = JSON.parse(json);
        const res = verifyEvent(verifiedEvent)

        // Login response
        const arm = new AccessRequestMessage(signedEvent.id, [mrme, mime, mame]);
        const arme = await aliceSigner.sign(hash(own(arm.template, alicePk)))

        const json2 = JSON.stringify(arme)
        const verifiedEvent2: VerifiedEvent = JSON.parse(json2);
        const res2 = verifyEvent(verifiedEvent2)
        const te: TrustedEvent = verifiedEvent2

        const acceptedMemberships = [mdme.id]

        // How do we check if we should let Alice in?
        // 1. Verify that this is a 5671
        const darm = AccessRequestMessage.create(te)

        expect(darm.pubkey).to.equal(alicePk)

        if (darm.kind !== AccessRequestMessage.KIND) {
            console.error("Wrong!")
            throw new Error("Wrong!")
        }

        const map: Map<number, TrustedEvent[]> = darm.contentObject.reduce((m: Map<number, TrustedEvent[]>, e: VerifiedEvent) => {

            if (verifyEvent(e)) {
                if (!m.has(e.kind)) m.set(e.kind, [])
                m.get(e.kind).push(e)
            }

            return m
        }, new Map())

        let allowAccess = false

        for (const ml of map.get(MembershipIssuanceMessage.KIND)) {
            const mim = MembershipIssuanceMessage.create(ml)

            expect(mim.memberIds).to.includes(alicePk)
            expect(mim.mdmIds).to.include(mdme.id)

            // TODO: WHY DO I GET BOBS ID HERE WHEN ALICE IS THE MEMBER
            // Check that the requesting user is a member
            if (mim.memberIds.find(id => id === darm.pubkey) === undefined) {
                console.error("Wrong!")
                continue
            }

            // Check that the existing membership is one of the accepted
            if (mim.mdmIds.find(id =>
                acceptedMemberships.find(amid => amid === id) !== undefined) === undefined) {
                console.error("Wrong!")
                continue
            }

            // Check if we need a recite
            if (mim.contentObject.proofofpurchase !== undefined) {
                if (map.get(MembershipActivationMessage.KIND)
                    .map(te => MembershipActivationMessage.create(te))
                    .find(mam =>
                        // assure there is a link
                        mam.mimId === mim.id
                        // check the ln
                        && verifyLn(mim.contentObject.proofofpurchase, mam.contentObject.preimage)
                    ) === undefined) {
                    console.error("Wrong!")
                    continue
                }
            }

            allowAccess = true
            break
        }

        expect(allowAccess).to.be.true

        console.log(allowAccess);
    });
});
