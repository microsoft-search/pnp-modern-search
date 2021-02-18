import { isArray } from '@pnp/common/util';
import * as jspath from 'jspath';

export class ObjectHelper {

    /**
     * Flatten object properties
     * Example: input = { 'a':{ 'b':{ 'b2':2 }, 'c':{ 'c2':2, 'c3':3 } } }
     * Result: { a.b.b2: 2, a.c.c2: 2, a.c.c3: 3 }
     * Reference: https://gist.github.com/penguinboy/762197
     * @param object the object to flatten
     * @param prefix the prefix to use
     */
    public static flatten(object: any, prefix = ''): any {
        return Object.keys(object).reduce((prev, element) => {

            let flattenObject;

            // For properties with dots in the name (ex: @odata.type), we enclose them with "". This way they could be resolved by the jspath library. 
            if (element.split('.').length > 1) {
                element = `"${element}"`;
            }

            if (object[element] && typeof object[element] == 'object' && !Array.isArray(element)) {
                flattenObject = { ...prev, ...this.flatten(object[element], `${prefix}${element}.`) };
            } else {
                flattenObject = { ...prev, ...{ [`${prefix}${element}`]: object[element] } };
            }

            return flattenObject;

        }, {});
    }

    /**
     * Get object proeprty value by its deep path.
     * @param object the object containg the property path
     * @param path the property path to get
     * @returns the property value if found, undefined otherwise
     */
    public static byPath(object: any, path: string): any  {

        if (path && object) {

            try {
                // Returns the value "as is". If it is an array, values will be separated by a comma (default delimiter for the toString() method)
                const value = jspath.apply(`.${path}`,object); // this can return an array.
                if(isArray(value)) return value.join(); // check for array and return as comma delimited string.
                return value; // not an array return value
            } catch (error) {
                // Case when unexpected string or tokens are passed in the path
                return null;
            }
                 
        } else {
            return undefined;
        }
    }
}