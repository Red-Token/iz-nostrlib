export class NostrUserProfileMetaData {
    constructor(public name: string = 'Unknown User',
                public about: string = '',
                public picture: string = '',
                public bot: boolean = false,
                public display_name?: string,
                public website?: string,
                public banner?: string) {
    }

}
