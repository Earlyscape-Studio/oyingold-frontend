import {ActionResult, fail} from "./result";



export function withErrorHandling<Args extends unknown [], T>(
    fn: (...args: Args) => Promise<ActionResult<T>>
) {
    return async (...args: Args): Promise<ActionResult<T>> => {
        try {
            return await fn(...args);
        }catch(error){
            // sentry capture exception goes here
            console.error("[action error]", error);
            return fail(
                "Something went wrong. Please try again",
                "UNEXPECTED ERROR"
            )
        }
    }
}