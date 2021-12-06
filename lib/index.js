"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleError(ctx, errorClass, handler, error) {
    // check if error is instance of passed error class
    if (typeof handler === 'function' && error instanceof errorClass) {
        // run handler with error object 
        // and class context as second argument
        handler.call(null, error, ctx);
    }
    else {
        // throw error further,
        // next decorator in chain can catch it
        throw error;
    }
}
// decorator factory function
exports.default = (errorClass, handler) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        if (descriptor === undefined) {
            throw Error('Something went wrong.');
        }
        if (typeof descriptor.value !== 'function') {
            throw Error('Permission decorator can only be used on a method');
        }
        // save a reference to the original method
        const originalMethod = descriptor.value;
        // rewrite original method with custom wrapper
        descriptor.value = function (...args) {
            try {
                const result = originalMethod.apply(this, args);
                // check if method is asynchronous
                if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                    // return promise
                    return result.catch((error) => {
                        handleError(this, errorClass, handler, error);
                    });
                }
                // return actual result
                return result;
            }
            catch (error) {
                handleError(this, errorClass, handler, error);
            }
        };
        return descriptor;
    };
};
