import {DateTime} from "luxon";



const normVietNamTime = (rawTime: Date | string | null | undefined): string | null => {
    if (!rawTime) return "";
    let utcDateTime;
    // const utcDateTime = DateTime.fromISO(rawTime, {zone: 'utc'});
    if (rawTime instanceof Date) {
        utcDateTime = DateTime.fromJSDate(rawTime, {zone: 'utc'});
    }
    else if (typeof rawTime === 'string') {
        utcDateTime = DateTime.fromISO(rawTime, {zone: 'utc'});
    }
    else {
        console.error("Invalid date format:", rawTime);
        return "";
    }

    const vnDateTime = utcDateTime.setZone('Asia/Ho_Chi_Minh').toISO();
    return vnDateTime;
}
export default normVietNamTime;
