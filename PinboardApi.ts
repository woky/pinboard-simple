class PinboardApi {

    apiToken: string;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    token() {
        return this.apiToken;
    }
}
