export interface IHttpTrailers {
    /**
     * The `size` property returns the number of trailers in this collection.
     */
    readonly size: number
    /**
     * The `add()` method declares the name of the trailer inside the trailer collection 
     * and it will be added to the `Trailer` response header. 
     * 
     * This must happen before the response headers are sent.
     * 
     * @throws Error if trailer `name` is not type of string, empty or is restricted.
     * @throws Error if header `value` is null or undefined.
     */
    add(name: string): this
    /**
     * The `has()` method checks whether a trailer with the specified name exists in this collection.
     * 
     * @returns Method returns `true` if trailer with the specified name is present, `false` otherwise.
     */
    has(name: string): boolean
    /**
     * The `delete()` method removes the specified trailer by its name from this colllection. 
     * 
     * @returns Method return `true` if trailer with provided name has been deleted, `false` otherwise.
     */
    delete(name: string): this 
    /**
     * The `names()` method return an array of collection trailer names.
     */
    names(): Array<string>
    /**
     * The `clear()` method removes all trailers from this collection.
     */
    clear(): void
    /**
     * Iterates over the collection until all entries have been read.
     */
    [Symbol.iterator](): IterableIterator<[ string, any ]>
}