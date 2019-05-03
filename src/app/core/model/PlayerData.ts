enum PlayerFound { none, unknown, known}

export class PlayerData {

    private readonly NO = 'no-player-found';
    private readonly UNKNOWN = 'unknown-player-found';
    private readonly KNOWN = 'known-player-found';

    // state
    private _personId: string;
    private _name: string;
    private _score: number;
    private _playerFound: string = this.NO;

    public adopt(other: PlayerData) {
        this._playerFound = other._playerFound;
        this._personId = other._personId;
        this._name = other._name;
        this._score = other._score;
    }

    public noPlayerFound() {
        this._playerFound = this.NO;
    }

    public unkownPlayerFound() {
        this._playerFound = this.UNKNOWN;
    }

    public knownPlayerFound(personId: string, name: string, score: number) {
        this._playerFound = this.KNOWN;
        this._personId = personId;
        this._name = name;
        this._score = score;
        return this;
    }

    public isNoPlayerFound() {
        return this._playerFound === this.NO;
    }

    public isUnknownPlayerFound() {
        return this._playerFound === this.UNKNOWN;
    }

    public isKnownPlayerFound() {
        return this._playerFound === this.KNOWN;
    }

    get personId() {
        return this._personId;
    }

    get name() {
        return this._name;
    }

    get score() {
        return this._score;
    }

    set score(newScore: number) {
        this._score = newScore;
    }
}
