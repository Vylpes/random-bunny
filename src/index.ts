import IReturnResult from "./contracts/IReturnResult";
import IRedditResult from "./contracts/IRedditResult";
import fetch from "got-cjs";
import { List } from 'linqts';
import IFetchResult from "./contracts/IFetchResult";
import { ErrorCode } from "./constants/ErrorCode";
import ErrorMessages from "./constants/ErrorMessages";
import ImageHelper from "./helpers/imageHelper";

export default async function randomBunny(subreddit: string, sortBy: "new" | "hot" | "top" = 'hot', limit: number = 100): Promise<IReturnResult> {
    if (limit < 1 || limit > 100) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.LimitOutOfRange,
                Message: ErrorMessages.LimitOutOfRange,
            }
        };
    }

    const result = await fetch(`https://reddit.com/r/${subreddit}/${sortBy}.json?limit=${limit}`)
        .then((res) => {
            return res;
        })
        .catch(() => {
            return null;
        });

    if (!result) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.FailedToFetchReddit,
                Message: ErrorMessages.FailedToFetchReddit,
            },
        }
    }

    const json = JSON.parse(result.body);

    if (!json) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.UnableToParseJSON,
                Message: ErrorMessages.UnableToParseJSON,
            },
        }
    }

    const data: IFetchResult[] = json.data.children;

    const dataWithImages = new List<IFetchResult>(data)
        .Where(x => x!.data.url.includes('.jpg') || x!.data.url.includes('.png') || x!.data.url.includes("/gallery/"))
        .ToArray();

    let random = 0;

    if (dataWithImages.length == 0) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.NoImageResultsFound,
                Message: ErrorMessages.NoImageResultsFound,
            },
        };
    } else {
        random = Math.floor((Math.random() * (dataWithImages.length - 1)) + 0); // Between 0 and (size - 1)
    }

    const randomSelect = dataWithImages[random];

    const randomData = randomSelect.data;

    let url: string;
    let gallery: string[];

    if (randomData.url.includes("/gallery")) {
        const galleryImage = await ImageHelper.FetchImageFromRedditGallery(`https://reddit.com${randomData.permalink}`);

        if (!galleryImage) {
            return {
                IsSuccess: false,
                Query: {
                    subreddit: subreddit,
                    sortBy: sortBy,
                    limit: limit,
                },
                Error: {
                    Code: ErrorCode.NoImageResultsFound,
                    Message: ErrorMessages.NoImageResultsFound,
                },
            }
        }

        url = galleryImage[0];
        gallery = galleryImage;
    } else {
        url = randomData.url;
        gallery = [randomData.url];
    }

    const redditResult: IRedditResult = {
        Author: randomData['author'],
        Archived: randomData['archived'],
        Downs: randomData['downs'],
        Hidden: randomData['hidden'],
        Permalink: randomData['permalink'],
        Subreddit: randomData['subreddit'],
        SubredditSubscribers: randomData['subreddit_subscribers'],
        Title: randomData['title'],
        Ups: randomData['ups'],
        Url: url,
        Gallery: gallery,
    };

    return {
        IsSuccess: true,
        Query: {
            subreddit: subreddit,
            sortBy: sortBy,
            limit: limit,
        },
        Result: redditResult
    };
}