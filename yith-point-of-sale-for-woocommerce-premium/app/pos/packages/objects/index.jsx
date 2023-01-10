export function getObjectMetaData( object = {}, key = '' ) {
    const values = 'meta_data' in object ? object.meta_data.filter( meta => meta.key === key ) : [];
    return values.length && typeof values[ 0 ].value !== 'undefined' ? values[ 0 ].value : false;
}