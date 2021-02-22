import { isArray } from '@pnp/common/util';
import * as jspath from 'jspath';
import { isEmpty } from '@microsoft/sp-lodash-subset';

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
     * @returns the property value as string if found, 'undefined' otherwise
     */
    public static byPath(object: any, path: string): string  {

        if (path && object) {

            try {

                // jsPath always returns an array. See https://www.npmjs.com/package/jspath#result
                const value: any[] = jspath.apply(`.${path}`, object);

                // Empty array returned by jsPath
                if (isEmpty(value)) {

                    // i.e the value to look for does not exist in the provided object
                    return undefined;
                }

                // Check if value is an object
                // - Arrays of objects will return '[object Object],[object Object]' etc.
                if (value.toString().indexOf('[object Object]') !== -1) {

                    // Returns the stringified array
                    return JSON.stringify(value);                         
                }

                // Use the default behavior of the toString() method. Arrays of simple values (string, integer, etc.) will be separated by a comma (',')
                return value.toString();                                  
            
            } catch (error) {
                // Case when unexpected string or tokens are passed in the path
                return null;
            }
                 
        } else {
            return undefined;
        }
    }
}