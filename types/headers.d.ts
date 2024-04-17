type THeaderValue = NonNullable<unknown>

export interface IHttpHeaders {
    /**
     * The `size` property returns the number of headers in this collection.
     */
    readonly size: number
    /**
     * The `set()` method adds or updates one or more headers in this collection.
     * 
     * @throws Error if header `name` is not type of string or is empty.
     * @throws Error if header `value` is null or undefined.
     */
    set(name: string, value: THeaderValue): this
    set(name: { [k: string]: THeaderValue }): this
    /**
     * The `has()` method checks whether a header with the specified `name` exists in this collection.
     */
    has(name: string): boolean
    /**
     * The 'get()' method returns a header value by its name.
     * 
     * If primary header name is not present in the collection, method will try to return the value by alternative header name if one is specified.
     */
    get<T>(name: string): T | undefined
    /**
     * The `delete()` method removes the specified header by its name from this colllection. 
     * 
     * @returns Method return `true` if header with provided name has been deleted, `false` otherwise.
     */
    delete(name: string): this 
    /**
     * The `names()` method return an array of collection header names.
     */
    names(): Array<string>
    /**
     * The `values()` method return an array of collection header values.
     */
    values(): Array<THeaderValue>
    /**
     * The `clear()` method removes all headers from this collection.
     */
    clear(): void
    /**
     * Iterates over the collection until all entries have been read.
     */
    [Symbol.iterator](): IterableIterator<[ string, THeaderValue ]>
}