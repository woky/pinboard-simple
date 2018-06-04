export interface Bookmark {
    href: string
    description: string
    extended: string
    meta:  string
    hash: string
    time: string
    shared: string
    toread: string
    tags: string
}

export interface GetParams {
    tag?: string,
    date?: string,
    url?: string,
    meta?: string
}

export interface AddParams {
    url: string,
    description: string,
    extended?: string,
    tags?: string,
    dt?: string,
    replace?: string,
    shared?: string,
    toread?: string
}

export class Pinboard {

    private authToken: string;

    constructor(apiToken: string) {
        this.authToken = apiToken;
    }

    private fetchApi(path: string, params: object = {}): Promise<any> {
        let urlParams = new URLSearchParams()
        for (let [key, value] of Object.entries(params))
            urlParams.append(key, value);
        urlParams.append('auth_token', this.authToken);
        urlParams.append('format', 'json');
        let url = new URL('https://api.pinboard.in/v1' + path);
        url.search = urlParams.toString();
        return fetch(url.toString()).then(reply => reply.json());
    }

    async lastUpdateTime(): Promise<number> {
        let response = await this.fetchApi('/posts/update');
        let dt = new Date(response['update_time']);
        return dt.getTime();
    }

    async get(params: GetParams): Promise<Array<Bookmark>> {
        return (await this.fetchApi('/posts/get', params)).posts;
    }

    add(params: AddParams): Promise<void> {
        return this.fetchApi('/posts/add', params);
    }

    delete(url: string): Promise<void> {
        return this.fetchApi('/posts/delete', {url: url});
    }

    all(): Promise<Array<Bookmark>> {
        return this.fetchApi('/posts/all');
    }
}
