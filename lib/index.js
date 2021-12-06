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
exports.default = (function (errorClass, handler) {
    return function (target, propertyKey, descriptor) {
        // save a reference to the original method
        var originalMethod = descriptor.value;
        // rewrite original method with custom wrapper
        descriptor.value = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                var result = originalMethod.apply(this, args);
                // check if method is asynchronous
                if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                    // return promise
                    return result.catch(function (error) {
                        handleError(_this, errorClass, handler, error);
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
});
