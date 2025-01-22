
// Utility to add a timeout for Promises
export const withTimeout = <T>(promise: Promise<T>, timeout = 5000): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Timeout'));
        }, timeout);

        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
};