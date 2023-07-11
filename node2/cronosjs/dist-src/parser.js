import { sortAsc, flatMap } from './utils';
const predefinedCronStrings = {
    '@yearly': '0 0 0 1 1 * *',
    '@annually': '0 0 0 1 1 * *',
    '@monthly': '0 0 0 1 * * *',
    '@weekly': '0 0 0 * * 0 *',
    '@daily': '0 0 0 * * * *',
    '@midnight': '0 0 0 * * * *',
    '@hourly': '0 0 * * * * *',
};
const monthReplacements = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthReplacementRegex = new RegExp(monthReplacements.join('|'), 'g');
const dayOfWeekReplacements = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayOfWeekReplacementRegex = new RegExp(dayOfWeekReplacements.join('|'), 'g');
/*
"The actual range of times supported by ECMAScript Date objects is slightly smaller:
  exactly –100,000,000 days to 100,000,000 days measured relative to midnight at the
  beginning of 01 January, 1970 UTC. This gives a range of 8,640,000,000,000,000
  milliseconds to either side of 01 January, 1970 UTC."
http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1

new Date(8640000000000000) => 00:00:00 13th Sep 275760
Largest full year valid as JS date = 275759
*/
const maxValidYear = 275759;
export var WarningType;
(function (WarningType) {
    WarningType["IncrementLargerThanRange"] = "IncrementLargerThanRange";
})(WarningType || (WarningType = {}));
export function _parse(cronstring) {
    let expr = cronstring.trim().toLowerCase();
    if (predefinedCronStrings[expr]) {
        expr = predefinedCronStrings[expr];
    }
    const fields = expr.split(/\s+/g);
    if (fields.length < 5 || fields.length > 7) {
        throw new Error('Expression must have at least 5 fields, and no more than 7 fields');
    }
    switch (fields.length) {
        case 5:
            fields.unshift('0');
        case 6:
            fields.push('*');
    }
    return [
        new SecondsOrMinutesField(fields[0]),
        new SecondsOrMinutesField(fields[1]),
        new HoursField(fields[2]),
        new DaysField(fields[3], fields[5]),
        new MonthsField(fields[4]),
        new YearsField(fields[6])
    ];
}
function getIncrementLargerThanRangeWarnings(items, first, last) {
    const warnings = [];
    for (let item of items) {
        let rangeLength;
        if (item.step > 1 &&
            item.step > (rangeLength = item.rangeLength(first, last))) {
            warnings.push({
                type: WarningType.IncrementLargerThanRange,
                message: `Increment (${item.step}) is larger than range (${rangeLength}) for expression '${item.itemString}'`
            });
        }
    }
    return warnings;
}
class Field {
    constructor(field) {
        this.field = field;
    }
    parse() {
        return this.field.split(',')
            .map(item => FieldItem.parse(item, this.first, this.last, true));
    }
    get items() {
        if (!this._items)
            this._items = this.parse();
        return this._items;
    }
    get values() {
        return Field.getValues(this.items, this.first, this.last);
    }
    get warnings() {
        return getIncrementLargerThanRangeWarnings(this.items, this.first, this.last);
    }
    static getValues(items, first, last) {
        return Array.from(new Set(flatMap(items, item => item.values(first, last)))).sort(sortAsc);
    }
}
class FieldItem {
    constructor(itemString) {
        this.itemString = itemString;
        this.step = 1;
    }
    rangeLength(first, last) {
        var _a, _b, _c, _d;
        const start = (_b = (_a = this.range) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : first, end = (_d = (_c = this.range) === null || _c === void 0 ? void 0 : _c.to) !== null && _d !== void 0 ? _d : last;
        return (end < start) ? ((last - start) + (end - first) + 1) : (end - start);
    }
    values(first, last) {
        const start = this.range ? this.range.from : first, rangeLength = this.rangeLength(first, last);
        return Array(Math.floor(rangeLength / this.step) + 1)
            .fill(0)
            .map((_, i) => first + ((start - first + (this.step * i)) % (last - first + 1)));
    }
    get any() {
        return this.range === undefined && this.step === 1;
    }
    get single() {
        return !!this.range && this.range.from === this.range.to;
    }
    static parse(item, first, last, allowCyclicRange = false, transformer) {
        var _a;
        const fieldItem = new FieldItem(item);
        const [match, all, startFrom, range, step] = ((_a = item.match(/^(?:(\*)|([0-9]+)|([0-9]+-[0-9]+))(?:\/([1-9][0-9]*))?$/)) !== null && _a !== void 0 ? _a : []);
        if (!match)
            throw new Error('Field item invalid format');
        if (step) {
            fieldItem.step = parseInt(step, 10);
        }
        if (startFrom) {
            let start = parseInt(startFrom, 10);
            start = transformer ? transformer(start) : start;
            if (start < first || start > last)
                throw new Error('Field item out of valid value range');
            fieldItem.range = {
                from: start,
                to: step ? undefined : start
            };
        }
        else if (range) {
            const [rangeStart, rangeEnd] = range.split('-').map(x => {
                const n = parseInt(x, 10);
                return transformer ? transformer(n) : n;
            });
            if (rangeStart < first || rangeStart > last || rangeEnd < first || rangeEnd > last ||
                (rangeEnd < rangeStart && !allowCyclicRange)) {
                throw new Error('Field item range invalid, either value out of valid range or start greater than end in non wraparound field');
            }
            fieldItem.range = {
                from: rangeStart,
                to: rangeEnd
            };
        }
        return fieldItem;
    }
}
FieldItem.asterisk = new FieldItem('*');
export class SecondsOrMinutesField extends Field {
    constructor() {
        super(...arguments);
        this.first = 0;
        this.last = 59;
    }
}
export class HoursField extends Field {
    constructor() {
        super(...arguments);
        this.first = 0;
        this.last = 23;
    }
}
export class DaysField {
    constructor(daysOfMonthField, daysOfWeekField) {
        this.lastDay = false;
        this.lastWeekday = false;
        this.daysItems = [];
        this.nearestWeekdayItems = [];
        this.daysOfWeekItems = [];
        this.lastDaysOfWeekItems = [];
        this.nthDaysOfWeekItems = [];
        for (let item of daysOfMonthField.split(',').map(s => s === '?' ? '*' : s)) {
            if (item === 'l') {
                this.lastDay = true;
            }
            else if (item === 'lw') {
                this.lastWeekday = true;
            }
            else if (item.endsWith('w')) {
                this.nearestWeekdayItems.push(FieldItem.parse(item.slice(0, -1), 1, 31));
            }
            else {
                this.daysItems.push(FieldItem.parse(item, 1, 31));
            }
        }
        const normalisedDaysOfWeekField = daysOfWeekField.replace(dayOfWeekReplacementRegex, match => dayOfWeekReplacements.indexOf(match) + '');
        const parseDayOfWeek = (item) => FieldItem.parse(item, 0, 6, true, n => n === 7 ? 0 : n);
        for (let item of normalisedDaysOfWeekField.split(',').map(s => s === '?' ? '*' : s)) {
            const nthIndex = item.lastIndexOf('#');
            if (item.endsWith('l')) {
                this.lastDaysOfWeekItems.push(parseDayOfWeek(item.slice(0, -1)));
            }
            else if (nthIndex !== -1) {
                const nth = item.slice(nthIndex + 1);
                if (!/^[1-5]$/.test(nth))
                    throw new Error('Field item nth of month (#) invalid');
                this.nthDaysOfWeekItems.push({
                    item: parseDayOfWeek(item.slice(0, nthIndex)),
                    nth: parseInt(nth, 10)
                });
            }
            else {
                this.daysOfWeekItems.push(parseDayOfWeek(item));
            }
        }
    }
    get values() {
        return DaysFieldValues.fromField(this);
    }
    get warnings() {
        const warnings = [], dayItems = [
            ...this.daysItems,
            ...this.nearestWeekdayItems,
        ], weekItems = [
            ...this.daysOfWeekItems,
            ...this.lastDaysOfWeekItems,
            ...this.nthDaysOfWeekItems.map(({ item }) => item),
        ];
        warnings.push(...getIncrementLargerThanRangeWarnings(dayItems, 1, 31), ...getIncrementLargerThanRangeWarnings(weekItems, 0, 6));
        return warnings;
    }
    get allDays() {
        return (!this.lastDay &&
            !this.lastWeekday &&
            !this.nearestWeekdayItems.length &&
            !this.lastDaysOfWeekItems.length &&
            !this.nthDaysOfWeekItems.length &&
            this.daysItems.length === 1 && this.daysItems[0].any &&
            this.daysOfWeekItems.length === 1 && this.daysOfWeekItems[0].any);
    }
}
export class DaysFieldValues {
    constructor() {
        this.lastDay = false;
        this.lastWeekday = false;
        this.days = [];
        this.nearestWeekday = [];
        this.daysOfWeek = [];
        this.lastDaysOfWeek = [];
        this.nthDaysOfWeek = [];
    }
    static fromField(field) {
        const values = new DaysFieldValues();
        const filterAnyItems = (items) => items.filter(item => !item.any);
        values.lastDay = field.lastDay;
        values.lastWeekday = field.lastWeekday;
        values.days = Field.getValues(field.allDays ? [FieldItem.asterisk] : filterAnyItems(field.daysItems), 1, 31);
        values.nearestWeekday = Field.getValues(field.nearestWeekdayItems, 1, 31);
        values.daysOfWeek = Field.getValues(filterAnyItems(field.daysOfWeekItems), 0, 6);
        values.lastDaysOfWeek = Field.getValues(field.lastDaysOfWeekItems, 0, 6);
        const nthDaysHashes = new Set();
        for (let item of field.nthDaysOfWeekItems) {
            for (let n of item.item.values(0, 6)) {
                let hash = n * 10 + item.nth;
                if (!nthDaysHashes.has(hash)) {
                    nthDaysHashes.add(hash);
                    values.nthDaysOfWeek.push([n, item.nth]);
                }
            }
        }
        return values;
    }
    getDays(year, month) {
        const days = new Set(this.days);
        const lastDateOfMonth = new Date(year, month, 0).getDate();
        const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
        const getNearestWeekday = (day) => {
            if (day > lastDateOfMonth)
                day = lastDateOfMonth;
            const dayOfWeek = (day + firstDayOfWeek - 1) % 7;
            let weekday = day + (dayOfWeek === 0 ? 1 : (dayOfWeek === 6 ? -1 : 0));
            return weekday + (weekday < 1 ? 3 : (weekday > lastDateOfMonth ? -3 : 0));
        };
        if (this.lastDay) {
            days.add(lastDateOfMonth);
        }
        if (this.lastWeekday) {
            days.add(getNearestWeekday(lastDateOfMonth));
        }
        for (const day of this.nearestWeekday) {
            days.add(getNearestWeekday(day));
        }
        if (this.daysOfWeek.length ||
            this.lastDaysOfWeek.length ||
            this.nthDaysOfWeek.length) {
            const daysOfWeek = Array(7).fill(0).map(() => ([]));
            for (let day = 1; day < 36; day++) {
                daysOfWeek[(day + firstDayOfWeek - 1) % 7].push(day);
            }
            for (const dayOfWeek of this.daysOfWeek) {
                for (const day of daysOfWeek[dayOfWeek]) {
                    days.add(day);
                }
            }
            for (const dayOfWeek of this.lastDaysOfWeek) {
                for (let i = daysOfWeek[dayOfWeek].length - 1; i >= 0; i--) {
                    if (daysOfWeek[dayOfWeek][i] <= lastDateOfMonth) {
                        days.add(daysOfWeek[dayOfWeek][i]);
                        break;
                    }
                }
            }
            for (const [dayOfWeek, nthOfMonth] of this.nthDaysOfWeek) {
                days.add(daysOfWeek[dayOfWeek][nthOfMonth - 1]);
            }
        }
        return Array.from(days).filter(day => day <= lastDateOfMonth).sort(sortAsc);
    }
}
export class MonthsField extends Field {
    constructor(field) {
        super(field.replace(monthReplacementRegex, match => {
            return monthReplacements.indexOf(match) + 1 + '';
        }));
        this.first = 1;
        this.last = 12;
    }
}
export class YearsField extends Field {
    constructor(field) {
        super(field);
        this.first = 1970;
        this.last = 2099;
        this.items;
    }
    parse() {
        return this.field.split(',')
            .map(item => FieldItem.parse(item, 0, maxValidYear));
    }
    get warnings() {
        return getIncrementLargerThanRangeWarnings(this.items, this.first, maxValidYear);
    }
    nextYear(fromYear) {
        var _a;
        return (_a = this.items.reduce((years, item) => {
            var _a, _b, _c, _d;
            if (item.any)
                years.push(fromYear);
            else if (item.single) {
                const year = item.range.from;
                if (year >= fromYear)
                    years.push(year);
            }
            else {
                const start = (_b = (_a = item.range) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : this.first;
                if (start > fromYear)
                    years.push(start);
                else {
                    const nextYear = start + Math.ceil((fromYear - start) / item.step) * item.step;
                    if (nextYear <= ((_d = (_c = item.range) === null || _c === void 0 ? void 0 : _c.to) !== null && _d !== void 0 ? _d : maxValidYear))
                        years.push(nextYear);
                }
            }
            return years;
        }, []).sort(sortAsc)[0]) !== null && _a !== void 0 ? _a : null;
    }
}
