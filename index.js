"use strict";

function validateAgainstStringDesc(descriptionVal, value) {
    var isOptional = descriptionVal.substr(0, 1) === "?";
    var typeToCheck = (isOptional ? descriptionVal.substr(1) : descriptionVal);
    if (isOptional && (value === null || typeof value === "undefined")) {
        return;
    }
    if (typeof value !== typeToCheck) {
        return ':' + (typeof value);
    }
}

function validate(obj, desc, parent) {
    if (!desc) {
        return []
    }
    parent = parent || '';
    var errors = [];

    if (typeof desc === "string") {
        var errorOnStringDesc = validateAgainstStringDesc(desc, obj);
        if (errorOnStringDesc) {
            errors.push(parent + errorOnStringDesc)
        }
        return errors;
    }

    const descKeysCount = Object.keys(desc).filter(desc.hasOwnProperty.bind(desc)).length;
    const isDictionaryDesc = descKeysCount === 1 && !!desc["__dictionary__"];


    if (isDictionaryDesc) {
        Object.keys(obj).filter(obj.hasOwnProperty.bind(obj)).forEach(objKey => validateEntry(objKey, desc["__dictionary__"]));
    } else {
        Object.keys(desc).forEach(descKey => validateEntry(descKey, desc[descKey]));
    }
    return errors;

    function validateEntry(key, descriptionVal) {
        if (typeof descriptionVal === "string") {
            const errorOnStringDesc = validateAgainstStringDesc(descriptionVal, obj[key]);
            if (errorOnStringDesc) {
                errors.push(parent + key + errorOnStringDesc);
            }
        } else {
            if (Array.isArray(descriptionVal)) {
                if (!Array.isArray(obj[key])) {
                    errors.push(parent + key + ':notArray');
                } else if (descriptionVal[0]) {
                    obj[key].forEach((arrElem, idx) => {
                        const arrParentName = parent + key + "[" + idx + "].";
                        errors = errors.concat(validate(arrElem, descriptionVal[0], arrParentName));
                    })
                }
            } else {
                if (obj.hasOwnProperty(key)) {
                    errors = errors.concat(validate(obj[key], descriptionVal, parent + key + '.'));
                } else {
                    errors.push(parent + key + ':missing');
                }
            }
        }

    }
}

module.exports = function (desc, proto, allowExtras) {
    const StronglyTyped = function StronglyTyped(obj) {
        const self = Object.create(StronglyTyped.prototype, {
            validate: {
                value: function validateType() {
                    var errors = validate(this, desc);
                    if (errors.length > 0) {
                        throw new TypeError("Incorrect values for fields: " + errors.join());
                    }
                    if (StronglyTyped.prototype.validate) {
                        return StronglyTyped.prototype.validate.call(this);
                    }
                }
            }
        });
        const descKeysCount = Object.keys(desc).filter(desc.hasOwnProperty.bind(desc)).length;
        const isDictionaryDesc = descKeysCount === 1 && !!desc["__dictionary__"];
        Object.keys(obj).forEach(function (key) {
            if (allowExtras || desc.hasOwnProperty(key) || isDictionaryDesc) {
                self[key] = obj[key];
            } else {
                throw new TypeError("Unexpected field " + key);
            }
        });
        if (StronglyTyped.prototype.constructor && StronglyTyped.prototype.constructor.apply) {
            StronglyTyped.prototype.constructor.apply(self, arguments)
        }
        self.validate();
        return self;
    };
    StronglyTyped.prototype = proto || {};
    Object.defineProperty(StronglyTyped, "created", {
        value: function (obj) {
            return StronglyTyped.prototype.isPrototypeOf(obj);
        }
    });
    return StronglyTyped;
};
