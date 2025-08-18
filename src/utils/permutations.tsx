export function getPermutationsOfLength<T>(arr: T[], length: number): T[][] {
    const result: T[][] = [];

    function permute(path: T[], options: T[]) {
        if (path.length === length) {
            result.push([...path]);
            return;
        }

        for (let i = 0; i < options.length; i++) {
            permute(
                [...path, options[i]],
                [...options.slice(0, i), ...options.slice(i + 1)]
            );
        }
    }

    permute([], arr);
    console.log(result);
    return result;
}