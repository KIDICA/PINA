enum PlayerFound { none, unknown, known}

export class PlayerData {

    private readonly NO = 'no-player-found';
    private readonly UNKNOWN = 'unknown-player-found';
    private readonly KNOWN = 'known-player-found';

    private playerFound: string = this.NO;
    private name: string;
    private time: string;

    public noPlayerFound() {
        this.playerFound = this.NO;
    }

    public unkownPlayerFound() {
        this.playerFound = this.UNKNOWN;
    }

    public knownPlayerFound(name: string, time: string) {
        this.playerFound = this.KNOWN;
        this.name = name;
        this.time = time;
    }

    public isNoPlayerFound() {
        return this.playerFound === this.NO;
    }

    public isUnknownPlayerFound() {
        return this.playerFound === this.UNKNOWN;
    }

    public isKnownPlayerFound() {
        return this.playerFound === this.KNOWN;
    }

    public blub() {
        console.log('none?', this.isNoPlayerFound(), 'unknown?', this.isUnknownPlayerFound(), 'known?', this.isKnownPlayerFound());
    }
}
