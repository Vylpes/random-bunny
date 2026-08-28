import { ErrorCode } from "../src/constants/ErrorCode";
import ErrorMessages from "../src/constants/ErrorMessages";
import ImageHelper from "../src/helpers/imageHelper";
import randomBunny from "../src/index";
import fetch from "got-cjs";

jest.mock('got-cjs');
const fetchMock = jest.mocked(fetch);

beforeEach(() => {
    fetchMock.mockReset();
});

describe('randomBunny', () => {
    test('GIVEN subreddit AND sortBy is supplied, EXPECT successful result', async() => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/cr8xudsnkgua1.jpg',
                            },
                        },
                    ],
                }
            }),
        });

        const result = await randomBunny('rabbits', 'new');

        expect(result.IsSuccess).toBeTruthy();
        expect(result.Result).toBeDefined();
        expect(result.Error).toBeUndefined();

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');
    });

    test('GIVEN sortBy is NOT supplied, expect it to default to hot', async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/cr8xudsnkgua1.jpg',
                            },
                        },
                    ],
                }
            }),
        });

        const result = await randomBunny('rabbits');

        expect(result.IsSuccess).toBeTruthy();
        expect(result.Result).toBeDefined();
        expect(result.Error).toBeUndefined();

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/hot.json?limit=100');
    });

    test('GIVEN the fetch fails, EXPECT failure result', async () => {
        fetchMock.mockRejectedValue('Test Reason')

        const result = await randomBunny('rabbits', 'new');

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Result).toBeUndefined();
        expect(result.Error).toBeDefined();

        expect(result.Error!.Code).toBe(ErrorCode.FailedToFetchReddit);
        expect(result.Error!.Message).toBe(ErrorMessages.FailedToFetchReddit);

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');
    });

    test('GIVEN the result is NOT valid JSON, EXPECT failure result', async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify(null),
        });

        const result = await randomBunny('rabbits', 'new');

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Result).toBeUndefined();
        expect(result.Error).toBeDefined();

        expect(result.Error!.Code).toBe(ErrorCode.UnableToParseJSON);
        expect(result.Error!.Message).toBe(ErrorMessages.UnableToParseJSON);

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');
    });

    test('GIVEN randomSelect does NOT find a response, EXPECT failure result', async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [],
                }
            }),
        });

        const result = await randomBunny('rabbits', 'new');

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Result).toBeUndefined();
        expect(result.Error).toBeDefined();

        expect(result.Error!.Code).toBe(ErrorCode.NoImageResultsFound);
        expect(result.Error!.Message).toBe(ErrorMessages.NoImageResultsFound);

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');
    });

    test('GIVEN randomSelect does NOT find a valid response, EXPECT failure result', async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/cr8xudsnkgua1.webp',
                            },
                        },
                    ],
                }
            }),
        });

        const result = await randomBunny('rabbits', 'new');

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Result).toBeUndefined();
        expect(result.Error).toBeDefined();

        expect(result.Error!.Code).toBe(ErrorCode.NoImageResultsFound);
        expect(result.Error!.Message).toBe(ErrorMessages.NoImageResultsFound);

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');
        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');
    });

    test("GIVEN data fetched is a gallery AND an image is returned from the helper, EXPECT this to be used", async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/gallery/cr8xudsnkgua1',
                            },
                        },
                    ],
                }
            }),
        });

        ImageHelper.FetchImageFromRedditGallery = jest.fn().mockResolvedValue("https://i.redd.it/cr8xudsnkgua1.jpg")

        const result = await randomBunny('rabbits', 'new');

        expect(result.IsSuccess).toBeTruthy();
        expect(result.Result).toBeDefined();

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=100');

        expect(ImageHelper.FetchImageFromRedditGallery).toHaveBeenCalledTimes(1);
        expect(ImageHelper.FetchImageFromRedditGallery).toHaveBeenCalledWith("https://reddit.com/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/");
    });

    test("GIVEN data fetched is a gallery AND an image is not returned from the helper, EXPECT error", async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/gallery/cr8xudsnkgua1',
                            },
                        },
                    ],
                }
            }),
        });

        ImageHelper.FetchImageFromRedditGallery = jest.fn().mockResolvedValue(undefined)

        const result = await randomBunny('rabbits', 'new');

        expect(ImageHelper.FetchImageFromRedditGallery).toHaveBeenCalledTimes(1);

        expect(result.IsSuccess).toBe(false);
        expect(result.Error).toBeDefined();
        expect(result.Error?.Code).toBe(ErrorCode.NoImageResultsFound);
        expect(result.Error?.Message).toBe(ErrorMessages.NoImageResultsFound);
    });

    test("GIVEN limit is supplied, EXPECT limit sent to the API", async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/cr8xudsnkgua1.jpg',
                            },
                        },
                    ],
                }
            }),
        });

        const result = await randomBunny('rabbits', 'new', 50);

        expect(result.IsSuccess).toBeTruthy();
        expect(result.Result).toBeDefined();
        expect(result.Error).toBeUndefined();

        expect(fetchMock).toHaveBeenCalledWith('https://reddit.com/r/rabbits/new.json?limit=50');
    });

    test("GIVEN limit is less than 1, EXPECT error to be returned", async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/cr8xudsnkgua1.jpg',
                            },
                        },
                    ],
                }
            }),
        });

        const result = await randomBunny('rabbits', 'new', 0);

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Result).toBeUndefined();
        expect(result.Error).toBeDefined();

        expect(result.Error!.Code).toBe(ErrorCode.LimitOutOfRange);
        expect(result.Error!.Message).toBe(ErrorMessages.LimitOutOfRange);

        expect(fetchMock).not.toHaveBeenCalled();
    });

    test("GIVEN limit is greater than 100, EXPECT error to be returned", async () => {
        fetchMock.mockResolvedValue({
            body: JSON.stringify({
                data: {
                    children: [
                        {
                            data: {
                                archived: false,
                                author: 'author',
                                downs: 0,
                                hidden: false,
                                permalink: '/r/Rabbits/comments/12pa5te/someone_told_pickles_its_monday_internal_fury/',
                                subreddit: 'Rabbits',
                                subreddit_subscribers: 298713,
                                title: 'Someone told pickles it’s Monday… *internal fury*',
                                ups: 1208,
                                url: 'https://i.redd.it/cr8xudsnkgua1.jpg',
                            },
                        },
                    ],
                }
            }),
        });

        const result = await randomBunny('rabbits', 'new', 101);

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Result).toBeUndefined();
        expect(result.Error).toBeDefined();

        expect(result.Error!.Code).toBe(ErrorCode.LimitOutOfRange);
        expect(result.Error!.Message).toBe(ErrorMessages.LimitOutOfRange);

        expect(fetchMock).not.toHaveBeenCalled();
    });
});