const stronglyTyped = require("../");
const assert = require("assert");

const SimplestCase = stronglyTyped({
    "__dictionary__": "string"
});

const Nested = stronglyTyped({
    groupName: "string",
    members: {
        "__dictionary__": {
            memberName: "string",
            dislikes: {
                "__dictionary__": "string"
            }
        }
    }
});

const NotADictionary = stronglyTyped({
    "__dictionary__": "string",
    "__books_count__": "number"
});

assert.doesNotThrow(function() {
    SimplestCase({
        "likes": "lego",
        "dislikes": "working"
    });
});

assert.throws(function() {
    SimplestCase({
        "likes": "potatoes",
        "dislikes": 2
    });
});

assert.doesNotThrow(function() {
    Nested({
        groupName: "developers",
        members: {
            "developer1": {
                memberName: "John Doe",
                dislikes: {
                    most: "bugs"
                }
            }
        }
    });
});

assert.throws(function() {
    Nested({
        groupName: "developers",
        members: {
            "developer1": {
                memberName: "John Doe",
                dislikes: {
                    most: "bugs",
                    less: 420
                }
            },
            "developer2": "Jane Doe"
        }
    });
});

assert.doesNotThrow(function () {
    NotADictionary({
        __dictionary__: "is ok",
        __books_count__: 100
    })
});