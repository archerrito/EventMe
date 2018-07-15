export const userDetailedQuery = ({ auth, userUid, match }) => {
    if (userUid !== null) {
      return [
        {
          collection: 'users',
          doc: userUid,
          storeAs: 'profile'
        },
        {
          collection: 'users',
          doc: userUid,
          subcollections: [{ collection: 'photos' }],
          storeAs: 'photos'
        },
        {
            //query user collections
          collection: 'users',
          doc: auth.uid,
          //into subcollection, checking param.id, user we clicked on, is in there
          subcollections: [{collection: 'following', doc: match.params.id}],
          storeAs: 'following'
        }
      ];
    } else {
      return [
        {
          collection: 'users',
          doc: auth.uid,
          subcollections: [{ collection: 'photos' }],
          storeAs: 'photos'
        }
      ];
    }
  };