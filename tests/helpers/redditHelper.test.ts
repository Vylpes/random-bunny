import RedditHelper from "../../src/helpers/redditHelper";
import fetch from "got-cjs";

jest.mock("got-cjs");
const fetchMock = jest.mocked(fetch);

const redditHeaders = { "User-Agent": RedditHelper.UserAgent };

beforeEach(() => {
    fetchMock.mockReset();
});

describe("FetchListing", () => {
    test("GIVEN session and listing requests succeed, EXPECT listing response to be returned", async () => {
        const listingResponse = {
            statusCode: 200,
            body: '{"data":{"children":[]}}',
        };

        fetchMock
            .mockResolvedValueOnce({
                statusCode: 200,
                headers: { "set-cookie": ["session=abc; Path=/", "token=xyz; Path=/"] },
                body: "<html></html>",
            })
            .mockResolvedValueOnce(listingResponse);

        const result = await RedditHelper.FetchListing("rabbits", "hot", 25);

        expect(result).toBe(listingResponse);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(1, "https://old.reddit.com/r/rabbits/hot/", {
            throwHttpErrors: false,
            headers: redditHeaders,
        });
        expect(fetchMock).toHaveBeenNthCalledWith(2, "https://old.reddit.com/r/rabbits/hot.json?limit=25", {
            throwHttpErrors: false,
            headers: { ...redditHeaders, Cookie: "session=abc; token=xyz" },
        });
    });

    test("GIVEN session response has no cookies, EXPECT listing request without Cookie header", async () => {
        fetchMock
            .mockResolvedValueOnce({
                statusCode: 200,
                headers: {},
                body: "<html></html>",
            })
            .mockResolvedValueOnce({
                statusCode: 200,
                body: '{"data":{"children":[]}}',
            });

        await RedditHelper.FetchListing("rabbits", "new", 100);

        expect(fetchMock).toHaveBeenNthCalledWith(2, "https://old.reddit.com/r/rabbits/new.json?limit=100", {
            throwHttpErrors: false,
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
            .mockResolvedValueOnce({
                statusCode: 200,
                headers: { "set-cookie": ["session=abc; Path=/"] },
                body: "<html></html>",
            })
            .mockRejectedValueOnce(new Error("network error"));

        const result = await RedditHelper.FetchListing("rabbits", "hot", 100);

        expect(result).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("GIVEN listing request returns 403, EXPECT null", async () => {
        fetchMock
            .mockResolvedValueOnce({
                statusCode: 200,
                headers: { "set-cookie": ["session=abc; Path=/"] },
                body: "<html></html>",
            })
            .mockResolvedValueOnce({
                statusCode: 403,
                body: "<html>Blocked</html>",
            });

        const result = await RedditHelper.FetchListing("rabbits", "hot", 100);

        expect(result).toBeNull();
    });
});
