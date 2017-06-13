/**
 * 指定時間待つシナリオ
 */

export default async (waitInMilliseconds: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(
            () => {
                resolve();
            },
            waitInMilliseconds
        );
    });
};
