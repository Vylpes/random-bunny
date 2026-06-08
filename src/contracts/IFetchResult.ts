export default interface IFetchResult {
    data: {
        archived: boolean,
        author: string,
        downs: number,
        gallery_data?: {
            items: {
                media_id: string,
            }[],
        },
        hidden: boolean,
        is_gallery?: boolean,
        media_metadata?: Record<string, {
            m?: string,
            s?: {
                u?: string,
            }
        }>,
        permalink: string,
        subreddit: string,
        subreddit_subscribers: number,
        title: string,
        ups: number,
        url: string
    }
}