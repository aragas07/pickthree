export const date = () => {

    const date = new Date()

    return date.getHours()
}

export const day = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
