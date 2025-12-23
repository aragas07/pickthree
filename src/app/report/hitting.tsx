export const pj = (fourD: string, combination: string, game: string): boolean => { 
    if (game === "4 Digit" && fourD.slice(-4) === combination) {
        return true
    } else if (game === "Last 3" && fourD.slice(-3) === combination) {
        return true
    } else if (game === "Last 2" && fourD.slice(-2) === combination) {
        return true
    }
    return false
}

export const edieboy = (fourD: string, threeD: string, twoD: string, combination: string, game: string): boolean => {
    const LastTwo = game.match(/(2D[1-3])/i)
    const LastThree = game.match(/(3D[1-3])/i)
    const FourDigit = game.match(/(4DN)/i)
    if (LastTwo && twoD === combination)
        return true
    else if (LastThree && threeD === combination)
        return true
    else if (FourDigit && fourD === combination)
        return true
    return false
}

export const other = (fourD: string, threeD: string, combination: string): boolean => {
    if(combination.length === 4 && fourD.slice(-4) === combination)
        return true
    else if (combination.length === 3 && threeD === combination)
        return true
    else if (combination.length === 2 && fourD.slice(-2) === combination)
        return true
    return false
}