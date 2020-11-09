
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
            return object[element]  && typeof object[element] == 'object' &&  !Array.isArray(element)
            ? { ...prev, ...this.flatten(object[element], `${prefix}${element}.`) }
            : { ...prev, ...{ [`${prefix}${element}`]: object[element] } };
        }, {});
    }

    /**
     * Get object proeprty value by its deep path.
     * @param object the object containg the property path
     * @param path the property path to get
     * @returns the property value if found, null otherwise
     */
    public static byPath(object: any, path: string): any  {

        if (path && object) {
            path = path.replace(/\[(\w+)\]/g, '.$1');
            path = path.replace(/^\./, '');           
            var a = path.split('.');
            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];
                if (k in object) {
                    object = object[k];
                } else {
                    return null;
                }
            }
            return object;
        } else {
            return null;
        }
    }
}