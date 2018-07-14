import moment from 'moment'

export const objectToArray = (object) => {
    if (object) {
        //gives array, key value pair separately
        //map over array
        return Object.entries(object).map(e => Object.assign(e[1], {id: e[0]}))
    }
}

export const createNewEvent = (user, photoURL, event) => {
    event.date = moment(event.date).toDate();

    //Return how we want event stored in firestore
    return {
        ...event,
        hostUid: user.uid,
        hostPhotoURL: user.displayName || '/assets/user/png',
        createdAt: Date.now(),
        attendees: {
            [user.uid]: {
                going: true,
                joinDate: Date.now(),
                photoURL: photoURL ||'/assets/user.png',
                displayName: user.displayName,
                host: true
            }
        }
    }
}

//take in dataset, our existing flat chat array
export const createDataTree = dataset => {
    //starts with null object
    let hashTable = Object.create(null);
    //add item into hashtable with id, spread across, add array called child nodes
    //each element, parent or child will have an array called child nodes
    dataset.forEach(a => hashTable[a.id] = {...a, childNodes: []});
    //add empty array
    let dataTree = [];
    //loop over our dataset
    dataset.forEach(a => {
        //if parent, add in as parent, if not, add in as child of parent id
        if (a.parentId) hashTable[a.parentId].childNodes.push(hashTable[a.id]);
        else dataTree.push(hashTable[a.id])
    });
    return dataTree
};