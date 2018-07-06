import sampleData from './sampleData';

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const fetchSampleData = () => {
    return delay(1000).then(() => {
        //get events inside sampledata, then use inside our actions
        return Promise.resolve(sampleData);
    })
}