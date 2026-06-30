import RedditHelper from "../../src/helpers/redditHelper";

const fetchMock = jest.fn();
global.fetch = fetchMock;

const redditHeaders = { "User-Agent": RedditHelper.UserAgent };

function mockFetchResponse(options: {
    status?: number;
    body?: string;
    cookies?: string[];
} = {}) {
    const status = options.status ?? 200;

    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => options.body ?? "",
        headers: {
            getSetCookie: () => options.cookies ?? [],
        },
    } as Response;
}

beforeEach(() => {
    fetchMock.mockReset();
});

describe("FetchListing", () => {
    test("GIVEN session and listing requests succeed, EXPECT listing response to be returned", async () => {
        const listingBody = '{"data":{"children":[]}}';

        fetchMock
            .mockResolvedValueOnce(mockFetchResponse({
                body: "<html></html>",
                cookies: ["session=abc; Path=/", "token=xyz; Path=/"],
            }))
            .mockResolvedValueOnce(mockFetchResponse({ body: listingBody }));

        const result = await RedditHelper.FetchListing("rabbits", "hot", 25);

        expect(result).toEqual({ body: listingBody });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(1, "https://old.reddit.com/r/rabbits/hot/", {
            headers: redditHeaders,
        });
        expect(fetchMock).toHaveBeenNthCalledWith(2, "https://old.reddit.com/r/rabbits/hot.json?limit=25", {
            headers: { ...redditHeaders, Cookie: "session=abc; token=xyz" },
        });
    });

    test("GIVEN session response has no cookies, EXPECT listing request without Cookie header", async () => {
        fetchMock
            .mockResolvedValueOnce(mockFetchResponse({ body: "<html></html>" }))
            .mockResolvedValueOnce(mockFetchResponse({ body: '{"data":{"children":[]}}' }));

        await RedditHelper.FetchListing("rabbits", "new", 100);

        expect(fetchMock).toHaveBeenNthCalledWith(2, "https://old.reddit.com/r/rabbits/new.json?limit=100", {
            headers: redditHeaders,
        });
    });

    test("GIVEN session request fails, EXPECT null", async () => {
        fetchMock.mockRejectedValueOnce(new Error("network error"));

        const result = await RedditHelper.FetchListing("rabbits", "top", 100);

        expect(result).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test("GIVEN listing request fails, EXPECT null", async () => {
        fetchMock
            .mockResolvedValueOnce(mockFetchResponse({
                body: "<html></html>",
                cookies: ["session=abc; Path=/"],
            }))
            .mockRejectedValueOnce(new Error("network error"));

        const result = await RedditHelper.FetchListing("rabbits", "hot", 100);

        expect(result).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("GIVEN listing request returns 403, EXPECT null", async () => {
        fetchMock
            .mockResolvedValueOnce(mockFetchResponse({
                body: "<html></html>",
                cookies: ["session=abc; Path=/"],
            }))
            .mockResolvedValueOnce(mockFetchResponse({ status: 403, body: "<html>Blocked</html>" }));

        const result = await RedditHelper.FetchListing("rabbits", "hot", 100);

        expect(result).toBeNull();
    });
});
