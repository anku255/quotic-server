import { filter, path, pick, omit } from 'ramda';

export const ArrayMaybe = (arr) => arr || [];
export const ObjectMaybe = (obj) => obj || {};
export const StringMaybe = (str) => str || '';

export const pickWrapper = (keys, object) => pick(keys, object);
export const omitWrapper = (keys, object) => omit(keys, object);
export const isNotEmptyArray = (x) => x && x.length > 0;
export const isNotEmptyObject = (obj) => obj && Object.keys(obj).length > 0;
export const removeNonTrueValuesFromObject = (obj) => filter(Boolean, obj);
export const accessDeepObject = (arr, obj) => path(Array.isArray(arr) ? arr : arr.split('.'), obj);

export const cleanMongoObject = (obj, customKeyName = 'id') =>
	omitWrapper(
		['__v'],
		renameObjectKeys(obj, {
			_id: customKeyName,
		}),
	);

export const nowMongoDate = () => new Date().toISOString();

export const dateToMongoDate = (input) => (input instanceof Date ? input.toISOString() : input);
