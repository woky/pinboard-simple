interface Post {
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

interface GetReply {
    date: string
    user: string
    posts: Post[]
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

    lastUpdateTime(): Promise<any> {
        return this.fetchApi('/posts/update');
    }

    all(): Promise<any> {
        return this.fetchApi('/posts/all');
    }

    get(params: object): Promise<GetReply> {
        return this.fetchApi('/posts/get', params);
    }

    add(params: object): Promise<any> {
        return this.fetchApi('/posts/get', params);
    }
}
